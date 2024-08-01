/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// @refresh reload

import { IconCircleX } from "@tabler/icons-solidjs";
import { createEffect, createResource, createSignal, For, JSX, Show } from "solid-js";
import { fetchTransactions } from "../actions/transactions";

export default function Page(): JSX.Element {
    const [paymentDialog, setPaymentDialog] = createSignal(false);
    const [transactions, { mutate }] = createResource(1, fetchTransactions);
    const [moreButtonState, setMoreButtonState] = createSignal(true);

    createEffect(() => {
        const handleOutsideClick = (event: MouseEvent): void => {
            const target = event.target;
            if (paymentDialog() && target instanceof HTMLElement && !target.closest("#app > dialog > div > form")) {
                setPaymentDialog(false);
            }
        };

        document.addEventListener("mousedown", e => handleOutsideClick(e));

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [paymentDialog()]);

    return (
        <>
            <dialog open={paymentDialog()} class="fixed inset-0 z-[90] size-full overflow-y-auto bg-transparent backdrop-blur-sm">
                <IconCircleX class="absolute right-0 top-0 m-4 cursor-pointer text-white" size={32} onClick={() => setPaymentDialog(false)} />
                <div class="flex size-full items-center justify-center px-4">
                    <form class="container max-w-2xl rounded-md bg-[#161E1E]" action="">
                        <div class="flex w-full flex-col gap-4 rounded-md px-6 py-4 text-white">
                            <div class="flex flex-col">
                                <h1 class="text-start text-2xl font-bold md:text-3xl">Buat pembayaran baru</h1>
                                <p class="text-xs font-light">Masukan jumlah pembayaran yang akan dibayar.</p>
                            </div>

                            <div class="mt-8 flex flex-col gap-2">
                                <div class="flex w-full flex-col gap-2">
                                    <label for="jumlah" class="font-medium">Jumlah</label>
                                    <input name="jumlah" class="rounded-md p-3 text-black" type="text" placeholder="Rp 100,000" />
                                </div>
                            </div>

                            <button type="submit" class="w-full rounded-md bg-white px-4 py-2 font-bold text-black hover:opacity-60">
                                Buat Pembayaran
                            </button>
                        </div>
                    </form>
                </div>
            </dialog>
            <main class="container min-h-screen max-w-2xl p-4 md:px-0">
                <h1 class="text-2xl font-bold text-white md:text-4xl">Selamat Datang!</h1>
                <p class="text-sm text-white">Silakan buat pembayaran QRIS untuk produk atau jasa yang Anda jual.</p>

                <div class="mt-2">
                    <button onClick={(() => setPaymentDialog(!paymentDialog()))} class="w-fit rounded-full bg-white px-4 py-1.5">
                        <p class="text-sm font-bold uppercase text-black md:text-base">
                            Buat Pembayaran Baru
                        </p>
                    </button>


                    <div class="mt-12">
                        <p class="text-xl font-bold text-white">Aktivitas Terbaru</p>

                        <div class="mt-4 grid grid-cols-1 gap-2">
                            <Show when={!transactions.loading}>
                                <For each={transactions()}>
                                    {transaction => <div class="rounded-lg bg-white p-4">
                                        <p class="text-sm font-bold text-black">Invoice #{transaction.invoiceId}</p>
                                        <p class="text-xl text-black">Rp {(transaction.amount + (transaction.amount * transaction.tax)).toLocaleString()}</p>
                                        <div class="mt-4 flex flex-row justify-between">
                                            <p class="text-sm font-bold text-black">{new Date(transaction.createdAt).toLocaleString()}</p>
                                            <p class="text-sm font-bold text-black">{transaction.paymentGatewayTransactionStatus.charAt(0).toUpperCase() + transaction.paymentGatewayTransactionStatus.slice(1)}</p>
                                        </div>
                                    </div>
                                    }
                                </For>
                            </Show>

                            <Show when={transactions.loading}>
                                <For each={[1, 2, 3, 4, 5]}>
                                    {() => <div class="animate-pulse rounded-lg bg-white p-4">
                                        <div class="h-4 w-1/3 rounded bg-gray-300"></div>
                                        <div class="mt-2 h-6 w-1/2 rounded bg-gray-300"></div>
                                        <div class="mt-4 flex flex-row justify-between">
                                            <div class="h-4 w-1/4 rounded bg-gray-300"></div>
                                            <div class="h-4 w-1/4 rounded bg-gray-300"></div>
                                        </div>
                                    </div>
                                    }
                                </For>
                            </Show>

                            <Show when={!transactions.loading && (transactions()?.length ?? 0) > 0 && moreButtonState()}>
                                <div class="mt-4 flex justify-center">
                                    <button
                                        onClick={() => {
                                            const currentPage = Math.ceil(transactions()!.length / 10);
                                            const nextPage = currentPage + 1;
                                            void fetchTransactions(nextPage).then(newTransactions => {
                                                mutate(prev => [...prev ?? [], ...newTransactions]);
                                                if (newTransactions.length <= 0) setMoreButtonState(false);
                                            });
                                        }}
                                        class="rounded-full bg-white px-4 py-2 text-sm font-bold text-black hover:bg-gray-100"
                                    >
                                        Muat Data Lebih Banyak
                                    </button>
                                </div>
                            </Show>
                        </div>
                    </div>
                </div>
            </main>

            <p class="py-3 text-center text-white">Copyright © 2024 KagChi</p>
        </>
    );
}
