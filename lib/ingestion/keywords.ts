export const GOVERNANCE_KEYWORDS: Record<string, string[]> = {
  critical: [
    "banned",
    "prohibited",
    "emergency",
    "breach",
    "violation",
    "enforcement action",
    "blacklisted",
    "shutdown",
    "moratorium",
    "autonomous weapons",
    "mass surveillance",
    "defense production act",
  ],
  high: [
    "regulation",
    "mandatory",
    "compliance deadline",
    "penalty",
    "fine",
    "guardrail",
    "safety policy",
    "red line",
    "executive order",
    "congressional",
    "eu ai act",
    "high-risk ai",
    "responsible scaling",
  ],
  medium: [
    "framework",
    "guideline",
    "standard",
    "nist",
    "iso 42001",
    "risk management",
    "governance",
    "transparency",
    "accountability",
    "bias audit",
    "model card",
    "safety evaluation",
  ],
  low: [
    "research",
    "paper",
    "study",
    "report",
    "survey",
    "analysis",
    "recommendation",
    "best practice",
    "benchmark",
  ],
};

export const VENDOR_KEYWORDS: Record<string, string[]> = {
  OpenAI: ["openai", "gpt-5", "gpt5", "chatgpt", "sam altman", "o3", "o4"],
  Anthropic: ["anthropic", "claude", "dario amodei", "constitutional ai"],
  "Google DeepMind": [
    "google deepmind",
    "gemini",
    "deepmind",
    "demis hassabis",
  ],
  "Meta AI": [
    "meta ai",
    "llama",
    "llama 4",
    "meta llama",
    "mark zuckerberg ai",
  ],
  Microsoft: ["microsoft ai", "copilot", "azure ai", "azure openai"],
  xAI: ["xai", "grok", "elon musk ai"],
  Mistral: ["mistral", "mistral ai", "codestral"],
  DeepSeek: ["deepseek", "deepseek v3", "deepseek r1"],
};

export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  regulatory: [
    "regulation",
    "law",
    "act",
    "legislation",
    "mandate",
    "directive",
    "statute",
    "compliance",
    "enforcement",
    "eu ai act",
    "colorado ai",
    "sb 53",
  ],
  vendor_guardrails: [
    "guardrail",
    "safety policy",
    "usage policy",
    "model spec",
    "content filter",
    "red teaming",
    "responsible scaling",
    "safety framework",
  ],
  frameworks: [
    "framework",
    "nist rmf",
    "iso 42001",
    "oecd",
    "hiroshima",
    "governance framework",
    "risk management framework",
  ],
  safety_research: [
    "safety research",
    "alignment",
    "jailbreak",
    "adversarial",
    "benchmark",
    "evaluation",
    "harm bench",
    "safety index",
  ],
  enforcement: [
    "enforcement",
    "penalty",
    "fine",
    "investigation",
    "attorney general",
    "ftc",
    "doj",
    "sec",
  ],
  standards: [
    "standard",
    "iso",
    "ieee",
    "nist",
    "certification",
    "interoperability",
    "mcp protocol",
  ],
};

export function detectSeverity(text: string): string {
  const lower = text.toLowerCase();
  for (const [severity, keywords] of Object.entries(GOVERNANCE_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return severity;
    }
  }
  return "info";
}

export function detectVendor(text: string): string | null {
  const lower = text.toLowerCase();
  for (const [vendor, keywords] of Object.entries(VENDOR_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return vendor;
    }
  }
  return null;
}

export function detectCategory(text: string, defaultCat: string): string {
  const lower = text.toLowerCase();
  let bestMatch = defaultCat;
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = category;
    }
  }

  return bestMatch;
}

export function extractTags(text: string): string[] {
  const tags: Set<string> = new Set();
  const lower = text.toLowerCase();

  if (lower.includes("nist")) tags.add("NIST");
  if (lower.includes("eu ai act")) tags.add("EU AI Act");
  if (lower.includes("iso 42001")) tags.add("ISO 42001");
  if (lower.includes("oecd")) tags.add("OECD");
  if (lower.includes("autonomous weapon")) tags.add("Autonomous Weapons");
  if (lower.includes("surveillance")) tags.add("Surveillance");
  if (lower.includes("bias")) tags.add("Bias");
  if (lower.includes("transparency")) tags.add("Transparency");
  if (lower.includes("agentic") || lower.includes("agent"))
    tags.add("Agentic AI");
  if (lower.includes("open source") || lower.includes("open weight"))
    tags.add("Open Source");
  if (
    lower.includes("military") ||
    lower.includes("defense") ||
    lower.includes("pentagon")
  )
    tags.add("Military/Defense");

  return Array.from(tags);
}
