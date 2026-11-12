// Regenerates demo.json: asks the same question to a spread of text models and
// stores their real answers, so the first visit shows a real example run.
// Usage: POLLINATIONS_API_KEY=sk_... node tools/fetch-demo.mjs "question"
import { writeFileSync } from "node:fs";

const QUESTION = process.argv[2] || "Is a hotdog a sandwich? One sentence.";
const MODELS = [
    "openai/gpt-5.4-nano",
    "deepseek/deepseek-v4.1-flash",
    "minimax/minimax-m3.1-flash",
    "inception/mercury-3",
    "meta/muse-spark-1.3",
    "moonshotai/kimi-k3.1-pro",
    "nex-agi/nex-n2.5-mini",
    "inclusionai/ling-3.1-flash",
    "xiaomi/mimo-v2.6-flash",
    "qwen/qwen3.8-flash",
    "tencent/hy3",
    "nvidia/nemotron-3.5-super-vl",
    "stepfun/step-5-preview",
    "z-ai/glm-5.3-flashx",
    "openai/gpt-4o-mini",
];
const MAX_KEPT = 6;
const key = process.env.POLLINATIONS_API_KEY;
if (!key) throw new Error("POLLINATIONS_API_KEY is required");

async function ask(model) {
    const started = Date.now();
    const response = await fetch("https://gen.pollinations.ai/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            model,
            messages: [
                { role: "system", content: "Answer in one short sentence. No preamble." },
                { role: "user", content: QUESTION },
            ],
            max_tokens: 200,
        }),
    });
    const ms = Date.now() - started;
    if (!response.ok) return { model, error: `HTTP ${response.status}`, ms };
    const data = await response.json();
    return {
        model,
        answer: data.choices?.[0]?.message?.content?.trim() ?? "",
        ms,
        usage: data.usage ?? null,
    };
}

const results = (await Promise.all(MODELS.map(ask)))
    .filter((item) => item.answer && !/doesn't have enough credits|needs paid Pollen/i.test(item.answer))
    .slice(0, MAX_KEPT);
if (!results.length) throw new Error("No model answered; check the key balance");
const payload = {
    question: QUESTION,
    ranAt: new Date().toISOString(),
    models: results,
};
writeFileSync(new URL("../demo.json", import.meta.url), JSON.stringify(payload, null, 2));
console.log(JSON.stringify(payload, null, 2).slice(0, 1200));