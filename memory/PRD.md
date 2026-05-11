# Cigna x Echoes of Silence — Cognitive Assessment

## Original problem statement
Build a pixel-perfect cognitive assessment app matching uploaded screenshots. Lime border + green→teal→sky gradient bg, navy #0d2240 game cards, lime-bordered Score/Time pills, gradient & white pill buttons. Co-brand with Cigna healthcare. Save sessions to DB.

## Architecture
- **Backend**: FastAPI + MongoDB (`users`, `sessions` collections)
  - `POST /api/users` — create user (name, dob, email, etc.)
  - `POST /api/sessions` — submit raw 0-50 scores, returns normalised /100, level, 4 dimensions
  - `GET /api/sessions/{id}` — retrieve a saved session
- **Frontend**: React 19 + react-router + qrcode.react
  - Routes: `/`, `/splash`, `/game`, `/calculating`, `/qr/:id`, `/results/:id`, `/share/:id`
  - 6 mini-games orchestrated via `GameRunner` + `AssessmentContext`

## User personas
- General consumer at a Cigna activation booth or marketing campaign — fills details, plays 6 short games (~25s each), gets a /100 cognitive score with 4 sub-dimensions, shares to social.

## Scoring
- Each game: 0-50 raw points → normalised to /100
- Total = mean of 6 normalised scores
- Level: ≥80 ADVANCED, ≥60 PROFICIENT, ≥40 INTERMEDIATE, else BEGINNER
- Dimensions: attention=(reaction_pulse+tap_stars)/2, processing=(decision_sprint+reaction_pulse)/2, memory=(pattern_recall+find_odd)/2, flexibility=(rule_changed+decision_sprint)/2

## Implemented (2026-05-09)
- Welcome form (Name, DOB d/m/y, Email, Phone, Company, Designation)
- Splash with starburst hero
- 6 mini-games: PATTERN RECALL (4×4 grid memory), RULE CHANGED (Stroop), REACTION PULSE (tap glowing bubbles), DECISON SPRINT (even/odd), TAP ONLY ★ STARS, FIND THE ODD ONE
- Calculating loader → QR Code → Results page (donut + 4 dimension bubbles + DSST description) → Share & Compete (FB/IG/Twitter)
- Real Echoes of Silence + Cigna logos embedded
- All screens framed with lime border + gradient stage; navy game cards; lime-bordered black Score/Time pills; gradient lime→teal pill CTAs

## Backlog (P1 / P2)
- P1: Email the result PDF to user (SendGrid/Resend integration)
- P1: Leaderboard view (top 10 today)
- P2: Cleaner skip buttons inside each game
- P2: Pydantic Field constraints on raw scores; EmailStr validation
- P2: Replay flow ("Play again to beat your score")

## Next action items
- Email-result delivery integration
- Admin/leaderboard dashboard

## Iteration 2 (2026-05-09) — Email + Leaderboard + Replay + CSV
- Added Resend integration: `POST /api/sessions/{id}/email` builds branded PDF (reportlab) and emails as attachment. Sender `onboarding@resend.dev`, reply_to gmail.
- Added `/leaderboard` page + `GET /api/leaderboard` endpoint (top N by score). Matches uploaded reference design exactly.
- Added `PLAY AGAIN` flow on Results — resets context, returns to `/register`.
- Added `GET /api/admin/export.csv` (header-token protected via `ADMIN_TOKEN` env var). Streams CSV of all participants + scores for booth lead capture.

## Booth operator how-to
- Leaderboard URL: `<APP_URL>/leaderboard`
- CSV export: `curl -H "X-Admin-Token: <ADMIN_TOKEN>" <APP_URL>/api/admin/export.csv -o leads.csv`
- ADMIN_TOKEN lives in backend/.env — rotate on demand.

## Iteration 3 (2026-05-09) — Admin dashboard
- Rotated `ADMIN_TOKEN` to: `xaXrE7tAzFy33Q1QNdVR0UTYCCkpSXRFMSK5HbfD9H4`
- Added `GET /api/admin/stats` (users / sessions / avg_score)
- Extended `GET /api/admin/export.csv` with optional `?from=YYYY-MM-DD&to=YYYY-MM-DD`
- Added `/admin` page: token login (saved to localStorage) → stats cards → date-range filter → click-to-download CSV → public leaderboard link

## Sender domain (action required by user)
To switch from `onboarding@resend.dev` to `results@cigna.com`:
1. Verify a Cigna-owned domain at https://resend.com/domains (add the SPF/DKIM/DMARC DNS records they show)
2. Update `SENDER_EMAIL` in `/app/backend/.env` and restart backend


## Iteration 4 (2026-05-09) — EmailJS migration (frontend-only email)
- Migrated email delivery from Resend (backend) to EmailJS (frontend) so emails reach the actual signed-up user without domain verification.
- Installed `@emailjs/browser`. Hardcoded credentials in `/app/frontend/src/pages/Results.jsx`:
  - Service ID: `service_yjyaw7v`
  - Template ID: `template_sxef4jd`
  - Public Key: `flNViTmsVcs9qjjJS`
- Button label changed to **EMAIL ME RESULTS** (free EmailJS tier does not support PDF attachments).
- Friendly inline error messaging on 422 / 4xx EmailJS responses.
- Backend `/api/sessions/{id}/email` and `pdf_builder.py` left in place but unused (backlog P2 cleanup).

### EmailJS dashboard setup (one-time, by user)
The user MUST configure their EmailJS template (`template_sxef4jd`) in the EmailJS dashboard:
1. **Settings → To Email**: set to `{{email}}` (so each user receives their own report)
2. **From Name**: `Echoes of Silence` (or preferred sender name)
3. **Subject**: `Your Cognitive Assessment Results — {{name}}`
4. Paste the supplied `echoes-of-silence-dsst.html` design into the **Content (HTML)** tab.
5. Wire these template variables (must match payload sent by `Results.jsx`):
   `{{name}}`, `{{email}}`, `{{score}}`, `{{level}}`, `{{attention}}`, `{{processing}}`, `{{memory}}`, `{{flexibility}}`, `{{date}}`
6. Click **Save** and ensure the template is **published** (not draft).

If 422 errors persist, double-check the "To Email" field — it must use `{{email}}` (or `{{to_email}}`), not be left blank.

## Backlog
- P2: Delete `/api/sessions/{id}/email`, `/api/sessions/{id}/email-mark`, `pdf_builder.py`, and Resend deps from backend
- P2: Move EmailJS keys into `frontend/.env` (`REACT_APP_EMAILJS_*`) instead of hardcoded
