import { Home, Bus, Cloud, Music, Sunrise } from "lucide-react";

export const IconHome    = ({ className }: { className?: string }) => <Home className={`h-6 w-6 ${className ?? ""}`} />;
export const IconBus     = ({ className }: { className?: string }) => <Bus className={`h-6 w-6 ${className ?? ""}`} />;
export const IconCloud   = ({ className }: { className?: string }) => <Cloud className={`h-6 w-6 ${className ?? ""}`} />;
export const IconMusic   = ({ className }: { className?: string }) => <Music className={`h-6 w-6 ${className ?? ""}`} />;
export const IconBriefing= ({ className }: { className?: string }) => <Sunrise className={`h-6 w-6 ${className ?? ""}`} />;
