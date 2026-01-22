import { Monitor, Moon, Sun } from 'lucide-react';

import { Button } from './button';
import { useTheme } from './theme-provider';

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('system');
    } else {
      setTheme('dark');
    }
  };

  const getIcon = () => {
    if (theme === 'dark') {
      return <Moon className="h-4 w-4" />;
    }
    if (theme === 'light') {
      return <Sun className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  const getLabel = () => {
    if (theme === 'dark') {
      return 'Switch to light mode';
    }
    if (theme === 'light') {
      return 'Switch to system mode';
    }
    return 'Switch to dark mode';
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      className="h-auto w-auto p-1 cursor-pointer hover:opacity-80 transition-opacity"
      aria-label={getLabel()}
    >
      {getIcon()}
    </Button>
  );
}
