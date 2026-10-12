import Link from "next/link";
import { loadCategory, loadDoc } from "@/lib/content";
import { loadStrategy } from "@/lib/strategy";
import { CATEGORY_META, type ContentCategory, type ContentDoc } from "@/lib/types";
import { DocCard } from "@/components/doc-card";

const PREVIEW = 3;

const ROLLUP_CATEGORIES: ContentCategory[] = [
  "findings",
  "implications",
  "hypotheses",
  "design-goals",
  "ideas",
  "todos",
];

interface SourceRollup {
  slug: string;
  href: string;
  title: string;
  date?: string;
  author?: string;
  snippet?: string;
  counts: { category: ContentCategory; count: number }[];
}

function buildRollups(): SourceRollup[] {
  const sources = loadCategory("sources");
  return sources.map((src) => {
    const summary = loadDoc("summaries", src.slug);
    const snippet = summary?.frontmatter.summary ?? src.frontmatter.summary;
    const counts = ROLLUP_CATEGORIES.map((cat) => {
      const docs = loadCategory(cat);
      const count = docs.filter((d) =>
        (d.frontmatter.citations ?? []).some((c) => c.source === src.slug),
      ).length;
      return { category: cat, count };
    });
    return {
      slug: src.slug,
      href: src.href,
      title: src.frontmatter.title,
      date: src.frontmatter.date,
      author: src.frontmatter.author,
      snippet,
      counts,
    };
  });
}

function formatMonth(date: string | undefined): string | null {
  if (!date) return null;
  const m = /^(\d{4})-(\d{2})/.exec(date);
  if (!m) return date;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const idx = parseInt(m[2], 10) - 1;
  if (idx < 0 || idx >= months.length) return date;
  return `${months[idx]} ${m[1]}`;
}

function isOpenTodo(doc: ContentDoc): boolean {
  const status = doc.frontmatter.status;
  return status !== "done";
}

export default function HomePage() {
  const strategy = loadStrategy();
  const implications = loadCategory("implications");
  const hypotheses = loadCategory("hypotheses");
  const openTodos = loadCategory("todos").filter(isOpenTodo);
  const rollups = buildRollups();
  const hasWork =
    implications.length > 0 || hypotheses.length > 0 || openTodos.length > 0 || rollups.length > 0;

  return (
    <div className="space-y-12">
      <header>
        <div className="text-xs font-medium uppercase tracking-widest text-accent-700">
          Start here
        </div>
        <h1 className="mt-2 font-serif text-3xl font-semibold leading-snug text-ink-900">
          {strategy?.problem ?? "Agent Studio · Research & Strategy"}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-600">
          {strategy
            ? `The question ${strategy.name} strategy is trying to answer. Implications, hypotheses, and to-dos below are what the research says about it. Each one cites the study it came from.`
            : "Implications, hypotheses, and to-dos are what the research says. Each one cites the study it came from."}
        </p>
        {strategy?.updated && (
          <p className="mt-3 text-xs text-ink-500">Strategy updated {formatMonth(strategy.updated)}</p>
        )}
      </header>

      {!hasWork && (
        <section className="rounded-lg border border-dashed border-ink-300 bg-ink-50 p-8 text-center">
          <h2 className="font-serif text-lg font-semibold text-ink-900">Nothing here yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-600">
            Run{" "}
            <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[12px]">
              /research-strategy &lt;url-or-path&gt;
            </code>{" "}
            in Claude Code to ingest a research doc. The skill will write a summary, findings, and
            Agent Studio implications — all grounded with citations back to the source.
          </p>
        </section>
      )}

      <PreviewSection
        title="Implications"
        meta="latest"
        href="/implications"
        docs={implications.slice(0, PREVIEW)}
        total={implications.length}
      />

      <PreviewSection
        title="Hypotheses"
        meta="latest"
        href="/hypotheses"
        docs={hypotheses.slice(0, PREVIEW)}
        total={hypotheses.length}
      />

      {openTodos.length > 0 && (
        <section>
          <SectionHeading
            title="Open to-dos"
            meta={`${openTodos.length} open`}
            href="/todos"
            showAll={openTodos.length > PREVIEW}
          />
          <ul className="divide-y divide-ink-200 rounded-lg border border-ink-200">
            {openTodos.slice(0, PREVIEW).map((doc) => (
              <li key={doc.href}>
                <Link
                  href={doc.href}
                  className="flex items-baseline justify-between gap-4 px-4 py-3 hover:bg-ink-50"
                >
                  <span className="font-medium leading-snug text-ink-900">{doc.frontmatter.title}</span>
                  {doc.frontmatter.status && doc.frontmatter.status !== "open" && (
                    <span className="shrink-0 text-xs capitalize text-ink-500">
                      {doc.frontmatter.status}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {rollups.length > 0 && (
        <section>
          <SectionHeading
            title="Studies"
            meta={`${rollups.length} ${rollups.length === 1 ? "source" : "sources"}`}
            href="/sources"
            showAll={false}
          />
          <div className="space-y-3">
            {rollups.map((r) => (
              <RollupCard key={r.slug} rollup={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function PreviewSection({
  title,
  meta,
  href,
  docs,
  total,
}: {
  title: string;
  meta: string;
  href: string;
  docs: ContentDoc[];
  total: number;
}) {
  if (docs.length === 0) return null;
  return (
    <section>
      <SectionHeading title={title} meta={meta} href={href} showAll={total > docs.length} />
      <div className="space-y-3">
        {docs.map((d) => (
          <DocCard key={d.href} doc={d} />
        ))}
      </div>
    </section>
  );
}

function SectionHeading({
  title,
  meta,
  href,
  showAll,
}: {
  title: string;
  meta: string;
  href: string;
  showAll: boolean;
}) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-4">
      <h2 className="font-serif text-lg font-semibold text-ink-900">
        {title}{" "}
        <span className="text-sm font-normal text-ink-400">· {meta}</span>
      </h2>
      {showAll && (
        <Link href={href} className="shrink-0 text-xs font-medium text-ink-500 hover:text-accent-700">
          All →
        </Link>
      )}
    </div>
  );
}

function RollupCard({ rollup }: { rollup: SourceRollup }) {
  const month = formatMonth(rollup.date);
  const nonZero = rollup.counts.filter((c) => c.count > 0);
  return (
    <article className="rounded-lg border border-ink-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium uppercase tracking-wider text-ink-500">
        {month && <span>{month}</span>}
        {month && rollup.author && <span className="text-ink-400">·</span>}
        {rollup.author && (
          <span className="normal-case tracking-normal text-ink-500">{rollup.author}</span>
        )}
      </div>
      <Link href={rollup.href} className="group mt-1 block">
        <h3 className="font-serif text-lg font-semibold leading-snug text-ink-900 group-hover:text-accent-700">
          {rollup.title}
        </h3>
      </Link>
      {nonZero.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {nonZero.map((c) => (
            <Link
              key={c.category}
              href={`/${c.category}?source=${rollup.slug}`}
              className="inline-flex items-baseline gap-1.5 rounded-md border border-ink-200 bg-white px-2.5 py-1 text-xs text-ink-700 transition hover:border-accent-500 hover:text-accent-700"
            >
              <span className="font-semibold text-ink-900">{c.count}</span>
              <span className="lowercase">{CATEGORY_META[c.category].title}</span>
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
