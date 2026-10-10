/**
 * Dardasha 100,000 Gifts Procedural Universe Engine
 * Generates, catalogs, and manages 100,000 unique gifts with serial numbers #000001 - #100000
 */

// Prefixes / Adjectives (40 variations)
const ADJECTIVES = [
  'الذهبي', 'الماسي', 'الكوني', 'النيوني', 'الملكي', 
  'الزمردي', 'السيبراني', 'الأسطوري', 'البركاني', 'الجليدي',
  'الطيفي', 'السحابي', 'البلوري', 'الهولوغرامي', 'المشع', 
  'النجمي', 'السحري', 'العتيق', 'الشبحي', 'الخارق',
  'الإمبراطوري', 'الفولاذي', 'الأرجواني', 'الياقوتي', 'السرمدي',
  'الفينيقي', 'المقدس', 'المتوهج', 'المتحول', 'الكهربائي',
  'الفردوسي', 'الفرعوني', 'الأندلسي', 'العثماني', 'السامي',
  'البلاتيني', 'المغناطيسي', 'الشمالي', 'المجراتي', 'المستقبلي'
];

// Core Item Categories & Bases
const ITEM_BASES = [
  // 1. Luxury & Physical Transports (Chat Super Gifts)
  { type: 'chat_luxury', name: 'سيارة سوبر كار رياضية', icon: '🏎️', baseVal: 50000, desc: 'تأثير أنيميشن انطلاق سيارة خارقة يملأ شاشة المحادثة' },
  { type: 'chat_luxury', name: 'يخت بحري فاخر', icon: '🛥️', baseVal: 45000, desc: 'إهداء يخت فاخر للأصدقاء مع أمواج مائية متحركة' },
  { type: 'chat_luxury', name: 'صاروخ فضائي فلكي', icon: '🚀', baseVal: 60000, desc: 'إطلاق صاروخ كوني في الشات مع شهب ومؤثرات صوتية' },
  { type: 'chat_luxury', name: 'طائرة نفاثة خاصة', icon: '🛩️', baseVal: 55000, desc: 'تحليق طائرة خاصة عبر شاشة المستلم مع أصوات محركات' },
  { type: 'chat_luxury', name: 'قصر أندلسي ملكي', icon: '🏰', baseVal: 80000, desc: 'عرض قصر ملكي مشع في بروفايل المستلم' },
  { type: 'chat_luxury', name: 'برج إيفل المضيء', icon: '🗼', baseVal: 35000, desc: 'أضواء برج إيفل الباريسي المتلألئة في المحادثة' },
  { type: 'chat_luxury', name: 'تاج الملوك المرصع', icon: '👑', baseVal: 70000, desc: 'تتويج الصديق بتاج الملوك الذهبي على صورته' },
  { type: 'chat_luxury', name: 'جوهرة الألماس الكبرى', icon: '💎', baseVal: 40000, desc: 'بريق ألماسي فائق النقاء يزين صندوق الدردشة' },
  { type: 'chat_luxury', name: 'صقر عربي مدرب', icon: '🦅', baseVal: 30000, desc: 'تحليق صقر أصيل مع رسالة فخر خاصة' },
  { type: 'chat_luxury', name: 'ساعة يد بلاتينية', icon: '⌚', baseVal: 25000, desc: 'ساعة سويسرية فاخرة مرصعة بالأحجار الكريمة' },

  // 2. Currencies & Wealth
  { type: 'currency', name: 'صرة عملات دردشة', icon: '🪙', baseVal: 500, desc: 'رصيد عملات كوينز يُضاف فوراً لمحفظة الحساب' },
  { type: 'currency', name: 'سبيكة ذهب خالص عيار 24', icon: '🧈', baseVal: 15000, desc: 'سبيكة ذهبية قابلة للتحويل إلى ميزات ورتب خاصة' },
  { type: 'currency', name: 'صندوق كنز القراصنة', icon: '🏴‍☠️', baseVal: 20000, desc: 'كنز مليء بالعملات والجواهر النادرة' },
  { type: 'currency', name: 'حقيبة كوينز VIP', icon: '💼', baseVal: 8000, desc: 'حزمة تمويل خاصة للاشتراك في الأنشطة المتميزة' },

  // 3. Boosters & Multipliers
  { type: 'booster', name: 'جرعة مضاعفة الخبرة 2x', icon: '⚡', baseVal: 1200, desc: 'مضاعفة سرعة ترقية المستوى ونقاط XP لمدة 48 ساعة' },
  { type: 'booster', name: 'مسرّع السمعة الفائق 5x', icon: '🧪', baseVal: 5000, desc: 'رفع نقاط الثقة والتفاعل 5 أضعاف في الغرف' },
  { type: 'booster', name: 'بلورة الطاقة اللامحدودة', icon: '🔮', baseVal: 9000, desc: 'تمنحك أولوية إرسال الرسائل وتأثير النبض' },

  // 4. Frames & Visual Customizations
  { type: 'frame', name: 'إطار هالة الشفق', icon: '🌌', baseVal: 10000, desc: 'إطار أفاتار متحرك يحاكي ألوان الشفق القطبي' },
  { type: 'frame', name: 'إطار درع السايبر المتوهج', icon: '🩵', baseVal: 8500, desc: 'حلقة ليزرية متوهجة تحيط بصورة البروفايل' },
  { type: 'frame', name: 'إطار لهب التنين البركاني', icon: '🔥', baseVal: 12000, desc: 'نيران بركانية متحركة تشع حول الأفاتار' },
  { type: 'frame', name: 'إطار الكريستال الأخضر', icon: '❇️', baseVal: 7500, desc: 'أضواء زمردية عاكسة للضوء بأسلوب فخم' },

  // 5. Sound Effects & Ringtones
  { type: 'sound', name: 'نغمة إشعارات الريترو 8-bit', icon: '🎵', baseVal: 2000, desc: 'نغمة تنبيه كلاسيكية مستوحاة من ألعاب الفيديو' },
  { type: 'sound', name: 'مؤثر الليزر السيبراني', icon: '🔊', baseVal: 2500, desc: 'صوت وصول رسالة فائق الحداثة والنقاء' },
  { type: 'sound', name: 'صوت شلال المياه المريح', icon: '🌊', baseVal: 1800, desc: 'تنبيه هادئ يبعث على الراحة عند استلام المحادثات' },

  // 6. Titles & Prestige Badges
  { type: 'title', name: 'لقب أسطورة الحوار', icon: '📜', baseVal: 15000, desc: 'لقب شرفي يعرض شارة ذهبية تحت اسم المستخدم' },
  { type: 'title', name: 'لقب حارس التشفير 256-bit', icon: '🛡️', baseVal: 22000, desc: 'لقب خاص للمهتمين بالخصوصية والأمان الرقمي' },
  { type: 'title', name: 'لقب سفير الكرم والبهجة', icon: '🌟', baseVal: 18000, desc: 'يُمنح للمستخدمين الأكثر إهداءً في المنصة' },

  // 7. Storage & Cloud Boosts
  { type: 'storage', name: 'خزنة سحابية إضافية 50GB', icon: '☁️', baseVal: 30000, desc: 'مساحة تخزين مشفرة لحفظ الصور والملفات مدى الحياة' },
  { type: 'storage', name: 'خزنة الوسائط السرية غير المحدودة', icon: '🗄️', baseVal: 75000, desc: 'خزنة خاصة مشفرة بكلمة مرور ثانية بلا حدود' }
];

