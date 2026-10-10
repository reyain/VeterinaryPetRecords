
using System.Reflection;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.UseUrls("http://127.0.0.1:5001");

var app = builder.Build();


/* ==========================================
   BRIDGE HEALTH CHECK
   ========================================== */

app.MapGet("/health", () =>
{
    return Results.Ok(new
    {
        success = true,
        service = "VeterinaryPetRecords.Bridge",
        status = "running",
        timestamp = DateTimeOffset.UtcNow
    });
});


/* ==========================================
   CHECK CORE DLL
   ========================================== */

app.MapGet("/api/core/status", () =>
{
    string dllPath = Path.Combine(
        AppContext.BaseDirectory,
        "lib",
        "VeterinaryPetRecords.Core.dll"
    );

    if (!File.Exists(dllPath))
    {
        return Results.Json(
            new
            {
                success = false,
                coreDllDetected = false,
                message = "Core DLL was not found."
            },
            statusCode: 503
        );
    }

    try
    {
        AssemblyName assembly =
            AssemblyName.GetAssemblyName(dllPath);

        return Results.Ok(new
        {
            success = true,
            coreDllDetected = true,
            assemblyName = assembly.Name,
            version = assembly.Version?.ToString(),
            message =
                "Core DLL detected. Service integration is not yet configured."
        });
    }
    catch (Exception error)
    {
        Console.Error.WriteLine(error);

        return Results.Json(
            new
            {
                success = false,
                coreDllDetected = true,
                message =
                    "The DLL exists, but its assembly metadata could not be read."
            },
            statusCode: 500
        );
    }
});


/* ==========================================
   INSPECT CORE DLL PUBLIC TYPES AND METHODS
   ========================================== */

app.MapGet("/api/core/members", () =>
{
    string dllPath = Path.Combine(
        AppContext.BaseDirectory,
        "lib",
        "VeterinaryPetRecords.Core.dll"
    );

    if (!File.Exists(dllPath))
    {
        return Results.Json(
            new
            {
                success = false,
                message = "Core DLL was not found."
            },
            statusCode: 503
        );
    }

    try
    {
        // Load the existing Core DLL for inspection.
        Assembly assembly = Assembly.LoadFrom(dllPath);

        // Get the public types declared by the assembly.
        var publicTypes = assembly
            .GetExportedTypes()
            .Select(type => new
            {
                typeName = type.FullName,

                typeKind = type.IsInterface
                    ? "Interface"
                    : type.IsEnum
                        ? "Enum"
                        : type.IsAbstract && type.IsSealed
                            ? "Static Class"
                            : type.IsClass
                                ? "Class"
                                : "Other",

                // List public methods declared by each type.
                methods = type.GetMethods(
                        BindingFlags.Public |
                        BindingFlags.Instance |
                        BindingFlags.Static |
                        BindingFlags.DeclaredOnly
                    )
                    .Where(method => !method.IsSpecialName)
                    .Select(method => new
                    {
                        methodName = method.Name,
                        returnType = method.ReturnType.FullName,

                        parameters = method.GetParameters()
                            .Select(parameter => new
                            {
                                name = parameter.Name,
                                type = parameter.ParameterType.FullName
                            })
                            .ToArray()
                    })
                    .ToArray()
            })
            .ToArray();

        return Results.Ok(new
        {
            success = true,
            assemblyName = assembly.GetName().Name,
            version = assembly.GetName().Version?.ToString(),
            publicTypes
        });
    }
    catch (Exception error)
    {
        Console.Error.WriteLine(error);

        return Results.Problem(
            title: "Unable to inspect the Core DLL",
            detail: error.Message,
            statusCode: 500
        );
    }
});


/* ==========================================
   START BRIDGE SERVER
   ========================================== */

/* ==========================================
   INSPECT SERVICE CONSTRUCTORS AND MODEL PROPERTIES
   ========================================== */

