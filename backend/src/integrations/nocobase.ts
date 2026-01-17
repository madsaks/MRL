import { err, fetchWithTimeout, ok, type Result } from "./http.js";

type NocoBaseClientConfig = {
  baseUrl: string;
  apiToken: string;
};

type SubmissionPayload = Record<string, unknown>;

type Issue = {
  id: string;
  title: string;
  status: string;
};

export function createNocobaseClient(config: NocoBaseClientConfig) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: config.apiToken ? `Bearer ${config.apiToken}` : "",
  };

  return {
    async createSubmission(payload: SubmissionPayload): Promise<Result<{ id: string }>> {
      if (!config.apiToken) {
        return err("NOCOBASE_API_TOKEN is not set");
      }
      try {
        const response = await fetchWithTimeout(
          `${config.baseUrl}/api/submissions:create`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({ values: payload }),
          }
        );
        if (!response.ok) {
          return err(`NocoBase error: ${response.status}`);
        }
        const data = (await response.json()) as { data?: { id?: string } };
        return ok({ id: data?.data?.id ?? "unknown" });
      } catch (error) {
        return err(`NocoBase request failed: ${String(error)}`);
      }
    },

    async listPublishedIssues(): Promise<Result<Issue[]>> {
      if (!config.apiToken) {
        return err("NOCOBASE_API_TOKEN is not set");
      }
      try {
        const response = await fetchWithTimeout(
          `${config.baseUrl}/api/issues:list?filter[status]=published`,
          { headers }
        );
        if (!response.ok) {
          return err(`NocoBase error: ${response.status}`);
        }
        const data = (await response.json()) as { data?: Issue[] };
        return ok(data?.data ?? []);
      } catch (error) {
        return err(`NocoBase request failed: ${String(error)}`);
      }
    },

    async promoteSubmission(
      submissionId: string,
      payload: { title?: string; description?: string }
    ): Promise<Result<{ id: string }>> {
      if (!config.apiToken) {
        return err("NOCOBASE_API_TOKEN is not set");
      }
      try {
        const response = await fetchWithTimeout(
          `${config.baseUrl}/api/issues:create`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              values: {
                submissionId,
                title: payload.title,
                description: payload.description,
                status: "published",
              },
            }),
          }
        );
        if (!response.ok) {
          return err(`NocoBase error: ${response.status}`);
        }
        const data = (await response.json()) as { data?: { id?: string } };
        return ok({ id: data?.data?.id ?? "unknown" });
      } catch (error) {
        return err(`NocoBase request failed: ${String(error)}`);
      }
    },

    async attachFiderLink(issueId: string, link: string): Promise<Result<void>> {
      if (!config.apiToken) {
        return err("NOCOBASE_API_TOKEN is not set");
      }
      try {
        const response = await fetchWithTimeout(
          `${config.baseUrl}/api/issues:update`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              values: { fiderLink: link },
              filterByTk: issueId,
            }),
          }
        );
        if (!response.ok) {
          return err(`NocoBase error: ${response.status}`);
        }
        return ok(undefined);
      } catch (error) {
        return err(`NocoBase request failed: ${String(error)}`);
      }
    },

    async createDecision(payload: Record<string, unknown>): Promise<Result<{ id: string }>> {
      if (!config.apiToken) {
        return err("NOCOBASE_API_TOKEN is not set");
      }
      try {
        const response = await fetchWithTimeout(
          `${config.baseUrl}/api/decisions:create`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({ values: payload }),
          }
        );
        if (!response.ok) {
          return err(`NocoBase error: ${response.status}`);
        }
        const data = (await response.json()) as { data?: { id?: string } };
        return ok({ id: data?.data?.id ?? "unknown" });
      } catch (error) {
        return err(`NocoBase request failed: ${String(error)}`);
      }
    },
  };
}
