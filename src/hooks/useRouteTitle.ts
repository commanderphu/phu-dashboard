import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { routes } from "@/routes";

export function useRouteTitle(defaultTitle = "Dashboard") {
  const { pathname } = useLocation();

  useEffect(() => {
    const label = routes.find((r) => r.to === pathname)?.label ?? defaultTitle;
    document.title = `${label} – Dashboard`;
  }, [pathname, defaultTitle]);
}
