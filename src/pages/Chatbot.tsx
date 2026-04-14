import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, Sparkles, Leaf, CloudSun, TrendingUp, Bug, X, Upload, Camera, Plus, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaFile } from "@/components/MediaUpload";
import { MediaData } from "@/components/MediaGallery";
import { useTranslation } from "react-i18next";

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  onstart: () => void;
}

type Msg = { role: "user" | "assistant"; content: string; media?: MediaData[] };

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
const CHAT_URL = SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/farming-chat` : "";
const USE_EDGE_FUNCTION = import.meta.env.VITE_USE_EDGE_FUNCTION === "true";
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = import.meta.env.VITE_GROQ_MODEL || "llama-3.3-70b-versatile";
const GROQ_VISION_MODEL = import.meta.env.VITE_GROQ_VISION_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct";

const quickReplies = [
  { labelKey: "chatbot.quickReplies.rabi", fallback: "Best Rabi crops?", icon: Leaf },
  { labelKey: "chatbot.quickReplies.weather", fallback: "Weather forecast for wheat", icon: CloudSun },
  { labelKey: "chatbot.quickReplies.tomatoPrices", fallback: "Current tomato prices", icon: TrendingUp },
  { labelKey: "chatbot.quickReplies.pestControl", fallback: "Pest control for rice", icon: Bug },
];

export default function Chatbot() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: t(
        "chatbot.welcome",
        "Namaste! I'm your AI farming assistant. Ask me anything about crops, weather, soil, prices, or farming techniques. How can I help you today?"
      ),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaFile[]>([]);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [imageSendingStatus, setImageSendingStatus] = useState<string | null>(null);
  const [edgeFunctionHealthy, setEdgeFunctionHealthy] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [speechLang, setSpeechLang] = useState("en-IN");
  const [detectedLang, setDetectedLang] = useState<string>("en");
  const [isTranslating, setIsTranslating] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadMenuRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const inputValueRef = useRef("");
  const voiceDetectedRef = useRef(false);
  const voicePrefixRef = useRef("");
  const voiceFinalTranscriptRef = useRef("");
  const voiceLatestSpokenRef = useRef("");
  const sendMessageRef = useRef<(text: string) => Promise<void>>(async () => {});

  const languageMap: Record<string, string> = {
    "en-IN": "en",
    "hi-IN": "hi",
    "mr-IN": "mr",
    "ta-IN": "ta",
    "te-IN": "te",
    "bn-IN": "bn",
    "gu-IN": "gu",
    "kn-IN": "kn",
    "ml-IN": "ml",
    "pa-IN": "pa",
  };

  const reverseLanguageMap: Record<string, string> = {
    "en": "en-IN",
    "hi": "hi-IN",
    "mr": "mr-IN",
    "ta": "ta-IN",
    "te": "te-IN",
    "bn": "bn-IN",
    "gu": "gu-IN",
    "kn": "kn-IN",
    "ml": "ml-IN",
    "pa": "pa-IN",
  };

  const getLanguageCode = (lang: string): string => {
    return languageMap[lang] || lang.split("-")[0] || "en";
  };

  const getSpeechLang = (code: string): string => {
    return reverseLanguageMap[code] || `${code}-IN`;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputValueRef.current = input;
  }, [input]);

  // Close upload menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (uploadMenuRef.current && !uploadMenuRef.current.contains(event.target as Node)) {
        setShowUploadMenu(false);
      }
    }
    if (showUploadMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showUploadMenu]);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = speechLang;

    recognition.onstart = () => {
      setIsListening(true);
      setInterimTranscript("");
      voiceDetectedRef.current = false;
      voiceFinalTranscriptRef.current = "";
      voiceLatestSpokenRef.current = "";
      voicePrefixRef.current = inputValueRef.current.trim();
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.trim();
        if (!transcript) continue;

        voiceDetectedRef.current = true;
        if (event.results[i].isFinal) {
          voiceFinalTranscriptRef.current = `${voiceFinalTranscriptRef.current} ${transcript}`.trim();
        } else {
          interim = `${interim} ${transcript}`.trim();
        }
      }

      const composedInput = [voicePrefixRef.current, voiceFinalTranscriptRef.current, interim]
        .filter(Boolean)
        .join(" ")
        .trim();

      voiceLatestSpokenRef.current = [voiceFinalTranscriptRef.current, interim]
        .filter(Boolean)
        .join(" ")
        .trim();

      setInput(composedInput);
      setInterimTranscript(interim);
      setDetectedLang(recognition.lang.split("-")[0] || "en");
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      setInterimTranscript("");
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");

      const spokenText = voiceLatestSpokenRef.current || voiceFinalTranscriptRef.current;
      const finalVoiceText = [voicePrefixRef.current, spokenText]
        .filter(Boolean)
        .join(" ")
        .trim();

      const shouldSend = voiceDetectedRef.current && spokenText.length > 0 && finalVoiceText.length > 0;

      voiceDetectedRef.current = false;
      voiceFinalTranscriptRef.current = "";
      voiceLatestSpokenRef.current = "";
      voicePrefixRef.current = "";

      if (shouldSend) {
        void sendMessageRef.current(finalVoiceText);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [speechLang]);

  // Update recognition language when changed
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = speechLang;
    }
  }, [speechLang]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      console.error("Speech recognition not supported");
      return;
    }
    recognitionRef.current.start();
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const speak = useCallback((text: string, targetLang?: string) => {
    if (!voiceEnabled || !text) return;

    window.speechSynthesis.cancel();

    const lang = targetLang || speechLang;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [voiceEnabled, speechLang]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  // Auto-speak AI response when voice is enabled
  useEffect(() => {
    if (voiceEnabled && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "assistant" && lastMessage.content) {
        speak(lastMessage.content);
      }
    }
  }, [messages, voiceEnabled]);

  // Handle file selection from input
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const file = files[0];
    if (file && (file.type.startsWith("image/") || file.type.startsWith("video/"))) {
      const preview = URL.createObjectURL(file);
      const type = file.type.startsWith("image/") ? "image" : "video";
      const media: MediaFile = {
        id: Date.now() + Math.random().toString(),
        file,
        preview,
        type,
      };
      setSelectedMedia((prev) => [...prev, media]);
      setShowUploadMenu(false);
    }
  };

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || "");
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() && selectedMedia.length === 0) return;
    if (isLoading) return;

    const userLanguage = getLanguageCode(speechLang);
    const isNonEnglish = userLanguage !== "en";
    
    let processedText = text.trim();
    const originalText = processedText;

    // Translate to English if needed
    if (isNonEnglish) {
      setIsTranslating(true);
      setImageSendingStatus(t("chatbot.status.translating", "Translating..."));
      try {
        const translateResp = await fetch(GROQ_URL, {
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
                content: `You are a translator. Translate the following text from ${userLanguage} to English. Only respond with the translated text, nothing else.`,
              },
              { role: "user", content: processedText },
            ],
            temperature: 0.3,
            max_tokens: 500,
          }),
        });
        
        if (translateResp.ok) {
          const translateData = await translateResp.json();
          const translated = translateData.choices?.[0]?.message?.content;
          if (translated) {
            processedText = translated.trim();
          }
        }
      } catch (error) {
        console.warn("Translation failed, using original text:", error);
      }
      setIsTranslating(false);
    }

    const outgoingMedia = [...selectedMedia];
    const hasImage = outgoingMedia.some((m) => m.type === "image");
    
    // Convert media files to data URLs and prepare for API
    const mediaData: MediaData[] = selectedMedia.map((m) => ({
      id: m.id,
      url: m.preview,
      type: m.type,
      name: m.file.name,
    }));

    const userMsg: Msg = {
      role: "user",
      content: originalText,
      media: mediaData.length > 0 ? mediaData : undefined,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSelectedMedia([]);
    setIsLoading(true);
    setImageSendingStatus(mediaData.length > 0 ? t("chatbot.status.analyzingImage", "Analyzing image...") : null);

    try {
      const allMessages = [...messages, userMsg].filter((m) => m.content);
      let reply = "";

      // Build OpenAI-compatible multimodal messages. Only the latest outbound message
      // carries file objects, so encode those files directly before upload.
      const messagesForApi = await Promise.all(
        allMessages.map(async (m) => {
          let content: string | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> = m.content;

          if (m.role === "user" && m === userMsg && outgoingMedia.length > 0) {
            const parts: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> = [];

            if ((m.content || "").trim()) {
              parts.push({ type: "text", text: m.content });
            }

            for (const media of outgoingMedia) {
              if (media.type !== "image") continue;
              try {
                const dataUrl = await fileToDataUrl(media.file);
                if (dataUrl) {
                  parts.push({
                    type: "image_url",
                    image_url: { url: dataUrl },
                  });
                }
              } catch (error) {
                console.warn("Image encoding failed:", error);
              }
            }

            content = parts.length > 0 ? parts : m.content;
          }

          return {
            role: m.role,
            content,
          };
        })
      );

      // Primary path for production: Supabase Edge Function (text-only).
      // For image analysis we directly use vision fallback to avoid gateway incompatibility.
      const shouldTryEdge = !!(USE_EDGE_FUNCTION && CHAT_URL && SUPABASE_PUBLISHABLE_KEY && edgeFunctionHealthy && !hasImage);
      if (shouldTryEdge) {
        try {
          setImageSendingStatus(t("chatbot.status.sendingToAi", "Sending to AI..."));
          const edgeResp = await fetch(CHAT_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ messages: messagesForApi }),
          });

          if (edgeResp.ok && edgeResp.body && edgeResp.headers.get("content-type")?.includes("text/event-stream")) {
            setImageSendingStatus(t("chatbot.status.processing", "Processing..."));
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
            if (edgeResp.status >= 500) {
              setEdgeFunctionHealthy(false);
            }
            throw new Error(edgeErr.error || t("chatbot.errors.edgeFailed", "Supabase chat function failed"));
          }
        } catch (edgeError) {
          setEdgeFunctionHealthy(false);
          if (!GROQ_API_KEY) {
            throw edgeError;
          }
        }
      }

      // Fallback path: direct Groq
      if (!reply) {
        if (!GROQ_API_KEY) {
          throw new Error(
            t(
              "chatbot.errors.notConfigured",
              "AI is not configured. Set Supabase function credentials or add VITE_GROQ_API_KEY in Vercel Environment Variables."
            )
          );
        }

        setImageSendingStatus(
          hasImage
            ? t("chatbot.status.analyzingWithAiImage", "Analyzing image with AI...")
            : t("chatbot.status.analyzingWithAi", "Analyzing with AI...")
        );
        const response = await fetch(GROQ_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: hasImage ? GROQ_VISION_MODEL : GROQ_MODEL,
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

When analyzing images:
- Identify crops, plants, pests, diseases, or soil conditions
- Provide specific recommendations based on what you see
- Suggest immediate actions if there's an issue
- Be practical and actionable

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

        setImageSendingStatus(null);
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const apiMessage = errData.error?.message || t("chatbot.errors.failedResponse", "Failed to get response from AI");

          if (typeof apiMessage === "string" && apiMessage.toLowerCase().includes("decommissioned")) {
            throw new Error(
              t(
                "chatbot.errors.modelDeprecated",
                "The selected Groq model is deprecated. Update VITE_GROQ_MODEL to a currently supported model and restart the app."
              )
            );
          }

          throw new Error(apiMessage);
        }

        const data = await response.json();
        reply = data.choices?.[0]?.message?.content || "";
      }

      setImageSendingStatus(null);
      if (!reply) {
        reply = t("chatbot.errors.emptyReply", "I apologize, I couldn't process that. Please try again.");
      }

      // Translate response back to user's language if needed
      if (isNonEnglish) {
        setImageSendingStatus(t("chatbot.status.translatingResponse", "Translating response..."));
        try {
          const translateResp = await fetch(GROQ_URL, {
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
                  content: `You are a translator. Translate the following text from English to ${userLanguage}. Only respond with the translated text, nothing else. Keep it simple and farmer-friendly.`,
                },
                { role: "user", content: reply },
              ],
              temperature: 0.3,
              max_tokens: 1024,
            }),
          });
          
          if (translateResp.ok) {
            const translateData = await translateResp.json();
            const translated = translateData.choices?.[0]?.message?.content;
            if (translated) {
              reply = translated.trim();
            }
          }
        } catch (error) {
          console.warn("Response translation failed, using English:", error);
        }
      }
      
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);

      // Auto-speak the response if voice is enabled
      if (voiceEnabled && reply) {
        speak(reply, speechLang);
      }
    } catch (e: any) {
      console.error("Chat error:", e);
      setImageSendingStatus(null);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: t(
            "chatbot.errors.generic",
            "Sorry, something went wrong: {{message}}. Please try again.",
            { message: e.message }
          ),
        },
      ]);
    } finally {
      setIsLoading(false);
      setImageSendingStatus(null);
      inputRef.current?.focus();
    }
  };

  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-lg font-heading font-bold text-foreground">{t("chatbot.title", "KrishiAI Assistant")}</h1>
            <p className="text-xs text-muted-foreground">{t("chatbot.subtitle", "Powered by AI - Ask anything about farming")}</p>
          </div>
        </div>
        
        {/* Language Selector */}
        <select
          value={speechLang}
          onChange={(e) => setSpeechLang(e.target.value)}
          className="text-xs bg-muted border border-border rounded-lg px-2 py-1.5 text-foreground outline-none focus:ring-2 ring-primary/30"
          title={t("chatbot.voice.selectLang", "Select language for speech")}
        >
          <option value="en-IN">English</option>
          <option value="hi-IN">हिन्दी</option>
          <option value="mr-IN">मराठी</option>
          <option value="ta-IN">தமிழ்</option>
          <option value="te-IN">తెలుగు</option>
          <option value="bn-IN">বাংলা</option>
          <option value="gu-IN">ગુજરાતી</option>
          <option value="kn-IN">ಕನ್ನಡ</option>
          <option value="ml-IN">മലയാളം</option>
          <option value="pa-IN">ਪੰਜਾਬੀ</option>
        </select>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-2">
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
            <div className={`max-w-[75%] space-y-2 ${msg.role === "user" ? "flex flex-col items-end" : ""}`}>
              {/* Image Preview - Compact inline display */}
              {msg.media && msg.media.length > 0 && (
                <div className={`flex gap-2 flex-wrap ${msg.role === "user" ? "justify-end" : ""}`}>
                  {msg.media.map((media) => (
                    <div key={media.id} className="rounded-xl overflow-hidden border border-border/50 shadow-sm">
                      {media.type === "image" ? (
                        <img 
                          src={media.url} 
                          alt={media.name || "Image"} 
                          className="max-w-[200px] max-h-[200px] object-cover"
                        />
                      ) : (
                        <div className="w-32 h-32 bg-muted flex items-center justify-center">
                          <video
                            src={media.url}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {/* Message Text */}
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "glass-card text-foreground rounded-bl-md"
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {voiceEnabled && msg.role === "assistant" && isSpeaking && (
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/30">
                    <Volume2 className="w-3 h-3 text-primary animate-pulse" />
                    <span className="text-xs text-muted-foreground">{t("chatbot.voice.speaking", "Speaking...")}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Loading State with Subtle Indicator */}
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="glass-card rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-xs text-muted-foreground ml-1">
                  {imageSendingStatus || t("chatbot.status.thinking", "Thinking...")}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Live Voice Transcription Display - Shows what's being said in real-time */}
        {isListening && interimTranscript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex gap-3 items-end"
          >
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0 border border-red-500/30">
              <Mic className="w-4 h-4 text-red-500 animate-pulse" />
            </div>
            <div className="max-w-[75%] rounded-2xl px-4 py-3 bg-red-500/10 border border-red-500/30 backdrop-blur-sm">
              <p className="text-sm text-foreground">{interimTranscript}</p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">🎙️ {t("chatbot.voice.listening", "Listening...")}</p>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      {messages.length <= 1 && (
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
          {quickReplies.map((q) => (
            <button
              key={q.labelKey}
              onClick={() => sendMessage(t(q.labelKey, q.fallback))}
              className="flex items-center gap-2 px-3 py-2 rounded-xl glass-card text-xs text-foreground hover:bg-muted/50 transition-colors shrink-0"
            >
              <q.icon className="w-3 h-3 text-primary" />
              {t(q.labelKey, q.fallback)}
            </button>
          ))}
        </div>
      )}

      {/* Selected Media Preview */}
      {selectedMedia.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 flex-wrap mb-3"
        >
          {selectedMedia.map((m) => (
            <div key={m.id} className="relative rounded-xl overflow-hidden bg-muted border border-border group w-20 h-20 flex-shrink-0">
              {m.type === "image" ? (
                <img src={m.preview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-black flex items-center justify-center">
                  <span className="text-xs text-white font-medium">Video</span>
                </div>
              )}
              <button
                type="button"
                aria-label={t("chatbot.actions.removeMedia", "Remove selected media")}
                onClick={() => {
                  const updated = selectedMedia.filter((x) => x.id !== m.id);
                  setSelectedMedia(updated);
                  URL.revokeObjectURL(m.preview);
                }}
                className="absolute top-1 right-1 bg-black/55 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-sm opacity-80 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 hover:bg-black/70 transition-all"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </motion.div>
      )}

      {/* Input Area */}
      <div className="flex gap-2 items-end">
        {/* Upload Menu */}
        <div className="relative" ref={uploadMenuRef}>
          <Button
            onClick={() => setShowUploadMenu(!showUploadMenu)}
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl hover:bg-muted"
            disabled={isLoading}
          >
            <Plus className="w-5 h-5 text-primary" />
          </Button>

          {/* Upload/Camera Menu */}
          {showUploadMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute bottom-12 left-0 bg-background border border-border rounded-xl shadow-lg z-50 overflow-hidden"
            >
              <button
                onClick={() => {
                  fileInputRef.current?.click();
                  setShowUploadMenu(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <Upload className="w-4 h-4 text-primary" />
                <span>{t("chatbot.actions.uploadImage", "Upload Image")}</span>
              </button>
              <div className="border-t border-border" />
              <button
                onClick={() => {
                  cameraInputRef.current?.click();
                  setShowUploadMenu(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <Camera className="w-4 h-4 text-primary" />
                <span>{t("chatbot.actions.useCamera", "Use Camera")}</span>
              </button>
            </motion.div>
          )}
        </div>

        {/* File Inputs (Hidden) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        {/* Input Field */}
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            placeholder={t("chatbot.inputPlaceholder", "Ask me anything... or upload an image")}
            className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 ring-primary/30 transition-all"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            disabled={isLoading}
          />
        </div>

        {/* Voice Input Button */}
        <Button
          onClick={isListening ? stopListening : startListening}
          variant="ghost"
          size="icon"
          className={`h-10 w-10 rounded-xl transition-all ${
            isListening 
              ? "bg-red-100 dark:bg-red-900/30 text-red-600 animate-pulse" 
              : "hover:bg-muted text-primary"
          }`}
          disabled={isLoading}
          title={isListening ? t("chatbot.voice.listening", "Listening...") : t("chatbot.voice.speak", "Click to speak")}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </Button>

        {/* Voice Output Toggle */}
        <Button
          onClick={() => {
            if (voiceEnabled) {
              setVoiceEnabled(false);
              stopSpeaking();
            } else {
              setVoiceEnabled(true);
            }
          }}
          variant="ghost"
          size="icon"
          className={`h-10 w-10 rounded-xl transition-all ${
            voiceEnabled 
              ? "bg-primary/10 text-primary" 
              : "hover:bg-muted text-muted-foreground"
          }`}
          disabled={isLoading}
          title={voiceEnabled ? t("chatbot.voice.outputOn", "Voice output enabled") : t("chatbot.voice.outputOff", "Voice output disabled")}
        >
          {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </Button>

        {/* Send Button */}
        <Button
          onClick={() => sendMessage(input)}
          disabled={isLoading || (!input.trim() && selectedMedia.length === 0)}
          className="gradient-hero text-primary-foreground border-0 hover:opacity-90 rounded-xl px-4 h-10"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