app.MapGet("/api/core/details", () =>
{
    string dllPath = Path.Combine(
        AppContext.BaseDirectory,
        "lib",
        "VeterinaryPetRecords.Core.dll"
    );

    if (!File.Exists(dllPath))
    {
        return Results.Json(
            new
            {
                success = false,
                message = "Core DLL was not found."
            },
            statusCode: 503
        );
    }

    try
    {
        Assembly assembly = Assembly.LoadFrom(dllPath);

        // Inspect the service, model, and configuration classes.
        var selectedTypes = assembly
            .GetExportedTypes()
            .Where(type =>
                type.Namespace == "VeterinaryPetRecords.Core.Services" ||
                type.Namespace == "VeterinaryPetRecords.Core.Models" ||
                type.Namespace == "VeterinaryPetRecords.Core.Configuration")
            .OrderBy(type => type.FullName)
            .ToArray();

        var details = selectedTypes.Select(type => new
        {
            typeName = type.FullName,

            typeKind = type.IsInterface
                ? "Interface"
                : type.IsEnum
                    ? "Enum"
                    : type.IsAbstract && type.IsSealed
                        ? "Static Class"
                        : type.IsClass
                            ? "Class"
                            : "Other",

            // Public instance constructors show how service objects
            // and model objects can be created.
            constructors = type.GetConstructors(
                    BindingFlags.Public | BindingFlags.Instance
                )
                .Select(constructor => new
                {
                    parameters = constructor.GetParameters()
                        .Select(parameter => new
                        {
                            name = parameter.Name,
                            type = parameter.ParameterType.FullName
                        })
                        .ToArray()
                })
                .ToArray(),

            // Public properties show which model fields are available.
            properties = type.GetProperties(
                    BindingFlags.Public |
                    BindingFlags.Instance |
                    BindingFlags.Static |
                    BindingFlags.DeclaredOnly
                )
                .Select(property => new
                {
                    name = property.Name,
                    type = property.PropertyType.FullName,
                    canRead = property.GetMethod?.IsPublic == true,
                    canWrite = property.SetMethod?.IsPublic == true
                })
                .ToArray(),

            // Include service methods and whether each one is static.
            methods = type.GetMethods(
                    BindingFlags.Public |
                    BindingFlags.Instance |
                    BindingFlags.Static |
                    BindingFlags.DeclaredOnly
                )
                .Where(method => !method.IsSpecialName)
                .Select(method => new
                {
                    methodName = method.Name,
                    returnType = method.ReturnType.FullName,
                    isStatic = method.IsStatic,

                    parameters = method.GetParameters()
                        .Select(parameter => new
                        {
                            name = parameter.Name,
                            type = parameter.ParameterType.FullName
                        })
                        .ToArray()
                })
                .ToArray()
        }).ToArray();

        return Results.Ok(new
        {
            success = true,
            assemblyName = assembly.GetName().Name,
            version = assembly.GetName().Version?.ToString(),
            inspectedTypeCount = details.Length,
            types = details
        });
    }
    catch (Exception error)
    {
        Console.Error.WriteLine(error);

        return Results.Problem(
            title: "Unable to inspect Core DLL details",
            detail: error.Message,
            statusCode: 500
        );
    }
});


/* ==========================================
   OWNERS API - LIST ALL OWNERS
   ========================================== */

app.MapGet("/api/owners", () =>
{
    try
    {
        object? owners = CoreDllInvoker.Invoke(
            "VeterinaryPetRecords.Core.Services.OwnerService",
            "GetAllOwners"
        );

        return Results.Ok(new
        {
            success = true,
            data = owners
        });
    }
    catch (Exception error)
    {
        var root = CoreDllInvoker.GetRootCause(error);
        Console.Error.WriteLine(error);

        return Results.Problem(
            title: "Unable to retrieve owners",
            detail: root.Message,
            statusCode: 500
        );
    }
});


/* ==========================================
   OWNERS API - GET ONE OWNER
   ========================================== */

