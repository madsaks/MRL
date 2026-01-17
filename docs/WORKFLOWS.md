# Portal Workflows

## Submission → Triage → Issue Publish
1. Floor staff submits an issue, idea, occurrence, or question.
2. Power user reviews the submission in NocoBase.
3. Power user promotes the submission to a published issue (and optionally creates a Fider post).
4. Published issues appear on the portal and can be tracked.

## Occurrence Tracking
1. Power user enables occurrence tracking for a published issue.
2. Occurrences are logged in NocoBase and linked to the parent issue.
3. Trends are reviewed in NocoBase dashboards.

## Decision Tickets + Supervisor Authority
1. Supervisor submits a decision ticket via backend.
2. Backend enforces authority rules:
   - If cost <= $5,000 and no procedure change → `approved_local`.
   - Otherwise → `escalated`.
3. Escalated decisions are surfaced for superintendent review.

## Post-Change Monitoring Window
1. After a change is deployed, track occurrences and leading indicators for a defined window.
2. Results are documented in NocoBase `changes` and referenced in OpenProject tasks.

## Procedure Consultation Flow
1. Draft procedures are created in NocoBase `procedure_drafts`.
2. Comments from affected crews are logged in `consultation_comments`.
3. Approved procedures are published to BookStack.

## Multi-Workgroup + Site-Wide Rollups
1. Each submission and issue is associated with a workgroup/crew.
2. Cross-workgroup issues are tagged as site-wide for leadership review.
3. Rollups are summarized in NocoBase dashboards and exported to OpenProject.
