// @refresh reload

import { JSX } from "solid-js";

export default function Page(): JSX.Element {
    return (
        <main class="container min-h-screen max-w-2xl px-4 py-16 md:px-0">
            <h1 class="text-2xl font-bold text-white md:text-4xl">Selamat Datang!</h1>
            <p class="text-sm text-white">Silakan buat pembayaran QRIS untuk produk atau jasa yang Anda jual.</p>

            <div class="mt-12">
                <button class="w-fit rounded-full bg-white px-4 py-1.5">
                    <p class="text-sm font-bold uppercase text-black md:text-base">
                        Buat Pembayaran Baru
                    </p>
                </button>


                <div class="mt-12">
                    <p class="text-xl font-bold text-white">Aktivitas Terbaru</p>

                    <div class="mt-4 grid grid-cols-1 gap-4">
                        <div class="rounded-lg bg-white p-4">
                            <p class="text-sm font-bold text-black">Invoice #123142</p>
                            <p class="text-xl text-black">Rp 100.000</p>
                            <div class="mt-4 flex flex-row justify-between">
                                <p class="text-sm font-bold text-black">2024-01-01</p>
                                <p class="text-sm font-bold text-black">Gagal</p>
                            </div>
                        </div>

                        <div class="rounded-lg bg-white p-4">
                            <p class="text-sm font-bold text-black">Invoice #123142</p>
                            <p class="text-xl text-black">Rp 100.000</p>
                            <div class="mt-4 flex flex-row justify-between">
                                <p class="text-sm font-bold text-black">2024-01-01</p>
                                <p class="text-sm font-bold text-black">Gagal</p>
                            </div>
                        </div>

                        <div class="rounded-lg bg-white p-4">
                            <p class="text-sm font-bold text-black">Invoice #123142</p>
                            <p class="text-xl text-black">Rp 100.000</p>
                            <div class="mt-4 flex flex-row justify-between">
                                <p class="text-sm font-bold text-black">2024-01-01</p>
                                <p class="text-sm font-bold text-black">Gagal</p>
                            </div>
                        </div>

                        <div class="rounded-lg bg-white p-4">
                            <p class="text-sm font-bold text-black">Invoice #123142</p>
                            <p class="text-xl text-black">Rp 100.000</p>
                            <div class="mt-4 flex flex-row justify-between">
                                <p class="text-sm font-bold text-black">2024-01-01</p>
                                <p class="text-sm font-bold text-black">Gagal</p>
                            </div>
                        </div>

                        <div class="rounded-lg bg-white p-4">
                            <p class="text-sm font-bold text-black">Invoice #123142</p>
                            <p class="text-xl text-black">Rp 100.000</p>
                            <div class="mt-4 flex flex-row justify-between">
                                <p class="text-sm font-bold text-black">2024-01-01</p>
                                <p class="text-sm font-bold text-black">Gagal</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
