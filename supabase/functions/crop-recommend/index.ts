export {};

declare const Deno: {
  env: {
    get: (key: string) => string | undefined;
  };
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

type FarmData = {
  location?: string;
  soilType?: string;
  farmSize?: number;
  sizeUnit?: string;
  budget?: number;
  waterAvailability?: string;
  irrigationType?: string;
  season?: string;
  purpose?: string;
};

type CropRecommendation = {
  crop_name: string;
  suitability_reason: string;
  estimated_cost: number;
  expected_roi: number;
  growth_duration: string;
  water_requirement: "low" | "medium" | "high";
  difficulty_level: "easy" | "medium" | "hard";
};

const CACHE_TTL_HOURS = Number(Deno.env.get("CROP_RECOMMEND_CACHE_TTL_HOURS") || "24");

const cleanText = (value: unknown, fallback = "") => {
  if (typeof value !== "string") return fallback;
  return value.trim();
};

const cleanNumber = (value: unknown, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^0-9.-]/g, ""));
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const normalizeWaterRequirement = (value: unknown): "low" | "medium" | "high" => {
  const v = cleanText(value, "medium").toLowerCase();
  if (v.includes("low")) return "low";
  if (v.includes("high")) return "high";
  return "medium";
};

const normalizeDifficulty = (value: unknown): "easy" | "medium" | "hard" => {
  const v = cleanText(value, "medium").toLowerCase();
  if (v.includes("easy")) return "easy";
  if (v.includes("hard")) return "hard";
  return "medium";
};

const normalizeCrop = (item: Record<string, unknown>): CropRecommendation => {
  const durationRaw = cleanText(item.growth_duration, "120 days");
  const duration = durationRaw.toLowerCase().includes("day")
    ? durationRaw
    : `${Math.max(60, Math.round(cleanNumber(durationRaw, 120)))} days`;

  return {
    crop_name: cleanText(item.crop_name, "Recommended Crop"),
    suitability_reason: cleanText(item.suitability_reason, "Suitable for the provided farm conditions."),
    estimated_cost: Math.max(1000, Math.round(cleanNumber(item.estimated_cost, 15000))),
    expected_roi: Math.max(10, Math.round(cleanNumber(item.expected_roi, 60))),
    growth_duration: duration,
    water_requirement: normalizeWaterRequirement(item.water_requirement),
    difficulty_level: normalizeDifficulty(item.difficulty_level),
  };
};

const buildCacheKey = (farmData: FarmData) => {
  const location = cleanText(farmData.location, "auto").toLowerCase().replace(/\s+/g, " ");
  const soilType = cleanText(farmData.soilType, "unknown").toLowerCase();
  const budget = Math.max(0, Math.round(cleanNumber(farmData.budget, 0)));
  return `${location}|${soilType}|${budget}`;
};

const getCacheConfig = () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return null;
  return { supabaseUrl, serviceRoleKey };
};

