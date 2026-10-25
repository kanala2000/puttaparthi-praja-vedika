# పుట్టపర్తి ప్రజా వేదిక | Puttaparthi Praja Vedika

A Telugu-first, mobile-friendly public grievance portal prototype for the Puttaparthi constituency. This is an independent demo, not an official government or MLA-office website.

## Current prototype
- Responsive Telugu-first homepage with a yellow theme.
- Three portrait placeholders: MLA (left), Chief Minister (center), constituency in-charge (right). Photos are not fabricated or prefilled; demo administrator can add images.
- Complaint form, client-side image compression preview, voice recording and playback controls.
- Demo tracking screen and demo-only photo manager.
- Clear notice that complaints are not actually submitted, stored on a server, or delivered to an official.

## Run locally
Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```
Then open http://localhost:3000

## Demo admin
Open **అడ్మిన్** and enter `demo123` to test local photo upload.

**Important:** This is only a browser-side demo gate, NOT secure authentication. Photos are compressed in the browser and saved to that browser's local storage only; they will not automatically appear for other visitors. Complaint submissions and tracking are mock flows.

## Before real launch
- Replace the demo gate with Supabase Auth or another secure server-side identity system and role-based access.
- Connect database and private storage with Row Level Security; implement complaint persistence, status updates and real tracking.
- Store portraits in authorized storage and expose only approved public image URLs.
- Upload user photos/voice recordings only after consent; validate formats and size/duration limits on both client and server.
- Never make phone numbers, sensitive welfare/health complaints or audio public by default.
- Add privacy notice, retention/deletion policy, spam prevention, audit history and a real complaint-routing process before accepting public reports.
- Verify locations, names and portraits. Do not imply official affiliation or successful delivery to the MLA/office without authorization and a working integration.
- Replace all demo content and test accessibility, mobile layout and error states.
