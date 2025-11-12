import { useEffect, useState, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import type { Weather } from "@/lib/types";
import { codeToText } from "@/lib/weather";
import { Header } from "@/components/Header";
import {routes, toDockItems} from "@/routes";
import DockNav from "@/components/DockNav.tsx";
import DockFade from "@/components/DockFade";
import DockPadding from "@/components/DockPadding.tsx";
import { Thermometer, Wifi } from "lucide-react";
import NotFound from "@/pages/NotFound.tsx";


function  RouteFallback() {
    return (
        <div className="grid place-items-center py-16 text-muted">
            Lädt ....
        </div>
    )
}


function RouteTitle(){
    const { pathname } = useLocation();
    useEffect(() => {
        const label = routes.find((r)=>r.to === pathname)?.label?? "Dashboard";
        document.title = `${label} - Dashboard`;
    }, [pathname]);
    return null;
}

function ScrollToTop(){
    const {pathname} = useLocation();
    useEffect(() => {
    window.scroll(0, 0);
    }, [pathname]);
    return null;
}

export default function App() {
  const [weather, setWeather] = useState<Weather>({ current: null, daily: [] });

  useEffect(() => {
    const lat = 50.3569, lon = 7.5889;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m&daily=temperature_2m_max,weather_code&timezone=auto`)
        .then((r) => r.json())
        .then((data) => {
          const days = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
          const daily = (data.daily?.time || []).slice(0, 4).map((iso: string, i: number) => ({
            day: i === 0 ? "Heute" : days[new Date(iso).getDay()],
            temp: Math.round(data.daily.temperature_2m_max?.[i] ?? 0),
            desc: codeToText(data.daily.weather_code?.[i]),
          }));
          setWeather({ current: data.current?.temperature_2m ?? null, daily });
        })
        .catch(() => {});
  }, []);

  //const sidebarItems = toSidebarItems();
  //const mobileItems = toMobileItems();

  return (
      <Router>
          <div className="min-h-screen bg-bg text-fg ">
              <Header />
              <RouteTitle />
              <ScrollToTop />
              <div className="mx-auto max-w-7xl px-4 py-4">
                  <main className="flex flex-col gap-4">
                      {/* ⬇️ Alles, was lazy geladen wird, kommt in Suspense */}
                      <Suspense fallback={<RouteFallback />}>
                          <Routes>
                              {routes.map((r) => (
                                  <Route key={r.to} path={r.to} element={r.element(weather)} />
                              ))}
                              <Route path="*" element={<NotFound />} />
                          </Routes>
                      </Suspense>
                      <DockPadding />
                  </main>
              </div>
              <DockFade/>

              <DockNav
                  items={toDockItems()}
                  maxVisible={3}
                  badges={weather.current != null ? { "/wetter": `${Math.round(weather.current)}°` } : {}}
                  footerLinks={[
                      { label: "Impressum", href: "/impressum" },
                      { label: "Datenschutz", href: "/datenschutz" },
                      { label: "GitHub", href: "https://github.com/commanderphu", external: true },
                  ]}

                  rightSlot={
                      <div className="hidden md:flex items-center gap-2">
                          {/* Netzwerk-Indikator (Dummy) */}
                          <span
                              className="inline-flex items-center gap-1 rounded-xl border border-border bg-elev px-2 py-1 text-xs text-fg"
                              aria-label="Netzwerkstatus: Online"
                              title="Online"
                          >
                              <Wifi className="h-4 w-4" />
                            Online
                          </span>

                          {/* Temperatur-Badge */}
                          {weather.current != null && (
                              <span
                                  className="inline-flex items-center gap-1 rounded-xl border border-border bg-elev px-2 py-1 text-xs text-fg"
                                  aria-label={`Aktuelle Temperatur: ${Math.round(weather.current)} Grad`}
                                  title="Aktuelle Temperatur"
                              >
                            <Thermometer className="h-4 w-4" />
                                  {Math.round(weather.current)}°
                            </span>
                          )}
                      </div>
                  }
              />

          </div>
      </Router>
  );
}
