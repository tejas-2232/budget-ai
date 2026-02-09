"use client";

import { ApiKeyCheck } from "@/components/ApiKeyCheck";
import { resetBudgetState } from "@/lib/budget/store";
import { cn } from "@/lib/utils";
import Image from "next/image";
import * as React from "react";
import { PointerSpotlight } from "./PointerSpotlight";
import { InteractiveCard } from "./InteractiveCard";
import { useActiveSection } from "./useActiveSection";
import { ThemeToggle } from "./ThemeToggle";
import { HeroMedia } from "./HeroMedia";
import { HeroWidget } from "./HeroWidget";
import { Sparkles, WandSparkles } from "lucide-react";
import { FloatingIcons } from "./FloatingIcons";

const SECTION_IDS = ["home", "projects", "about"] as const;

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function NavLink({
  label,
  id,
  isActive,
}: {
  label: string;
  id: string;
  isActive: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => scrollToId(id)}
      className={cn(
        "px-2 py-1 text-sm rounded-md transition-colors",
        "hover:bg-muted",
        isActive ? "text-foreground" : "text-muted-foreground",
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <span className="relative">
        {label}
        <span
          className={cn(
            "absolute left-0 -bottom-1 h-[2px] w-full rounded-full transition-opacity",
            "bg-primary",
            isActive ? "opacity-100" : "opacity-0",
          )}
        />
      </span>
    </button>
  );
}

export default function LandingPage() {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const active = useActiveSection([...SECTION_IDS]);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "min-h-screen bg-background text-foreground",
        // Spotlight background for hero area
        "landing-spotlight",
      )}
    >
      <PointerSpotlight targetRef={containerRef} />

      {/* Sticky nav */}
      <div
        className={cn(
          "sticky top-0 z-50",
          "transition-all duration-200",
          isScrolled
            ? "backdrop-blur bg-background/80 border-b border-border"
            : "bg-transparent",
        )}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => scrollToId("home")}
            className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted transition-colors"
          >
            <Image src="/Octo-Icon.svg" alt="Budget Analyzer" width={20} height={20} />
            <span className="font-semibold tracking-tight">Budget Analyzer</span>
          </button>

          <div className="flex items-center gap-1">
            <NavLink label="Home" id="home" isActive={active === "home"} />
            <NavLink
              label="Projects"
              id="projects"
              isActive={active === "projects"}
            />
            <NavLink label="About" id="about" isActive={active === "about"} />
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a
              href="/interactables"
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              Open workspace
            </a>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 md:px-8">
        {/* HOME */}
        <section id="home" className="pt-14 md:pt-18 pb-16 md:pb-20">
          <div className="relative">
            <HeroMedia />
            <FloatingIcons />
            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7">
                <h1 className="text-[42px] leading-[1.08] md:text-[52px] font-semibold tracking-tight">
                  See where your money is going—clearly.
                </h1>
                <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
                  Import a CSV, assign categories, and set envelope budgets in minutes.
                  <br />
                  Your data stays in your browser. No login. No hidden syncing.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <a
                    href="/interactables"
                    className={cn(
                      "px-5 py-3 rounded-md font-medium",
                      "bg-primary text-primary-foreground hover:bg-primary/90",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    )}
                  >
                    Open workspace
                  </a>
                  <a
                    href="/chat"
                    className={cn(
                      "px-5 py-3 rounded-md font-medium",
                      "border border-border hover:bg-muted",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    )}
                  >
                    Try chat
                  </a>
                  <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Start with a sample CSV
                  </span>
                </div>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      title: "Stored locally",
                      body: "Saved in your browser on this device.",
                    },
                    {
                      title: "Explainable",
                      body: "Categories and envelopes you can verify.",
                    },
                    {
                      title: "Monthly clarity",
                      body: "Budgeted / spent / remaining at a glance.",
                    },
                  ].map((item) => (
                    <InteractiveCard key={item.title} className="p-4 bg-card/80">
                      <div className="text-sm font-medium">{item.title}</div>
                      <div className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {item.body}
                      </div>
                    </InteractiveCard>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5">
                <HeroWidget />
              </div>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            <InteractiveCard className="p-5">
              <div className="text-sm font-semibold">1) Import CSV</div>
              <div className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Load the sample CSV or paste your own. You’ll confirm column mapping
                before anything is saved.
              </div>
            </InteractiveCard>
            <InteractiveCard className="p-5">
              <div className="text-sm font-semibold">2) Assign categories</div>
              <div className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Keep it simple: one category per transaction by default. You can
                refine later.
              </div>
            </InteractiveCard>
            <InteractiveCard className="p-5">
              <div className="text-sm font-semibold">3) Set envelopes</div>
              <div className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Monthly budget rows per category so graphs and totals stay predictable.
              </div>
            </InteractiveCard>
          </div>

          <div className="mt-10">
            <ApiKeyCheck>
              <InteractiveCard className="p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">
                      Assistant connection
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Add your Tambo key to enable chat-powered actions (import, categorization, insights).
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground inline-flex items-center gap-1">
                      <WandSparkles className="w-3.5 h-3.5" />
                      Tip: You can attach a CSV directly in chat now.
                    </div>
                  </div>
                  <a
                    href="/interactables"
                    className={cn(
                      "px-4 py-2 rounded-md text-sm font-medium w-fit",
                      "bg-primary text-primary-foreground hover:bg-primary/90",
                    )}
                  >
                    Open workspace
                  </a>
                </div>
              </InteractiveCard>
            </ApiKeyCheck>
          </div>
        </section>

        {/* PROJECTS */}
        <section id="projects" className="py-16 md:py-20">
          <div className="max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Projects
            </h2>
            <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl">
              This version stores one local workspace on this device. Later, you can
              expand this to multiple projects without changing the core UX.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <InteractiveCard className="p-5 gradient-border">
              <div className="text-sm font-semibold">Local workspace</div>
              <div className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Transactions, categories, and budgets are saved in your browser storage.
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href="/interactables"
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium",
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                  )}
                >
                  Open
                </a>
                <button
                  type="button"
                  onClick={() => {
                    const ok = confirm(
                      "Reset local workspace? This removes imported transactions and budgets from this device.",
                    );
                    if (ok) resetBudgetState();
                  }}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium",
                    "border border-border hover:bg-muted",
                  )}
                >
                  Reset data
                </button>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                Tip: You can always re-import.
              </div>
            </InteractiveCard>

            <InteractiveCard className="p-5 gradient-border">
              <div className="text-sm font-semibold">Sample CSV</div>
              <div className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Download a ready-made file to test the full flow (small or big dataset).
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href="/sample-transactions.csv"
                  download
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium",
                    "border border-border hover:bg-muted",
                  )}
                >
                  Download (small)
                </a>
                <a
                  href="/sample-transactions-big-2025H2-2026-01.csv"
                  download
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium",
                    "border border-border hover:bg-muted",
                  )}
                >
                  Download (big)
                </a>
                <a
                  href="/interactables"
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium",
                    "border border-border hover:bg-muted",
                  )}
                >
                  Import in workspace
                </a>
              </div>
            </InteractiveCard>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="py-16 md:py-20">
          <div className="max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
              About
            </h2>
            <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl">
              Budget Analyzer is a calm, local-first envelope budgeting workspace with
              an AI assistant you can use weekly or monthly for check-ins.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <InteractiveCard className="p-5 gradient-border">
              <div className="text-sm font-semibold">What this is</div>
              <div className="mt-2 text-sm text-muted-foreground leading-relaxed">
                A CSV-based budgeting tool: import → categorize → set envelopes → review.
              </div>
            </InteractiveCard>
            <InteractiveCard className="p-5 gradient-border">
              <div className="text-sm font-semibold">What we store</div>
              <div className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Accounts, transactions, categories (envelopes), monthly budgets, and tags.
              </div>
            </InteractiveCard>
            <InteractiveCard className="p-5 gradient-border">
              <div className="text-sm font-semibold">What we don’t do</div>
              <div className="mt-2 text-sm text-muted-foreground leading-relaxed">
                No login. No bank sync. No cloud storage in this version.
              </div>
            </InteractiveCard>
          </div>

          <div className="mt-10 border-t border-border pt-8 text-sm text-muted-foreground">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <span>Clarity first. Calm by default.</span>
              <div className="flex gap-3">
                <a
                  href="https://docs.tambo.co"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline underline-offset-4"
                >
                  Tambo docs
                </a>
                <a
                  href="/interactables"
                  className="hover:underline underline-offset-4"
                >
                  Open workspace
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

