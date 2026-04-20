# Deploy Mana Mentor for Mobile Access

This app is now deployable as a regular mobile web app. The student in India only needs a browser and internet connection.

## Fastest Deployment: Vercel

1. Open https://vercel.com/new
2. Sign in with GitHub.
3. Import this repository: `saiprasadchary/TG_Poly_Rjc`
4. Keep the defaults:
   - Framework: Next.js
   - Install command: `npm install`
   - Build command: `npm run build`
5. Click Deploy.
6. Share the deployed URL with the student.

The app currently does not require a production database to display the study UI, papers, sources, and imported POLYCET mock questions. Deployment data is bundled in `data/deploy`, and PDFs are served from `public/sources`.

## What Works After Deploy

- Mobile-first dashboard
- POLYCET topic priority pages
- TSRJC/TGRJC MPC pages
- Papers and sources library
- 119 imported POLYCET 2025 Q&A questions
- Strict mock test review with red/green answer feedback
- Source registry and source PDF links

## Add to Home Screen

On the student's Android phone:

1. Open the Vercel URL in Chrome.
2. Tap the three-dot menu.
3. Tap `Add to Home screen`.
4. Name it `Mana Mentor`.

## Future Production Database

For login, persistent mock history, and per-student mistake book, add hosted Postgres later:

- Supabase Postgres, or
- Neon Postgres

Then set `DATABASE_URL` in Vercel and switch relevant pages/actions back to Prisma-backed persistence.
