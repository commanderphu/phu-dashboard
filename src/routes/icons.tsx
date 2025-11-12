import { Home, Bus, Cloud, Music, Battery, Settings } from "lucide-react";

export const IconHome    = ({ className }: { className?: string }) => <Home className={`h-6 w-6 ${className ?? ""}`} />;
export const IconBus     = ({ className }: { className?: string }) => <Bus className={`h-6 w-6 ${className ?? ""}`} />;
export const IconCloud   = ({ className }: { className?: string }) => <Cloud className={`h-6 w-6 ${className ?? ""}`} />;
export const IconMusic   = ({ className }: { className?: string }) => <Music className={`h-6 w-6 ${className ?? ""}`} />;
export const IconBattery = ({ className }: { className?: string }) => <Battery className={`h-6 w-6 ${className ?? ""}`} />;
export const IconSettings= ({ className }: { className?: string }) => <Settings className={`h-6 w-6 ${className ?? ""}`} />;
