# Suomen Treeni — Finnish Trainer

A personal Finnish-learning site built toward passing the YKI exam (language
requirement for Finnish citizenship) and everyday conversational fluency.

## Features

- **Drills** — spaced-repetition (SM-2) flashcards covering ~150 core vocab
  words and grammar (case system, conjugation) fill-in-the-blank exercises.
- **Chat** — AI conversation partner that replies in Finnish and corrects
  mistakes, pitched to your level.
- **Writing** — generates YKI-style writing prompts and grades your response
  with structured feedback.
- **Grammar** — reference notes on cases, consonant gradation, and verb
  conjugation.

## How it works

Static site (Vite, vanilla JS), hosted on GitHub Pages. There is no backend:
all progress lives in your browser's `localStorage`, and the AI features call
the Anthropic API directly from the browser using an API key you paste into
Settings — the key is stored only in your browser and is never committed to
this repo or sent anywhere except Anthropic's API.

## Local development

```bash
npm install
npm run dev
```

## Deployment

Pushing to `main` builds and deploys automatically to GitHub Pages via
`.github/workflows/deploy.yml`.