app.MapGet("/api/owners/{ownerId:int}", (int ownerId) =>
{
    try
    {
        object? owner = CoreDllInvoker.Invoke(
            "VeterinaryPetRecords.Core.Services.OwnerService",
            "GetOwnerByID",
            ownerId
        );

        if (owner is null)
        {
            return Results.NotFound(new
            {
                success = false,
                message = "Owner not found."
            });
        }

        return Results.Ok(new
        {
            success = true,
            data = owner
        });
    }
    catch (Exception error)
    {
        var root = CoreDllInvoker.GetRootCause(error);
        Console.Error.WriteLine(error);

        return Results.Problem(
            title: "Unable to retrieve owner",
            detail: root.Message,
            statusCode: 500
        );
    }
});


/* ==========================================
   OWNERS API - ADD OWNER
   ========================================== */

app.MapPost("/api/owners", (JsonElement payload) =>
{
    try
    {
        object owner = CoreDllInvoker.CreateModel(
            "VeterinaryPetRecords.Core.Models.Owner",
            payload
        );

        object? createdId = CoreDllInvoker.Invoke(
            "VeterinaryPetRecords.Core.Services.OwnerService",
            "AddOwner",
            owner
        );

        return Results.Json(
            new
            {
                success = true,
                message = "Owner added successfully.",
                ownerId = createdId
            },
            statusCode: 201
        );
    }
    catch (Exception error)
    {
        var root = CoreDllInvoker.GetRootCause(error);
        Console.Error.WriteLine(error);

        return Results.Problem(
            title: "Unable to add owner",
            detail: root.Message,
            statusCode: 500
        );
    }
});


/* ==========================================
   OWNERS API - UPDATE OWNER
   ========================================== */

app.MapPut(
    "/api/owners/{ownerId:int}",
    (int ownerId, JsonElement payload) =>
{
    try
    {
        object owner = CoreDllInvoker.CreateModel(
            "VeterinaryPetRecords.Core.Models.Owner",
            payload
        );

        // Set the identifier from the URL so the record being
        // updated is determined by the requested ownerId.
        CoreDllInvoker.SetIdentifier(
            owner,
            ownerId,
            "OwnerID",
            "OwnerId",
            "Id"
        );

        object? result = CoreDllInvoker.Invoke(
            "VeterinaryPetRecords.Core.Services.OwnerService",
            "UpdateOwner",
            owner
        );

        bool updated = result is bool value && value;

        return Results.Ok(new
        {
            success = updated,
            message = updated
                ? "Owner updated successfully."
                : "The owner was not updated."
        });
    }
    catch (Exception error)
    {
        var root = CoreDllInvoker.GetRootCause(error);
        Console.Error.WriteLine(error);

        return Results.Problem(
            title: "Unable to update owner",
            detail: root.Message,
            statusCode: 500
        );
    }
});


/* ==========================================
   OWNERS API - DELETE OWNER
   ========================================== */

app.MapDelete(
    "/api/owners/{ownerId:int}",
    (int ownerId) =>
{
    try
    {
        object? result = CoreDllInvoker.Invoke(
            "VeterinaryPetRecords.Core.Services.OwnerService",
            "DeleteOwner",
            ownerId
        );

        bool deleted = result is bool value && value;

        return Results.Ok(new
        {
            success = deleted,
            message = deleted
                ? "Owner deleted successfully."
                : "The owner was not deleted."
        });
    }
    catch (Exception error)
    {
        var root = CoreDllInvoker.GetRootCause(error);
        Console.Error.WriteLine(error);

        return Results.Problem(
            title: "Unable to delete owner",
            detail: root.Message,
            statusCode: 500
        );
    }
});



/* ==========================================
   PETS API - LIST ALL PETS
   ========================================== */



app.MapGet("/api/pets", () =>
{
    try
    {
        object? pets = CoreDllInvoker.Invoke(
            "VeterinaryPetRecords.Core.Services.PetService",
            "GetAllPets"
        );

        return Results.Ok(new
        {
            success = true,
            data = pets
        });
    }
    catch (Exception error)
    {
        var root = CoreDllInvoker.GetRootCause(error);

        Console.Error.WriteLine(error);

        return Results.Problem(
            title: "Unable to retrieve pets",
            detail: root.Message,
            statusCode: 500
        );
    }
});

