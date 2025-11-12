export function QuickLinks() {
  const links = [
    { name: "Wiki", url: "https://wiki.phudevelopement.xyz" },
    { name: "Jellyfin", url: "https://jellyfin.phudevelopement.xyz" },
    { name: "Home Assistant", url: "https://home.phudevelopement.xyz" },
    { name: "GitHub", url: "https://github.com/commanderphu" },
  ];
  return (
    <ul className="grid grid-cols-2 gap-2 text-sm">
      {links.map((x) => (
        <li key={x.name}>
          <a
            href={x.url}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-2 hover:border-ok/50"
          >
            <span>{x.name}</span>
            <svg
              className="h-4 w-4 opacity-60 group-hover:opacity-100"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path d="M7 17L17 7M10 7h7v7" />
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
