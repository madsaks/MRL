import { fetchWithTimeout } from "../integrations/http.js";

const baseUrl = process.env.NOCOBASE_URL ?? "http://nocobase:13000";
const apiToken = process.env.NOCOBASE_API_TOKEN ?? "";

const collections = [
  "workgroups",
  "crews",
  "submissions",
  "issues",
  "occurrences",
  "decisions",
  "changes",
  "procedure_drafts",
  "consultation_comments",
  "known_pain_points",
];

async function createCollection(name: string) {
  if (!apiToken) {
    throw new Error("NOCOBASE_API_TOKEN is not set");
  }

  const response = await fetchWithTimeout(
    `${baseUrl}/api/collections:create`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        values: {
          name,
          title: name.replace(/_/g, " "),
        },
      }),
    },
    8000
  );

  if (!response.ok) {
    throw new Error(`Failed to create ${name}: ${response.status}`);
  }
}

async function run() {
  for (const name of collections) {
    try {
      await createCollection(name);
      console.log(`Created collection: ${name}`);
    } catch (error) {
      console.warn(`Skip collection ${name}: ${String(error)}`);
    }
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
