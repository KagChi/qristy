export interface Transaction {
    id: string;
    createdAt: string;
    updatedAt: string;
    amount: number;
    tax: number;
    invoiceId: string;
    paymentGatewayTransactionQrUrl: string;
    paymentGatewayTransactionId: string;
    paymentGatewayTransactionStatus: string;
    paymentGatewayTransactionExpireAt: string;
}

export const fetchTransactions = async (page: number): Promise<Transaction[]> => {
    try {
        const response: Response = await fetch(`/api/transactions?page=${page}`);
        if (!response.ok) {
            throw new Error("Failed to fetch transactions");
        }
        const { transactions }: { transactions: Transaction[] } = await response.json();
        return transactions;
    } catch (error) {
        console.error("Error fetching transactions:", error);
        throw error;
    }
};

export const fetchTransaction = async (transactionId: string): Promise<Transaction> => {
    try {
        const response: Response = await fetch(`/api/transaction/${transactionId}`);
        if (!response.ok) {
            throw new Error("Failed to fetch transactions");
        }
        return await (response.json() as unknown as Promise<Transaction>);
    } catch (error) {
        console.error("Error fetching transactions:", error);
        throw error;
    }
};

export const createTransaction = async (amount: number, withTax: boolean): Promise<Transaction> => {
    try {
        const response: Response = await fetch("/api/create", {
            method: "POST",
            body: JSON.stringify({
                amount,
                withTax
            })
        });
        if (!response.ok) {
            throw new Error("Failed to create transaction");
        }

        return await (response.json() as unknown as Promise<Transaction>);
    } catch (error) {
        console.error("Error creating transaction:", error);
        throw error;
    }
};
