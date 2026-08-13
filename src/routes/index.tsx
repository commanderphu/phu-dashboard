/* eslint react-refresh/only-export-components: "off" */
import { lazy } from "react";
import type { Weather } from "@/lib/types";
import type { ReactElement } from "react";
import { PATH } from "./path";
import { IconHome, IconBus, IconCloud, IconMusic, IconBriefing } from "./icons";

// ⬇️ Lazy-Komponenten (Pages exportieren bei dir "named"; deshalb .then(...default: m.X))
const OverviewPage    = lazy(() => import("@/pages/Overview").then(m => ({ default: m.Overview })));
const VerkehrPage     = lazy(() => import("@/pages/Verkehr").then(m => ({ default: m.Verkehr })));
const WetterPage      = lazy(() => import("@/pages/Wetter").then(m => ({ default: m.Wetter })));
const MusicPage       = lazy(() => import("@/pages/MusicPage").then(m => ({ default: m.default })));
const BriefingPage    = lazy(() => import("@/pages/Briefing").then(m => ({ default: m.Briefing })));

export type RouteItem = {
  to: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  end?: boolean;
  group?: "primary" | "more";
  element: (weather: Weather) => ReactElement;
};

export const routes: RouteItem[] = [
  {
    to: PATH.overview,
    label: "Übersicht",
    icon: IconHome,
    end: true,
    group: "primary",
    element: (w) => <OverviewPage weather={w} />,
  },
  {
    to: PATH.briefing,
    label: "Briefing",
    icon: IconBriefing,
    group: "primary",
    element: () => <BriefingPage />,
  },
  {
    to: PATH.verkehr,
    label: "Verkehr",
    icon: IconBus,
    group: "primary",
    element: () => <VerkehrPage />,
  },
  {
    to: PATH.wetter,
    label: "Wetter",
    icon: IconCloud,
    group: "primary",
    element: (w) => <WetterPage weather={w} />,
  },
  {
    to: PATH.musik,
    label: "Musik",
    icon: IconMusic,
    group: "more",
    element: () => <MusicPage />,
  },
];

const groupRoutes = () => {
  const primary = routes.filter((r) => (r.group ?? "primary") === "primary");
  const more    = routes.filter((r) => (r.group ?? "primary") === "more");
  return { primary, more };
};


export const toDockItems = () => {
  const { primary, more } = groupRoutes();
  return [...primary, ...more].map((r) => ({ to: r.to, label: r.label, icon: r.icon!, end: r.end }));
};

export { PATH , groupRoutes}; 
