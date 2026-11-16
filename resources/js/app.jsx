import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { ThemeProvider } from '@/Contexts/ThemeContext';
import { AuthProvider } from '@/Contexts/AuthContext';

createInertiaApp({
    title: (title) => (title ? `${title} - JamaJoint` : 'JamaJoint'),
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });
        return pages[`./Pages/${name}.jsx`];
    },
    setup({ el, App, props }) {
        createRoot(el).render(
            <ThemeProvider>
                <App {...props} />
            </ThemeProvider>
        );
    },
    progress: { color: '#2563eb' },
});