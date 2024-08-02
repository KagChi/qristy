import "dotenv/config";
import { migrate } from "drizzle-orm/mysql2/migrator";
import { createConnection } from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./schema.js";
import { config } from "./config.js";

void (async () => {
    const connection = await createConnection({
        database: config.mysql.database,
        port: config.mysql.port,
        user: config.mysql.user,
        password: config.mysql.password,
        multipleStatements: true
    });

    const db = drizzle(connection, { schema, mode: "default" });
    await migrate(db, { migrationsFolder: "./drizzle" });
    await connection.end();
})();
