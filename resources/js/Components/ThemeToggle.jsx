import { Sun, Moon } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { useTheme } from '@/Contexts/ThemeContext';

export default function ThemeToggle() {
    const { dark, toggleTheme } = useTheme();

    return (
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </Button>
    );
}