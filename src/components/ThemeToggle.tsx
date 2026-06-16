import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative"
      title={theme === "light" ? "Switch to Dark Blue" : "Switch to Light"}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all darkblue:-rotate-90 darkblue:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all darkblue:rotate-0 darkblue:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
