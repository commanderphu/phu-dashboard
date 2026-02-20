type Greeting = string;

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getDailyGreeting(): Greeting {
  const now   = new Date();
  const hour  = now.getHours();
  const day   = now.getDay(); // 0=So, 1=Mo, ..., 6=Sa
  const month = now.getMonth(); // 0=Jan

  const isWeekend  = day === 0 || day === 6;
  const isFriday   = day === 5;
  const isMonday   = day === 1;

  const isSummer = month >= 5 && month <= 8;
  const isWinter = month === 11 || month <= 1;
  const isSpring = month >= 2 && month <= 4;
  const isAutumn = month >= 9 && month <= 10;

  // 🌙 Nacht (0–6)
  if (hour < 6) {
    return pick([
      "🌙 Noch wach in Koblenz?",
      "🦉 Late-Night-Session läuft",
      "🎮 Nacht-Gaming-Modus",
      "💻 Bug-Hunting um Mitternacht",
      "🎵 Lo-Fi & Koblenz bei Nacht",
    ]);
  }

  // 🌅 Morgen (6–10)
  if (hour < 10) {
    if (isMonday) return pick([
      "☕ Montag. Koblenz wartet.",
      "💪 Neue Woche, neuer Code",
      "🗓 Montag-Grind startet",
    ]);
    if (isWeekend) return pick([
      "🛏 Wochenende! Ausschlafen?",
      "☕ Ruhiger Morgen an der Mosel",
      "🎮 Entspannt in den Tag",
    ]);
    return pick([
      "☕ Guten Morgen, Koblenz!",
      "🌅 Rhein & Kaffee – los geht's",
      "💻 Frischer Code-Tag",
      "🎵 Morgen-Playlist läuft?",
    ]);
  }

  // 🌞 Vormittag (10–12)
  if (hour < 12) {
    return pick([
      "💻 Produktive Stunden incoming",
      "🎬 Content-Ideen sammeln?",
      "🎮 Warm-up vor dem Grind",
      "🛠 Was wird heute gebaut?",
      isSummer ? "☀️ Koblenz brennt – bleib drin, code" : "🌥 Koblenz-Wetter zum Coden",
    ]);
  }

  // 🍽 Mittag (12–14)
  if (hour < 14) {
    return pick([
      "🍕 Mittag – kurz AFK?",
      "🎵 Mittagspause-Playlist",
      "🌉 Deutsches Eck ruft… oder doch coden?",
      "⚡ Halbzeit – was läuft?",
    ]);
  }

  // ☀️ Nachmittag (14–18)
  if (hour < 18) {
    if (isWeekend && isSummer) return pick([
      "🏊 Blaues Wunder Koblenz?",
      "🌊 Rheinbad-Wetter!",
      "🎮 Wochenend-Session",
    ]);
    if (isWeekend) return pick([
      "🎮 Wochenend-Gaming?",
      "🎬 Content-Day?",
      "🎵 Playlist für den Nachmittag",
    ]);
    return pick([
      "💻 Deep-Work-Phase",
      "🎧 Kopfhörer rein, Welt aus",
      "🛠 Was wird heute geshippt?",
      "🎬 Nachmittags-Grind",
      isAutumn ? "🍂 Herbst-Coding-Vibes" : "",
      isSpring ? "🌸 Frühling in Koblenz" : "",
    ].filter(Boolean) as string[]);
  }

  // 🌆 Abend (18–22)
  if (hour < 22) {
    if (isFriday) return pick([
      "🎉 Freitagabend – Stream?",
      "🎮 TGIF – Zock-Session?",
      "🍻 Feierabend in Koblenz",
    ]);
    if (isWeekend) return pick([
      "🎮 Wochenend-Abend-Session",
      "🎬 Stream-Zeit!",
      "🎵 Abend-Playlist an der Mosel",
    ]);
    return pick([
      "🎮 Abend-Gaming?",
      "🎬 Stream-Abend?",
      "💻 Side-Project-Zeit",
      "🎵 Feierabend-Playlist",
      isWinter ? "🕯 Gemütlicher Koblenz-Abend" : "🌆 Goldene Stunde am Rhein",
    ]);
  }

  // 🌃 Spätnacht (22–24)
  return pick([
    "🌃 Koblenz schläft – du nicht",
    "🎮 Late-Night-Gaming",
    "💻 One more commit…",
    "🎵 Nacht-Playlist läuft",
    "🦉 Nachteulen-Modus",
  ]);
}
