import { createContext, useContext } from 'react';
import { usePage } from '@inertiajs/react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const { auth } = usePage().props;
    const user = auth?.user || null;

    return (
        <AuthContext.Provider value={{ user }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}