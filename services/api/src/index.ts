/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/naming-convention */
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { pinoLogger } from "hono-pino-logger";
import { pino } from "pino";
import { Server } from "socket.io";
import { got } from "got";
import { config } from "./config.js";
import { randomUUID } from "crypto";
import { createPool } from "mysql2";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./schema.js";
import { eq } from "drizzle-orm";

const db = drizzle(
    createPool({
        database: config.mysql.database,
        port: config.mysql.port,
        user: config.mysql.user,
        password: config.mysql.password
    }), { schema, mode: "default" }
);

const app = new Hono();
const logger = pino({
    transport: {
        target: "pino-pretty"
    }
});

app.use("*", pinoLogger(logger));

app.get("/", c => c.text("Hello World"));

app.post("/create", async c => {
    const { amount, with_tax } = await c.req.json<{ amount: number; with_tax: boolean }>();

    const transactionId = randomUUID();
    const tax = with_tax ? 0.01 : 0;

    const { token } = await got.post(`https://app${config.production ? "" : ".sandbox"}.midtrans.com/snap/v1/transactions`, {
        json: {
            transaction_details: {
                order_id: randomUUID(),
                gross_amount: Math.ceil(amount + (amount * tax))
            },
            enabled_payments: ["gopay"]
        },
        headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${Buffer.from(config.midtransServerKey).toString("base64")}`
        }
    }).json<{ token: string }>();

    // Somehow this is not available on sandbox ?! 🤷‍♀️
    const { status_code, qris_expiration_raw, qris_url, transaction_id } = await got.post(`https://app${config.production ? "" : ".sandbox"}.midtrans.com/snap/v2/transactions/${token}/charge`, {
        json: {
            payment_params: {
                acquirer: [
                    "gopay"
                ]
            },
            payment_type: "qris"
        },
        headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${Buffer.from(config.midtransServerKey).toString("base64")}`
        }
    }).json<{ qris_expiration_raw: string; qris_url: string; transaction_id: string; status_code: string }>();

    if (Number(status_code) < 200 || Number(status_code) >= 300) {
        return c.json({ message: "Transaction failed" }, 400);
    }

    try {
        console.log(qris_expiration_raw);
        await db.insert(schema.transaction)
            .values({
                tax,
                amount,
                invoiceId: transactionId,
                paymentGatewayTransactionId: transaction_id,
                paymentGatewayTransactionStatus: "pending",
                paymentGatewayTransactionExpireAt: new Date(qris_expiration_raw),
                paymentGatewayTransactionQrUrl: qris_url
            });

        return c.json({ qris_expiration: qris_expiration_raw, qris_url, transaction_id });
    } catch (error) {
        logger.error(error, "An error ocurred while dispatching requests");
        return c.json({ message: "Transaction failed" }, 500);
    }
});

const server = serve({ fetch: app.fetch, port: 3001 }, info => {
    logger.info(`Server is running on port ${info.port}`);
});

const io = new Server(server);
io.on("connection", socket => {
    logger.info(`Client connected: ${socket.id}`);
});

async function checkPendingTransactions(): Promise<void> {
    try {
        const pendingTransactions = await db
            .select()
            .from(schema.transaction)
            .where(eq(schema.transaction.paymentGatewayTransactionStatus, "pending"));

        for (const transaction of pendingTransactions) {
            const { transaction_status, issuer } = await got.get(`https://api.midtrans.com/v2/${transaction.paymentGatewayTransactionId}/status`, {
                headers: {
                    Authorization: `Basic ${Buffer.from(config.midtransServerKey).toString("base64")}`
                }
            }).json<{ transaction_status: string; issuer: string }>();

            if (transaction_status !== "pending") {
                // Update transaction status in the database
                await db
                    .update(schema.transaction)
                    .set({ paymentGatewayTransactionStatus: transaction_status })
                    .where(eq(schema.transaction.id, transaction.id));

                // Emit event to connected clients
                io.emit("transaction_update", {
                    transactionId: transaction.id,
                    status: transaction_status,
                    issuer
                });
            }
        }
    } catch (error) {
        logger.error("Error checking pending transactions:", error);
    }
}

setInterval(checkPendingTransactions, 15000);
