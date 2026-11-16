import { useState, useRef, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { LogOut, Menu, User } from 'lucide-react';
import ThemeToggle from '@/Components/ThemeToggle';
import { Button } from '@/Components/ui/button';
import { Avatar, AvatarFallback } from '@/Components/ui/avatar';

export default function Navbar({ onOpenMobileMenu }) {
    const { auth } = usePage().props;
    const user = auth?.user || {};

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    async function logout() {
        setDropdownOpen(false);
        const result = await Swal.fire({
            icon: 'question',
            title: 'Log out?',
            text: 'You will need to log in again to continue.',
            showCancelButton: true,
            confirmButtonText: 'Yes, log out',
            confirmButtonColor: '#2563eb',
        });
        if (!result.isConfirmed) return;

        router.post('/logout', {}, {
            onSuccess: () =>
                Swal.fire({
                    icon: 'success',
                    title: 'Logged out',
                    text: 'See you soon.',
                    timer: 1500,
                    showConfirmButton: false,
                }),
        });
    }

    return (
        <header className="relative flex h-14 items-center justify-between border-b bg-card px-4">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={onOpenMobileMenu}>
                <Menu className="size-5" />
            </Button>
            <div className="hidden md:block" />

            <div className="flex items-center gap-3">
                <ThemeToggle />

                {/* Custom Native Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-2 rounded-md p-1 text-sm hover:bg-accent focus:outline-none"
                    >
                        <Avatar className="size-8">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                                <User className="size-4" />
                            </AvatarFallback>
                        </Avatar>
                    </button>

                    {dropdownOpen && (
                        <div className="absolute right-0 z-50 mt-2 w-56 rounded-md border bg-card p-1 text-card-foreground shadow-lg">
                            <div className="border-b px-3 py-2">
                                <div className="text-sm font-semibold text-foreground">{user.name}</div>
                            </div>
                            <div className="py-1">
                                <Link
                                    href="/profile"
                                    className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                    onClick={() => setDropdownOpen(false)}
                                >
                                    <User className="size-4" /> Profile
                                </Link>
                                <button
                                    type="button"
                                    onClick={logout}
                                    className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
                                >
                                    <LogOut className="size-4" /> Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}