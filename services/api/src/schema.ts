import { HasDefault, NotNull } from "drizzle-orm";
import { float, int, mysqlTable, MySqlTimestampBuilderInitial, text, timestamp } from "drizzle-orm/mysql-core";

export function createdAt(name?: string): HasDefault<NotNull<MySqlTimestampBuilderInitial<string>>> {
    return timestamp(name ?? "created_at")
        .notNull()
        .$defaultFn(() => new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })));
}

export function updatedAt(name?: string): HasDefault<NotNull<MySqlTimestampBuilderInitial<string>>> {
    return timestamp(name ?? "updated_at")
        .notNull()
        .$onUpdate(() => new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })));
}

export const transaction = mysqlTable("transaction", {
    id: int("id")
        .primaryKey()
        .autoincrement()
        .notNull(),

    createdAt: createdAt(),
    updatedAt: updatedAt(),

    amount: int("amount")
        .notNull(),
    tax: float("tax")
        .default(0.01)
        .notNull(),
    invoiceId: text("invoice_id")
        .notNull(),

    // Returned by payment gateway
    paymentGatewayTransactionQrUrl: text("payment_gateway_transaction_qr_url")
        .notNull(),
    paymentGatewayTransactionId: text("payment_gateway_transaction_id")
        .notNull(),
    paymentGatewayTransactionStatus: text("payment_gateway_transaction_status")
        .notNull(),
    paymentGatewayTransactionExpireAt: timestamp("payment_gateway_transaction_expire_at")
        .notNull()
});
