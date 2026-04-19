# Mana Mentor

Mana Mentor is a production-minded MVP for Telangana SSC students preparing mainly for POLYCET and TSRJC/TGRJC MPC. It is mobile-first, low-clutter, and built around useful exam prep actions: practice, assess, retry mistakes, plan study, and ask doubts from curated context.

## What is included

- Next.js App Router with TypeScript and Tailwind CSS
- Mobile-first dashboard and exam pages
- Previous papers library structure focused on POLYCET and TSRJC/TGRJC MPC
- Reusable OMR-like mock test component
- Instant mock evaluation logic
- Mistake book screen
- Study planner with POLYCET Maths-first weighting and TSRJC/TGRJC MPC adaptation
- Insights screen for accuracy, weak topics, speed issues, guesses, and projection
- Doubt resolver stub that retrieves only from the local curated question bank
- Prisma schema for production-ready persistence
- JSON seed format and import validator for future PDF extraction output

## Exam facts encoded

### POLYCET

- 120 objective questions
- 50 Maths, 40 Physics, 30 Chemistry
- No negative marking
- SSC-level syllabus
- OMR style practice supported

### TSRJC/TGRJC MPC

- Objective type
- 2.5 hours
- 150 marks
- MPC only in this app
- English, Mathematics, Physical Science
- 50 marks per subject
- Telangana 10th syllabus based
- OMR style practice supported

## Current Prep Focus

- POLYCET: Maths first, Physics second, Chemistry third.
- POLYCET Maths topics: Linear Equations, Quadratic Equations, Trigonometry, Applications of Trigonometry, Arithmetic Progression, Polynomials, Probability, Statistics, Circles, Similar Triangles, Sets, Logarithm.
- POLYCET Physics topics: Electricity, Heating Effect of Current, Magnetism, Reflection of Light, Refraction, Human Eye and Colourful World, Sources of Energy, Metallurgy.
- POLYCET Chemistry topics: Carbon and its Compounds, Acids Bases and Salts, Atomic Structure, Classification of Elements, Redox Reactions, States of Matter, Equilibrium, Polymers, Nuclear Chemistry.
- TSRJC/TGRJC: MPC only, covering English, Mathematics, Physical Science.

## Pages

- `/`
- `/exam/polycet`
- `/exam/tgrjc`
- `/exam/tgrjc/mpc`
- `/exam/tgrjc/bpc`
- `/exam/tgrjc/mec`
- `/papers`
- `/mock`
- `/mistakes`
- `/planner`
- `/insights`
- `/ask`

## Run locally

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run db:init
npm run seed
npm run sources:import
npm run dev
```

Open `http://localhost:3000`.

## Build

```bash
npm run build
```

## Data and ingestion

Demo seed questions live in `data/questions.seed.json`. They are placeholder questions shaped for the app and database. Before production use, replace them with verified official or licensed question data.

Source registry inputs live in:

- `data/mana_mentor_seed_manifest.json`
- `data/source_registry.csv`

Import or refresh source records with:

```bash
npm run sources:import
```

The registry creates queryable `SourceRecord` rows for previous papers, answer keys, official portals, bulletin/brochure references, and SCERT topic-mapping references. Retrieval prefers official sources first, then reputable mirrors, then community gap-fill records. Answer keys are only marked `verified_official_key` when the source is official or clearly labeled as an official final key.

Debug source registry view:

- `/sources`
- `/api/sources?exam=POLYCET`
- `/api/sources?exam=TGRJC&group=MPC`

The import pipeline validates future extraction output:

```bash
npm run import:questions -- data/questions.seed.json data/questions.normalized.json
```

Expected question format:

```json
{
  "exam_type": "POLYCET",
  "year": 2024,
  "group": null,
  "subject": "Maths",
  "topic": "Algebra",
  "subtopic": "Linear equations",
  "difficulty": "EASY",
  "question_text": "If 2x + 5 = 17, what is x?",
  "options": [
    { "label": "A", "text": "5" },
    { "label": "B", "text": "6" },
    { "label": "C", "text": "7" },
    { "label": "D", "text": "8" }
  ],
  "correct_option": "B",
  "explanation": "Subtract 5 from both sides, then divide by 2.",
  "source_type": "official_pdf_extraction",
  "source_url": "https://example.com/source.pdf",
  "tags": ["algebra", "ssc"]
}
```

Recommended ingestion path:

1. Extract text/questions from PDFs into raw JSON.
2. Normalize options, subjects, topics, and answer keys into the format above.
3. Run `npm run import:questions` to validate and deduplicate tags.
4. Review a sample manually before seeding production.
5. Store original source metadata for every question.

## Prisma

Schema is in `prisma/schema.prisma`. It includes:

- exams
- exam_groups
- subjects
- papers
- questions
- options
- answer_keys
- topic_tags
- mock_attempts
- mock_answers
- user_profiles
- study_plans
- weakness_profiles
- bookmarks

The default datasource is SQLite for MVP development. For Postgres, update `DATABASE_URL` and the Prisma datasource provider.

An initial SQLite SQL migration is checked in at `prisma/migrations/0001_init/migration.sql`. If `prisma db push` works in your environment, you can use that instead of `npm run db:init`.

For an existing local database created before source registry support, run:

```bash
npm run db:sources
npm run sources:import
```

## Product notes

Mana Mentor should stay practical. Avoid ornamental features unless they directly improve preparation. Good future additions:

- Real auth and per-student persistence
- Server actions for autosaving mock answers
- Admin upload flow for validated question JSON
- Full mock generator that enforces exact exam distributions
- Retrieval layer backed by embeddings over curated syllabus/question-bank data
- Downloadable low-data revision sheets
