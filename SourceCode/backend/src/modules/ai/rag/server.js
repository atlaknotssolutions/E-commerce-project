

import express from "express";
import { createAiService } from "./services/aiService.js";
import { createAiRouter } from "./routes/ai.routes.js";

const PORT = process.env.PORT || 5000;

async function main()
{
    let aiService;
    try
    {
        aiService = createAiService({ logger: console });
    }
    catch (err)
    {
        // Fails fast if required env vars are missing, instead of starting
        // a server that will 500 on every request.
        console.error(err.message);
        process.exit(1);
    }

    const app = express();
    app.use(express.json());

    app.use("/", createAiRouter({ aiService }));

    app.listen(PORT, () =>
    {
        console.log(`Server running on port ${PORT}`);
        console.log(`AI endpoints: POST /api/ai/chat, POST /api/ai/chat/demo, GET /api/ai/health`);
    });
}

main();