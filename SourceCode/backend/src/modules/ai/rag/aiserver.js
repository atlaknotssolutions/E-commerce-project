// /**
//  * AI Service
//  * ------------------------------------------------------------------
//  * Owns the RAG pipeline: embeddings, in-memory vector index,
//  * retrieval, and the final Claude generation call. The controller
//  * layer only ever talks to getChatBotResponse() — it doesn't know
//  * or care that RAG is happening underneath.
//  *
//  * Requirements:
//  *   npm install @anthropic-ai/sdk node-cron
//  *
//  * Env vars:
//  *   ANTHROPIC_API_KEY=...
//  *   VOYAGE_API_KEY=...           (voyageai.com se free tier mil jaata hai)
//  *   PRODUCTS_API_URL=...         (default: http://localhost:5000/products)
//  */

// import Anthropic from "@anthropic-ai/sdk";
// import cron from "node-cron";

// const REQUIRED_ENV = ["ANTHROPIC_API_KEY", "VOYAGE_API_KEY"];

// export const createAiService = ({ logger = console } = {}) =>
// {
//     const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
//     if (missingEnv.length > 0)
//     {
//         throw new Error(
//             `Missing required env var(s): ${missingEnv.join(", ")}. Set them and restart.`
//         );
//     }

//     const PRODUCTS_API_URL =
//         process.env.PRODUCTS_API_URL || "http://localhost:5000/products";

//     const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

//     // ------------------------------------------------------------------
//     // VECTOR STORE (in-memory demo). Production me isko Pinecone,
//     // Qdrant, Weaviate, ya Postgres+pgvector se replace karein
//     // (same logic, bas storage/search backend badal jaata hai).
//     // ------------------------------------------------------------------
//     let vectorIndex = []; // [{ id, product, embedding: number[] }]
//     let indexReady = false;
//     let lastIndexError = null;

//     function cosineSimilarity(a, b)
//     {
//         if (!a || !b || a.length !== b.length) return 0;

//         let dot = 0, normA = 0, normB = 0;
//         for (let i = 0; i < a.length; i++)
//         {
//             dot += a[i] * b[i];
//             normA += a[i] * a[i];
//             normB += b[i] * b[i];
//         }

//         const denom = Math.sqrt(normA) * Math.sqrt(normB);
//         return denom === 0 ? 0 : dot / denom;
//     }

//     async function getEmbeddings(texts)
//     {
//         if (!Array.isArray(texts) || texts.length === 0)
//         {
//             throw new Error("getEmbeddings: 'texts' must be a non-empty array");
//         }

//         let res;
//         try
//         {
//             res = await fetch("https://api.voyageai.com/v1/embeddings", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                     Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
//                 },
//                 body: JSON.stringify({
//                     input: texts,
//                     model: "voyage-3.5-lite", // fast + cheap, achha hai product search ke liye
//                 }),
//             });
//         }
//         catch (err)
//         {
//             throw new Error(`Voyage embeddings request failed: ${err.message}`);
//         }

//         if (!res.ok)
//         {
//             const errBody = await res.text().catch(() => "");
//             throw new Error(
//                 `Voyage embeddings API returned ${res.status}: ${errBody.slice(0, 300)}`
//             );
//         }

//         const data = await res.json();

//         if (!data || !Array.isArray(data.data))
//         {
//             throw new Error("Voyage embeddings API returned an unexpected shape");
//         }

//         return data.data.map((d) => d.embedding);
//     }

//     // ------------------------------------------------------------------
//     // INDEXING: /products se data laao, embeddings banao, store karo.
//     // Ye periodically chalta hai (naye products add hone par),
//     // chat request ke waqt NAHI — isi se speed milti hai.
//     // ------------------------------------------------------------------
//     async function buildIndex()
//     {
//         logger.log("Indexing products...");

//         try
//         {
//             const res = await fetch(PRODUCTS_API_URL);
//             if (!res.ok)
//             {
//                 throw new Error(`Products API returned ${res.status}`);
//             }

//             const products = await res.json();
//             if (!Array.isArray(products))
//             {
//                 throw new Error("Products API did not return an array");
//             }

//             if (products.length === 0)
//             {
//                 logger.warn("No products returned; keeping previous index (if any).");
//                 lastIndexError = null;
//                 return;
//             }

