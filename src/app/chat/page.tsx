"use client";

import { MessageThreadFull } from "@/components/tambo/message-thread-full";
import { useMcpServers } from "@/components/tambo/mcp-config-modal";
import { components, tools } from "@/lib/tambo";
import { TamboProvider } from "@tambo-ai/react";
import Link from "next/link";
import { ThemeToggle } from "@/components/landing/ThemeToggle";

/**
 * Home page component that renders the Tambo chat interface.
 *
 * @remarks
 * The `NEXT_PUBLIC_TAMBO_URL` environment variable specifies the URL of the Tambo server.
 * You do not need to set it if you are using the default Tambo server.
 * It is only required if you are running the API server locally.
 *
 * @see {@link https://github.com/tambo-ai/tambo/blob/main/CONTRIBUTING.md} for instructions on running the API server locally.
 */
export default function Home() {
  // Load MCP server configurations
  const mcpServers = useMcpServers();

  return (
    <TamboProvider
      apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
      components={components}
      tools={tools}
      tamboUrl={process.env.NEXT_PUBLIC_TAMBO_URL}
      mcpServers={mcpServers}
    >
      <div className="h-screen workspace-bg">
        <div className="sticky top-0 z-40 backdrop-blur bg-background/70 border-b border-border">
          <div className="max-w-6xl mx-auto px-6 md:px-8 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <div className="text-sm text-muted-foreground">Chat</div>
              <div className="text-lg font-semibold tracking-tight">
                Budget assistant
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/"
                className="px-3 py-2 rounded-md text-sm border border-border bg-background hover:bg-muted"
              >
                Home
              </Link>
              <Link
                href="/interactables"
                className="px-3 py-2 rounded-md text-sm border border-border bg-background hover:bg-muted"
              >
                Workspace
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>

        <div className="h-[calc(100vh-57px)]">
          <div className="max-w-6xl mx-auto h-full px-4 md:px-8 py-6">
            <div className="gradient-border h-full rounded-2xl">
              <MessageThreadFull className="h-full rounded-2xl bg-card" />
            </div>
          </div>
        </div>
      </div>
    </TamboProvider>
  );
}
