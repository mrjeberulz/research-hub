import Link from "next/link";
import { countByCategory, loadCategory } from "@/lib/content";
import { CATEGORY_META, type ContentCategory } from "@/lib/types";
import { SearchBox } from "./search-box";

const STRATEGY_CATEGORIES: ContentCategory[] = [
  "findings",
  "implications",
  "hypotheses",
  "design-goals",
  "ideas",
];

const ACTION_CATEGORIES: ContentCategory[] = ["todos"];

/**
 * Inner navigation content (server component). Used by both the desktop
 * sticky sidebar and the mobile drawer — same links, same structure,
 * different container. The mobile drawer auto-closes via `usePathname()`
 * inside `MobileNav`, so no onClick wiring is needed on links here.
 */
export function SidebarContent() {
  const counts = countByCategory();
  const sources = loadCategory("sources");

  return (
    <div className="flex h-full flex-col gap-6">
      <Link href="/" className="block">
        <div className="text-xs font-medium uppercase tracking-widest text-ink-500">
          Agent Studio
        </div>
        <div className="mt-1 font-serif text-2xl font-semibold leading-tight text-ink-900">
          Research &amp; Strategy
        </div>
      </Link>

      <SearchBox />

      <nav className="flex flex-col gap-5 text-sm">
        <Section label="Research">
          {sources.map((s) => (
            <Link
              key={s.slug}
              href={s.href}
              title={s.frontmatter.title}
              className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-ink-700 hover:bg-ink-100 hover:text-ink-900"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
              <span className="truncate">{s.frontmatter.title}</span>
            </Link>
          ))}
          <Link
            href="/sources"
            className="mt-1 px-2 text-[11px] font-medium text-ink-500 hover:text-accent-700"
          >
            All sources →
          </Link>
        </Section>

        <Section label="Strategy">
          {STRATEGY_CATEGORIES.map((cat) => (
            <CategoryLink key={cat} category={cat} count={counts[cat]} />
          ))}
        </Section>

        <Section label="Actions">
          {ACTION_CATEGORIES.map((cat) => (
            <CategoryLink key={cat} category={cat} count={counts[cat]} />
          ))}
        </Section>
      </nav>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 overflow-y-auto px-6 py-8 md:block">
      <SidebarContent />
    </aside>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
        {label}
      </div>
      {children}
    </div>
  );
}

function CategoryLink({ category, count }: { category: ContentCategory; count: number }) {
  const meta = CATEGORY_META[category];
  return (
    <Link
      href={`/${category}`}
      className="group flex items-center justify-between rounded-md px-2 py-1.5 text-ink-700 hover:bg-ink-100 hover:text-ink-900"
    >
      <span>{meta.title}</span>
      <span className="rounded-full bg-ink-100 px-2 text-xs font-medium text-ink-600 group-hover:bg-white">
        {count}
      </span>
    </Link>
  );
}