//             // Batch me embeddings banao (efficient hai)
//             const texts = products.map(
//                 (p) => `${p.name}. ${p.category || ""}. ${p.description || ""}`
//             );
//             const embeddings = await getEmbeddings(texts);

//             if (embeddings.length !== products.length)
//             {
//                 throw new Error(
//                     `Embedding count (${embeddings.length}) doesn't match product count (${products.length})`
//                 );
//             }

//             vectorIndex = products.map((p, i) => ({
//                 id: p.id,
//                 product: p,
//                 embedding: embeddings[i],
//             }));

//             indexReady = true;
//             lastIndexError = null;
//             logger.log(`Indexed ${vectorIndex.length} products.`);
//         }
//         catch (err)
//         {
//             // Don't let a failed rebuild wipe out a previously good index,
//             // and don't let it crash the process (runs on cron + at boot).
//             lastIndexError = err.message;
//             logger.error("Index build failed:", err.message);
//         }
//     }

//     // Har 10 minute me index refresh karo (apni need ke hisaab se adjust karein)
//     cron.schedule("*/10 * * * *", buildIndex);
//     buildIndex(); // service create hote hi ek baar build karo

//     // ------------------------------------------------------------------
//     // RETRIEVAL: query embedding banao, top-K similar products nikalo
//     // ------------------------------------------------------------------
//     async function retrieveProducts(query, topK = 5, maxPrice = null)
//     {
//         if (vectorIndex.length === 0) return [];

//         const [queryEmbedding] = await getEmbeddings([query]);

//         const results = vectorIndex
//             .map((item) => ({
//                 product: item.product,
//                 score: cosineSimilarity(queryEmbedding, item.embedding),
//             }))
//             .filter((r) => !maxPrice || r.product.price <= maxPrice)
//             .sort((a, b) => b.score - a.score)
//             .slice(0, topK);

//         return results.map((r) => r.product);
//     }

//     function findProductById(productId)
//     {
//         const match = vectorIndex.find(
//             (item) => String(item.id) === String(productId)
//         );
//         return match ? [match.product] : [];
//     }

//     // ------------------------------------------------------------------
//     // GENERATION: RAG context + Claude call
//     // ------------------------------------------------------------------
//     async function generateReply(prompt, relevantProducts)
//     {
//         const claudePrompt = `User ka sawaal: "${prompt}"

// Neeche diye gaye relevant products ke data ke aadhar par, user ko
// helpful aur natural Hindi/English (jaisi bhi user ki language ho)
// me jawab do. Sirf isi data ka use karo, kuch bhi khud se mat banao.

// Products:
// ${JSON.stringify(relevantProducts, null, 2)}`;

//         const response = await anthropic.messages.create({
//             model: "claude-sonnet-5",
//             max_tokens: 800,
//             messages: [{ role: "user", content: claudePrompt }],
//         });

//         return response.content
//             .filter((c) => c.type === "text")
//             .map((c) => c.text)
//             .join("\n");
//     }

//     /**
//      * Single entry point the controller layer calls.
//      * Resolves with { response, mockMode, sources } on success.
//      * Throws only for genuine failures (e.g. Claude call itself failing),
//      * which the controller maps to a 502.
//      */
//     async function getChatBotResponse({ prompt, productId = null, userId = null })
//     {
//         if (!indexReady)
//         {
//             return {
//                 response:
//                     "Product catalog abhi load ho raha hai. Kripya thodi der me try karein.",
//                 mockMode: true,
//                 sources: [],
//             };
//         }

//         const relevantProducts = productId
//             ? findProductById(productId)
//             : await retrieveProducts(prompt, 5);

//         if (relevantProducts.length === 0)
//         {
//             return {
//                 response:
//                     "Mujhe is query se match karta hua koi product nahi mila. Kripya thoda alag tarike se poochein.",
//                 mockMode: true,
//                 sources: [],
//             };
//         }

//         const reply = await generateReply(prompt, relevantProducts);

//         return {
//             response: reply,
//             mockMode: false,
//             sources: relevantProducts,
//         };
//     }

//     function getStatus()
//     {
//         return {
//             indexReady,
//             productsIndexed: vectorIndex.length,
//             lastIndexError,
//         };
//     }

