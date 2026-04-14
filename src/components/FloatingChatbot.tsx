import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, MessageCircle, X, Leaf, CloudSun, TrendingUp, Bug, Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

type Msg = { role: "user" | "assistant"; content: string };

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
const CHAT_URL = SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/farming-chat` : "";
const USE_EDGE_FUNCTION = import.meta.env.VITE_USE_EDGE_FUNCTION === "true";
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = import.meta.env.VITE_GROQ_MODEL || "llama-3.3-70b-versatile";
const GROQ_STT_URL = "https://api.groq.com/openai/v1/audio/transcriptions";
const GROQ_STT_MODEL = import.meta.env.VITE_GROQ_STT_MODEL || "whisper-large-v3-turbo";
const IS_MOBILE_DEVICE =
  typeof navigator !== "undefined" &&
  /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
const AI_AVATAR_SRC = "/images/ai-avatar.jpeg";

const quickReplies = [
  { label: "Best Rabi crops?", icon: Leaf },
  { label: "Weather forecast for wheat", icon: CloudSun },
  { label: "Current tomato prices", icon: TrendingUp },
  { label: "Pest control for rice", icon: Bug },
];

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Namaste! 🙏 I'm your AI farming assistant. Ask me anything about crops, weather, soil, prices, or farming techniques. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [canRecordAudio, setCanRecordAudio] = useState(false);
  const [isTranscribingVoice, setIsTranscribingVoice] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const speechRecognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const inputValueRef = useRef("");
  const voicePrefixRef = useRef("");
  const voiceFinalTranscriptRef = useRef("");
  const voiceDetectedRef = useRef(false);
  const shouldAutoSendVoiceRef = useRef(false);
  const sendMessageRef = useRef<(text: string) => Promise<void>>(async () => {});

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    inputValueRef.current = input;
  }, [input]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const allMessages = [...messages, userMsg].filter((m) => m.content);

      let reply = "";

      // Primary path for production: Supabase Edge Function
      if (USE_EDGE_FUNCTION && CHAT_URL && SUPABASE_PUBLISHABLE_KEY) {
        try {
          const edgeResp = await fetch(CHAT_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ messages: allMessages }),
          });

          if (edgeResp.ok && edgeResp.body && edgeResp.headers.get("content-type")?.includes("text/event-stream")) {
            const reader = edgeResp.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });

              let newlineIndex: number;
              while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
                let line = buffer.slice(0, newlineIndex);
                buffer = buffer.slice(newlineIndex + 1);
                if (line.endsWith("\r")) line = line.slice(0, -1);
                if (line.startsWith(":") || line.trim() === "" || !line.startsWith("data: ")) continue;
                const jsonStr = line.slice(6).trim();
                if (jsonStr === "[DONE]") continue;
                try {
                  const parsed = JSON.parse(jsonStr);
                  const chunk = parsed.choices?.[0]?.delta?.content as string | undefined;
                  if (chunk) reply += chunk;
                } catch {
                  // Ignore malformed stream chunk and continue.
                }
              }
            }
          } else if (edgeResp.ok) {
            const data = await edgeResp.json().catch(() => ({}));
            reply = data.choices?.[0]?.message?.content || data.message || "";
          } else {
            const edgeErr = await edgeResp.json().catch(() => ({}));
            throw new Error(edgeErr.error || "Supabase chat function failed");
          }
        } catch (edgeError) {
          if (!GROQ_API_KEY) {
            throw edgeError;
          }
        }
      }

      // Fallback path: direct Groq
      if (!reply) {
        if (!GROQ_API_KEY) {
          throw new Error(
            "AI is not configured. Set Supabase function credentials or add VITE_GROQ_API_KEY in Vercel Environment Variables."
          );
        }

        const messagesForApi = allMessages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await fetch(GROQ_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [
              {
                role: "system",
                content: `You are KrishiAI, an expert Indian agricultural assistant. You help farmers with:
- Crop selection and recommendations based on soil, climate, and season
- Weather interpretation and farming advisories
- Market prices and selling strategies
- Pest and disease identification and organic/chemical solutions
- Fertilizer schedules and soil health management
- Irrigation techniques and water conservation
- Government schemes (PM-KISAN, crop insurance, MSP)
- Storage and post-harvest management

