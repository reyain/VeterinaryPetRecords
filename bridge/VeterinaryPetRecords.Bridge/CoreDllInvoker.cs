
using System.Reflection;
using System.Text.Json;

public static class CoreDllInvoker
{
    private static Assembly LoadCoreAssembly()
    {
        string dllPath = Path.Combine(
            AppContext.BaseDirectory,
            "lib",
            "VeterinaryPetRecords.Core.dll"
        );

        if (!File.Exists(dllPath))
        {
            throw new FileNotFoundException(
                "VeterinaryPetRecords.Core.dll was not found.",
                dllPath
            );
        }

        return Assembly.LoadFrom(dllPath);
    }

    public static object? Invoke(
        string serviceTypeName,
        string methodName,
        params object?[] arguments)
    {
        Assembly assembly = LoadCoreAssembly();

        Type serviceType =
            assembly.GetType(serviceTypeName)
            ?? throw new TypeLoadException(
                $"Service type '{serviceTypeName}' was not found."
            );

        MethodInfo? method = serviceType
            .GetMethods(
                BindingFlags.Public |
                BindingFlags.Instance |
                BindingFlags.Static
            )
            .Where(candidate =>
                candidate.Name == methodName &&
                candidate.GetParameters().Length == arguments.Length
            )
            .FirstOrDefault(candidate =>
                ParametersMatch(
                    candidate.GetParameters(),
                    arguments
                )
            );

        if (method is null)
        {
            throw new MissingMethodException(
                $"Method '{methodName}' with the supplied parameters " +
                $"was not found in '{serviceTypeName}'."
            );
        }

        object? instance = null;

        if (!method.IsStatic)
        {
            instance = Activator.CreateInstance(serviceType)
                ?? throw new InvalidOperationException(
                    $"Could not create an instance of '{serviceTypeName}'. " +
                    "Check the service constructors."
                );
        }

        return method.Invoke(instance, arguments);
    }

    private static bool ParametersMatch(
        ParameterInfo[] parameters,
        object?[] arguments)
    {
        for (int i = 0; i < parameters.Length; i++)
        {
            Type parameterType = parameters[i].ParameterType;
            object? argument = arguments[i];

            if (argument is null)
            {
                if (parameterType.IsValueType &&
                    Nullable.GetUnderlyingType(parameterType) is null)
                {
                    return false;
                }

                continue;
            }

            if (!parameterType.IsInstanceOfType(argument))
            {
                return false;
            }
        }

        return true;
    }

    public static object CreateModel(
        string modelTypeName,
        JsonElement payload)
    {
        if (payload.ValueKind != JsonValueKind.Object)
        {
            throw new ArgumentException(
                "The request body must be a JSON object."
            );
        }

        Assembly assembly = LoadCoreAssembly();

        Type modelType =
            assembly.GetType(modelTypeName)
            ?? throw new TypeLoadException(
                $"Model type '{modelTypeName}' was not found."
            );

        object model = Activator.CreateInstance(modelType)
            ?? throw new InvalidOperationException(
                $"Could not create model '{modelTypeName}'."
            );

        var options = new JsonSerializerOptions(
            JsonSerializerDefaults.Web
        );

        foreach (JsonProperty jsonProperty in payload.EnumerateObject())
        {
            PropertyInfo? property = modelType.GetProperty(
                jsonProperty.Name,
                BindingFlags.Public |
                BindingFlags.Instance |
                BindingFlags.IgnoreCase
            );

            if (property is null)
            {
                throw new ArgumentException(
                    $"'{jsonProperty.Name}' is not a property of " +
                    $"'{modelType.Name}'. Check the actual model properties."
                );
            }

            if (property.SetMethod?.IsPublic != true)
            {
                throw new ArgumentException(
                    $"Property '{property.Name}' cannot be assigned."
                );
            }

            object? value = JsonSerializer.Deserialize(
                jsonProperty.Value.GetRawText(),
                property.PropertyType,
                options
            );

            property.SetValue(model, value);
        }

        return model;
    }

    public static void SetIdentifier(
        object model,
        int id,
        params string[] candidateNames)
    {
        Type modelType = model.GetType();

        foreach (string candidateName in candidateNames)
        {
            PropertyInfo? property = modelType.GetProperty(
                candidateName,
                BindingFlags.Public |
                BindingFlags.Instance |
                BindingFlags.IgnoreCase
            );

            if (property?.SetMethod?.IsPublic != true)
            {
                continue;
            }

            Type targetType =
                Nullable.GetUnderlyingType(property.PropertyType)
                ?? property.PropertyType;

            object convertedId = Convert.ChangeType(id, targetType);

            property.SetValue(model, convertedId);
            return;
        }

        throw new InvalidOperationException(
            $"Could not find a writable identifier property on " +
            $"'{modelType.Name}'. Check its actual properties."
        );
    }

    public static Exception GetRootCause(Exception error)
    {
        while (true)
        {
            if (error is TargetInvocationException
                { InnerException: not null } invocationError)
            {
                error = invocationError.InnerException;
                continue;
            }

            if (error is TypeInitializationException
                { InnerException: not null } initializationError)
            {
                error = initializationError.InnerException;
                continue;
            }

            return error;
        }
    }
}