app.MapGet("/api/pets/{petId:int}", (int petId) =>
{
    try
    {
        var result = CoreDllInvoker.Invoke(
            "VeterinaryPetRecords.Core.Services.PetService",
            "GetAllPets"
        );

        if (result is not System.Collections.IEnumerable pets)
        {
            return Results.Problem(
                title: "Unable to retrieve pets",
                detail: "The Core DLL did not return a valid pet list.",
                statusCode: 500
            );
        }

        foreach (var pet in pets)
        {
            if (pet == null)
                continue;

            var idProperty = pet.GetType().GetProperty("PetID");
            var idValue = idProperty?.GetValue(pet);

            if (idValue != null &&
                Convert.ToInt32(idValue) == petId)
            {
                return Results.Ok(new
                {
                    success = true,
                    data = pet
                });
            }
        }

        return Results.NotFound(new
        {
            success = false,
            message = $"Pet with ID {petId} was not found."
        });
    }
    catch (Exception error)
    {
        var root = CoreDllInvoker.GetRootCause(error);

        Console.Error.WriteLine(error);

        return Results.Problem(
            title: "Unable to retrieve pet",
            detail: root.Message,
            statusCode: 500
        );
    }
});


/* ==========================================
   PETS API - ADD PET
   ========================================== */

app.MapPost("/api/pets", (JsonElement payload) =>
{
    try
    {
        object pet = CoreDllInvoker.CreateModel(
            "VeterinaryPetRecords.Core.Models.Pet",
            payload
        );

        // The current registration form does not send Color.
        // Use a fallback when no color is provided.
        var colorProperty = pet.GetType().GetProperty("Color");

        if (colorProperty != null &&
            string.IsNullOrWhiteSpace(
                colorProperty.GetValue(pet) as string))
        {
            colorProperty.SetValue(pet, "Not specified");
        }

        object? createdId = CoreDllInvoker.Invoke(
            "VeterinaryPetRecords.Core.Services.PetService",
            "AddPet",
            pet
        );

        return Results.Json(
            new
            {
                success = true,
                message = "Pet registered successfully.",
                petId = createdId
            },
            statusCode: 201
        );
    }
    catch (Exception error)
    {
        var root = CoreDllInvoker.GetRootCause(error);
        Console.Error.WriteLine(error);

        return Results.Problem(
            title: "Unable to register pet",
            detail: root.Message,
            statusCode: 500
        );
    }
});



/* ==========================================
   PETS API - UPDATE PET
   ========================================== */

app.MapPut("/api/pets/{petId:int}",
    (int petId, JsonElement payload) =>
{
    try
    {
        object pet = CoreDllInvoker.CreateModel(
            "VeterinaryPetRecords.Core.Models.Pet",
            payload
        );

        CoreDllInvoker.SetIdentifier(
            pet,
            petId,
            "PetID",
            "PetId",
            "Id"
        );

        var petType = pet.GetType();
        var colorProperty = petType.GetProperty("Color");

        // Preserve the stored color if the form omits it.
        if (colorProperty != null &&
            string.IsNullOrWhiteSpace(
                colorProperty.GetValue(pet) as string))
        {
            object? existingResult = CoreDllInvoker.Invoke(
                "VeterinaryPetRecords.Core.Services.PetService",
                "GetAllPets"
            );

            if (existingResult is System.Collections.IEnumerable allPets)
            {
                foreach (var existingPet in allPets)
                {
                    if (existingPet == null)
                        continue;

                    var idProperty =
                        existingPet.GetType().GetProperty("PetID");

                    var idValue = idProperty?.GetValue(existingPet);

                    if (idValue != null &&
                        Convert.ToInt32(idValue) == petId)
                    {
                        var existingColor =
                            existingPet.GetType()
                                .GetProperty("Color")?
                                .GetValue(existingPet);

                        colorProperty.SetValue(pet, existingColor);
                        break;
                    }
                }
            }
        }

        object? result = CoreDllInvoker.Invoke(
            "VeterinaryPetRecords.Core.Services.PetService",
            "UpdatePet",
            pet
        );

        bool updated = result is bool value && value;

        if (!updated)
        {
            return Results.NotFound(new
            {
                success = false,
                message = $"Pet with ID {petId} was not found or was not updated."
            });
        }

        return Results.Ok(new
        {
            success = true,
            message = "Pet updated successfully."
        });
    }
    catch (Exception error)
    {
        var root = CoreDllInvoker.GetRootCause(error);
        Console.Error.WriteLine(error);

        return Results.Problem(
            title: "Unable to update pet",
            detail: root.Message,
            statusCode: 500
        );
    }
});