//     return Object.freeze({
//         getChatBotResponse,
//         getStatus,
//     });
// };


/**
 * AI Service
 * ------------------------------------------------------------------
 * Owns the RAG pipeline: embeddings, in-memory vector index,
 * retrieval, and the final response generation call. The controller
 * layer only ever talks to getChatBotResponse() — it doesn't know
 * or care that RAG is happening underneath.
 *
 * Generation uses Groq's free tier (OpenAI-compatible endpoint,
 * Llama 3.3 70B) instead of a paid model — no credit card needed,
 * get a key at console.groq.com. Swap GROQ_MODEL if you want a
 * different free model from Groq's catalog.
 *
 * Requirements:
 *   npm install node-cron
 *
 * Env vars:
 *   GROQ_API_KEY=...             (console.groq.com — free, no card required)
 *   GROQ_MODEL=...                (default: llama-3.3-70b-versatile)
 *   VOYAGE_API_KEY=...           (voyageai.com se free tier mil jaata hai)
 *   PRODUCTS_API_URL=...         (default: http://localhost:5000/products)
 */

import cron from "node-cron";

//yaha add karna tha 

export const createAiService = ({ logger = console } = {}) =>
{
    const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
    if (missingEnv.length > 0)
    {
        throw new Error(
            `Missing required env var(s): ${missingEnv.join(", ")}. Set them and restart.`
        );
    }

    const PRODUCTS_API_URL =
        process.env.PRODUCTS_API_URL || "http://localhost:5000/products";

    const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
    const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";

    // ------------------------------------------------------------------
    // VECTOR STORE (in-memory demo). Production me isko Pinecone,
    // Qdrant, Weaviate, ya Postgres+pgvector se replace karein
    // (same logic, bas storage/search backend badal jaata hai).
    // ------------------------------------------------------------------
    let vectorIndex = []; // [{ id, product, embedding: number[] }]
    let indexReady = false;
    let lastIndexError = null;

    function cosineSimilarity(a, b)
    {
        if (!a || !b || a.length !== b.length) return 0;

        let dot = 0, normA = 0, normB = 0;
        for (let i = 0; i < a.length; i++)
        {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        const denom = Math.sqrt(normA) * Math.sqrt(normB);
        return denom === 0 ? 0 : dot / denom;
    }

    async function getEmbeddings(texts)
    {
        if (!Array.isArray(texts) || texts.length === 0)
        {
            throw new Error("getEmbeddings: 'texts' must be a non-empty array");
        }

        let res;
        try
        {
            res = await fetch("https://api.voyageai.com/v1/embeddings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
                },
                body: JSON.stringify({
                    input: texts,
                    model: "voyage-3.5-lite", // fast + cheap, achha hai product search ke liye
                }),
            });
        }
        catch (err)
        {
            throw new Error(`Voyage embeddings request failed: ${err.message}`);
        }

        if (!res.ok)
        {
            const errBody = await res.text().catch(() => "");
            throw new Error(
                `Voyage embeddings API returned ${res.status}: ${errBody.slice(0, 300)}`
            );
        }

        const data = await res.json();

        if (!data || !Array.isArray(data.data))
        {
            throw new Error("Voyage embeddings API returned an unexpected shape");
        }

        return data.data.map((d) => d.embedding);
    }

    // ------------------------------------------------------------------
    // INDEXING: /products se data laao, embeddings banao, store karo.
    // Ye periodically chalta hai (naye products add hone par),
    // chat request ke waqt NAHI — isi se speed milti hai.
    // ------------------------------------------------------------------
    async function buildIndex()
    {
        logger.log("Indexing products...");

        try
        {
            const res = await fetch(PRODUCTS_API_URL);
            if (!res.ok)
            {
                throw new Error(`Products API returned ${res.status}`);
            }

            const products = await res.json();
            if (!Array.isArray(products))
            {
                throw new Error("Products API did not return an array");
            }

            if (products.length === 0)
            {
                logger.warn("No products returned; keeping previous index (if any).");
                lastIndexError = null;
                return;
            }

            // Batch me embeddings banao (efficient hai)
            const texts = products.map(
                (p) => `${p.name}. ${p.category || ""}. ${p.description || ""}`
            );
            const embeddings = await getEmbeddings(texts);

            if (embeddings.length !== products.length)
            {
                throw new Error(
                    `Embedding count (${embeddings.length}) doesn't match product count (${products.length})`
                );
            }

            vectorIndex = products.map((p, i) => ({
                id: p.id,
                product: p,
                embedding: embeddings[i],
            }));

            indexReady = true;
            lastIndexError = null;
            logger.log(`Indexed ${vectorIndex.length} products.`);
        }
        catch (err)
        {
            // Don't let a failed rebuild wipe out a previously good index,
            // and don't let it crash the process (runs on cron + at boot).
            lastIndexError = err.message;
            logger.error("Index build failed:", err.message);
        }
    }

    // Har 10 minute me index refresh karo (apni need ke hisaab se adjust karein)
    cron.schedule("*/10 * * * *", buildIndex);
    buildIndex(); // service create hote hi ek baar build karo

    // ------------------------------------------------------------------
    // RETRIEVAL: query embedding banao, top-K similar products nikalo
    // ------------------------------------------------------------------
    async function retrieveProducts(query, topK = 5, maxPrice = null)
    {
        if (vectorIndex.length === 0) return [];

        const [queryEmbedding] = await getEmbeddings([query]);

        const results = vectorIndex
            .map((item) => ({
                product: item.product,
                score: cosineSimilarity(queryEmbedding, item.embedding),
            }))
            .filter((r) => !maxPrice || r.product.price <= maxPrice)
            .sort((a, b) => b.score - a.score)
            .slice(0, topK);

        return results.map((r) => r.product);
    }

    function findProductById(productId)
    {
        const match = vectorIndex.find(
            (item) => String(item.id) === String(productId)
        );
        return match ? [match.product] : [];
    }

    // ------------------------------------------------------------------
    // GENERATION: RAG context + Groq (free tier) call
    // ------------------------------------------------------------------
    async function generateReply(prompt, relevantProducts)
    {
        const genPrompt = `User ka sawaal: "${prompt}"

Neeche diye gaye relevant products ke data ke aadhar par, user ko
helpful aur natural Hindi/English (jaisi bhi user ki language ho)
me jawab do. Sirf isi data ka use karo, kuch bhi khud se mat banao.

Products:
${JSON.stringify(relevantProducts, null, 2)}`;

        let res;
        try
        {
            res = await fetch(GROQ_CHAT_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                },
                body: JSON.stringify({
                    model: GROQ_MODEL,
                    max_tokens: 800,
                    messages: [{ role: "user", content: genPrompt }],
                }),
            });
        }
        catch (err)
        {
            throw new Error(`Groq chat request failed: ${err.message}`);
        }

        if (!res.ok)
        {
            const errBody = await res.text().catch(() => "");
            throw new Error(
                `Groq chat API returned ${res.status}: ${errBody.slice(0, 300)}`
            );
        }

        const data = await res.json();
        const reply = data?.choices?.[0]?.message?.content;

        if (!reply)
        {
            throw new Error("Groq chat API returned an unexpected shape");
        }

        return reply;
    }

    /**
     * Single entry point the controller layer calls.
     * Resolves with { response, mockMode, sources } on success.
     * Throws only for genuine failures (e.g. the Groq call itself failing),
     * which the controller maps to a 502.
     */
    async function getChatBotResponse({ prompt, productId = null, userId = null })
    {
        if (!indexReady)
        {
            return {
                response:
                    "Product catalog abhi load ho raha hai. Kripya thodi der me try karein.",
                mockMode: true,
                sources: [],
            };
        }

        const relevantProducts = productId
            ? findProductById(productId)
            : await retrieveProducts(prompt, 5);

        if (relevantProducts.length === 0)
        {
            return {
                response:
                    "Mujhe is query se match karta hua koi product nahi mila. Kripya thoda alag tarike se poochein.",
                mockMode: true,
                sources: [],
            };
        }

        const reply = await generateReply(prompt, relevantProducts);

        return {
            response: reply,
            mockMode: false,
            sources: relevantProducts,
        };
    }

    function getStatus()
    {
        return {
            indexReady,
            productsIndexed: vectorIndex.length,
            lastIndexError,
        };
    }

    return Object.freeze({
        getChatBotResponse,
        getStatus,
    });
};