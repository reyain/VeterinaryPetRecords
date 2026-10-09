const express = require("express");
const path = require("path");

const db = require("./config/db");


const app = express();

const PORT =
    process.env.PORT || 3000;


/* =========================================================
   MIDDLEWARE
   ========================================================= */

app.use(
    express.json()
);


/* =========================================================
   SERVE FRONTEND
   ========================================================= */

app.use(
    express.static(
        path.join(
            __dirname,
            "../frontend"
        )
    )
);


/* =========================================================
   HOME PAGE
   ========================================================= */

app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "../frontend/index.html"
            )
        );

    }
);


/* =========================================================
   DATABASE TEST ROUTE
   ========================================================= */

app.get(
    "/api/test-db",
    async (req, res) => {

        try {

            const [result] =
                await db.query(
                    `
                    SELECT
                        1 AS connected,
                        DATABASE() AS databaseName
                    `
                );


            res.json({

                success:
                    true,

                message:
                    "MySQL database connection successful.",

                database:
                    result[0].databaseName

            });

        }
        catch (error) {

            console.error(
                "Database connection error:",
                error
            );


            res.status(500).json({

                success:
                    false,

                message:
                    "Unable to connect to MySQL database.",

                error:
                    error.message

            });

        }

    }
);


/* =========================================================
   SERVER START
   ========================================================= */

app.listen(
    PORT,
    () => {

        console.log(
            `Veterinary Pet Records System running at http://localhost:${PORT}`
        );

        console.log(
            `Database test endpoint: http://localhost:${PORT}/api/test-db`
        );

    }
);