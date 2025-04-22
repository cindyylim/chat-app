"use client";
import { MoonIcon, SunIcon, VolumeX, Volume2 } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { usePreferences } from "@/store/usePreferences";
import { useSound } from "use-sound";
const PreferencesTab = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { soundEnabled, setSoundEnabled } = usePreferences();
  const [playMouseClick] = useSound("/sounds/mouse-click.mp3");
  const [playSoundOn] = useSound("/sounds/sound-on.mp3");
  const [playSoundOff] = useSound("/sounds/sound-off.mp3");

  // Prevent hydration mismatch by only rendering after component is mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until after hydration
  if (!mounted) {
    return (
      <div className="flex flex-wrap gap-2 px-1 md:px-2">
        <Button variant="outline" size="icon" disabled>
          <SunIcon className="size-[1.2rem]" />
        </Button>
        <Button variant="outline" size="icon" disabled>
          <MoonIcon className="size-[1.2rem]" />
        </Button>
        <Button variant="outline" size="icon" disabled>
          <VolumeX className="size-[1.2rem]" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 px-1 md:px-2">
      <Button
        variant={theme === "light" ? "default" : "outline"}
        size={"icon"}
        onClick={() => {
          setTheme("light");
          soundEnabled && playMouseClick();
        }}
      >
        <SunIcon className="size-[1.2rem]" />
      </Button>
      <Button
        variant={theme === "dark" ? "default" : "outline"}
        size={"icon"}
        onClick={() => {
          setTheme("dark");
          soundEnabled && playMouseClick();
        }}
      >
        <MoonIcon className="size-[1.2rem]" />
      </Button>
      <Button
        variant="outline"
        size={"icon"}
        onClick={() => {
          setSoundEnabled(!soundEnabled);
          soundEnabled ? playSoundOff() : playSoundOn();
        }}
      >
        {soundEnabled ? (
          <Volume2 className="size-[1.2rem] text-muted-foreground" />
        ) : (
          <VolumeX className="size-[1.2rem] text-muted-foreground" />
        )}
      </Button>
    </div>
  );
};

export default PreferencesTab;
