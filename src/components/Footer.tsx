export function Footer() {
  return (
    <footer className="mt-14 flex items-center justify-between border-t border-border pt-4 text-xs text-muted">
      <span>© {new Date().getFullYear()} Joshua Phu • Private Dashboard</span>
      <a className="hover:text-ok" href="#">
        Impressum
      </a>
    </footer>
  );
}
