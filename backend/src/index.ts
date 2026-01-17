import express from "express";
import pino from "pino";
import { createNocobaseClient } from "./integrations/nocobase.js";
import { createFiderClient } from "./integrations/fider.js";
import { createBookstackClient } from "./integrations/bookstack.js";
import { createOllamaClient } from "./integrations/ollama.js";

const app = express();
const log = pino({ level: process.env.LOG_LEVEL ?? "info" });

app.use(express.json({ limit: "1mb" }));

const apiKey = process.env.API_KEY ?? "";

const requireApiKey: express.RequestHandler = (req, res, next) => {
  if (!apiKey) {
    return next();
  }
  const provided = req.header("x-api-key");
  if (provided && provided === apiKey) {
    return next();
  }
  return res.status(401).json({ error: "Unauthorized" });
};

const nocobase = createNocobaseClient({
  baseUrl: process.env.NOCOBASE_URL ?? "http://nocobase:13000",
  apiToken: process.env.NOCOBASE_API_TOKEN ?? "",
});
const fider = createFiderClient({
  baseUrl: process.env.FIDER_URL ?? "http://fider:3000",
});
const bookstack = createBookstackClient({
  baseUrl: process.env.BOOKSTACK_URL ?? "http://bookstack:80",
});
const ollama = createOllamaClient({
  baseUrl: process.env.OLLAMA_URL ?? "http://ollama:11434",
  model: process.env.OLLAMA_MODEL ?? "llama3.1",
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/intake", requireApiKey, async (req, res) => {
  const submission = req.body ?? {};
  const created = await nocobase.createSubmission(submission);
  if (!created.ok) {
    log.warn({ err: created.error }, "Failed to store submission in NocoBase");
  }
  res.status(202).json({ accepted: true, nocobase: created.ok });
});

app.get("/issues", async (_req, res) => {
  const issues = await nocobase.listPublishedIssues();
  if (!issues.ok) {
    log.warn({ err: issues.error }, "Failed to load issues from NocoBase");
    return res.json({ issues: [] });
  }
  return res.json({ issues: issues.value });
});

app.post("/promote/:submissionId", requireApiKey, async (req, res) => {
  const { submissionId } = req.params;
  const { title, description } = req.body ?? {};

  const createdIssue = await nocobase.promoteSubmission(submissionId, {
    title,
    description,
  });

  let fiderLink: string | null = null;
  if (createdIssue.ok && title) {
    const fiderIssue = await fider.createIssue({ title, description });
    if (fiderIssue.ok) {
      fiderLink = fiderIssue.value.url;
      await nocobase.attachFiderLink(createdIssue.value.id, fiderLink);
    }
  }

  res.json({ promoted: createdIssue.ok, fiderLink });
});

app.post("/decision", requireApiKey, async (req, res) => {
  const decision = req.body ?? {};
  const cost = Number(decision.cost ?? 0);
  const procedureChange = Boolean(decision.procedureChange);
  const escalated = cost > 5000 || procedureChange;

  const saved = await nocobase.createDecision({
    ...decision,
    status: escalated ? "escalated" : "approved_local",
  });

  if (!saved.ok) {
    log.warn({ err: saved.error }, "Failed to store decision in NocoBase");
  }

  res.json({
    ok: saved.ok,
    escalated,
  });
});

app.post("/faq/check", async (req, res) => {
  const { question } = req.body ?? {};
  if (!question || typeof question !== "string") {
    return res.status(400).json({ error: "question is required" });
  }

  const results = await bookstack.search(question);
  if (!results.ok) {
    log.warn({ err: results.error }, "BookStack search failed");
    return res.json({ matches: [], summary: null, confident: false });
  }

  const confident = results.value.confidence >= 0.7;
  let summary: string | null = null;
  if (confident && results.value.matches.length > 0) {
    const pageTitles = results.value.matches.map((match) => match.name).join(", ");
    const summaryResult = await ollama.summarize({
      prompt: `Summarize the likely answer based on these BookStack pages: ${pageTitles}. Question: ${question}`,
    });
    if (summaryResult.ok) {
      summary = summaryResult.value;
    }
  }

  res.json({
    matches: results.value.matches,
    summary,
    confident,
  });
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, "0.0.0.0", () => {
  log.info({ port }, "Improvement portal backend started");
});