/* ==========================================
   PETS API - DELETE PET
   ========================================== */

app.MapDelete("/api/pets/{petId:int}", (int petId) =>
{
    try
    {
        object? result = CoreDllInvoker.Invoke(
            "VeterinaryPetRecords.Core.Services.PetService",
            "DeletePet",
            petId
        );

        bool deleted = result is bool value && value;

        if (!deleted)
        {
            return Results.NotFound(new
            {
                success = false,
                message = $"Pet with ID {petId} was not found."
            });
        }

        return Results.Ok(new
        {
            success = true,
            message = "Pet deleted successfully."
        });
    }
    catch (Exception error)
    {
        var root = CoreDllInvoker.GetRootCause(error);
        Console.Error.WriteLine(error);

        return Results.Problem(
            title: "Unable to delete pet",
            detail: root.Message,
            statusCode: 500
        );
    }
});




/* ==========================================
   VACCINATIONS API - GET ALL
   ========================================== */

app.MapGet("/api/vaccinations", () =>
{
    try
    {
        object? vaccinations = CoreDllInvoker.Invoke(
            "VeterinaryPetRecords.Core.Services.VaccinationService",
            "GetAllVaccinations"
        );

        return Results.Ok(new
        {
            success = true,
            data = vaccinations
        });
    }
    catch (Exception error)
    {
        var root = CoreDllInvoker.GetRootCause(error);
        Console.Error.WriteLine(error);

        return Results.Problem(
            title: "Unable to retrieve vaccination records",
            detail: root.Message,
            statusCode: 500
        );
    }
});

/* ==========================================
   USERS API - LOOK UP BY USERNAME
   ========================================== */

app.MapGet("/api/users/by-username/{username}", (string username) =>
{
    try
    {
        object? user = CoreDllInvoker.Invoke(
            "VeterinaryPetRecords.Core.Services.UserService",
            "GetUserByUsername",
            username
        );

        if (user is null)
        {
            return Results.NotFound(new
            {
                success = false,
                message = "User account not found."
            });
        }

        Type userType = user.GetType();

        return Results.Ok(new
        {
            success = true,
            data = new
            {
                userID = userType.GetProperty("UserID")?.GetValue(user),
                username = userType.GetProperty("Username")?.GetValue(user),
                fullName = userType.GetProperty("FullName")?.GetValue(user),
                role = userType.GetProperty("Role")?.GetValue(user),
                status = userType.GetProperty("Status")?.GetValue(user)
            }
        });
    }
    catch (Exception error)
    {
        var root = CoreDllInvoker.GetRootCause(error);
        Console.Error.WriteLine(error);

        return Results.Problem(
            title: "Unable to retrieve user account",
            detail: root.Message,
            statusCode: 500
        );
    }
});



/* ==========================================
   USERS API - LOOK UP BY USER ID
   ========================================== */

