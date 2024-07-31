export const config = {
    midtransServerKey: process.env.MIDTRANS_SERVER_KEY!,
    production: process.env.NODE_ENV === "production",
    mysql: {
        host: process.env.MYSQL_HOST ?? "localhost",
        user: process.env.MYSQL_USER ?? "root",
        password: process.env.MYSQL_PASSWORD ?? "",
        database: process.env.MYSQL_DATABASE ?? "qristy",
        port: parseInt(process.env.MYSQL_PORT ?? "3306")
    }
};
