import { Crown, Flower2, Scissors, Sparkles, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  "Bridal & Packages": Crown,
  "Hair Treatments": Scissors,
  "Skincare & Facials": Sparkles,
};

export function CategoryIcon({ category, className }: { category: string; className?: string }) {
  const Icon = ICONS[category] ?? Flower2;
  return <Icon className={className} aria-hidden="true" />;
}
