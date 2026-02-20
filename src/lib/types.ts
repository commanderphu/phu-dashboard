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

export interface NowPlaying {
  title: string;
  artist: string;
  album: string;
  albumArt: string;
  url?: string;
  isPlaying: boolean;
  progress: number; // ms
  duration: number; // ms
  source: MusicProvider;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  image: string;
  url: string;
}

export type MusicProvider = "spotify" | "navidrome";

export interface MusicDataResult {
  provider: MusicProvider;
  nowPlaying: NowPlaying | null;
  topTracks: MusicTrack[];
  loading: boolean;
  error: string | null;
}
export interface MusicTopTracksResponse {
  provider: MusicProvider;
  tracks: MusicTrack[];
}

/* ========= 🎮 Twitch ========= */
export interface TwitchUser {
  login: string;
  display_name: string;
  avatar: string;
  description: string;
}

export interface TwitchStatus {
  online: boolean;
  viewerCount: number;
  user: TwitchUser;
}

export interface TwitchData {
  status: TwitchStatus | null;
  followerCount: number | null;
  loading: boolean;
  error: string | null;
}
