export const PATH = {
    overview: "/",
    briefing: "/briefing",
    verkehr: "/verkehr",
    wetter: "/wetter",
    musik: "/musik",
    energie: "/energie",
    einstellungen: "/einstellungen",
} as const;

export type AppPath = (typeof PATH)[keyof typeof PATH];
