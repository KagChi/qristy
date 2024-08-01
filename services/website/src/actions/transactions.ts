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

export const fetchTransactions = async (): Promise<Transaction[]> => {
    try {
        const response: Response = await fetch("http://localhost:3001/transactions");
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
