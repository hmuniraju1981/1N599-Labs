// =============================================================================
// FILE: src/components/sections/AiAssistant.tsx
// PURPOSE: The website AI assistant, rendered as a full-width section directly
//          below the hero (deliberately NOT a floating chat bubble).
//
//          Talks to POST /api/assistant, which is a Cloudflare Pages Function.
//          The API key lives only in that function's environment — this
//          component never sees it and never could.
//
// LAYOUT NOTE: The message area has a FIXED height and scrolls internally. All
//          auto-scrolling sets `scrollTop` on that container directly rather
//          than using scrollIntoView(), because scrollIntoView also scrolls
//          ancestor elements and would yank the whole page as tokens stream in.
// =============================================================================

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, ChevronDown, RotateCcw, Send } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { ASSISTANT_UI, SUGGESTED_PROMPTS } from "../../../content/knowledge";
import { completeOnboardingStep } from "@/lib/onboarding";

// Mirrors the payload shape the API function validates.
type Role = "user" | "assistant";
interface Message {
  role: Role;
  content: string;
}

const MAX_INPUT_CHARS = 1200; // Kept in sync with the server-side cap.

// -----------------------------------------------------------------------------
// A suggestion chip. Extracted because these are rendered in two places now —
// the empty state and after each completed reply — and the styling was long
// enough that a second inline copy would have drifted from the first.
// -----------------------------------------------------------------------------
function PromptChip({
  prompt,
  onSelect,
}: {
  prompt: string;
  onSelect: (prompt: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(prompt)}
      className="px-2.5 sm:px-3.5 py-1.5 rounded-full bg-white/[0.07] border border-white/[0.12] backdrop-blur-sm text-[11.5px] sm:text-[13px] text-slate-200 hover:border-cyan-400/70 hover:text-cyan-200 hover:bg-white/[0.11] transition-colors duration-200"
    >
      {prompt}
    </button>
  );
}