const getCachedRecommendations = async (cacheKey: string): Promise<CropRecommendation[] | null> => {
  const cfg = getCacheConfig();
  if (!cfg) return null;

  const params = new URLSearchParams();
  params.set("select", "response_data,expires_at");
  params.set("cache_key", `eq.${cacheKey}`);
  params.set("expires_at", `gt.${new Date().toISOString()}`);
  params.set("order", "created_at.desc");
  params.set("limit", "1");

  const response = await fetch(`${cfg.supabaseUrl}/rest/v1/crop_recommendation_cache?${params.toString()}`, {
    method: "GET",
    headers: {
      apikey: cfg.serviceRoleKey,
      Authorization: `Bearer ${cfg.serviceRoleKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    console.warn("Cache read skipped:", response.status);
    return null;
  }

  const rows = await response.json();
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const crops = rows[0]?.response_data?.crops;
  if (!Array.isArray(crops) || crops.length === 0) return null;
  return crops as CropRecommendation[];
};

const saveCachedRecommendations = async (
  cacheKey: string,
  farmData: FarmData,
  crops: CropRecommendation[]
) => {
  const cfg = getCacheConfig();
  if (!cfg) return;

  const expiresAt = new Date(Date.now() + CACHE_TTL_HOURS * 60 * 60 * 1000).toISOString();

  const payload = [{
    cache_key: cacheKey,
    location: cleanText(farmData.location, "auto"),
    soil_type: cleanText(farmData.soilType, "unknown"),
    budget: Math.max(0, Math.round(cleanNumber(farmData.budget, 0))),
    response_data: { crops },
    expires_at: expiresAt,
  }];

  await fetch(`${cfg.supabaseUrl}/rest/v1/crop_recommendation_cache?on_conflict=cache_key`, {
    method: "POST",
    headers: {
      apikey: cfg.serviceRoleKey,
      Authorization: `Bearer ${cfg.serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(payload),
  }).catch((error) => {
    console.warn("Cache write skipped:", error);
  });
};

const buildPrompt = (farmData: FarmData) => `You are an expert agricultural advisor AI.

Your task is to recommend the best crops for a farmer based on the given data.

Input Data:
- Location: ${cleanText(farmData.location, "Not provided")}
- Soil Type: ${cleanText(farmData.soilType, "Not provided")}
- Farm Size (in acres): ${cleanNumber(farmData.farmSize, 0)}
- Budget (in INR): ${Math.max(0, Math.round(cleanNumber(farmData.budget, 0)))}
- Water Availability: ${cleanText(farmData.waterAvailability, "Not provided")}
- Season: ${cleanText(farmData.season, "Not provided")}
- Farming Purpose: ${cleanText(farmData.purpose, "commercial")}

Instructions:
1. Analyze all inputs carefully.
2. Recommend exactly 5 crops best suited for the conditions.
3. Consider soil compatibility, climate, water availability, and budget.
4. Ensure recommendations are practical for Indian farming conditions.

For each crop, provide:
- crop_name
- suitability_reason (why this crop is suitable)
- estimated_cost (in INR)
- expected_roi (in percentage)
- growth_duration (in days)
- water_requirement (low/medium/high)
- difficulty_level (easy/medium/hard)

Return ONLY a valid JSON array of exactly 5 objects. No markdown. No extra text.`;

const invokeGemini = async (farmData: FarmData): Promise<CropRecommendation[]> => {
  const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
  const geminiModel = Deno.env.get("GEMINI_MODEL") || "gemini-2.0-flash";
  if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY is not configured in Supabase secrets");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{
            text: "You are an expert agricultural advisor AI for Indian farming conditions. Always return valid JSON only.",
          }],
        },
        contents: [{ parts: [{ text: buildPrompt(farmData) }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini API error:", response.status, errorText);
    if (response.status === 429) {
      throw new Error("Rate limit exceeded. Please try again in a moment.");
    }
    throw new Error("AI service temporarily unavailable. Please try again.");
  }

  const data = await response.json();
  const textOutput = data?.candidates?.[0]?.content?.parts
    ?.map((part: { text?: string }) => part?.text || "")
    .join("\n")
    .trim();

  if (!textOutput) {
    throw new Error("Invalid response from AI");
  }

  const cleaned = textOutput.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned);

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("AI returned invalid crop list");
  }

  const normalized = parsed.slice(0, 5).map((item) => normalizeCrop(item as Record<string, unknown>));

  if (normalized.length < 5) {
    throw new Error("AI returned less than 5 crops. Please retry.");
  }

  return normalized;
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const { farmData } = await req.json();
    const normalizedFarmData: FarmData = {
      location: cleanText(farmData?.location, ""),
      soilType: cleanText(farmData?.soilType, ""),
      farmSize: cleanNumber(farmData?.farmSize, 0),
      sizeUnit: cleanText(farmData?.sizeUnit, "acres"),
      budget: cleanNumber(farmData?.budget, 0),
      waterAvailability: cleanText(farmData?.waterAvailability, ""),
      irrigationType: cleanText(farmData?.irrigationType, ""),
      season: cleanText(farmData?.season, ""),
      purpose: cleanText(farmData?.purpose, "commercial"),
    };

    const cacheKey = buildCacheKey(normalizedFarmData);
    const cached = await getCachedRecommendations(cacheKey);
    if (cached && cached.length === 5) {
      return new Response(
        JSON.stringify({ crops: cached, cacheHit: true, provider: "cache" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const crops = await invokeGemini(normalizedFarmData);
    await saveCachedRecommendations(cacheKey, normalizedFarmData, crops);

    return new Response(
      JSON.stringify({ crops, cacheHit: false, provider: "gemini" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (e) {
    console.error("crop-recommend error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});