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
        const response: Response = await fetch(`http://localhost:3001/transactions?page=${page}`);
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

export const createTransaction = async (amount: number, withTax: boolean): Promise<void> => {
    try {
        const response: Response = await fetch("http://localhost:3001/create", {
            method: "POST",
            body: JSON.stringify({
                amount,
                withTax
            })
        });
        if (!response.ok) {
            throw new Error("Failed to create transaction");
        }
    } catch (error) {
        console.error("Error creating transaction:", error);
        throw error;
    }
};
