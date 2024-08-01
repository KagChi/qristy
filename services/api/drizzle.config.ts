import { defineConfig } from "drizzle-kit";

export default defineConfig({
    dialect: "mysql",
    dbCredentials: {
        host: process.env.MYSQL_HOST ?? "localhost",
        user: process.env.MYSQL_USER ?? "root",
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE ?? "qristy",
        port: parseInt(process.env.MYSQL_PORT ?? "3306")
    },
    schema: "./src/schema.ts",
    out: "./drizzle"
});
