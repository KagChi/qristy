import { createHandler, StartServer } from "@solidjs/start/server";

export default createHandler(() => <StartServer
    document={({ assets, children, scripts }) => <html lang="en">
        <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" type="image/x-icon" href="/favicon.ico" />

            <title>QRISTY - Payment Handler</title>
            <meta name="title" content="QRISTY - Payment Handler" />
            <meta name="description" content="The open source QRIS Payment Handler for Indonesian UMKM's, Providing realtime QRIS Status." />
            {assets}
        </head>
        <body>
            <div id="app">{children}</div>
            {scripts}
        </body>
    </html>
    }
/>);