Guidelines:
- Be concise, practical, and actionable
- Use Indian units (acres, quintals, ₹) and reference Indian conditions
- Include both Hindi crop names and English names when relevant
- Suggest organic alternatives alongside chemical solutions
- Mention relevant government schemes when applicable
- Keep responses focused and farmer-friendly
- If unsure, say so rather than guessing`,
              },
              ...messagesForApi,
            ],
            temperature: 0.7,
            max_tokens: 1024,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const apiMessage = errData.error?.message || "Failed to get response from AI";

          if (typeof apiMessage === "string" && apiMessage.toLowerCase().includes("decommissioned")) {
            throw new Error(
              "The selected Groq model is deprecated. Update VITE_GROQ_MODEL to a currently supported model and restart the app."
            );
          }

          throw new Error(apiMessage);
        }

        const data = await response.json();
        reply = data.choices?.[0]?.message?.content || "";
      }

      if (!reply) {
        reply = "I apologize, I couldn't process that. Please try again.";
      }
      
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (e: any) {
      console.error("Chat error:", e);
      setMessages((prev) => [...prev, { role: "assistant", content: `Sorry, something went wrong: ${e.message}. Please try again.` }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    setSpeechSupported(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = navigator.language || "en-IN";

    recognition.onstart = () => {
      setIsListening(true);
      setSpeechError(null);
      shouldAutoSendVoiceRef.current = true;
      voiceDetectedRef.current = false;
      voiceFinalTranscriptRef.current = "";
      voicePrefixRef.current = inputValueRef.current.trim();
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const transcriptChunk = result?.[0]?.transcript?.trim() || "";
        if (!transcriptChunk) continue;

        voiceDetectedRef.current = true;
        if (result.isFinal) {
          voiceFinalTranscriptRef.current = `${voiceFinalTranscriptRef.current} ${transcriptChunk}`.trim();
        } else {
          interimTranscript = `${interimTranscript} ${transcriptChunk}`.trim();
        }
      }

      const composedInput = [voicePrefixRef.current, voiceFinalTranscriptRef.current, interimTranscript]
        .filter(Boolean)
        .join(" ")
        .trim();

      setInput(composedInput);
    };

    recognition.onerror = (event: any) => {
      shouldAutoSendVoiceRef.current = false;

      if (event?.error === "aborted") return;

      if (event?.error === "not-allowed") {
        setSpeechError("Microphone access denied. Please allow microphone permission.");
        return;
      }

      setSpeechError("Could not capture voice. Please try again.");
    };

    recognition.onend = () => {
      setIsListening(false);

      const finalVoiceText = [voicePrefixRef.current, voiceFinalTranscriptRef.current]
        .filter(Boolean)
        .join(" ")
        .trim();

      const shouldSend =
        shouldAutoSendVoiceRef.current &&
        voiceDetectedRef.current &&
        finalVoiceText.length > 0;

      shouldAutoSendVoiceRef.current = false;
      voiceDetectedRef.current = false;
      voiceFinalTranscriptRef.current = "";
      voicePrefixRef.current = "";

      if (shouldSend) {
        void sendMessageRef.current(finalVoiceText);
      }
    };

    speechRecognitionRef.current = recognition;

    return () => {
      recognition.abort();
      speechRecognitionRef.current = null;
    };
  }, []);

  const handleVoiceToggle = () => {
    if (!speechSupported || !speechRecognitionRef.current || isLoading) return;

    setSpeechError(null);
    try {
      if (isListening) {
        speechRecognitionRef.current.stop();
        return;
      }

      speechRecognitionRef.current.lang = navigator.language || "en-IN";
      speechRecognitionRef.current.start();
    } catch {
      setSpeechError("Unable to start voice input. Please try again.");
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full bg-white dark:bg-slate-900 border-2 border-emerald-700 dark:border-emerald-500 ring-1 ring-emerald-700/55 dark:ring-emerald-500/55 flex items-center justify-center shadow-[0_0_22px_rgba(5,150,105,0.62),0_0_48px_rgba(5,150,105,0.36)] hover:shadow-[0_0_30px_rgba(5,150,105,0.78),0_0_64px_rgba(5,150,105,0.5)] transition-shadow overflow-hidden"
        aria-label="Toggle chatbot"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-primary-foreground" />
        ) : (
          avatarLoadFailed ? (
            <MessageCircle className="w-6 h-6 text-primary-foreground" />
          ) : (
            <img
              src={AI_AVATAR_SRC}
              alt="Friendly robot avatar"
              className="w-full h-full object-cover"
              onError={() => setAvatarLoadFailed(true)}
            />
          )
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed z-50 left-2 right-2 sm:left-auto sm:right-6 bottom-[calc(env(safe-area-inset-bottom)+5rem)] sm:bottom-24 w-auto sm:w-[380px] h-[min(70vh,500px)] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-border bg-white dark:bg-slate-900 shrink-0 flex items-center justify-center">
                {avatarLoadFailed ? (
                  <Bot className="w-5 h-5 text-primary" />
                ) : (
                  <img
                    src={AI_AVATAR_SRC}
                    alt="KrishiAI robot avatar"
                    className="w-full h-full object-cover"
                    onError={() => setAvatarLoadFailed(true)}
                  />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-heading font-bold text-foreground">KrishiAI Assistant</h2>
                <p className="text-xs text-muted-foreground">Powered by AI • Ask anything about farming</p>
                {isListening && (
                  <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-600">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                    </span>
                    <span>Listening</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 p-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    msg.role === "user" ? "gradient-warm" : "gradient-hero"
                  }`}>
                    {msg.role === "user" ? <User className="w-4 h-4 text-secondary-foreground" /> : <Bot className="w-4 h-4 text-primary-foreground" />}
                  </div>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "glass-card text-foreground rounded-bl-md"
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </motion.div>
              ))}

              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="glass-card rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {messages.length <= 1 && (
              <div className="flex gap-2 px-4 pb-2 overflow-x-auto">
                {quickReplies.map((q) => (
                  <button
                    key={q.label}
                    onClick={() => sendMessage(q.label)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl glass-card text-xs text-foreground hover:bg-muted/50 transition-colors shrink-0"
                  >
                    <q.icon className="w-3 h-3 text-primary" />
                    {q.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="space-y-2">
                <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Ask about crops, weather, prices..."
                  className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 ring-primary/30"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                  disabled={isLoading || isListening}
                />
                <Button
                  onClick={handleVoiceToggle}
                  disabled={isLoading || !speechSupported}
                  variant="outline"
                  className={`relative rounded-xl px-3 border ${
                    isListening
                      ? "border-red-500 bg-red-50 text-red-600 hover:bg-red-100 shadow-[0_0_0_3px_rgba(239,68,68,0.12)]"
                      : "border-border"
                  }`}
                  aria-label={isListening ? "Stop voice input" : "Start voice input"}
                  title={
                    speechSupported
                      ? isListening
                        ? "Stop voice input"
                        : "Start voice input"
                      : "Voice input is not supported in this browser"
                  }
                >
                  {isListening && (
                    <span className="pointer-events-none absolute -inset-1 rounded-xl border border-red-500/60 animate-ping" aria-hidden="true" />
                  )}
                  {isListening ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                <Button
                  onClick={() => sendMessage(input)}
                  disabled={isLoading || isListening || !input.trim()}
                  className="gradient-hero text-primary-foreground border-0 hover:opacity-90 rounded-xl px-4"
                >
                  <Send className="w-4 h-4" />
                </Button>
                </div>

                {(isListening || speechError || !speechSupported) && (
                  isListening ? (
                    <div className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-50 px-2.5 py-1.5 text-xs text-red-600">
                      <div className="flex items-end gap-0.5" aria-hidden="true">
                        <span className="h-2 w-0.5 rounded bg-red-500 animate-pulse" style={{ animationDelay: "0ms" }} />
                        <span className="h-3 w-0.5 rounded bg-red-500 animate-pulse" style={{ animationDelay: "120ms" }} />
                        <span className="h-2 w-0.5 rounded bg-red-500 animate-pulse" style={{ animationDelay: "240ms" }} />
                      </div>
                      <span>Listening... speak your question and tap again to stop.</span>
                    </div>
                  ) : (
                    <p className={`text-xs ${speechError ? "text-red-600" : "text-muted-foreground"}`}>
                      {speechError || "Voice input is not supported in this browser"}
                    </p>
                  )
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