export default function AiAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The last user message, retained so the error state can offer a retry.
  const lastAttemptRef = useRef<Message[] | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasConversation = messages.length > 0;

  // ---------------------------------------------------------------------------
  // Follow-up suggestions.
  //
  // The chips used to live only in the empty state, so they disappeared the
  // moment the first question was sent and never came back. That left the
  // visitor staring at a bare text box with no idea what else could be asked,
  // which is the point at which most people stop using an assistant.
  //
  // Prompts already asked are filtered out — re-offering a question that is
  // sitting a few lines above in the transcript is noise, and clicking it would
  // just produce the same answer again.
  // ---------------------------------------------------------------------------
  const askedPrompts = new Set(
    messages.filter((message) => message.role === "user").map((m) => m.content),
  );
  const remainingPrompts = SUGGESTED_PROMPTS.filter(
    (prompt) => !askedPrompts.has(prompt),
  );

  const lastMessage = messages[messages.length - 1];

  // Only once a reply is genuinely complete: not mid-stream, not errored, and
  // with actual content — otherwise the chips flash in beside a half-written
  // answer or an empty bubble.
  const showFollowUpPrompts =
    hasConversation &&
    !isStreaming &&
    !error &&
    lastMessage?.role === "assistant" &&
    lastMessage.content.trim() !== "" &&
    remainingPrompts.length > 0;

  // ---------------------------------------------------------------------------
  // Keep the newest content in view WITHOUT touching page scroll.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const el = scrollAreaRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isStreaming]);

  // ---------------------------------------------------------------------------
  // Send a turn and stream the reply token by token.
  // ---------------------------------------------------------------------------
  const send = useCallback(
    async (history: Message[]) => {
      lastAttemptRef.current = history;
      setError(null);
      setIsStreaming(true);
      setMessages(history);

      try {
        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
        });

        if (res.status === 429) {
          // Two different causes share this status: our own per-IP limit, and
          // the model provider throttling us. They need different wording.
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

        // Open an empty assistant message, then fill it as tokens arrive.
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

        // An empty stream is a failure, not an answer.
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
    },
    [],
  );

  const submit = useCallback(
    (text: string) => {
      const trimmed = text.trim().slice(0, MAX_INPUT_CHARS);
      if (!trimmed || isStreaming) return;

      setInput("");
      completeOnboardingStep("asked_assistant");
      void send([...messages, { role: "user", content: trimmed }]);
    },
    [isStreaming, messages, send],
  );

  const retry = useCallback(() => {
    const history = lastAttemptRef.current;
    if (history) void send(history);
  }, [send]);

  return (
    // No background of its own: this section floats over the shared sky rendered
    // by SpaceScene. It previously carried its own glows and sat on the page's
    // flat near-black, which is what created the visible horizontal edge.
    <section
      id="assistant"
      className="relative w-full px-4 sm:px-6 pt-4 pb-16"
    >
      {/* ---------------------------------------------------------------- CARD */}
      {/* Frosted glass over the sky rather than an opaque panel: the starfield
          and the Earth stay faintly visible through it, and the outer violet
          glow lifts it off the background instead of stamping it on. */}
      <div
        className="relative z-10 mx-auto w-full max-w-[760px] overflow-hidden"
        style={{
          background: "rgba(3,7,18,0.55)",
          backdropFilter: "blur(20px) saturate(1.2)",
          WebkitBackdropFilter: "blur(20px) saturate(1.2)",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: "20px",
          boxShadow: "0 0 60px rgba(139,92,246,0.15)",
        }}
      >

        {/* -------------------------------------------------------- HEADER ROW */}
        <div className="flex items-center gap-3 px-4 sm:px-5 py-4">
          {/* Circular gradient tile holding the hexagon neural mark */}
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white">
            <Logo size={24} showText={false} mono />
          </div>

          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-semibold text-white leading-tight">
              {ASSISTANT_UI.title}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 leading-snug">
              {ASSISTANT_UI.subtitle}
            </p>
          </div>
        </div>

        {/* Thin divider under the header */}
        <div className="h-px" style={{ background: "rgba(255,255,255,0.08)" }} />

        {/* -------------------------------------------------- MESSAGES / BODY */}
        {/* Fixed height + internal scroll: the page never reflows or jumps. */}
        <div
          ref={scrollAreaRef}
          aria-live="polite"
          aria-atomic="false"
          aria-label="Conversation"
          className="h-[300px] sm:h-[260px] overflow-y-auto px-4 sm:px-5 py-5 flex flex-col"
        >
          {!hasConversation ? (
            /* ---------------------------------------- EMPTY STATE + CHIPS */
            /* `m-auto` centres this vertically but, unlike justify-center,
               never clips the top once the content outgrows the container. */
            <div className="m-auto flex flex-col items-center">
              <Bot className="w-7 h-7 text-slate-400 mb-3" aria-hidden="true" />
              <p className="text-sm text-slate-400 mb-5">
                {ASSISTANT_UI.emptyState}
              </p>

              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <PromptChip key={prompt} prompt={prompt} onSelect={submit} />
                ))}
              </div>
            </div>
          ) : (
            /* ------------------------------------------------- TRANSCRIPT */
            <div className="w-full space-y-4">
              {messages.map((message, i) => (
                <div
                  key={i}
                  className={
                    message.role === "user" ? "flex justify-end" : "flex justify-start"
                  }
                >
                  <div
                    className={
                      message.role === "user"
                        ? "max-w-[85%] rounded-2xl rounded-br-sm bg-gradient-to-br from-cyan-500/90 to-violet-600/90 px-3.5 py-2 text-[13px] sm:text-sm text-white"
                        : "max-w-[90%] rounded-2xl rounded-bl-sm bg-white/[0.07] border border-white/[0.12] px-3.5 py-2 text-[13px] sm:text-sm text-slate-100 whitespace-pre-wrap leading-relaxed"
                    }
                  >
                    {message.content}

                    {/* Streaming indicator — a pulsing caret on the open reply */}
                    {isStreaming &&
                      message.role === "assistant" &&
                      i === messages.length - 1 && (
                        <span
                          className="inline-block w-1.5 h-3.5 ml-0.5 align-middle bg-cyan-400 animate-pulse"
                          aria-hidden="true"
                        />
                      )}
                  </div>
                </div>
              ))}

              {/* Waiting on the first token */}
              {isStreaming && messages[messages.length - 1]?.role === "user" && (
                <div className="flex justify-start" aria-label="Assistant is typing">
                  <div className="rounded-2xl rounded-bl-sm bg-white/[0.07] border border-white/[0.12] px-3.5 py-3 flex gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.3s]" />
                  </div>
                </div>
              )}

              {/* ------------------------------------- FOLLOW-UP SUGGESTIONS */}
              {/* Left-aligned to sit under the assistant's bubble, so they read
                  as "here is what to ask next" rather than as a second reply. */}
              {showFollowUpPrompts && (
                <div className="pt-1">
                  <p className="text-[10.5px] uppercase tracking-wider text-slate-500 mb-2">
                    {ASSISTANT_UI.followUpLabel}
                  </p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {remainingPrompts.map((prompt) => (
                      <PromptChip key={prompt} prompt={prompt} onSelect={submit} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------ ERROR STATE + RETRY */}
          {error && (
            <div
              role="alert"
              className="w-full flex-shrink-0 mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5"
            >
              <p className="text-[13px] text-red-200">{error}</p>
              <button
                type="button"
                onClick={retry}
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-cyan-300 hover:text-cyan-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                Retry
              </button>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------ FOOTER */}
        <div className="px-4 sm:px-5 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <form
            onSubmit={(e) => {
              e.preventDefault(); // Enter submits without navigating.
              submit(input);
            }}
            className="flex items-center gap-2.5"
          >
            <label htmlFor="assistant-input" className="sr-only">
              {ASSISTANT_UI.placeholder}
            </label>
            <input
              id="assistant-input"
              ref={inputRef}
              type="text"
              value={input}
              maxLength={MAX_INPUT_CHARS}
              onChange={(e) => setInput(e.target.value)}
              placeholder={ASSISTANT_UI.placeholder}
              disabled={isStreaming}
              autoComplete="off"
              className="flex-1 min-w-0 px-4 py-2.5 rounded-xl bg-white/[0.07] border border-white/[0.12] backdrop-blur-sm text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/50 transition-all disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isStreaming || input.trim() === ""}
              aria-label="Send message"
              className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-white hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 disabled:opacity-40 disabled:hover:shadow-none"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>

      {/* -------------------------------------- SCROLL CUE TO NEXT SECTION */}
      <div className="relative z-10 flex justify-center mt-4">
        <a href="#about" aria-label="Scroll to next section">
          <ChevronDown className="w-6 h-6 text-cyan-400 animate-bounce" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
