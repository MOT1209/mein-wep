'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './theme-provider';
import { Button } from './ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-9 h-9" />;

  const isDark = theme === 'dark';

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative w-9 h-9 rounded-xl p-0 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors"
    >
      <Sun className={`h-[1.2rem] w-[1.2rem] transition-all ${isDark ? 'rotate-0 scale-100' : 'rotate-90 scale-0'} text-amber-500`} />
      <Moon className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${isDark ? '-rotate-90 scale-0' : 'rotate-0 scale-100'} text-violet-400`} />
      <span className="sr-only">تبديل المظهر</span>
    </Button>
  );
}
