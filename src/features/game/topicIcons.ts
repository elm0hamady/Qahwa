import {
  Landmark,
  Film,
  Trophy,
  FlaskConical,
  Music2,
  Globe2,
  BookOpen,
  Cpu,
  Palette,
  UtensilsCrossed,
  PawPrint,
  Rocket,
  Gamepad2,
  Shirt,
  Car,
  HeartPulse,
  Star,
  type LucideIcon,
} from "lucide-react";

// Substring-matched against "<topic name> <category>" (lowercased). English and
// Arabic keywords both supported since topics can be named in either.
const KEYWORD_ICON_MAP: Array<{ keywords: string[]; icon: LucideIcon }> = [
  { keywords: ["history", "تاريخ"], icon: Landmark },
  { keywords: ["movie", "film", "cinema", "افلام", "سينما"], icon: Film },
  { keywords: ["football", "soccer", "sport", "كرة", "رياض"], icon: Trophy },
  { keywords: ["science", "علوم", "فيزياء", "كيمياء"], icon: FlaskConical },
  { keywords: ["music", "song", "موسيقى", "اغاني", "أغاني"], icon: Music2 },
  { keywords: ["geo", "جغراف"], icon: Globe2 },
  { keywords: ["book", "literature", "novel", "ادب", "كتب", "روايات"], icon: BookOpen },
  { keywords: ["tech", "computer", "programming", "تكنولوجيا", "برمجة"], icon: Cpu },
  { keywords: ["art", "فن", "رسم"], icon: Palette },
  { keywords: ["food", "cook", "cuisine", "اكل", "طبخ", "أكل"], icon: UtensilsCrossed },
  { keywords: ["animal", "nature", "wildlife", "حيوان", "طبيعة"], icon: PawPrint },
  { keywords: ["space", "astronomy", "فضاء", "فلك"], icon: Rocket },
  { keywords: ["game", "gaming", "العاب", "ألعاب"], icon: Gamepad2 },
  { keywords: ["fashion", "ازياء", "أزياء"], icon: Shirt },
  { keywords: ["car", "vehicle", "سيارات"], icon: Car },
  { keywords: ["health", "medic", "صحة", "طب"], icon: HeartPulse },
];

// Deterministic fallback so a topic that doesn't match any keyword still
// always gets the same icon across renders/sessions, instead of a random one.
const FALLBACK_ICONS: LucideIcon[] = [Star, Rocket, Palette, Globe2, Trophy, BookOpen];

// Arabic words are often written with different hamza/taa-marbuta/alif-maqsura
// forms depending on who typed them (e.g. "أفلام" vs "افلام"). Normalizing
// both the keyword list and the topic name before comparing means those
// spelling variants still match instead of silently falling through to a
// random-looking fallback icon.
function normalizeArabic(value: string): string {
  return value.replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي");
}

export function getTopicIcon(name: string, category?: string): LucideIcon {
  const haystack = normalizeArabic(`${name} ${category ?? ""}`.toLowerCase());

  for (const entry of KEYWORD_ICON_MAP) {
    if (entry.keywords.some((keyword) => haystack.includes(normalizeArabic(keyword)))) {
      return entry.icon;
    }
  }

  let hash = 0;
  for (const char of name) hash += char.charCodeAt(0);
  return FALLBACK_ICONS[hash % FALLBACK_ICONS.length];
}
