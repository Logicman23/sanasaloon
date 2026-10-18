import { FacebookIcon, InstagramIcon, TikTokIcon } from "@/components/brand-icons";
import { SITE } from "@/lib/site";

const PLATFORMS = [
  { key: "instagram", label: "Instagram", Icon: InstagramIcon },
  { key: "facebook", label: "Facebook", Icon: FacebookIcon },
  { key: "tiktok", label: "TikTok", Icon: TikTokIcon },
] as const;

type Props = {
  /** "light" for dark backgrounds, "dark" for light backgrounds. */
  tone?: "light" | "dark";
  showLabels?: boolean;
};

export function SocialLinks({ tone = "dark", showLabels = false }: Props) {
  const base =
    tone === "light"
      ? "border-white/20 text-white hover:bg-white hover:text-plum-900"
      : "border-plum-200 text-plum-800 hover:bg-plum-800 hover:text-white";

  return (
    <ul className="flex flex-wrap gap-3">
      {PLATFORMS.map(({ key, label, Icon }) => {
        const href = SITE.social[key];
        const content = (
          <>
            <Icon className="size-5" />
            {showLabels && <span className="text-sm font-medium">{label}</span>}
          </>
        );
        const shape = showLabels ? "gap-2 rounded-full px-4 py-2.5" : "size-11 justify-center rounded-full";

        return (
          <li key={key}>
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${SITE.name} on ${label}`}
                className={`inline-flex items-center border transition-colors ${shape} ${base}`}
              >
                {content}
              </a>
            ) : (
              <span
                title={`${label} coming soon`}
                aria-label={`${label} (coming soon)`}
                className={`inline-flex cursor-not-allowed items-center border opacity-50 ${shape} ${
                  tone === "light" ? "border-white/20 text-white" : "border-plum-200 text-plum-800"
                }`}
              >
                {content}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
