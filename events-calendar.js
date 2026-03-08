/**
 * MCT Event Calendar — "Google Doodle"-style event banner system.
 *
 * Each event defines:
 *   id          – unique slug
 *   name        – display title for the banner
 *   subtitle    – secondary line / call to action
 *   startMonth, startDay  – when the banner begins (inclusive)
 *   endMonth, endDay      – when the banner ends (inclusive)
 *   accentColor – primary gradient color for the banner
 *   accentColor2– secondary gradient color (optional, defaults to darker shade)
 *   textColor   – text color over the gradient
 *   emoji       – decorative emoji shown next to the title
 *   imagePrompt – AI image generation prompt (used by the cron to create the banner)
 *
 * Month: 1-12, Day: 1-31. All dates in Asia/Manila timezone.
 */

const MCT_EVENTS = [
  // ── JANUARY ──
  {
    id: "new-year",
    name: "Happy New Year",
    subtitle: "Maligayang Bagong Taon — from Morning Coffee Thoughts",
    startMonth: 1, startDay: 1,
    endMonth: 1, endDay: 2,
    accentColor: "#c6a700", accentColor2: "#8b6914",
    textColor: "#ffffff",
    emoji: "🎆",
    imagePrompt: "Festive New Year celebration banner, golden fireworks over Manila skyline at night, Philippine flag subtly in background, warm gold and deep navy blue tones, elegant confetti, cinematic wide aspect ratio, no text"
  },
  {
    id: "chinese-new-year",
    name: "Happy Chinese New Year",
    subtitle: "Gong Xi Fa Cai — celebrating our Filipino-Chinese heritage",
    startMonth: 1, startDay: 29,  // approximate — varies yearly
    endMonth: 1, endDay: 30,
    accentColor: "#c41e3a", accentColor2: "#8b1025",
    textColor: "#ffe4b5",
    emoji: "🧧",
    imagePrompt: "Chinese New Year celebration banner, red lanterns, gold dragons, Binondo Manila Chinatown festive scene, red and gold color scheme, no text, cinematic wide"
  },

  // ── FEBRUARY ──
  {
    id: "edsa-revolution",
    name: "EDSA People Power Anniversary",
    subtitle: "Remembering the spirit of 1986 — the power of the Filipino people",
    startMonth: 2, startDay: 25,
    endMonth: 2, endDay: 25,
    accentColor: "#f5c518", accentColor2: "#d4a017",
    textColor: "#1a1a2e",
    emoji: "✊",
    imagePrompt: "EDSA People Power Revolution anniversary, Filipino people standing united along EDSA highway, yellow ribbons, Laban sign, warm golden yellow tones, hope and courage, Manila skyline, cinematic wide, no text"
  },
  {
    id: "valentines-day",
    name: "Happy Valentine's Day",
    subtitle: "Spread love — even over morning coffee",
    startMonth: 2, startDay: 14,
    endMonth: 2, endDay: 14,
    accentColor: "#e91e63", accentColor2: "#ad1457",
    textColor: "#ffffff",
    emoji: "💝",
    imagePrompt: "Valentine's Day banner, soft romantic pink and magenta tones, elegant hearts and roses, warm morning light through a coffee shop window, Philippine aesthetic, no text, cinematic wide"
  },

  // ── MARCH ──
  {
    id: "womens-month",
    name: "Happy Women's Month",
    subtitle: "Celebrating Filipinas — brave, brilliant, and boundless",
    startMonth: 3, startDay: 1,
    endMonth: 3, endDay: 31,
    accentColor: "#9333ea", accentColor2: "#6b21a8",
    textColor: "#ffffff",
    emoji: "💜",
    imagePrompt: "Women's Month celebration banner, powerful diverse Filipina women silhouettes standing together, purple and violet gradient sky, empowerment and unity, flowers blooming, warm golden light, Philippine setting, no text, cinematic wide aspect ratio"
  },

  // ── APRIL ──
  {
    id: "araw-ng-kagitingan",
    name: "Araw ng Kagitingan",
    subtitle: "Day of Valor — honoring the bravery of Filipino soldiers",
    startMonth: 4, startDay: 9,
    endMonth: 4, endDay: 9,
    accentColor: "#1b4332", accentColor2: "#0d2818",
    textColor: "#f0f0f0",
    emoji: "🎖️",
    imagePrompt: "Araw ng Kagitingan Day of Valor banner, Filipino soldiers silhouette at Bataan, Mount Samat cross memorial, military olive green and bronze tones, sunrise, honor and sacrifice, Philippine flag, no text, cinematic wide"
  },

  // ── MAY ──
  {
    id: "labor-day",
    name: "Happy Labor Day",
    subtitle: "Saluting every Filipino worker — here and abroad",
    startMonth: 5, startDay: 1,
    endMonth: 5, endDay: 1,
    accentColor: "#d97706", accentColor2: "#92400e",
    textColor: "#ffffff",
    emoji: "👷",
    imagePrompt: "Labor Day banner, diverse Filipino workers — farmer, nurse, construction worker, OFW, teacher — standing proud, warm amber and burnt orange tones, sunrise over Philippine landscape, solidarity, no text, cinematic wide"
  },

  // ── JUNE ──
  {
    id: "independence-day",
    name: "Happy Independence Day",
    subtitle: "Mabuhay ang Kalayaan ng Pilipinas — June 12, 1898",
    startMonth: 6, startDay: 12,
    endMonth: 6, endDay: 12,
    accentColor: "#0038a8", accentColor2: "#001f5c",
    textColor: "#ffffff",
    emoji: "🇵🇭",
    imagePrompt: "Philippine Independence Day banner, Philippine flag waving majestically, Aguinaldo Shrine in Kawit Cavite, blue and red Philippine national colors, golden sun rays, patriotic and proud, no text, cinematic wide"
  },
  {
    id: "pride-month",
    name: "Happy Pride Month",
    subtitle: "Love is love — celebrating LGBTQ+ Filipinos",
    startMonth: 6, startDay: 1,
    endMonth: 6, endDay: 30,
    accentColor: "#e91e63", accentColor2: "#7b1fa2",
    textColor: "#ffffff",
    emoji: "🏳️‍🌈",
    imagePrompt: "Pride Month celebration banner, rainbow colors flowing gracefully, diverse Filipino people celebrating, Manila cityscape, vibrant and joyful, warm light, no text, cinematic wide"
  },

  // ── JULY ──
  {
    id: "nutrition-month",
    name: "Nutrition Month",
    subtitle: "Healthy Philippines — invest in nutrition, invest in the future",
    startMonth: 7, startDay: 1,
    endMonth: 7, endDay: 31,
    accentColor: "#16a34a", accentColor2: "#15803d",
    textColor: "#ffffff",
    emoji: "🥗",
    imagePrompt: "Nutrition Month banner, fresh Philippine tropical fruits and vegetables, vibrant green and natural tones, healthy Filipino food spread, bright and fresh aesthetic, no text, cinematic wide"
  },

  // ── AUGUST ──
  {
    id: "buwan-ng-wika",
    name: "Buwan ng Wika",
    subtitle: "Celebrating the Filipino language — our voice, our identity",
    startMonth: 8, startDay: 1,
    endMonth: 8, endDay: 31,
    accentColor: "#be123c", accentColor2: "#881337",
    textColor: "#ffe4b5",
    emoji: "📖",
    imagePrompt: "Buwan ng Wika Filipino Language Month banner, baybayin script elements, Philippine heritage and culture, warm earth tones with deep red accents, books and traditional Filipino imagery, no text, cinematic wide"
  },
  {
    id: "ninoy-aquino-day",
    name: "Ninoy Aquino Day",
    subtitle: "\"The Filipino is worth dying for\" — Benigno Aquino Jr.",
    startMonth: 8, startDay: 21,
    endMonth: 8, endDay: 21,
    accentColor: "#eab308", accentColor2: "#a16207",
    textColor: "#1a1a2e",
    emoji: "🕯️",
    imagePrompt: "Ninoy Aquino Day remembrance banner, Manila International Airport tarmac, single candle vigil, yellow ribbon, solemn golden tones, sacrifice and courage, no text, cinematic wide"
  },

  // ── SEPTEMBER ──
  {
    id: "teachers-month",
    name: "Teachers' Month",
    subtitle: "To every Filipino teacher — thank you for shaping the nation",
    startMonth: 9, startDay: 1,
    endMonth: 9, endDay: 30,
    accentColor: "#0369a1", accentColor2: "#075985",
    textColor: "#ffffff",
    emoji: "👩‍🏫",
    imagePrompt: "Teachers Month banner, Filipino teacher in a classroom with students, warm blue and cream tones, books and chalkboard, inspiring and heartfelt, Philippine school setting, no text, cinematic wide"
  },

  // ── OCTOBER ──
  {
    id: "mental-health-month",
    name: "Mental Health Awareness Month",
    subtitle: "It's okay not to be okay — let's talk about mental health",
    startMonth: 10, startDay: 1,
    endMonth: 10, endDay: 31,
    accentColor: "#059669", accentColor2: "#047857",
    textColor: "#ffffff",
    emoji: "🧠",
    imagePrompt: "Mental Health Awareness Month banner, serene peaceful landscape, person meditating at sunrise, calming green and teal tones, Philippine nature backdrop, wellness and peace, no text, cinematic wide"
  },

  // ── NOVEMBER ──
  {
    id: "all-saints-day",
    name: "All Saints' Day",
    subtitle: "Remembering our loved ones — Undas",
    startMonth: 11, startDay: 1,
    endMonth: 11, endDay: 2,
    accentColor: "#78350f", accentColor2: "#451a03",
    textColor: "#fef3c7",
    emoji: "🕯️",
    imagePrompt: "All Saints Day Undas banner, Philippine cemetery with beautiful candle-lit graves at night, warm amber glow, families visiting, peaceful and reverent, soft warm tones, no text, cinematic wide"
  },
  {
    id: "bonifacio-day",
    name: "Bonifacio Day",
    subtitle: "Supremo — honoring the Father of the Philippine Revolution",
    startMonth: 11, startDay: 30,
    endMonth: 11, endDay: 30,
    accentColor: "#991b1b", accentColor2: "#7f1d1d",
    textColor: "#fef2f2",
    emoji: "⚔️",
    imagePrompt: "Bonifacio Day banner, Andres Bonifacio heroic silhouette with bolo, Katipunan flag, Philippine revolution imagery, deep red and dark tones, courage and patriotism, no text, cinematic wide"
  },

  // ── DECEMBER ──
  {
    id: "christmas",
    name: "Maligayang Pasko",
    subtitle: "Merry Christmas from Morning Coffee Thoughts",
    startMonth: 12, startDay: 16,
    endMonth: 12, endDay: 25,
    accentColor: "#15803d", accentColor2: "#166534",
    textColor: "#ffffff",
    emoji: "🎄",
    imagePrompt: "Filipino Christmas Pasko banner, beautiful parol lanterns glowing in the night, Simbang Gabi church, warm green and gold tones, noche buena table, Philippine Christmas tradition, joyful and warm, no text, cinematic wide"
  },
  {
    id: "rizal-day",
    name: "Rizal Day",
    subtitle: "In memory of Dr. José Rizal — the national hero",
    startMonth: 12, startDay: 30,
    endMonth: 12, endDay: 30,
    accentColor: "#1e3a5f", accentColor2: "#0f2440",
    textColor: "#e2e8f0",
    emoji: "📜",
    imagePrompt: "Rizal Day banner, Luneta Park Rizal monument at golden hour, Philippine flag, Noli Me Tangere book, deep navy blue and gold tones, honor and enlightenment, no text, cinematic wide"
  },

  // ── INTERNATIONAL (non-Philippine) ──
  {
    id: "earth-day",
    name: "Happy Earth Day",
    subtitle: "Protecting our planet — from Manila Bay to the Sierra Madre",
    startMonth: 4, startDay: 22,
    endMonth: 4, endDay: 22,
    accentColor: "#166534", accentColor2: "#14532d",
    textColor: "#dcfce7",
    emoji: "🌍",
    imagePrompt: "Earth Day banner, lush Philippine rainforest, Sierra Madre mountains, coral reefs and ocean, vibrant green and blue nature tones, environmental protection, no text, cinematic wide"
  },
  {
    id: "world-press-freedom-day",
    name: "World Press Freedom Day",
    subtitle: "Journalism is not a crime — defending the truth",
    startMonth: 5, startDay: 3,
    endMonth: 5, endDay: 3,
    accentColor: "#1d4ed8", accentColor2: "#1e3a8a",
    textColor: "#ffffff",
    emoji: "📰",
    imagePrompt: "World Press Freedom Day banner, journalist with camera and notebook, newspapers flying, blue and white tones, truth and transparency, broken chains, no text, cinematic wide"
  },
  {
    id: "international-human-rights-day",
    name: "International Human Rights Day",
    subtitle: "Every Filipino deserves dignity, justice, and freedom",
    startMonth: 12, startDay: 10,
    endMonth: 12, endDay: 10,
    accentColor: "#0ea5e9", accentColor2: "#0369a1",
    textColor: "#ffffff",
    emoji: "⚖️",
    imagePrompt: "International Human Rights Day banner, diverse people holding hands, scales of justice, blue sky and dove of peace, warm hopeful tones, Philippine setting, no text, cinematic wide"
  },
];
