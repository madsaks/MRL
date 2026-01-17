import { err, fetchWithTimeout, ok, type Result } from "./http.js";

type FiderConfig = {
  baseUrl: string;
};

type FiderIssue = {
  title?: string;
  description?: string;
};

export function createFiderClient(config: FiderConfig) {
  return {
    async createIssue(payload: FiderIssue): Promise<Result<{ url: string }>> {
      if (!payload.title) {
        return err("Title is required");
      }
      try {
        const response = await fetchWithTimeout(
          `${config.baseUrl}/api/v1/posts`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // TODO: Add proper auth token or API key for Fider.
            },
            body: JSON.stringify({
              title: payload.title,
              description: payload.description ?? "",
            }),
          }
        );
        if (!response.ok) {
          return err(`Fider error: ${response.status}`);
        }
        const data = (await response.json()) as { slug?: string };
        return ok({ url: `${config.baseUrl}/posts/${data.slug ?? ""}` });
      } catch (error) {
        return err(`Fider request failed: ${String(error)}`);
      }
    },
  };
}
