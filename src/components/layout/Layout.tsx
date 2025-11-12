// src/components/layout/Layout.tsx
// src/components/layout/Layout.tsx
import { Suspense } from "react";
import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import DockFade from "@/components/DockFade";
import DockPadding from "@/components/DockPadding";
import DockNav from "@/components/DockNav";

type LayoutProps = {
  children: ReactNode;
  dockProps: React.ComponentProps<typeof DockNav>;
  user?: { name: string } | null;
  onLogin?: () => void;
  onLogout?: () => void;
};

export function Layout({ children, dockProps, user,onLogin, onLogout }: LayoutProps) {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <Header user={user} onLogin={onLogin} onLogout={onLogout}  />

      <div className="mx-auto max-w-7xl px-4 py-4">
        <main className="flex flex-col gap-4">
          <Suspense fallback={<div className="py-16 text-muted text-center">Lädt…</div>}>
            {children}
          </Suspense>
          <DockPadding />
        </main>
      </div>

      <DockFade />
      <DockNav {...dockProps} />
    </div>
  );
}
