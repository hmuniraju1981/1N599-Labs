// =============================================================================
// FILE: src/components/sections/AiAssistant.tsx
// PURPOSE: The website AI assistant, on its own full screen directly below the
//          hero. Laid out like an answer engine: a product panel on the left,
//          a single centred question box on the right.
//
//          Talks to POST /api/assistant, which is a Cloudflare Pages Function.
//          The API key lives only in that function's environment — this
//          component never sees it and never could. The selected product is
//          sent as `product` and validated server-side.
//
// LAYOUT NOTE: The conversation scrolls inside its own container. All
//          auto-scrolling sets `scrollTop` on that container directly rather
//          than using scrollIntoView(), because scrollIntoView also scrolls
//          ancestor elements and would yank the whole page as tokens stream in.
// =============================================================================

"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  ArrowUpRight,
  ChevronDown,
  Layers,
  Plus,
  RotateCcw,
} from "lucide-react";
import Logo from "@/components/ui/Logo";
import {
  ASSISTANT_UI,
  PRODUCTS,
  SUGGESTED_PROMPTS,
  type Product,
} from "../../../content/knowledge";
import { completeOnboardingStep } from "@/lib/onboarding";
import NextSectionCue from "@/components/ui/NextSectionCue";

type Role = "user" | "assistant";
interface Message {
  role: Role;
  content: string;
}

const MAX_INPUT_CHARS = 1200; // Kept in sync with the server-side cap.

// -----------------------------------------------------------------------------
// Minimal, injection-safe rendering of the model's light Markdown: paragraphs,
// "-"/"*"/"1." bullets, **bold** and bare https links. Everything is rendered
// as React text nodes — no HTML from the model ever reaches the DOM.
// -----------------------------------------------------------------------------
function renderInline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|https?:\/\/[^\s)]+)/g);
  return parts.map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={key} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (/^https?:\/\//.test(part)) {
      const href = part.replace(/[.,;:]+$/, "");
      const trailing = part.slice(href.length);
      return (
        <Fragment key={key}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-300 underline decoration-cyan-300/40 underline-offset-2 hover:text-cyan-200"
          >
            {href.replace(/^https?:\/\/(www\.)?/, "")}
          </a>
          {trailing}
        </Fragment>
      );
    }
    return <Fragment key={key}>{part}</Fragment>;
  });
}

function RichText({ text }: { text: string }) {
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];

  const flushList = (key: string) => {
    if (list.length === 0) return;
    blocks.push(
      <ul key={key} className="space-y-1.5 pl-1">
        {list.map((item, i) => (
          <li key={i} className="flex gap-2.5">
            <span className="mt-[0.6em] h-1 w-1 flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-400 to-violet-400" />
            <span>{renderInline(item, `${key}-${i}`)}</span>
          </li>
        ))}
      </ul>,
    );
    list = [];
  };

  text.split("\n").forEach((rawLine, i) => {
    const line = rawLine.trim();
    const bullet = line.match(/^(?:[-*•]|\d+[.)])\s+(.*)$/);
    if (bullet) {
      list.push(bullet[1]);
      return;
    }
    flushList(`l${i}`);
    if (line === "") return;
    const heading = line.match(/^#{1,4}\s+(.*)$/);
    blocks.push(
      heading ? (
        <p key={`p${i}`} className="font-semibold text-white">
          {renderInline(heading[1], `p${i}`)}
        </p>
      ) : (
        <p key={`p${i}`}>{renderInline(line, `p${i}`)}</p>
      ),
    );
  });
  flushList("end");

  return <div className="space-y-3">{blocks}</div>;
}

// -----------------------------------------------------------------------------
// Product mark. Every logo sits on the same rounded tile size so the panel
// reads as one set even though the sources differ (PNG vs SVG).
// -----------------------------------------------------------------------------
function ProductMark({ product, size = 36 }: { product: Product; size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static export, images are unoptimized anyway
    <img
      src={product.logo}
      alt=""
      width={size}
      height={size}
      className="flex-shrink-0 rounded-[10px] ring-1 ring-white/10 shadow-lg shadow-black/40"
      style={{ width: size, height: size }}
    />
  );
}

function AllProductsMark({ size = 36 }: { size?: number }) {
  return (
    <span
      className="flex flex-shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-cyan-500 to-violet-600 text-white ring-1 ring-white/10 shadow-lg shadow-violet-900/40"
      style={{ width: size, height: size }}
    >
      <Layers className="h-[45%] w-[45%]" aria-hidden="true" />
    </span>
  );
}

