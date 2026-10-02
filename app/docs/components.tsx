export function DocSection({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <p className="mb-1 text-xs font-semibold tracking-wide text-accent uppercase">{eyebrow}</p>
      <h2 className="mb-4 text-2xl font-semibold text-foreground">{title}</h2>
      <div className="text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">{children}</div>
    </section>
  );
}

export function MiniCard({
  icon: Icon,
  title,
  children,
}: {
  icon?: (props: { className?: string }) => React.ReactElement;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col gap-2 p-4">
      <div className="flex items-center gap-2">
        {Icon && (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent/15 text-accent">
            <Icon className="h-3.5 w-3.5" />
          </span>
        )}
        <p className="text-sm font-medium text-foreground">{title}</p>
      </div>
      <p className="text-sm text-zinc-500">{children}</p>
    </div>
  );
}

export function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="glow-accent flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
        {n}
      </span>
      <p>
        <strong className="text-foreground">{title}</strong> —{" "}
        <span className="text-zinc-600 dark:text-zinc-400">{children}</span>
      </p>
    </li>
  );
}

export function ListPoint({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
      <span>{children}</span>
    </li>
  );
}

export function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div className="card p-4">
      <p className="mb-1 text-sm font-medium text-foreground">{q}</p>
      <p className="text-sm text-zinc-500">{children}</p>
    </div>
  );
}

export function Code({ children }: { children: React.ReactNode }) {
  return <code className="rounded bg-accent/10 px-1.5 py-0.5 font-mono text-[0.85em] text-accent">{children}</code>;
}
