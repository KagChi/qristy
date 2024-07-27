import Lenis from "@studio-freight/lenis";
import { createContext, useContext } from "solid-js";

export const LenisContext = createContext<Lenis>();

export const useLenis = (): Lenis => useContext(LenisContext)!;