app.MapGet("/api/users/by-id/{userID:int}", (int userID) =>
{
    try
    {
        if (userID <= 0)
        {
            return Results.BadRequest(new
            {
                success = false,
                message = "A valid UserID is required."
            });
        }

        object? user = CoreDllInvoker.Invoke(
            "VeterinaryPetRecords.Core.Services.UserService",
            "GetUserByID",
            userID
        );

        if (user is null)
        {
            return Results.NotFound(new
            {
                success = false,
                message = "User account not found."
            });
        }

        Type userType = user.GetType();

        return Results.Ok(new
        {
            success = true,
            data = new
            {
                userID = userType.GetProperty("UserID")?.GetValue(user),
                username = userType.GetProperty("Username")?.GetValue(user),
                fullName = userType.GetProperty("FullName")?.GetValue(user),
                role = userType.GetProperty("Role")?.GetValue(user),
                status = userType.GetProperty("Status")?.GetValue(user)
            }
        });
    }
    catch (Exception error)
    {
        var root = CoreDllInvoker.GetRootCause(error);
        Console.Error.WriteLine(error);

        return Results.Problem(
            title: "Unable to retrieve user account",
            detail: root.Message,
            statusCode: 500
        );
    }
});



/* ==========================================
   VACCINATIONS API - GET ONE
   ========================================== */

app.MapGet(
    "/api/vaccinations/{vaccinationId:int}",
    (int vaccinationId) =>
{
    try
    {
        object? vaccination = CoreDllInvoker.Invoke(
            "VeterinaryPetRecords.Core.Services.VaccinationService",
            "GetVaccinationByID",
            vaccinationId
        );

        if (vaccination is null)
        {
            return Results.NotFound(new
            {
                success = false,
                message = "Vaccination record not found."
            });
        }

        return Results.Ok(new
        {
            success = true,
            data = vaccination
        });
    }
    catch (Exception error)
    {
        var root = CoreDllInvoker.GetRootCause(error);
        Console.Error.WriteLine(error);

        return Results.Problem(
            title: "Unable to retrieve vaccination record",
            detail: root.Message,
            statusCode: 500
        );
    }
});


/* ==========================================
   VACCINATIONS API - GET BY PET
   ========================================== */

app.MapGet(
    "/api/pets/{petId:int}/vaccinations",
    (int petId) =>
{
    try
    {
        object? vaccinations = CoreDllInvoker.Invoke(
            "VeterinaryPetRecords.Core.Services.VaccinationService",
            "GetVaccinationsByPetID",
            petId
        );

        return Results.Ok(new
        {
            success = true,
            data = vaccinations
        });
    }
    catch (Exception error)
    {
        var root = CoreDllInvoker.GetRootCause(error);
        Console.Error.WriteLine(error);

        return Results.Problem(
            title: "Unable to retrieve pet vaccination history",
            detail: root.Message,
            statusCode: 500
        );
    }
});


/* ==========================================
   VACCINATIONS API - ADD
   ========================================== */

