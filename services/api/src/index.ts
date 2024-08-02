/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/naming-convention */
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { pinoLogger } from "hono-pino-logger";
import { pino } from "pino";
import { config } from "./config";
import { randomUUID } from "crypto";
import { createPool } from "mysql2";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./schema";
import { desc, eq, sql } from "drizzle-orm";
import { cors } from "hono/cors";
import axios from "axios";

const db = drizzle(
    createPool({
        host: config.mysql.host,
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

app.use("*", cors({
    origin: "*"
}));
app.use("*", pinoLogger(logger));

app.get("/", c => c.text("Hello World"));

app.post("/create", async c => {
    const { amount, withTax } = await c.req.json<{ amount: number; withTax: boolean }>();

    const invoiceId = randomUUID();
    const tax = withTax ? 0.01 : 0;

    const { token } = await axios.post<any, { data: { token: string } }>(`https://app${config.production ? "" : ".sandbox"}.midtrans.com/snap/v1/transactions`, {
        json: {
            transaction_details: {
                order_id: invoiceId,
                gross_amount: Math.ceil(amount + (amount * tax))
            },
            enabled_payments: ["gopay"]
        },
        headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${Buffer.from(config.midtransServerKey).toString("base64")}`
        }
    })
        .then(x => x.data);

    // Somehow this is not available on sandbox ?! 🤷‍♀️
    const { status_code, qris_expiration_raw, qris_url, transaction_id } = await axios.post<any, { data: { qris_expiration_raw: string; qris_url: string; transaction_id: string; status_code: string } }>(`https://app${config.production ? "" : ".sandbox"}.midtrans.com/snap/v2/transactions/${token}/charge`, {
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
    })
        .then(x => x.data);

    if (Number(status_code) < 200 || Number(status_code) >= 300) {
        return c.json({ message: "Transaction failed" }, 400);
    }

    try {
        await db.insert(schema.transaction)
            .values({
                tax,
                amount,
                invoiceId,
                paymentGatewayTransactionId: transaction_id,
                paymentGatewayTransactionStatus: "pending",
                paymentGatewayTransactionExpireAt: new Date(qris_expiration_raw),
                paymentGatewayTransactionQrUrl: qris_url
            });

        const transaction = await db.select({
            createdAt: schema.transaction.createdAt,
            updatedAt: schema.transaction.updatedAt,
            amount: schema.transaction.amount,
            tax: schema.transaction.tax,
            invoiceId: schema.transaction.invoiceId,
            paymentGatewayTransactionQrUrl: schema.transaction.paymentGatewayTransactionQrUrl,
            paymentGatewayTransactionId: schema.transaction.paymentGatewayTransactionId,
            paymentGatewayTransactionStatus: schema.transaction.paymentGatewayTransactionStatus,
            paymentGatewayTransactionExpireAt: schema.transaction.paymentGatewayTransactionExpireAt
        })
            .from(schema.transaction)
            .where(eq(schema.transaction.invoiceId, invoiceId))
            .limit(1);

        return c.json(transaction[0]);
    } catch (error) {
        logger.error(error, "An error ocurred while dispatching requests");
        return c.json({ message: "Transaction failed" }, 500);
    }
});

app.get("/transaction/:id", async c => {
    const invoiceId = c.req.param("id");

    try {
        const transaction = await db
            .select({
                createdAt: schema.transaction.createdAt,
                updatedAt: schema.transaction.updatedAt,
                amount: schema.transaction.amount,
                tax: schema.transaction.tax,
                invoiceId: schema.transaction.invoiceId,
                paymentGatewayTransactionQrUrl: schema.transaction.paymentGatewayTransactionQrUrl,
                paymentGatewayTransactionId: schema.transaction.paymentGatewayTransactionId,
                paymentGatewayTransactionStatus: schema.transaction.paymentGatewayTransactionStatus,
                paymentGatewayTransactionExpireAt: schema.transaction.paymentGatewayTransactionExpireAt
            })
            .from(schema.transaction)
            .where(eq(schema.transaction.invoiceId, invoiceId))
            .limit(1);

        if (transaction.length === 0) {
            return c.json({ message: "Transaction not found" }, 404);
        }

        return c.json(transaction[0]);
    } catch (error) {
        logger.error(error, "An error occurred while fetching the transaction");
        return c.json({ message: "Failed to fetch transaction" }, 500);
    }
});


app.get("/transactions", async c => {
    const page = Number(c.req.query("page")) || 1;
    const limit = Number(c.req.query("limit")) || 10;
    const offset = (page - 1) * limit;

    try {
        const [transactions, totalCount] = await Promise.all([
            db.select({
                createdAt: schema.transaction.createdAt,
                updatedAt: schema.transaction.updatedAt,
                amount: schema.transaction.amount,
                tax: schema.transaction.tax,
                invoiceId: schema.transaction.invoiceId,
                paymentGatewayTransactionQrUrl: schema.transaction.paymentGatewayTransactionQrUrl,
                paymentGatewayTransactionId: schema.transaction.paymentGatewayTransactionId,
                paymentGatewayTransactionStatus: schema.transaction.paymentGatewayTransactionStatus,
                paymentGatewayTransactionExpireAt: schema.transaction.paymentGatewayTransactionExpireAt
            })
                .from(schema.transaction)
                .limit(limit)
                .offset(offset)
                .orderBy(desc(schema.transaction.id)),
            db.select({ count: sql<number>`count(*)` })
                .from(schema.transaction)
        ]);

        const totalPages = Math.ceil(totalCount[0].count / limit);

        return c.json({
            transactions,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: totalCount[0].count,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        logger.error(error, "An error occurred while fetching transactions");
        return c.json({ message: "Failed to fetch transactions" }, 500);
    }
});


serve({ fetch: app.fetch, port: 3001 }, info => {
    logger.info(`Server is running on port ${info.port}`);
});

async function checkPendingTransactions(): Promise<void> {
    try {
        const pendingTransactions = await db
            .select()
            .from(schema.transaction)
            .where(eq(schema.transaction.paymentGatewayTransactionStatus, "pending"));

        for (const transaction of pendingTransactions) {
            const { transaction_status } = await axios.get<any, { data: { transaction_status: string } }>(`https://api.midtrans.com/v2/${transaction.paymentGatewayTransactionId}/status`, {
                headers: {
                    Authorization: `Basic ${Buffer.from(config.midtransServerKey).toString("base64")}`
                }
            })
                .then(x => x.data);

            if (transaction_status !== "pending") {
                // Update transaction status in the database
                console.log(transaction_status);
                await db
                    .update(schema.transaction)
                    .set({ paymentGatewayTransactionStatus: transaction_status })
                    .where(eq(schema.transaction.id, transaction.id));
            }
        }
    } catch (error) {
        console.log(error);
        logger.error("Error checking pending transactions:", error);
    }
}

setInterval(checkPendingTransactions, 15000);
