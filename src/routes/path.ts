export const PATH = {
    overview: "/",
    briefing: "/briefing",
    arbeit: "/arbeit",
    verkehr: "/verkehr",
    wetter: "/wetter",
    musik: "/musik",
} as const;

export type AppPath = (typeof PATH)[keyof typeof PATH];
