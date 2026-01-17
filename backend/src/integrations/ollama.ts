import { err, fetchWithTimeout, ok, type Result } from "./http.js";

type OllamaConfig = {
  baseUrl: string;
  model: string;
};

export function createOllamaClient(config: OllamaConfig) {
  return {
    async summarize({ prompt }: { prompt: string }): Promise<Result<string>> {
      try {
        const response = await fetchWithTimeout(
          `${config.baseUrl}/api/generate`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: config.model,
              prompt,
              stream: false,
            }),
          },
          8000
        );
        if (!response.ok) {
          return err(`Ollama error: ${response.status}`);
        }
        const data = (await response.json()) as { response?: string };
        return ok(data.response ?? "");
      } catch (error) {
        return err(`Ollama request failed: ${String(error)}`);
      }
    },
  };
}
