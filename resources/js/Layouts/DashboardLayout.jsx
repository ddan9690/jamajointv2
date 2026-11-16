import { useState } from 'react';
import { Head } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';

export default function DashboardLayout({ title, children }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Head title={title} />

            <div className="flex min-h-screen">
                {open && (
                    <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setOpen(false)} />
                )}

                <Sidebar open={open} />

                <div className="flex min-w-0 flex-1 flex-col">
                    <Navbar onOpenMobileMenu={() => setOpen(true)} />

                    <main className="flex-1 p-4 sm:p-6">{children}</main>

                    <Footer />
                </div>
            </div>
        </>
    );
}