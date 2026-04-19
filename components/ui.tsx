import Link from "next/link";
import { clsx } from "clsx";
import type { ReactNode } from "react";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={clsx("rounded-3xl border border-ink/10 bg-paper/90 p-4 shadow-soft", className)}>{children}</section>;
}

export function PageHeader({ eyebrow, title, note }: { eyebrow?: string; title: string; note?: string }) {
  return (
    <header className="mb-5 space-y-2 pt-2">
      {eyebrow ? <p className="text-sm font-bold uppercase tracking-[0.22em] text-leaf">{eyebrow}</p> : null}
      <h1 className="text-3xl font-black leading-tight text-ink sm:text-4xl">{title}</h1>
      {note ? <p className="max-w-2xl text-base leading-7 text-ink/70">{note}</p> : null}
    </header>
  );
}

export function ActionButton({ href, children, tone = "primary" }: { href: string; children: ReactNode; tone?: "primary" | "light" | "clay" }) {
  return (
    <Link
      href={href}
      className={clsx(
        "flex min-h-12 items-center justify-center rounded-2xl px-4 py-3 text-center text-base font-extrabold transition active:scale-[0.98]",
        tone === "primary" && "bg-leaf text-white",
        tone === "light" && "border border-ink/10 bg-white text-ink",
        tone === "clay" && "bg-clay text-white"
      )}
    >
      {children}
    </Link>
  );
}

export function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/80 p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-ink/50">{label}</p>
      <p className="mt-1 text-xl font-black text-ink">{value}</p>
    </div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="mb-3 text-xl font-black text-ink">{children}</h2>;
}
