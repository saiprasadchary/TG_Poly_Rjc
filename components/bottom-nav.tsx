import Link from "next/link";
import { BookOpen, Home, MessageCircle, NotebookPen, Target } from "lucide-react";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/papers", label: "Papers", icon: BookOpen },
  { href: "/mock", label: "Mock", icon: Target },
  { href: "/planner", label: "Plan", icon: NotebookPen },
  { href: "/ask", label: "Ask", icon: MessageCircle }
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-ink/10 bg-paper/95 px-2 py-2 backdrop-blur">
      <div className="mx-auto grid max-w-3xl grid-cols-5 gap-1">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-xs font-bold text-ink/70 active:bg-field">
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
