import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LaptopMinimalIcon } from "lucide-react";
import { MoonIcon } from "lucide-react";
import { SunIcon } from "lucide-react";
import { useEffect, useState } from "react";

export default function SettingsPage() {
    return (
        <div className="space-y-8">
            <h2 className="font-semibold text-2xl">Settings</h2>

            <div className="space-y-4">
                <h3 className="font-medium text-xl">Preferences</h3>

                <div className="grid border rounded-sm divide-y *:p-4">
                    <div className="justify-between flex place-items-center gap-4">
                        <div className="space-y-1">
                            <div className="">Theme</div>
                            <p className="text-muted-foreground text-sm text-pretty">
                                Change between dark and light modes.
                            </p>
                        </div>
                        <ThemeToggle />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="font-medium text-xl">Profile</h3>

                <div className="grid border rounded-sm divide-y *:p-4">
                    <div className="justify-between flex place-items-center gap-4">
                        <div className="space-y-1">
                            <div className="">Change password</div>
                            <p className="text-muted-foreground text-sm text-pretty">
                                You can change the name of your club but not the handle. Your club's public profile page
                                will still be accessible via the handle.
                            </p>
                        </div>
                        <Button variant="outline">Rename</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    const icons = {
        light: SunIcon,
        dark: MoonIcon,
        system: LaptopMinimalIcon,
    };

    const [Icon, setIcon] = useState(icons[theme || "system"]);

    useEffect(() => {
        setIcon(icons[theme]);
    }, [theme]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <Icon />
                    <span className="capitalize">{theme}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                    <SunIcon /> Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <MoonIcon /> Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                    <LaptopMinimalIcon /> System
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