app.MapPost("/api/vaccinations", (JsonElement payload) =>
{
    try
    {
        object vaccination = CoreDllInvoker.CreateModel(
            "VeterinaryPetRecords.Core.Models.Vaccination",
            payload
        );

        Type modelType = vaccination.GetType();

        int petId = Convert.ToInt32(
            modelType.GetProperty("PetID")?.GetValue(vaccination) ?? 0
        );

        int userId = Convert.ToInt32(
            modelType.GetProperty("UserID")?.GetValue(vaccination) ?? 0
        );

        string vaccineName = Convert.ToString(
            modelType.GetProperty("VaccineName")?.GetValue(vaccination)
        ) ?? "";

        DateTime dateAdministered = Convert.ToDateTime(
            modelType.GetProperty("DateAdministered")?.GetValue(vaccination)
                ?? default(DateTime)
        );

        
        DateTime? nextVaccinationDate =
            modelType.GetProperty("NextVaccinationDate")?.GetValue(vaccination)
                as DateTime?;


        if (petId <= 0)
        {
            return Results.BadRequest(new
            {
                success = false,
                message = "A valid PetId is required."
            });
        }

        if (userId <= 0)
        {
            return Results.BadRequest(new
            {
                success = false,
                message = "A valid UserId for the staff member is required."
            });
        }

        
        // Verify that the referenced pet exists.
        object? petsResult = CoreDllInvoker.Invoke(
            "VeterinaryPetRecords.Core.Services.PetService",
            "GetAllPets"
        );

        bool petExists = false;

        if (petsResult is System.Collections.IEnumerable petCollection)
        {
            foreach (object pet in petCollection)
            {
                int existingPetId = Convert.ToInt32(
                    pet.GetType().GetProperty("PetID")?.GetValue(pet) ?? 0
                );

                if (existingPetId == petId)
                {
                    petExists = true;
                    break;
                }
            }
        }

        if (!petExists)
        {
            return Results.BadRequest(new
            {
                success = false,
                message = "The specified pet does not exist."
            });
        }

        // Verify that the staff account exists and is active.
        object? staff = CoreDllInvoker.Invoke(
            "VeterinaryPetRecords.Core.Services.UserService",
            "GetUserByID",
            userId
        );

        if (staff is null)
        {
            return Results.BadRequest(new
            {
                success = false,
                message = "The specified staff account does not exist."
            });
        }

        Type staffType = staff.GetType();

        string staffStatus = Convert.ToString(
            staffType.GetProperty("Status")?.GetValue(staff)
        ) ?? "";

        if (!staffStatus.Equals("Active", StringComparison.OrdinalIgnoreCase))
        {
            return Results.BadRequest(new
            {
                success = false,
                message = "The specified staff account is inactive."
            });
        }


        if (string.IsNullOrWhiteSpace(vaccineName))
        {
            return Results.BadRequest(new
            {
                success = false,
                message = "VaccineName is required."
            });
        }

        if (dateAdministered == default(DateTime))
        {
            
            return Results.BadRequest(new
            {
                success = false,
                message = "A valid DateAdministered is required."
            });
        }

        
        if (!nextVaccinationDate.HasValue ||
            nextVaccinationDate.Value == default(DateTime))
        {
            return Results.BadRequest(new
            {
                success = false,
                message = "A valid NextVaccinationDate is required."
            });
        }

        if (nextVaccinationDate.Value.Date < dateAdministered.Date)
        {
            return Results.BadRequest(new
            {
                success = false,
                message = "NextVaccinationDate cannot be earlier than DateAdministered."
            });
        }


        object? createdId = CoreDllInvoker.Invoke(
            "VeterinaryPetRecords.Core.Services.VaccinationService",
            "AddVaccination",
            vaccination
        );

        return Results.Json(
            new
            {
                success = true,
                message = "Vaccination record added successfully.",
                vaccinationId = createdId
            },
            statusCode: 201
        );
    }
    catch (Exception error)
    {
        var root = CoreDllInvoker.GetRootCause(error);
        Console.Error.WriteLine(error);

        return Results.Problem(
            title: "Unable to add vaccination record",
            detail: root.Message,
            statusCode: 500
        );
    }
});


/* ==========================================
   VACCINATIONS API - UPDATE
   ========================================== */

