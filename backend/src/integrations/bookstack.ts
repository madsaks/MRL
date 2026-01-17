import { err, fetchWithTimeout, ok, type Result } from "./http.js";

type BookstackConfig = {
  baseUrl: string;
};

type BookstackMatch = {
  id: number;
  name: string;
  url: string;
};

export function createBookstackClient(config: BookstackConfig) {
  return {
    async search(query: string): Promise<
      Result<{ matches: BookstackMatch[]; confidence: number }>
    > {
      try {
        const response = await fetchWithTimeout(
          `${config.baseUrl}/api/search?query=${encodeURIComponent(query)}`,
          {
            headers: {
              "Content-Type": "application/json",
              // TODO: Add BookStack API token headers.
            },
          }
        );
        if (!response.ok) {
          return err(`BookStack error: ${response.status}`);
        }
        const data = (await response.json()) as {
          data?: Array<{ id: number; name: string; url: string }>;
        };
        const matches = (data?.data ?? []).map((item) => ({
          id: item.id,
          name: item.name,
          url: item.url,
        }));
        const confidence = Math.min(1, matches.length / 5);
        return ok({ matches, confidence });
      } catch (error) {
        return err(`BookStack request failed: ${String(error)}`);
      }
    },
  };
}
