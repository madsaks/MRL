import { useMemo, useState } from "react";

type Role =
  | "floor"
  | "power"
  | "supervisor"
  | "superintendent"
  | "admin";

type Issue = {
  id: string;
  title: string;
  status: string;
};

const apiBase = import.meta.env.VITE_API_BASE_URL ?? "/api";
const linkBases = {
  fider: import.meta.env.VITE_FIDER_BASE_URL ?? "/fider",
  bookstack: import.meta.env.VITE_BOOKSTACK_BASE_URL ?? "/bookstack",
  openproject: import.meta.env.VITE_OPENPROJECT_BASE_URL ?? "/openproject",
  nocobase: import.meta.env.VITE_NOCBASE_BASE_URL ?? "/nocobase",
  n8n: import.meta.env.VITE_N8N_BASE_URL ?? "/n8n",
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

export default function App() {
  const [role, setRole] = useState<Role>("floor");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState<string | null>(null);
  const [faqMatches, setFaqMatches] = useState<Array<{ id: number; name: string; url: string }>>([]);
  const [formStatus, setFormStatus] = useState<string | null>(null);

  const roleLabel = useMemo(() => {
    switch (role) {
      case "floor":
        return "Floor";
      case "power":
        return "Power User";
      case "supervisor":
        return "Supervisor";
      case "superintendent":
        return "Superintendent/Manager";
      case "admin":
        return "Admin";
    }
  }, [role]);

  async function loadIssues() {
    const data = await fetchJson<{ issues: Issue[] }>(`${apiBase}/issues`);
    setIssues(data.issues);
  }

  async function handleFaqCheck() {
    setFaqAnswer(null);
    setFaqMatches([]);
    if (!faqQuestion.trim()) return;
    const data = await fetchJson<{
      matches: Array<{ id: number; name: string; url: string }>;
      summary: string | null;
      confident: boolean;
    }>(`${apiBase}/faq/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: faqQuestion }),
    });
    setFaqMatches(data.matches);
    setFaqAnswer(data.summary ?? (data.confident ? "No summary returned." : null));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    setFormStatus("Submitting...");
    try {
      await fetchJson(`${apiBase}/intake`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setFormStatus("Submission accepted.");
      form.reset();
    } catch (error) {
      setFormStatus(`Submission failed: ${String(error)}`);
    }
  }

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <p className="app__eyebrow">Improvement Portal (Prototype)</p>
          <h1>Unified Improvement Portal</h1>
          <p>Connect submissions, knowledge, automation, and project execution.</p>
        </div>
        <div className="app__role">
          <label htmlFor="role">Role (dev-only)</label>
          <select id="role" value={role} onChange={(event) => setRole(event.target.value as Role)}>
            <option value="floor">Floor</option>
            <option value="power">Power User</option>
            <option value="supervisor">Supervisor</option>
            <option value="superintendent">Superintendent/Manager</option>
            <option value="admin">Admin</option>
          </select>
          <span className="app__role-label">{roleLabel}</span>
        </div>
      </header>

      <main className="app__grid">
        <section className="card">
          <h2>Quick Links</h2>
          <ul className="link-list">
            <li>
              <a href={linkBases.nocobase}>NocoBase (Data + Forms)</a>
            </li>
            <li>
              <a href={linkBases.fider}>Fider (Issues + Voting)</a>
            </li>
            <li>
              <a href={linkBases.bookstack}>BookStack (Knowledge)</a>
            </li>
            <li>
              <a href={linkBases.openproject}>OpenProject (Execution)</a>
            </li>
            <li>
              <a href={linkBases.n8n}>n8n (Automation)</a>
            </li>
          </ul>
        </section>

        <section className="card">
          <h2>FAQ Quick Check</h2>
          <p>Check BookStack before submitting a question.</p>
          <div className="stack">
            <input
              value={faqQuestion}
              onChange={(event) => setFaqQuestion(event.target.value)}
              placeholder="Ask a how-to or policy question"
            />
            <button type="button" onClick={handleFaqCheck}>
              Check FAQ
            </button>
          </div>
          {faqAnswer && (
            <div className="notice">
              <strong>Suggested answer:</strong>
              <p>{faqAnswer}</p>
            </div>
          )}
          {faqMatches.length > 0 && (
            <div>
              <h4>Related pages</h4>
              <ul>
                {faqMatches.map((match) => (
                  <li key={match.id}>
                    <a href={match.url}>{match.name}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="card">
          <h2>Submit an Improvement</h2>
          <form onSubmit={handleSubmit} className="stack">
            <label>
              Type
              <select name="type" defaultValue="issue">
                <option value="issue">Issue</option>
                <option value="idea">Idea</option>
                <option value="occurrence">Occurrence</option>
                <option value="question">Question</option>
              </select>
            </label>
            <label>
              Title
              <input name="title" required />
            </label>
            <label>
              Description
              <textarea name="description" rows={4} required />
            </label>
            <button type="submit">Submit</button>
            {formStatus && <p className="muted">{formStatus}</p>}
          </form>
        </section>

        <section className="card">
          <h2>Published Issues</h2>
          <p>
            Curated issues synced from NocoBase. <button onClick={loadIssues}>Refresh</button>
          </p>
          {issues.length === 0 ? (
            <p className="muted">No published issues yet.</p>
          ) : (
            <ul>
              {issues.map((issue) => (
                <li key={issue.id}>
                  <strong>{issue.title}</strong> — {issue.status}
                </li>
              ))}
            </ul>
          )}
        </section>

        {role === "power" && (
          <section className="card accent">
            <h2>Power User Triage</h2>
            <ul>
              <li>Review new submissions in NocoBase.</li>
              <li>Promote to published issues and create Fider votes.</li>
              <li>Enable occurrence tracking for systemic issues.</li>
            </ul>
          </section>
        )}

        {role === "supervisor" && (
          <section className="card accent">
            <h2>Supervisor Decision Queue</h2>
            <ul>
              <li>Approve local decisions &lt;= $5,000 with no procedure change.</li>
              <li>Escalate larger items to superintendent review.</li>
            </ul>
          </section>
        )}

        {role === "superintendent" && (
          <section className="card accent">
            <h2>Leadership Overview</h2>
            <ul>
              <li>Review escalated decisions and cross-workgroup issues.</li>
              <li>Monitor change impact windows and metrics.</li>
            </ul>
          </section>
        )}

        {role === "admin" && (
          <section className="card accent">
            <h2>Admin Configuration</h2>
            <ul>
              <li>Configure workgroups, crews, and categories in NocoBase.</li>
              <li>Maintain procedures and knowledge articles in BookStack.</li>
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
