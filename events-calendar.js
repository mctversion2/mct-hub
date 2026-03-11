/**
 * MCT Event Calendar — "Google Doodle"-style event banner system.
 *
 * PRIORITY SYSTEM:
 *   When multiple events overlap, the SHORTEST-duration event wins.
 *   1-day events > 1-week events > 1-month events > generic banner.
 *   This means a festival or holiday will temporarily replace a
 *   month-long awareness banner, then revert when it ends.
 *
 * Each event defines:
 *   id          – unique slug (also used for banner image filename: event-{id}.png)
 *   name        – display title for the banner
 *   subtitle    – secondary line / call to action
 *   startMonth, startDay  – when the banner begins (inclusive)
 *   endMonth, endDay      – when the banner ends (inclusive)
 *   duration    – "day" | "week" | "month" — controls priority
 *   accentColor – primary gradient color for the banner
 *   accentColor2– secondary gradient color
 *   textColor   – text color over the gradient
 *   emoji       – decorative emoji
 *   imagePrompt – AI image generation prompt (used by cron)
 *
 * Month: 1-12, Day: 1-31. All dates in Asia/Manila timezone.
 */

const MCT_EVENTS = [

  // ═══════════════════════════════════════════════════
  // ── JANUARY ──
  // ═══════════════════════════════════════════════════
  {
    id: "new-year",
    name: "Happy New Year",
    subtitle: "Maligayang Bagong Taon — from Morning Coffee Thoughts",
    startMonth: 1, startDay: 1, endMonth: 1, endDay: 2,
    duration: "day",
    accentColor: "#c6a700", accentColor2: "#8b6914", textColor: "#ffffff", emoji: "🎆",
    imagePrompt: "Festive New Year celebration banner, golden fireworks over Manila skyline at night, Philippine flag subtly in background, warm gold and deep navy blue tones, elegant confetti, cinematic wide aspect ratio, no text"
  },
  {
    id: "cancer-awareness-month",
    name: "Cancer Awareness Month",
    subtitle: "Early detection saves lives — get screened",
    startMonth: 1, startDay: 1, endMonth: 1, endDay: 31,
    duration: "month",
    accentColor: "#7c3aed", accentColor2: "#5b21b6", textColor: "#ffffff", emoji: "🎗️",
    imagePrompt: "Cancer awareness month banner, lavender and purple ribbons, hopeful sunrise, hands holding awareness ribbon, warm supportive tones, Philippine hospital setting, no text, cinematic wide"
  },
  {
    id: "black-nazarene",
    name: "Feast of the Black Nazarene",
    subtitle: "Traslación — a testament to Filipino faith",
    startMonth: 1, startDay: 9, endMonth: 1, endDay: 9,
    duration: "day",
    accentColor: "#7f1d1d", accentColor2: "#450a0a", textColor: "#fef2f2", emoji: "✝️",
    imagePrompt: "Feast of the Black Nazarene Traslacion banner, massive crowd of devotees in Quiapo Manila carrying the Black Nazarene statue, deep maroon and dark tones, candlelight, intense devotion, no text, cinematic wide"
  },
  {
    id: "sinulog",
    name: "Sinulog Festival",
    subtitle: "Pit Señor! — celebrating the Santo Niño in Cebu",
    startMonth: 1, startDay: 8, endMonth: 1, endDay: 18,
    duration: "week",
    accentColor: "#dc2626", accentColor2: "#991b1b", textColor: "#fef2f2", emoji: "💃",
    imagePrompt: "Sinulog Festival Cebu banner, vibrant street dancing with colorful costumes, Santo Nino statue, red yellow orange celebration, Philippine Cebu streets, festive and energetic, no text, cinematic wide"
  },
  {
    id: "ati-atihan",
    name: "Ati-Atihan Festival",
    subtitle: "Hala Bira! — the Mother of All Philippine Festivals",
    startMonth: 1, startDay: 9, endMonth: 1, endDay: 18,
    duration: "week",
    accentColor: "#ea580c", accentColor2: "#9a3412", textColor: "#ffffff", emoji: "🥁",
    imagePrompt: "Ati-Atihan Festival Kalibo Aklan banner, dancers with painted faces and tribal costumes, drums and music, vibrant orange and earth tones, festive street parade, no text, cinematic wide"
  },
  {
    id: "santo-nino",
    name: "Feast of the Santo Niño",
    subtitle: "Viva Pit Señor! — honoring the Holy Child",
    startMonth: 1, startDay: 18, endMonth: 1, endDay: 18,
    duration: "day",
    accentColor: "#b45309", accentColor2: "#78350f", textColor: "#fef3c7", emoji: "👶",
    imagePrompt: "Feast of the Santo Nino banner, golden Santo Nino statue with red cape, candles and flowers, warm golden and red tones, reverent Philippine church setting, no text, cinematic wide"
  },
  {
    id: "dinagyang",
    name: "Dinagyang Festival",
    subtitle: "Iloilo's warrior dance — faith, art, and fire",
    startMonth: 1, startDay: 23, endMonth: 1, endDay: 26,
    duration: "week",
    accentColor: "#b91c1c", accentColor2: "#7f1d1d", textColor: "#fef2f2", emoji: "🔥",
    imagePrompt: "Dinagyang Festival Iloilo banner, warrior dancers with face paint and tribal attire, dramatic red and black, fire and drums, powerful and dynamic, no text, cinematic wide"
  },
  {
    id: "chinese-new-year",
    name: "Happy Chinese New Year",
    subtitle: "Gong Xi Fa Cai — celebrating our Filipino-Chinese heritage",
    startMonth: 1, startDay: 29, endMonth: 1, endDay: 30,
    duration: "day",
    accentColor: "#c41e3a", accentColor2: "#8b1025", textColor: "#ffe4b5", emoji: "🧧",
    imagePrompt: "Chinese New Year celebration banner, red lanterns, gold dragons, Binondo Manila Chinatown festive scene, red and gold color scheme, no text, cinematic wide"
  },

  // ═══════════════════════════════════════════════════
  // ── FEBRUARY ──
  // ═══════════════════════════════════════════════════
  {
    id: "heart-month",
    name: "Philippine Heart Month",
    subtitle: "Take care of your heart — it's the only one you've got",
    startMonth: 2, startDay: 1, endMonth: 2, endDay: 28,
    duration: "month",
    accentColor: "#dc2626", accentColor2: "#991b1b", textColor: "#ffffff", emoji: "❤️",
    imagePrompt: "Philippine Heart Month banner, anatomical heart illustration with warm red tones, health and wellness, stethoscope, caring hands, Philippine medical setting, no text, cinematic wide"
  },
  {
    id: "national-arts-month",
    name: "National Arts Month",
    subtitle: "Celebrating Filipino creativity and artistic heritage",
    startMonth: 2, startDay: 1, endMonth: 2, endDay: 28,
    duration: "month",
    accentColor: "#a855f7", accentColor2: "#7e22ce", textColor: "#ffffff", emoji: "🎨",
    imagePrompt: "National Arts Month banner, Filipino art and creativity, paint brushes and canvas, traditional and modern Philippine art fusion, vibrant purple and colorful palette, no text, cinematic wide"
  },
  {
    id: "panagbenga",
    name: "Panagbenga Festival",
    subtitle: "Baguio's Flower Festival — a season of bloom",
    startMonth: 2, startDay: 7, endMonth: 3, endDay: 1,
    duration: "week",
    accentColor: "#16a34a", accentColor2: "#15803d", textColor: "#ffffff", emoji: "🌸",
    imagePrompt: "Panagbenga Flower Festival Baguio banner, spectacular flower floats parade, vibrant blooming flowers, Baguio pine trees, fresh green and floral colors, joyful celebration, no text, cinematic wide"
  },
  {
    id: "valentines-day",
    name: "Happy Valentine's Day",
    subtitle: "Spread love — even over morning coffee",
    startMonth: 2, startDay: 14, endMonth: 2, endDay: 14,
    duration: "day",
    accentColor: "#e91e63", accentColor2: "#ad1457", textColor: "#ffffff", emoji: "💝",
    imagePrompt: "Valentine's Day banner, soft romantic pink and magenta tones, elegant hearts and roses, warm morning light through a coffee shop window, Philippine aesthetic, no text, cinematic wide"
  },
  {
    id: "edsa-revolution",
    name: "EDSA People Power Anniversary",
    subtitle: "Remembering the spirit of 1986 — the power of the Filipino people",
    startMonth: 2, startDay: 25, endMonth: 2, endDay: 25,
    duration: "day",
    accentColor: "#f5c518", accentColor2: "#d4a017", textColor: "#1a1a2e", emoji: "✊",
    imagePrompt: "EDSA People Power Revolution anniversary, Filipino people standing united along EDSA highway, yellow ribbons, Laban sign, warm golden yellow tones, hope and courage, Manila skyline, cinematic wide, no text"
  },

  // ═══════════════════════════════════════════════════
  // ── MARCH ──
  // ═══════════════════════════════════════════════════
  {
    id: "womens-month",
    name: "Happy Women's Month",
    subtitle: "Celebrating Filipinas — brave, brilliant, and boundless",
    startMonth: 3, startDay: 1, endMonth: 3, endDay: 31,
    duration: "month",
    accentColor: "#9333ea", accentColor2: "#6b21a8", textColor: "#ffffff", emoji: "💜",
    imagePrompt: "Women's Month celebration banner, powerful diverse Filipina women silhouettes standing together, purple and violet gradient sky, empowerment and unity, flowers blooming, warm golden light, Philippine setting, no text, cinematic wide aspect ratio"
  },
  {
    id: "international-womens-day",
    name: "International Women's Day",
    subtitle: "March 8 — equal rights, equal opportunity, equal respect",
    startMonth: 3, startDay: 8, endMonth: 3, endDay: 8,
    duration: "day",
    accentColor: "#7c3aed", accentColor2: "#581c87", textColor: "#ffffff", emoji: "♀️",
    imagePrompt: "International Women's Day banner, powerful Filipina women leading march, purple and magenta tones, raised fists, flowers and banners, empowerment and solidarity, no text, cinematic wide"
  },
  {
    id: "duterte-arrest-anniversary",
    name: "One Year Since the Duterte Arrest",
    subtitle: "March 11, 2025 — the day a former president was arrested on an ICC warrant for crimes against humanity",
    startMonth: 3, startDay: 11, endMonth: 3, endDay: 11,
    duration: "day",
    accentColor: "#1c1917", accentColor2: "#0c0a09", textColor: "#d6d3d1", emoji: "⚖️",
    imagePrompt: "Somber editorial banner, silhouette of a figure being escorted through an airport terminal by law enforcement, cool blue and steel gray tones, harsh fluorescent lighting, aircraft visible through window, heavy institutional atmosphere, cinematic wide, no text"
  },
  {
    id: "world-water-day",
    name: "World Water Day",
    subtitle: "Every drop counts — clean water for every Filipino",
    startMonth: 3, startDay: 22, endMonth: 3, endDay: 22,
    duration: "day",
    accentColor: "#0284c7", accentColor2: "#075985", textColor: "#ffffff", emoji: "💧",
    imagePrompt: "World Water Day banner, crystal clear water flowing, Philippine rivers and waterfalls, blue and turquoise tones, clean water access, nature and sustainability, no text, cinematic wide"
  },

  // ═══════════════════════════════════════════════════
  // ── APRIL ──
  // ═══════════════════════════════════════════════════
  {
    id: "holy-week",
    name: "Holy Week",
    subtitle: "Semana Santa — a time for reflection and renewal",
    startMonth: 3, startDay: 29, endMonth: 4, endDay: 5,
    duration: "week",
    accentColor: "#78350f", accentColor2: "#451a03", textColor: "#fef3c7", emoji: "✝️",
    imagePrompt: "Holy Week Semana Santa Philippines banner, solemn procession with saints statues, candlelit Filipino church, purple and gold liturgical tones, reverent and peaceful, no text, cinematic wide"
  },
  {
    id: "maundy-thursday",
    name: "Maundy Thursday",
    subtitle: "Huwebes Santo — remembering the Last Supper",
    startMonth: 4, startDay: 2, endMonth: 4, endDay: 2,
    duration: "day",
    accentColor: "#78350f", accentColor2: "#451a03", textColor: "#fef3c7", emoji: "🍞",
    imagePrompt: "Maundy Thursday banner, Filipino Visita Iglesia church hopping, candlelit churches, deep brown and gold tones, solemn devotion, Philippine Catholic tradition, no text, cinematic wide"
  },
  {
    id: "good-friday",
    name: "Good Friday",
    subtitle: "Biyernes Santo — the sacrifice remembered",
    startMonth: 4, startDay: 3, endMonth: 4, endDay: 3,
    duration: "day",
    accentColor: "#1c1917", accentColor2: "#0c0a09", textColor: "#d6d3d1", emoji: "🕊️",
    imagePrompt: "Good Friday Philippines banner, solemn crucifixion scene, dark somber tones, Philippine Senakulo passion play, deep black and muted purple, reverence and mourning, no text, cinematic wide"
  },
  {
    id: "world-health-day",
    name: "World Health Day",
    subtitle: "Health for all — a right, not a privilege",
    startMonth: 4, startDay: 7, endMonth: 4, endDay: 7,
    duration: "day",
    accentColor: "#0891b2", accentColor2: "#0e7490", textColor: "#ffffff", emoji: "🏥",
    imagePrompt: "World Health Day banner, Filipino healthcare workers, stethoscope and medical symbols, blue and teal tones, hospitals and community health, compassion and care, no text, cinematic wide"
  },
  {
    id: "araw-ng-kagitingan",
    name: "Araw ng Kagitingan",
    subtitle: "Day of Valor — honoring the bravery of Filipino soldiers",
    startMonth: 4, startDay: 9, endMonth: 4, endDay: 9,
    duration: "day",
    accentColor: "#1b4332", accentColor2: "#0d2818", textColor: "#f0f0f0", emoji: "🎖️",
    imagePrompt: "Araw ng Kagitingan Day of Valor banner, Filipino soldiers silhouette at Bataan, Mount Samat cross memorial, military olive green and bronze tones, sunrise, honor and sacrifice, Philippine flag, no text, cinematic wide"
  },
  {
    id: "earth-day",
    name: "Happy Earth Day",
    subtitle: "Protecting our planet — from Manila Bay to the Sierra Madre",
    startMonth: 4, startDay: 22, endMonth: 4, endDay: 22,
    duration: "day",
    accentColor: "#166534", accentColor2: "#14532d", textColor: "#dcfce7", emoji: "🌍",
    imagePrompt: "Earth Day banner, lush Philippine rainforest, Sierra Madre mountains, coral reefs and ocean, vibrant green and blue nature tones, environmental protection, no text, cinematic wide"
  },

  // ═══════════════════════════════════════════════════
  // ── MAY ──
  // ═══════════════════════════════════════════════════
  {
    id: "labor-day",
    name: "Happy Labor Day",
    subtitle: "Saluting every Filipino worker — here and abroad",
    startMonth: 5, startDay: 1, endMonth: 5, endDay: 1,
    duration: "day",
    accentColor: "#d97706", accentColor2: "#92400e", textColor: "#ffffff", emoji: "👷",
    imagePrompt: "Labor Day banner, diverse Filipino workers — farmer, nurse, construction worker, OFW, teacher — standing proud, warm amber and burnt orange tones, sunrise over Philippine landscape, solidarity, no text, cinematic wide"
  },
  {
    id: "heritage-month",
    name: "National Heritage Month",
    subtitle: "Preserving our past — building our future",
    startMonth: 5, startDay: 1, endMonth: 5, endDay: 31,
    duration: "month",
    accentColor: "#92400e", accentColor2: "#78350f", textColor: "#fef3c7", emoji: "🏛️",
    imagePrompt: "National Heritage Month Philippines banner, Intramuros walls, rice terraces, bahay kubo, Philippine heritage sites collage, warm sepia and earth tones, preservation and pride, no text, cinematic wide"
  },
  {
    id: "world-press-freedom-day",
    name: "World Press Freedom Day",
    subtitle: "Journalism is not a crime — defending the truth",
    startMonth: 5, startDay: 3, endMonth: 5, endDay: 3,
    duration: "day",
    accentColor: "#1d4ed8", accentColor2: "#1e3a8a", textColor: "#ffffff", emoji: "📰",
    imagePrompt: "World Press Freedom Day banner, journalist with camera and notebook, newspapers flying, blue and white tones, truth and transparency, broken chains, no text, cinematic wide"
  },
  {
    id: "pahiyas",
    name: "Pahiyas Festival",
    subtitle: "Lucban's harvest celebration — kiping, colors, and gratitude",
    startMonth: 5, startDay: 15, endMonth: 5, endDay: 15,
    duration: "day",
    accentColor: "#65a30d", accentColor2: "#4d7c0f", textColor: "#ffffff", emoji: "🌾",
    imagePrompt: "Pahiyas Festival Lucban Quezon banner, houses decorated with colorful kiping rice wafers, vibrant harvest celebration, green orange yellow, abundant and festive, no text, cinematic wide"
  },
  {
    id: "flores-de-mayo",
    name: "Flores de Mayo",
    subtitle: "A month of devotion to the Blessed Virgin Mary",
    startMonth: 5, startDay: 1, endMonth: 5, endDay: 31,
    duration: "month",
    accentColor: "#2563eb", accentColor2: "#1e40af", textColor: "#ffffff", emoji: "🌺",
    imagePrompt: "Flores de Mayo Philippines banner, Santacruzan parade with beautiful Filipina sagalas in white gowns, flowers and arches, soft pastel blue and floral tones, Marian devotion, no text, cinematic wide"
  },

  // ═══════════════════════════════════════════════════
  // ── JUNE ──
  // ═══════════════════════════════════════════════════
  {
    id: "pride-month",
    name: "Happy Pride Month",
    subtitle: "Love is love — celebrating LGBTQ+ Filipinos",
    startMonth: 6, startDay: 1, endMonth: 6, endDay: 30,
    duration: "month",
    accentColor: "#e91e63", accentColor2: "#7b1fa2", textColor: "#ffffff", emoji: "🏳️‍🌈",
    imagePrompt: "Pride Month celebration banner, rainbow colors flowing gracefully, diverse Filipino people celebrating, Manila cityscape, vibrant and joyful, warm light, no text, cinematic wide"
  },
  {
    id: "environment-month",
    name: "Philippine Environment Month",
    subtitle: "Protecting our islands, forests, and seas",
    startMonth: 6, startDay: 1, endMonth: 6, endDay: 30,
    duration: "month",
    accentColor: "#059669", accentColor2: "#047857", textColor: "#ffffff", emoji: "🌿",
    imagePrompt: "Philippine Environment Month banner, lush tropical forest, pristine beach, coral reef underwater, diverse Philippine ecosystems, green and blue tones, no text, cinematic wide"
  },
  {
    id: "world-environment-day",
    name: "World Environment Day",
    subtitle: "One Earth — our home, our responsibility",
    startMonth: 6, startDay: 5, endMonth: 6, endDay: 5,
    duration: "day",
    accentColor: "#15803d", accentColor2: "#166534", textColor: "#ffffff", emoji: "🌱",
    imagePrompt: "World Environment Day banner, hands planting a seedling, Philippine forest backdrop, lush green nature, hope and renewal, environmental action, no text, cinematic wide"
  },
  {
    id: "world-oceans-day",
    name: "World Oceans Day",
    subtitle: "7,641 islands — the sea is in our blood",
    startMonth: 6, startDay: 8, endMonth: 6, endDay: 8,
    duration: "day",
    accentColor: "#0369a1", accentColor2: "#075985", textColor: "#ffffff", emoji: "🌊",
    imagePrompt: "World Oceans Day banner, Philippine coral reef underwater, sea turtles and colorful fish, deep ocean blue tones, beautiful Philippine marine biodiversity, no text, cinematic wide"
  },
  {
    id: "independence-day",
    name: "Happy Independence Day",
    subtitle: "Mabuhay ang Kalayaan ng Pilipinas — June 12, 1898",
    startMonth: 6, startDay: 12, endMonth: 6, endDay: 12,
    duration: "day",
    accentColor: "#0038a8", accentColor2: "#001f5c", textColor: "#ffffff", emoji: "🇵🇭",
    imagePrompt: "Philippine Independence Day banner, Philippine flag waving majestically, Aguinaldo Shrine in Kawit Cavite, blue and red Philippine national colors, golden sun rays, patriotic and proud, no text, cinematic wide"
  },
  {
    id: "anti-drug-abuse-day",
    name: "International Day Against Drug Abuse",
    subtitle: "Choose life — say no to drugs, yes to hope",
    startMonth: 6, startDay: 26, endMonth: 6, endDay: 26,
    duration: "day",
    accentColor: "#0f766e", accentColor2: "#115e59", textColor: "#ffffff", emoji: "🚫",
    imagePrompt: "International Day Against Drug Abuse banner, hands breaking free from chains, rehabilitation and hope, teal and green tones, Filipino community support, light breaking through darkness, no text, cinematic wide"
  },

  // ═══════════════════════════════════════════════════
  // ── JULY ──
  // ═══════════════════════════════════════════════════
  {
    id: "nutrition-month",
    name: "Nutrition Month",
    subtitle: "Healthy Philippines — invest in nutrition, invest in the future",
    startMonth: 7, startDay: 1, endMonth: 7, endDay: 31,
    duration: "month",
    accentColor: "#16a34a", accentColor2: "#15803d", textColor: "#ffffff", emoji: "🥗",
    imagePrompt: "Nutrition Month banner, fresh Philippine tropical fruits and vegetables, vibrant green and natural tones, healthy Filipino food spread, bright and fresh aesthetic, no text, cinematic wide"
  },
  {
    id: "anti-trafficking-day",
    name: "World Day Against Trafficking",
    subtitle: "No one is for sale — protect the vulnerable",
    startMonth: 7, startDay: 30, endMonth: 7, endDay: 30,
    duration: "day",
    accentColor: "#0f172a", accentColor2: "#020617", textColor: "#e2e8f0", emoji: "🔗",
    imagePrompt: "World Day Against Trafficking banner, broken chains, hands reaching for freedom, dark and somber tones giving way to light, hope emerging from darkness, no text, cinematic wide"
  },

  // ═══════════════════════════════════════════════════
  // ── AUGUST ──
  // ═══════════════════════════════════════════════════
  {
    id: "buwan-ng-wika",
    name: "Buwan ng Wika",
    subtitle: "Celebrating the Filipino language — our voice, our identity",
    startMonth: 8, startDay: 1, endMonth: 8, endDay: 31,
    duration: "month",
    accentColor: "#be123c", accentColor2: "#881337", textColor: "#ffe4b5", emoji: "📖",
    imagePrompt: "Buwan ng Wika Filipino Language Month banner, baybayin script elements, Philippine heritage and culture, warm earth tones with deep red accents, books and traditional Filipino imagery, no text, cinematic wide"
  },
  {
    id: "kadayawan",
    name: "Kadayawan Festival",
    subtitle: "Davao's harvest festival — a celebration of life and abundance",
    startMonth: 8, startDay: 14, endMonth: 8, endDay: 18,
    duration: "week",
    accentColor: "#ea580c", accentColor2: "#c2410c", textColor: "#ffffff", emoji: "🌻",
    imagePrompt: "Kadayawan Festival Davao banner, vibrant floral floats, indigenous tribal dancers, colorful harvest celebration, orange and warm tones, Davao cityscape, abundance and gratitude, no text, cinematic wide"
  },
  {
    id: "ninoy-aquino-day",
    name: "Ninoy Aquino Day",
    subtitle: "\"The Filipino is worth dying for\" — Benigno Aquino Jr.",
    startMonth: 8, startDay: 21, endMonth: 8, endDay: 21,
    duration: "day",
    accentColor: "#eab308", accentColor2: "#a16207", textColor: "#1a1a2e", emoji: "🕯️",
    imagePrompt: "Ninoy Aquino Day remembrance banner, Manila International Airport tarmac, single candle vigil, yellow ribbon, solemn golden tones, sacrifice and courage, no text, cinematic wide"
  },
  {
    id: "national-heroes-day",
    name: "National Heroes Day",
    subtitle: "Honoring every Filipino who fought for freedom",
    startMonth: 8, startDay: 31, endMonth: 8, endDay: 31,
    duration: "day",
    accentColor: "#1e3a5f", accentColor2: "#0f2440", textColor: "#e2e8f0", emoji: "🏅",
    imagePrompt: "National Heroes Day Philippines banner, collage of Filipino heroes silhouettes — Rizal, Bonifacio, Gabriela Silang, Tandang Sora — Philippine flag, deep navy and gold, honor and patriotism, no text, cinematic wide"
  },

  // ═══════════════════════════════════════════════════
  // ── SEPTEMBER ──
  // ═══════════════════════════════════════════════════
  {
    id: "ber-months",
    name: "-Ber Months Begin",
    subtitle: "It's officially Christmas season na — Filipinos, unite!",
    startMonth: 9, startDay: 1, endMonth: 9, endDay: 1,
    duration: "day",
    accentColor: "#15803d", accentColor2: "#166534", textColor: "#ffffff", emoji: "🎄",
    imagePrompt: "Start of BER months Filipino Christmas season banner, parol lanterns switching on, Jose Mari Chan playing, green and gold festive tones, excited Filipino family, September 1 countdown, no text, cinematic wide"
  },
  {
    id: "teachers-month",
    name: "Teachers' Month",
    subtitle: "To every Filipino teacher — thank you for shaping the nation",
    startMonth: 9, startDay: 5, endMonth: 10, endDay: 5,
    duration: "month",
    accentColor: "#0369a1", accentColor2: "#075985", textColor: "#ffffff", emoji: "👩‍🏫",
    imagePrompt: "Teachers Month banner, Filipino teacher in a classroom with students, warm blue and cream tones, books and chalkboard, inspiring and heartfelt, Philippine school setting, no text, cinematic wide"
  },
  {
    id: "penafrancia",
    name: "Peñafrancia Festival",
    subtitle: "Naga City's grand Marian fluvial procession",
    startMonth: 9, startDay: 12, endMonth: 9, endDay: 20,
    duration: "week",
    accentColor: "#1d4ed8", accentColor2: "#1e3a8a", textColor: "#ffffff", emoji: "⛵",
    imagePrompt: "Penafrancia Festival Naga City banner, fluvial procession on Naga River, boats decorated with flowers carrying the Virgen de Penafrancia, deep blue water and warm golden light, reverent and festive, no text, cinematic wide"
  },
  {
    id: "martial-law-anniversary",
    name: "Martial Law Anniversary",
    subtitle: "September 21, 1972 — never again, never forget",
    startMonth: 9, startDay: 21, endMonth: 9, endDay: 21,
    duration: "day",
    accentColor: "#1c1917", accentColor2: "#0c0a09", textColor: "#fafaf9", emoji: "🕯️",
    imagePrompt: "Martial Law anniversary banner, candlelight vigil, black and white photos of Martial Law era, somber dark tones, barbed wire, desaparecidos silhouettes, never forget never again, no text, cinematic wide"
  },
  {
    id: "international-peace-day",
    name: "International Day of Peace",
    subtitle: "Kapayapaan — peace begins with understanding",
    startMonth: 9, startDay: 21, endMonth: 9, endDay: 21,
    duration: "day",
    accentColor: "#0284c7", accentColor2: "#0369a1", textColor: "#ffffff", emoji: "☮️",
    imagePrompt: "International Day of Peace banner, white dove flying over Mindanao landscape, olive branches, blue sky and peaceful waters, unity and harmony, no text, cinematic wide"
  },

  // ═══════════════════════════════════════════════════
  // ── OCTOBER ──
  // ═══════════════════════════════════════════════════
  {
    id: "mental-health-month",
    name: "Mental Health Awareness Month",
    subtitle: "It's okay not to be okay — let's talk about mental health",
    startMonth: 10, startDay: 1, endMonth: 10, endDay: 31,
    duration: "month",
    accentColor: "#059669", accentColor2: "#047857", textColor: "#ffffff", emoji: "🧠",
    imagePrompt: "Mental Health Awareness Month banner, serene peaceful landscape, person meditating at sunrise, calming green and teal tones, Philippine nature backdrop, wellness and peace, no text, cinematic wide"
  },
  {
    id: "indigenous-peoples-month",
    name: "National Indigenous Peoples Month",
    subtitle: "Honoring the first Filipinos — their land, their culture, their rights",
    startMonth: 10, startDay: 1, endMonth: 10, endDay: 31,
    duration: "month",
    accentColor: "#92400e", accentColor2: "#78350f", textColor: "#fef3c7", emoji: "🏔️",
    imagePrompt: "National Indigenous Peoples Month Philippines banner, Cordillera rice terraces, indigenous Filipino tribes in traditional attire, earth tones and warm light, cultural pride and heritage, no text, cinematic wide"
  },
  {
    id: "world-teachers-day",
    name: "World Teachers' Day",
    subtitle: "Behind every successful nation is a dedicated teacher",
    startMonth: 10, startDay: 5, endMonth: 10, endDay: 5,
    duration: "day",
    accentColor: "#1d4ed8", accentColor2: "#1e3a8a", textColor: "#ffffff", emoji: "📚",
    imagePrompt: "World Teachers Day banner, Filipino teacher in classroom with students, books and chalkboard, blue and warm tones, appreciation and respect, heartfelt, no text, cinematic wide"
  },
  {
    id: "world-mental-health-day",
    name: "World Mental Health Day",
    subtitle: "Your mental health matters — reach out, speak up",
    startMonth: 10, startDay: 10, endMonth: 10, endDay: 10,
    duration: "day",
    accentColor: "#0d9488", accentColor2: "#0f766e", textColor: "#ffffff", emoji: "💚",
    imagePrompt: "World Mental Health Day banner, green ribbon, peaceful Filipino person by the ocean at sunset, calming teal and green tones, mindfulness and healing, no text, cinematic wide"
  },
  {
    id: "masskara",
    name: "MassKara Festival",
    subtitle: "Bacolod's festival of smiles — masks, music, and joy",
    startMonth: 10, startDay: 19, endMonth: 10, endDay: 25,
    duration: "week",
    accentColor: "#eab308", accentColor2: "#ca8a04", textColor: "#1a1a2e", emoji: "🎭",
    imagePrompt: "MassKara Festival Bacolod banner, vibrant smiling masks, colorful costumes and street dancing, bright yellow and warm tones, pure joy and celebration, no text, cinematic wide"
  },

  // ═══════════════════════════════════════════════════
  // ── NOVEMBER ──
  // ═══════════════════════════════════════════════════
  {
    id: "all-saints-day",
    name: "All Saints' Day",
    subtitle: "Remembering our loved ones — Undas",
    startMonth: 11, startDay: 1, endMonth: 11, endDay: 2,
    duration: "day",
    accentColor: "#78350f", accentColor2: "#451a03", textColor: "#fef3c7", emoji: "🕯️",
    imagePrompt: "All Saints Day Undas banner, Philippine cemetery with beautiful candle-lit graves at night, warm amber glow, families visiting, peaceful and reverent, soft warm tones, no text, cinematic wide"
  },
  {
    id: "childrens-month",
    name: "National Children's Month",
    subtitle: "Protect, nurture, and empower every Filipino child",
    startMonth: 11, startDay: 1, endMonth: 11, endDay: 30,
    duration: "month",
    accentColor: "#0ea5e9", accentColor2: "#0284c7", textColor: "#ffffff", emoji: "👧",
    imagePrompt: "National Childrens Month Philippines banner, happy Filipino children playing, colorful and bright, school and park setting, blue and warm sunshine tones, joy and innocence, no text, cinematic wide"
  },
  {
    id: "vaw-campaign",
    name: "18-Day Campaign to End Violence Against Women",
    subtitle: "Break the silence — end violence against women and children",
    startMonth: 11, startDay: 25, endMonth: 12, endDay: 12,
    duration: "week",
    accentColor: "#be123c", accentColor2: "#9f1239", textColor: "#ffffff", emoji: "🟣",
    imagePrompt: "Campaign to End Violence Against Women banner, strong Filipina women standing united, purple and red tones, broken chains, solidarity and courage, hopeful sunrise, no text, cinematic wide"
  },
  {
    id: "end-violence-women-day",
    name: "International Day to End Violence Against Women",
    subtitle: "November 25 — silence is complicity",
    startMonth: 11, startDay: 25, endMonth: 11, endDay: 25,
    duration: "day",
    accentColor: "#9f1239", accentColor2: "#881337", textColor: "#ffffff", emoji: "🟣",
    imagePrompt: "International Day to End Violence Against Women banner, orange and purple tones, women marching together, solidarity ribbons, powerful and solemn, no text, cinematic wide"
  },
  {
    id: "bonifacio-day",
    name: "Bonifacio Day",
    subtitle: "Supremo — honoring the Father of the Philippine Revolution",
    startMonth: 11, startDay: 30, endMonth: 11, endDay: 30,
    duration: "day",
    accentColor: "#991b1b", accentColor2: "#7f1d1d", textColor: "#fef2f2", emoji: "⚔️",
    imagePrompt: "Bonifacio Day banner, Andres Bonifacio heroic silhouette with bolo, Katipunan flag, Philippine revolution imagery, deep red and dark tones, courage and patriotism, no text, cinematic wide"
  },

  // ═══════════════════════════════════════════════════
  // ── DECEMBER ──
  // ═══════════════════════════════════════════════════
  {
    id: "overseas-filipinos-month",
    name: "Month of Overseas Filipinos",
    subtitle: "To every OFW — the nation stands with you",
    startMonth: 12, startDay: 1, endMonth: 12, endDay: 31,
    duration: "month",
    accentColor: "#0369a1", accentColor2: "#075985", textColor: "#ffffff", emoji: "🌏",
    imagePrompt: "Month of Overseas Filipinos banner, OFW families connected across the globe, world map with Philippine flag, warm blue and gold tones, love and sacrifice, airport reunions, no text, cinematic wide"
  },
  {
    id: "world-aids-day",
    name: "World AIDS Day",
    subtitle: "End stigma, fight HIV — know your status",
    startMonth: 12, startDay: 1, endMonth: 12, endDay: 1,
    duration: "day",
    accentColor: "#dc2626", accentColor2: "#991b1b", textColor: "#ffffff", emoji: "🎗️",
    imagePrompt: "World AIDS Day banner, red ribbon prominently displayed, hands clasped in solidarity, warm red tones, hope and awareness, Filipino community support, no text, cinematic wide"
  },
  {
    id: "immaculate-conception",
    name: "Feast of the Immaculate Conception",
    subtitle: "A day of Marian devotion",
    startMonth: 12, startDay: 8, endMonth: 12, endDay: 8,
    duration: "day",
    accentColor: "#2563eb", accentColor2: "#1d4ed8", textColor: "#ffffff", emoji: "🙏",
    imagePrompt: "Feast of the Immaculate Conception banner, Blessed Virgin Mary statue in Philippine church, blue and white tones, candles and flowers, serene devotion, no text, cinematic wide"
  },
  {
    id: "international-human-rights-day",
    name: "International Human Rights Day",
    subtitle: "Every Filipino deserves dignity, justice, and freedom",
    startMonth: 12, startDay: 10, endMonth: 12, endDay: 10,
    duration: "day",
    accentColor: "#0ea5e9", accentColor2: "#0369a1", textColor: "#ffffff", emoji: "⚖️",
    imagePrompt: "International Human Rights Day banner, diverse people holding hands, scales of justice, blue sky and dove of peace, warm hopeful tones, Philippine setting, no text, cinematic wide"
  },
  {
    id: "giant-lantern-festival",
    name: "Giant Lantern Festival",
    subtitle: "Ligligan Parul — San Fernando, Pampanga lights up the sky",
    startMonth: 12, startDay: 13, endMonth: 12, endDay: 13,
    duration: "day",
    accentColor: "#d97706", accentColor2: "#b45309", textColor: "#ffffff", emoji: "🏮",
    imagePrompt: "Giant Lantern Festival San Fernando Pampanga banner, massive kaleidoscopic lanterns glowing in the night, spectacular light show, warm gold and multicolor tones, Philippine Christmas tradition, no text, cinematic wide"
  },
  {
    id: "simbang-gabi",
    name: "Simbang Gabi",
    subtitle: "Nine dawn masses — the heart of Filipino Christmas tradition",
    startMonth: 12, startDay: 16, endMonth: 12, endDay: 24,
    duration: "week",
    accentColor: "#15803d", accentColor2: "#166534", textColor: "#ffffff", emoji: "⛪",
    imagePrompt: "Simbang Gabi Philippines banner, beautiful church at dawn, Filipino families walking to mass in early morning, warm golden sunrise, puto bumbong and bibingka vendors outside, peaceful and traditional, no text, cinematic wide"
  },
  {
    id: "international-migrants-day",
    name: "International Migrants Day",
    subtitle: "To every Filipino abroad — you are never forgotten",
    startMonth: 12, startDay: 18, endMonth: 12, endDay: 18,
    duration: "day",
    accentColor: "#0891b2", accentColor2: "#0e7490", textColor: "#ffffff", emoji: "✈️",
    imagePrompt: "International Migrants Day banner, OFW airport reunion with family, Philippine flag in background, warm emotional tones, blue and gold, sacrifice and homecoming, no text, cinematic wide"
  },
  {
    id: "christmas",
    name: "Maligayang Pasko",
    subtitle: "Merry Christmas from Morning Coffee Thoughts",
    startMonth: 12, startDay: 25, endMonth: 12, endDay: 25,
    duration: "day",
    accentColor: "#15803d", accentColor2: "#166534", textColor: "#ffffff", emoji: "🎄",
    imagePrompt: "Filipino Christmas Pasko banner, beautiful parol lanterns glowing in the night, Simbang Gabi church, warm green and gold tones, noche buena table, Philippine Christmas tradition, joyful and warm, no text, cinematic wide"
  },
  {
    id: "rizal-day",
    name: "Rizal Day",
    subtitle: "In memory of Dr. José Rizal — the national hero",
    startMonth: 12, startDay: 30, endMonth: 12, endDay: 30,
    duration: "day",
    accentColor: "#1e3a5f", accentColor2: "#0f2440", textColor: "#e2e8f0", emoji: "📜",
    imagePrompt: "Rizal Day banner, Luneta Park Rizal monument at golden hour, Philippine flag, Noli Me Tangere book, deep navy blue and gold tones, honor and enlightenment, no text, cinematic wide"
  },
  {
    id: "new-years-eve",
    name: "Happy New Year's Eve",
    subtitle: "Paalam at Salamat — farewell to 2026, welcome 2027",
    startMonth: 12, startDay: 31, endMonth: 12, endDay: 31,
    duration: "day",
    accentColor: "#c6a700", accentColor2: "#8b6914", textColor: "#ffffff", emoji: "🎇",
    imagePrompt: "New Year's Eve Philippines banner, countdown celebration, fireworks preparing over Manila skyline, warm gold and midnight blue tones, exciting anticipation, no text, cinematic wide"
  },
];
