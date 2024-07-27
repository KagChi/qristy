import { mount, StartClient } from "@solidjs/start/client";
import { LenisContext } from "./contexts/Lenis";
import Lenis from "@studio-freight/lenis";

mount(() => {
    const lenis = new Lenis();

    function raf(time: number): void {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(() => {
        lenis.raf(performance.now());
        requestAnimationFrame(raf);
    });

    return (
        <LenisContext.Provider value={lenis}>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
            <link href="https://fonts.googleapis.com/css?family=Tilt+Neon&display=optional" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css?family=Rubik&display=optional" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css?family=Baloo+2&display=optional" rel="stylesheet" />
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
            <StartClient />
        </LenisContext.Provider>
    );
}, document.getElementById("app")!);
