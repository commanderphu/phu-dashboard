import type { JSX } from "react";

export type Weather = {
  current: number | null;
  daily: { day: string; temp: number; desc: string }[];
};

export type SidebarItem = { to: string; label: string; end?: boolean };
export type MobileNavItem = { to: string; label: string; icon: JSX.Element };
