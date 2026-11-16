import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3, BookOpen, ClipboardList, GraduationCap, LayoutDashboard, School, Settings,
} from 'lucide-react';

const links = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Exams', href: '/exams', icon: ClipboardList },
    { label: 'Schools', href: '/schools', icon: School, roles: ['super_admin'] },
    { label: 'Subjects', href: '/subjects', icon: BookOpen, roles: ['super_admin'] },
    { label: 'Students', href: '#', icon: GraduationCap },
    { label: 'Results', href: '#', icon: BarChart3 },
    { label: 'Settings', href: '#', icon: Settings },
];

export default function Sidebar({ open }) {
    const { props, url } = usePage();
    const role = props.auth?.user?.role;

    const isActive = (href) => (href === '/' ? url === '/' : url.startsWith(href));

    const linkClass = (active) =>
        `flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
            active
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        }`;

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-40 w-60 shrink-0 border-r bg-card transition-transform md:static md:translate-x-0 ${
                open ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
            <div className="flex h-14 items-center border-b px-5 font-bold text-primary">JamaJoint</div>
            <nav className="flex flex-col gap-1 p-3">
                {links
                    .filter((link) => !link.roles || link.roles.includes(role))
                    .map(({ label, href, icon: Icon }) =>
                        href === '#' ? (
                            <a key={label} href="#" className={linkClass(false)}>
                                <Icon className="size-4" /> {label}
                            </a>
                        ) : (
                            <Link key={label} href={href} className={linkClass(isActive(href))}>
                                <Icon className="size-4" /> {label}
                            </Link>
                        )
                    )}
            </nav>
        </aside>
    );
}