app.MapPut(
    "/api/vaccinations/{vaccinationId:int}",
    (int vaccinationId, JsonElement payload) =>
{
    try
    {
        object vaccination = CoreDllInvoker.CreateModel(
            "VeterinaryPetRecords.Core.Models.Vaccination",
            payload
        );

        CoreDllInvoker.SetIdentifier(
            vaccination,
            vaccinationId,
            "VaccinationId",
            "VaccinationID",
            "Id"
        );

        Type modelType = vaccination.GetType();

        
        int petId = Convert.ToInt32(
            modelType.GetProperty("PetID")?.GetValue(vaccination) ?? 0
        );

        int userId = Convert.ToInt32(
            modelType.GetProperty("UserID")?.GetValue(vaccination) ?? 0
        );


        string vaccineName = Convert.ToString(
            modelType.GetProperty("VaccineName")?.GetValue(vaccination)
        ) ?? "";

        DateTime dateAdministered = Convert.ToDateTime(
            modelType.GetProperty("DateAdministered")?.GetValue(vaccination)
                ?? default(DateTime)
        );


        DateTime? nextVaccinationDate =
            modelType.GetProperty("NextVaccinationDate")?.GetValue(vaccination)
                as DateTime?;


        if (petId <= 0 || userId <= 0 ||
            string.IsNullOrWhiteSpace(vaccineName) ||
            dateAdministered == default(DateTime))
        {
            return Results.BadRequest(new
            {
                success = false,
                message =
                    "Valid PetId, UserId, VaccineName, and DateAdministered are required."
            });
        }
        
        
        if (!nextVaccinationDate.HasValue ||
            nextVaccinationDate.Value == default(DateTime))
        {
            return Results.BadRequest(new
            {
                success = false,
                message = "A valid NextVaccinationDate is required."
            });
        }

        if (nextVaccinationDate.Value.Date < dateAdministered.Date)
        {
            return Results.BadRequest(new
            {
                success = false,
                message = "NextVaccinationDate cannot be earlier than DateAdministered."
            });
        }
        
        // Verify that the referenced pet exists.
        object? petsResult = CoreDllInvoker.Invoke(
            "VeterinaryPetRecords.Core.Services.PetService",
            "GetAllPets"
        );

        bool petExists = false;

        if (petsResult is System.Collections.IEnumerable petCollection)
        {
            foreach (object pet in petCollection)
            {
                int existingPetId = Convert.ToInt32(
                    pet.GetType().GetProperty("PetID")?.GetValue(pet) ?? 0
                );

                if (existingPetId == petId)
                {
                    petExists = true;
                    break;
                }
            }
        }

        if (!petExists)
        {
            return Results.BadRequest(new
            {
                success = false,
                message = "The specified pet does not exist."
            });
        }

        // Verify that the staff account exists and is active.
        object? staff = CoreDllInvoker.Invoke(
            "VeterinaryPetRecords.Core.Services.UserService",
            "GetUserByID",
            userId
        );

        if (staff is null)
        {
            return Results.BadRequest(new
            {
                success = false,
                message = "The specified staff account does not exist."
            });
        }

        Type staffType = staff.GetType();

        string staffStatus = Convert.ToString(
            staffType.GetProperty("Status")?.GetValue(staff)
        ) ?? "";

        if (!staffStatus.Equals("Active", StringComparison.OrdinalIgnoreCase))
        {
            return Results.BadRequest(new
            {
                success = false,
                message = "The specified staff account is inactive."
            });
        }



        object? result = CoreDllInvoker.Invoke(
            "VeterinaryPetRecords.Core.Services.VaccinationService",
            "UpdateVaccination",
            vaccination
        );

        bool updated = result is bool value && value;

        if (!updated)
        {
            return Results.NotFound(new
            {
                success = false,
                message = "Vaccination record was not found or was not updated."
            });
        }

        return Results.Ok(new
        {
            success = true,
            message = "Vaccination record updated successfully."
        });
    }
    catch (Exception error)
    {
        var root = CoreDllInvoker.GetRootCause(error);
        Console.Error.WriteLine(error);

        return Results.Problem(
            title: "Unable to update vaccination record",
            detail: root.Message,
            statusCode: 500
        );
    }
});


/* ==========================================
   VACCINATIONS API - DELETE
   ========================================== */

app.MapDelete(
    "/api/vaccinations/{vaccinationId:int}",
    (int vaccinationId) =>
{
    try
    {
        object? result = CoreDllInvoker.Invoke(
            "VeterinaryPetRecords.Core.Services.VaccinationService",
            "DeleteVaccination",
            vaccinationId
        );

        bool deleted = result is bool value && value;

        if (!deleted)
        {
            return Results.NotFound(new
            {
                success = false,
                message = "Vaccination record not found."
            });
        }

        return Results.Ok(new
        {
            success = true,
            message = "Vaccination record deleted successfully."
        });
    }
    catch (Exception error)
    {
        var root = CoreDllInvoker.GetRootCause(error);
        Console.Error.WriteLine(error);

        return Results.Problem(
            title: "Unable to delete vaccination record",
            detail: root.Message,
            statusCode: 500
        );
    }
});





app.Run();