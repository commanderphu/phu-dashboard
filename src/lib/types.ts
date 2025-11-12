import type { JSX } from "react";

/* ========= 🌦 Wetter ========= */
export type Weather = {
  current: number | null;
  daily: { day: string; temp: number; desc: string }[];
};

/* ========= 🧭 Navigation ========= */
export type SidebarItem = { to: string; label: string; end?: boolean };
export type MobileNavItem = { to: string; label: string; icon: JSX.Element };

/* ========= 🧠 System & Infrastruktur ========= */

// 🧩 Pi-hole API
export type PiHoleStats = {
  domains_being_blocked: number;
  dns_queries_today: number;
  ads_blocked_today: number;
  ads_percentage_today: number;
};

// ⚙️ Caddy API
export type CaddySite = {
  id: string;
  host: string;
  handler: string;
};

// 💻 Systemstatus
export type SystemInfo = {
  host: string;
  uptime: string;
  cpuLoad: number;
  memUsage: number;
};

// 🚌 Verkehr (VRM / DB)
export type TrafficDeparture = {
  line: string;
  direction: string;
  time: string;
};

// 🧩 Allgemeine Helper-Typen (optional für Widgets)
export type WidgetProps = {
  title: string;
  icon?: JSX.Element;
  className?: string;
  children?: JSX.Element | JSX.Element[];
};
