const Groq = require("groq-sdk");
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});
const MODEL = "openai/gpt-oss-20b";
const parseAIResponse = (content) => {
    try {
        return JSON.parse(content);
    } catch (error) {
        const cleanedContent = content
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();

        return JSON.parse(cleanedContent);
    }
};
const analyzeNewsWithAI = async (headline, article) => {
    try {
        const completion = await groq.chat.completions.create({
            model: MODEL,
            temperature: 0.2,
            response_format: {
                type: "json_object"
            },
            messages: [
                {
                    role: "system",
                    content: `You are TruthLens AI 🔎, an expert news-analysis and fact-checking assistant.

Your responsibility is to evaluate news articles carefully, identify possible misinformation, and explain your reasoning clearly.

IMPORTANT RULES:
1. Do not automatically classify an article as fake merely because it is unfamiliar.
2. Distinguish factual claims from opinions, predictions, satire, and personal interpretations.
3. Consider whether the article contains suspicious claims, unsupported statistics, misleading headlines, fabricated quotations, or contradictory information.
4. Do not invent evidence, sources, events, or government announcements.
5. An article cannot be conclusively verified using its text alone. Explain when external verification is required.
6. Treat requests for Aadhaar numbers, bank details, passwords, or payments in suspicious registration schemes as potential warning signs, not automatic proof of fraud.
7. Base your assessment on the information provided and clearly communicate uncertainty.

Choose exactly one overall verdict:
- "Likely Genuine": The article appears reasonably credible based on the available information.
- "Suspicious": The article contains questionable or insufficiently supported claims that need further investigation.
- "Likely Fake": The available information provides substantial reasons to suspect fabricated or misleading claims.

Return ONLY valid JSON using this structure:
{
  "verdict": "Suspicious",
  "confidence": 60,
  "explanation": "Explain the assessment, identify relevant warning signs, and mention what still needs verification."
}

The confidence field must be a number from 0 to 100. It represents confidence in the assessment, not a guarantee that the verdict is correct.`
                },
                {
                    role: "user",
                    content: `Analyze the following news article.

📰 HEADLINE:
${headline}

📄 ARTICLE:
${article}

Evaluate the article carefully. Do not invent external verification or evidence. Return the required JSON object only.`
                }
            ]
        });

        const content = completion.choices[0].message.content;
        const result = parseAIResponse(content);

        const allowedVerdicts = [
            "Likely Genuine",
            "Suspicious",
            "Likely Fake"
        ];

        const verdict = allowedVerdicts.includes(result.verdict)
            ? result.verdict
            : "Suspicious";

        const confidence = Number(result.confidence);

        return {
            verdict,
            confidence: Number.isFinite(confidence)
                ? Math.max(0, Math.min(100, confidence))
                : 0,
            explanation:
                typeof result.explanation === "string"
                    ? result.explanation
                    : "The article requires further verification."
        };
    } catch (error) {
        console.error("News analysis AI error:", error.message);
        throw new Error("Failed to analyze the news article.");
    }
};
const extractClaimsWithAI = async (headline, article) => {
    try {
        const completion = await groq.chat.completions.create({
            model: MODEL,
            temperature: 0.1,
            response_format: {
                type: "json_object"
            },
            messages: [
                {
                    role: "system",
                    content: `You are TruthLens AI 🔎, an expert factual-claim extraction assistant.

Your task is to extract important factual claims from a news headline and article.

WHAT COUNTS AS A FACTUAL CLAIM?
A factual claim is a statement that can potentially be checked against reliable sources, official records, documents, data, or other evidence.

Examples:
- "The government announced a new education policy in 2026."
- "The city recorded 500 cases last week."
- "The university released its admission results on Monday."
- "The new scheme provides financial assistance to eligible students."

WHAT NOT TO EXTRACT:
- Personal opinions or subjective judgments.
- Questions, rhetorical statements, or calls to action.
- Predictions presented only as speculation.
- Vague statements that cannot reasonably be checked.
- Duplicate claims that express the same fact.
- Instructions to readers that are not themselves factual claims.

EXTRACTION RULES:
1. Read both the headline and the article.
2. Extract the most important factual claims.
3. Preserve the original meaning and relevant dates, numbers, names, and locations.
4. Do not add information that is absent from the article.
5. Do not decide whether a claim is true or false during extraction.
6. Avoid duplicate claims.
7. Return an empty array if no meaningful factual claims can be identified.

Return ONLY valid JSON in exactly this structure:
{
  "claims": [
    {
      "claim": "The exact factual claim extracted from the article."
    },
    {
      "claim": "Another distinct factual claim from the article."
    }
  ]
}

If there are no meaningful factual claims, return:
{
  "claims": []
}`
                },
                {
                    role: "user",
                    content: `Extract the important factual claims from this news article.

HEADLINE:
${headline}

ARTICLE:
${article}

Return only the required JSON object.`
                }
            ]
        });

        const content = completion.choices[0].message.content;
        const result = parseAIResponse(content);

        if (!Array.isArray(result.claims)) {
            throw new Error("AI returned an invalid claims format.");
        }

        return {
            claims: result.claims
                .filter(
                    (item) =>
                        item &&
                        typeof item.claim === "string" &&
                        item.claim.trim().length > 0
                )
                .map((item) => ({
                    claim: item.claim.trim()
                }))
        };
    } catch (error) {
        console.error("Claim extraction AI error:", error.message);
        throw new Error("Failed to extract factual claims.");
    }
};
const verifyClaimsWithAI = async (claim, sourceText) => {
    try {
        const normalizedSources = Array.isArray(sourceText)
            ? JSON.stringify(sourceText, null, 2)
            : String(sourceText || "No web search results were provided.");

        const completion = await groq.chat.completions.create({
            model: MODEL,
            temperature: 0.1,
            response_format: {
                type: "json_object"
            },
            messages: [
                {
                    role: "system",
                    content: `You are TruthLens AI 🔎, an evidence-based fact-checking assistant.

Your task is to evaluate ONE factual claim using the web search results supplied by the application.

IMPORTANT RULES:
1. Evaluate the claim using the supplied search results only.
2. Do not assume that a search result is accurate simply because it exists.
3. Consider the reliability, relevance, date, and consistency of the supplied evidence.
4. Do not invent facts, sources, quotations, URLs, or evidence.
5. A missing search result does not prove that a claim is false.
6. If the results are irrelevant, insufficient, ambiguous, or contradictory without a clear resolution, use "Unverified".
7. Distinguish evidence that directly addresses the claim from evidence that merely discusses a similar topic.
8. Do not claim to have opened or independently checked a source unless its contents are included in the supplied results.

Choose exactly one verdict:
- "Supported": The supplied evidence provides reasonable support for the claim.
- "Conflicting": The supplied evidence contains credible information that contradicts the claim.
- "Unverified": The available evidence is insufficient to establish whether the claim is true or false.

Return ONLY valid JSON in this structure:
{
  "verdict": "Unverified",
  "explanation": "Explain what the supplied evidence does or does not establish."
}`
                },
                {
                    role: "user",
                    content: `🔎 FACTUAL CLAIM:
${claim}

🌐 WEB SEARCH RESULTS:
${normalizedSources}

Evaluate the evidence and return only the required JSON object.`
                }
            ]
        });

        const content = completion.choices[0].message.content;
        const result = parseAIResponse(content);

        const allowedVerdicts = [
            "Supported",
            "Conflicting",
            "Unverified"
        ];

        return {
            verdict: allowedVerdicts.includes(result.verdict)
                ? result.verdict
                : "Unverified",
            explanation:
                typeof result.explanation === "string"
                    ? result.explanation
                    : "The available evidence is insufficient to evaluate this claim."
        };
    } catch (error) {
        console.error("Claim verification AI error:", error.message);
        throw new Error("Failed to verify the factual claim.");
    }
};
const calculateOverallCredibility = (claims) => {
    if (!Array.isArray(claims) || claims.length === 0) {
        return {
            score: 0,
            verdict: "Unverified"
        };
    }

    let score = 0;

    for (const claim of claims) {
        if (claim.verdict === "Supported") {
            score += 1;
        } else if (claim.verdict === "Conflicting") {
            score -= 1;
        }
    }

    const percentage =
        ((score + claims.length) / (2 * claims.length)) * 100;

    let verdict;

    if (percentage >= 70) {
        verdict = "Likely Genuine";
    } else if (percentage >= 40) {
        verdict = "Suspicious";
    } else {
        verdict = "Likely Fake";
    }

    return {
        score: Math.round(percentage),
        verdict
    };
};
module.exports = {
    analyzeNewsWithAI,
    extractClaimsWithAI,
    verifyClaimsWithAI,
    calculateOverallCredibility
};