export default function AiAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);

  const lastAttemptRef = useRef<Message[] | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const focus = PRODUCTS.find((p) => p.id === focusId) ?? null;
  const hasConversation = messages.length > 0;

  const prompts: readonly string[] = focus ? focus.prompts : SUGGESTED_PROMPTS;
  const askedPrompts = new Set(
    messages.filter((m) => m.role === "user").map((m) => m.content),
  );
  const remainingPrompts = prompts.filter((p) => !askedPrompts.has(p));
  const lastMessage = messages[messages.length - 1];
  const showFollowUpPrompts =
    hasConversation &&
    !isStreaming &&
    !error &&
    lastMessage?.role === "assistant" &&
    lastMessage.content.trim() !== "" &&
    remainingPrompts.length > 0;

  useEffect(() => {
    const el = scrollAreaRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isStreaming]);

  // Grow the question box with its content, up to a cap.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [input]);

  const send = useCallback(async (history: Message[], productId: string | null) => {
    lastAttemptRef.current = history;
    setError(null);
    setIsStreaming(true);
    setMessages(history);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          ...(productId ? { product: productId } : {}),
        }),
      });

      if (res.status === 429) {
        const body = await res.json().catch(() => null);
        const isUpstream =
          (body as { error?: string } | null)?.error === "upstream_busy";
        setError(isUpstream ? ASSISTANT_UI.busyMessage : ASSISTANT_UI.rateLimitMessage);
        return;
      }
      if (!res.ok || !res.body) {
        setError(ASSISTANT_UI.errorMessage);
        return;
      }

      setMessages([...history, { role: "assistant", content: "" }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: "assistant", content: acc };
          return next;
        });
      }

      if (acc.trim() === "") {
        setMessages(history);
        setError(ASSISTANT_UI.errorMessage);
      }
    } catch {
      setMessages(history);
      setError(ASSISTANT_UI.errorMessage);
    } finally {
      setIsStreaming(false);
    }
  }, []);

  const submit = useCallback(
    (text: string) => {
      const trimmed = text.trim().slice(0, MAX_INPUT_CHARS);
      if (!trimmed || isStreaming) return;
      setInput("");
      completeOnboardingStep("asked_assistant");
      void send([...messages, { role: "user", content: trimmed }], focusId);
    },
    [focusId, isStreaming, messages, send],
  );

  const retry = useCallback(() => {
    const history = lastAttemptRef.current;
    if (history) void send(history, focusId);
  }, [focusId, send]);

  const newChat = useCallback(() => {
    if (isStreaming) return;
    setMessages([]);
    setError(null);
    setInput("");
    lastAttemptRef.current = null;
    inputRef.current?.focus();
  }, [isStreaming]);

  const selectFocus = useCallback((id: string | null) => {
    setFocusId(id);
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  const placeholder = focus
    ? ASSISTANT_UI.productPlaceholder(focus.name)
    : ASSISTANT_UI.placeholder;

  // ---------------------------------------------------------------- composer
  const composer = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit(input);
      }}
      className="group relative rounded-2xl p-px bg-gradient-to-br from-white/15 via-white/[0.06] to-white/10 focus-within:from-cyan-400/60 focus-within:via-violet-500/40 focus-within:to-fuchsia-500/50 transition-colors duration-300 shadow-[0_20px_60px_-20px_rgba(139,92,246,0.45)]"
    >
      <div className="rounded-[15px] bg-[#0b0f19]/95 backdrop-blur-xl">
        <label htmlFor="assistant-input" className="sr-only">
          {placeholder}
        </label>
        <textarea
          id="assistant-input"
          ref={inputRef}
          rows={hasConversation ? 1 : 2}
          value={input}
          maxLength={MAX_INPUT_CHARS}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submit(input);
            }
          }}
          placeholder={placeholder}
          disabled={isStreaming}
          autoComplete="off"
          className="block w-full resize-none bg-transparent px-5 pt-4 pb-2 text-[15px] leading-relaxed text-slate-100 placeholder:text-slate-500 focus:outline-none disabled:opacity-60"
        />
        <div className="flex items-center justify-between gap-3 px-3 pb-3">
          <span className="inline-flex min-w-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1 pl-1 pr-3 text-xs text-slate-300">
            {focus ? <ProductMark product={focus} size={20} /> : <AllProductsMark size={20} />}
            <span className="truncate">{focus ? focus.name : ASSISTANT_UI.allProductsLabel}</span>
          </span>
          <button
            type="submit"
            disabled={isStreaming || input.trim() === ""}
            aria-label="Send message"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 text-white shadow-lg shadow-violet-900/40 transition-all duration-300 hover:scale-105 hover:shadow-cyan-500/30 disabled:scale-100 disabled:opacity-30 disabled:shadow-none"
          >
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </form>
  );

  // ------------------------------------------------------------ product list
  const productButton = (product: Product | null, compact: boolean) => {
    const active = (product?.id ?? null) === focusId;
    const name = product ? product.name : ASSISTANT_UI.allProductsLabel;
    const sub = product ? product.category : "Ask across all four";
    return (
      <button
        key={product?.id ?? "all"}
        type="button"
        onClick={() => selectFocus(product?.id ?? null)}
        aria-pressed={active}
        className={[
          "relative flex items-center gap-3 rounded-xl text-left transition-all duration-200",
          compact ? "flex-shrink-0 px-2.5 py-2 pr-4" : "w-full px-2.5 py-2.5",
          active
            ? "bg-gradient-to-r from-cyan-500/[0.14] via-violet-500/[0.12] to-transparent ring-1 ring-inset ring-white/15"
            : "hover:bg-white/[0.05]",
        ].join(" ")}
      >
        {active && !compact && (
          <span className="absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-cyan-400 to-violet-500" />
        )}
        {product ? <ProductMark product={product} size={compact ? 26 : 36} /> : <AllProductsMark size={compact ? 26 : 36} />}
        <span className="min-w-0">
          <span className={`block truncate font-medium ${active ? "text-white" : "text-slate-200"} ${compact ? "text-[13px]" : "text-sm"}`}>
            {name}
          </span>
          {!compact && (
            <span className="block truncate text-xs text-slate-500">{sub}</span>
          )}
        </span>
      </button>
    );
  };

  return (
    <section
      id="assistant"
      className="relative flex min-h-[100svh] w-full items-center overflow-hidden bg-[#030712] px-3 py-20 sm:px-6"
    >
      {/* Ambient glows behind the app window. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/4 h-[520px] w-[520px] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute -bottom-40 right-1/4 h-[480px] w-[480px] rounded-full bg-cyan-500/15 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black, transparent)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black, transparent)",
          }}
        />
      </div>

      {/* ------------------------------------------------------- APP WINDOW */}
      <div className="relative z-10 mx-auto flex h-[min(860px,calc(100svh-8rem))] min-h-[560px] w-full max-w-7xl overflow-hidden rounded-3xl border border-white/10 bg-[#070a12]/85 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_40px_120px_-30px_rgba(0,0,0,0.9),0_0_80px_-20px_rgba(139,92,246,0.25)] backdrop-blur-xl">

        {/* -------------------------------------------- LEFT PANEL (lg and up) */}
        <aside className="hidden w-72 flex-shrink-0 flex-col border-r border-white/[0.07] bg-white/[0.015] lg:flex">
          <div className="flex items-center gap-2.5 px-5 pt-5 pb-4">
            <Logo size={30} showText={false} />
            <div className="leading-tight">
              <p className="text-sm font-semibold text-white">1N599 <span className="gradient-text">AI</span></p>
              <p className="text-[11px] text-slate-500">Product assistant</p>
            </div>
          </div>

          <div className="px-3">
            <button
              type="button"
              onClick={newChat}
              disabled={isStreaming}
              className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-slate-200 transition-colors hover:border-white/20 hover:bg-white/[0.06] disabled:opacity-50"
            >
              <Plus className="h-4 w-4 text-slate-400" aria-hidden="true" />
              {ASSISTANT_UI.newChat}
            </button>
          </div>

          <p className="px-5 pt-6 pb-2 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {ASSISTANT_UI.productsHeading}
          </p>
          <nav aria-label="Choose a product" className="flex flex-col gap-1 px-3">
            {productButton(null, false)}
            {PRODUCTS.map((p) => productButton(p, false))}
          </nav>

          {/* Selected product card */}
          <div className="mt-auto p-3">
            <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.05] to-transparent p-4">
              {focus ? (
                <>
                  <div className="mb-2 flex items-center gap-2.5">
                    <ProductMark product={focus} size={28} />
                    <p className="text-sm font-semibold text-white">{focus.name}</p>
                  </div>
                  <p className="mb-3 text-xs leading-relaxed text-slate-400">{focus.tagline}</p>
                  <a
                    href={focus.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-cyan-300 hover:text-cyan-200"
                  >
                    {focus.url.replace("https://", "")}
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </>
              ) : (
                <>
                  <div className="mb-3 flex -space-x-2">
                    {PRODUCTS.map((p) => (
                      <span key={p.id} className="rounded-[10px] ring-2 ring-[#0b0e16]">
                        <ProductMark product={p} size={26} />
                      </span>
                    ))}
                  </div>
                  <p className="text-xs leading-relaxed text-slate-400">
                    Four products, one assistant. Pick a product to focus the answers.
                  </p>
                </>
              )}
            </div>
          </div>
        </aside>

        {/* ------------------------------------------------------- MAIN PANE */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile / tablet product strip */}
          <div className="flex items-center gap-2 border-b border-white/[0.07] px-3 py-2.5 lg:hidden">
            <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto [scrollbar-width:none]">
              {productButton(null, true)}
              {PRODUCTS.map((p) => productButton(p, true))}
            </div>
            {hasConversation && (
              <button
                type="button"
                onClick={newChat}
                disabled={isStreaming}
                aria-label={ASSISTANT_UI.newChat}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 text-slate-300 hover:bg-white/[0.06] disabled:opacity-50"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>

          {!hasConversation ? (
            /* ------------------------------------------------ EMPTY / HOME */
            <div className="flex flex-1 flex-col overflow-y-auto px-5 sm:px-10">
              <div className="m-auto w-full max-w-2xl py-10">
                <p className="mb-3 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_2px_rgba(34,211,238,0.6)]" />
                  {ASSISTANT_UI.eyebrow}
                </p>
                <h2 className="mb-3 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                  {ASSISTANT_UI.title.split(" ").slice(0, -1).join(" ")}{" "}
                  <span className="gradient-text">{ASSISTANT_UI.title.split(" ").slice(-1)}</span>
                </h2>
                <p className="mb-8 text-sm text-slate-400 sm:text-base">
                  {focus ? `${focus.tagline}. Ask anything about ${focus.name}.` : ASSISTANT_UI.subtitle}
                </p>

                {composer}

                {error && (
                  <ErrorBanner message={error} onRetry={retry} />
                )}

                <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                  {prompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => submit(prompt)}
                      className="group/card flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-left text-sm text-slate-300 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-400/40 hover:bg-white/[0.05] hover:text-white"
                    >
                      <span>{prompt}</span>
                      <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-slate-600 transition-colors group-hover/card:text-cyan-300" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ------------------------------------------------ CONVERSATION */
            <>
              <div
                ref={scrollAreaRef}
                aria-live="polite"
                aria-atomic="false"
                aria-label="Conversation"
                className="flex-1 overflow-y-auto px-5 py-8 sm:px-10"
              >
                <div className="mx-auto w-full max-w-3xl space-y-8">
                  {messages.map((message, i) =>
                    message.role === "user" ? (
                      <div key={i} className="flex justify-end">
                        <h3 className="max-w-[85%] rounded-2xl rounded-br-md border border-white/10 bg-gradient-to-br from-cyan-500/20 to-violet-600/25 px-4 py-2.5 text-[15px] font-medium text-white">
                          {message.content}
                        </h3>
                      </div>
                    ) : (
                      <div key={i} className="flex gap-3.5">
                        <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 text-white shadow-lg shadow-violet-900/40">
                          <Logo size={18} showText={false} mono />
                        </span>
                        <div className="min-w-0 flex-1 pt-1 text-[14.5px] leading-relaxed text-slate-300">
                          <RichText text={message.content} />
                          {isStreaming && i === messages.length - 1 && (
                            <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-cyan-400 align-middle" aria-hidden="true" />
                          )}
                        </div>
                      </div>
                    ),
                  )}

                  {isStreaming && lastMessage?.role === "user" && (
                    <div className="flex items-center gap-3.5" aria-label="Assistant is typing">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 text-white">
                        <Logo size={18} showText={false} mono />
                      </span>
                      <span className="flex gap-1.5">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0.15s]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0.3s]" />
                      </span>
                    </div>
                  )}

                  {showFollowUpPrompts && (
                    <div className="pl-[46px]">
                      <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {ASSISTANT_UI.followUpLabel}
                      </p>
                      <div className="flex flex-col divide-y divide-white/[0.06] rounded-xl border border-white/[0.08] bg-white/[0.02]">
                        {remainingPrompts.slice(0, 4).map((prompt) => (
                          <button
                            key={prompt}
                            type="button"
                            onClick={() => submit(prompt)}
                            className="flex items-center justify-between gap-3 px-4 py-2.5 text-left text-sm text-slate-300 transition-colors hover:bg-white/[0.04] hover:text-white"
                          >
                            {prompt}
                            <Plus className="h-3.5 w-3.5 flex-shrink-0 text-slate-500" aria-hidden="true" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {error && <ErrorBanner message={error} onRetry={retry} />}
                </div>
              </div>

              <div className="border-t border-white/[0.06] px-4 pt-4 pb-3 sm:px-10">
                <div className="mx-auto w-full max-w-3xl">
                  {composer}
                  <p className="mt-2 text-center text-[11px] text-slate-600">
                    {ASSISTANT_UI.disclaimer}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <a
        href="#about"
        aria-label="Scroll to next section"
        className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2"
      >
        <ChevronDown className="h-6 w-6 animate-bounce text-cyan-400" aria-hidden="true" />
      </a>
      <NextSectionCue href="#about" label="About" />
    </section>
  );
}

function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5"
    >
      <p className="text-[13px] text-red-200">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-cyan-300 transition-colors hover:text-cyan-200"
      >
        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
        Retry
      </button>
    </div>
  );
}
