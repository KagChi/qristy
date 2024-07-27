import { createHandler, StartServer } from "@solidjs/start/server";

export default createHandler(() => <StartServer
    document={({ assets, children, scripts }) => <html lang="en">
        <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" type="image/x-icon" href="/favicon.ico" />

            <title>NezukoChan - Home</title>
            <meta name="title" content="NezukoChan - Home" />
            <meta name="description" content="The Only Discord Music Bot YouU+0060ll ever need!" />

            <meta name="theme-color" content="#B82065" />
            {assets}
        </head>
        <body>
            <div id="app">{children}</div>
            {scripts}
        </body>
    </html>
    }
/>);
