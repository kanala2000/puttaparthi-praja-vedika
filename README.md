# పుట్టపర్తి ప్రజా వేదిక | Puttaparthi Praja Vedika

A Telugu-first, mobile-friendly public grievance portal concept for the Puttaparthi constituency. This repository starts as a **demo/prototype** and is not an official government or MLA-office website.

## Homepage requirements
- Yellow-forward, accessible design with Telugu-first copy.
- Three compact portrait slots: constituency MLA (left), Chief Minister (center), constituency in-charge (right). Photos are uploaded by an authorized administrator; none are bundled or fabricated.
- Clear actions: **మీ సమస్యను చెప్పండి**, **గళంతో సమస్యను నమోదు చేయండి**, **ఫిర్యాదు స్థితిని తెలుసుకోండి**.
- Complaint categories and Mandal → Village/Ward → Area fields.
- Mobile-first layout and accessible buttons/labels for residents who have difficulty reading or typing.

## Admin requirements
- Secure sign-in and role-based permissions before real deployment.
- Authorized admin can upload/replace the three homepage portraits and update captions.
- Resize/compress photos client-side before upload; enforce file type and size limits.
- Manage complaints and statuses; keep names, phone numbers, audio and sensitive complaint details private by default.
- Dashboard statistics must come from actual stored records; demo counts must be labelled as sample data.

## Voice complaint
- Large microphone control, record/pause/stop, playback before submit, and consent notice.
- Provide a text alternative and allow correction of speech-to-text when supported.
- Save audio securely and limit size/duration. Do not publish recordings publicly.

## Suggested stack
- Next.js + TypeScript + responsive CSS
- Supabase Auth, Postgres and Storage with Row Level Security
- Vercel deployment / installable PWA

## Safety and trust
- Do not imply official authorization or that a complaint has reached a public official unless a verified forwarding process exists.
- Never commit secrets, Supabase service-role keys, passwords, real complaint records or personal data.
- Add privacy notice, consent, retention policy, spam/abuse controls and audit history before accepting public complaints.
- Verify constituency locations and official portraits before launch.

## Development stages
1. Homepage and navigation prototype
2. Complaint form and client-side image/audio compression
3. Supabase schema, authentication, storage policies and admin roles
4. Complaint status tracking and admin dashboard
5. Accessibility, security, testing and deployment

## Local setup (after the Next.js app is added)
```bash
npm install
npm run dev
```