// Determine Rarity based on deterministic hash / index
function getRarityByIndex(index) {
  const mod = index % 100;
  if (mod < 5) return { key: 'mythic', name: 'خرافية 💎', color: 'from-amber-400 via-rose-500 to-purple-600', badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40', mult: 5 };
  if (mod < 15) return { key: 'legendary', name: 'أسطورية 🟡', color: 'from-amber-400 to-yellow-600', badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40', mult: 3 };
  if (mod < 30) return { key: 'epic', name: 'ملحمية 🟣', color: 'from-purple-500 to-indigo-600', badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40', mult: 2 };
  if (mod < 60) return { key: 'rare', name: 'نادرة 🔵', color: 'from-cyan-400 to-blue-600', badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', mult: 1.5 };
  return { key: 'common', name: 'شائعة ⚪', color: 'from-slate-400 to-gray-600', badgeClass: 'bg-white/10 text-gray-300 border-white/20', mult: 1 };
}

/**
 * Generate a gift object deterministically by its unique Index (1 to 100,000)
 */
export function generateGiftByIndex(index) {
  // Normalize index 1 <= index <= 100,000
  const normalizedIndex = Math.max(1, Math.min(100000, parseInt(index, 10) || 1));
  
  const adjIdx = (normalizedIndex * 7 + 13) % ADJECTIVES.length;
  const baseIdx = (normalizedIndex * 11 + 3) % ITEM_BASES.length;
  
  const adjective = ADJECTIVES[adjIdx];
  const baseItem = ITEM_BASES[baseIdx];
  const rarity = getRarityByIndex(normalizedIndex);

  const formattedSerial = String(normalizedIndex).padStart(6, '0');
  const serialNumber = `#${formattedSerial}`;
  const finalValue = Math.round(baseItem.baseVal * rarity.mult);

  return {
    id: `gift-${formattedSerial}`,
    serialNumber,
    index: normalizedIndex,
    name: `${baseItem.name} ${adjective}`,
    category: baseItem.type,
    icon: baseItem.icon,
    rarity: rarity.key,
    rarityLabel: rarity.name,
    rarityBadgeClass: rarity.badgeClass,
    rarityGradient: rarity.color,
    value: finalValue,
    description: `${baseItem.desc} (إصدار فريد يحمل الرقم التسلسلي ${serialNumber} من عالم الـ 100,000 هدية).`,
    totalUniverse: 100000
  };
}

/**
 * Draw a random gift from the 100,000 universe (optionally biased by chest tier)
 */
export function drawRandomGift(chestTier = 'daily') {
  let targetIndex;
  
  if (chestTier === 'cosmic') {
    // Highly favors Epic, Legendary, Mythic (indices with mod < 30)
    const base = Math.floor(Math.random() * 1000);
    const luckyMod = Math.random() < 0.35 ? Math.floor(Math.random() * 5) : Math.floor(Math.random() * 25);
    targetIndex = (base * 100 + luckyMod) % 100000 + 1;
  } else if (chestTier === 'golden') {
    // Favors Rare and Epic
    const base = Math.floor(Math.random() * 1000);
    const luckyMod = Math.random() < 0.4 ? Math.floor(Math.random() * 15) : Math.floor(Math.random() * 55);
    targetIndex = (base * 100 + luckyMod) % 100000 + 1;
  } else {
    // Normal Daily Chest - Uniform across the 100,000 pool
    targetIndex = Math.floor(Math.random() * 100000) + 1;
  }

  return generateGiftByIndex(targetIndex);
}

/**
 * Explore / Search gifts with pagination across the 100,000 pool
 */
export function exploreGifts({ page = 1, limit = 20, rarity = '', category = '', query = '' }) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const lim = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  
  const results = [];
  let foundCount = 0;
  const startIndex = (p - 1) * lim + 1;

  // For fast streaming discovery
  for (let i = startIndex; i <= 100000 && results.length < lim; i++) {
    const gift = generateGiftByIndex(i);
    
    if (rarity && gift.rarity !== rarity) continue;
    if (category && gift.category !== category) continue;
    if (query && !gift.name.includes(query) && !gift.serialNumber.includes(query)) continue;

    results.push(gift);
  }

  return {
    items: results,
    page: p,
    limit: lim,
    totalUniverse: 100000
  };
}
