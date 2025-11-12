// src/app/App.tsx
import { Suspense,useState} from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { routes, toDockItems } from "@/routes";
import { Thermometer, Wifi } from "lucide-react";
import NotFound from "@/pages/NotFound.tsx";
import { useScrollTop } from "@/hooks/useScrollTop";
import { useRouteTitle } from "@/hooks/useRouteTitle";
import { useWeather } from "@/hooks/useWeather";

function RouteFallback() {
  return (
    <div className="grid place-items-center py-16 text-muted">
      Lädt …
    </div>
  );
}

// -----------------------------------------------
// 🧠 AppContent – läuft *innerhalb* des Routers
// -----------------------------------------------
function AppContent() {
  useScrollTop();
  useRouteTitle();
  const [user, setUser] = useState<{ name: string } | null>(null);
  const weather = useWeather();

  return (
    <Layout
        user={user}
        onLogin={() => setUser({ name: "Joshua Phu" })}
        onLogout={() => setUser(null)}
      dockProps={{
        items: toDockItems(),
        maxVisible: 3,
        badges:
          weather.current != null
            ? { "/wetter": `${Math.round(weather.current)}°` }
            : {},
        footerLinks: [
          { label: "Impressum", href: "/impressum" },
          { label: "Datenschutz", href: "/datenschutz" },
          {
            label: "GitHub",
            href: "https://github.com/commanderphu",
            external: true,
          },
        ],
        rightSlot: (
          <div className="hidden md:flex items-center gap-2">
            {/* Netzwerkstatus */}
            <span className="inline-flex items-center gap-1 rounded-xl border border-border bg-elev px-2 py-1 text-xs text-fg">
              <Wifi className="h-4 w-4" /> Online
            </span>

            {/* Temperaturanzeige */}
            {weather.current != null && (
              <span className="inline-flex items-center gap-1 rounded-xl border border-border bg-elev px-2 py-1 text-xs text-fg">
                <Thermometer className="h-4 w-4" />{" "}
                {Math.round(weather.current)}°
              </span>
            )}
          </div>
        ),
      }}
    >
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {routes.map((r) => (
            <Route key={r.to} path={r.to} element={r.element(weather)} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

// -----------------------------------------------
// 🧩 App Root
// -----------------------------------------------
export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
