export const config = {
    midtransServerKey: process.env.MIDTRANS_SERVER_KEY!,
    production: process.env.NODE_ENV === "production"
};
