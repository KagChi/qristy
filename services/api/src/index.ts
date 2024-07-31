import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { pinoLogger } from "hono-pino-logger";
import pino from "pino";
import { Server } from "socket.io";

const app = new Hono();
const logger = pino({
    transport: {
        target: "pino-pretty"
    }
});

app.use("*", pinoLogger(logger));

app.get("/", c => c.text("Hello World"));

const server = serve({ fetch: app.fetch, port: 3001 }, info => {
    logger.info(`Server is running on port ${info.port}`);
});

const io = new Server(server);
io.on("connection", socket => {
    logger.info(`Client connected: ${socket.id}`);
});
