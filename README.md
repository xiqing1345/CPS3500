# Portfolio AI

This repository contains a personal portfolio built with Next.js (App Router) and TypeScript. It features an **AI Resume / LinkedIn Helper** powered by OpenAI's GPT model.

## Structure

- `app/` – main application routes and API.
- `components/` – reusable UI components (Navbar, Footer, ProjectCard).
- `lib/` – helper modules (project data).
- `public/` – static assets.
- `.env.local` – environment variables (add your OpenAI API key here).

## Getting Started

1. Clone the repo and `cd portfolio-ai`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with your OpenAI key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- Home, About, Projects, Contact, and AI Resume pages.
- AI Resume Helper lets you input experience text and generate:
  - Resume bullets
  - LinkedIn summaries
  - Cover letter paragraphs
- Customizable tone and target role.
- Copy and regenerate functionality.

## Deployment

1. Push this repository to GitHub.
2. Import the repo into [Vercel](https://vercel.com).
3. Add an environment variable `OPENAI_API_KEY` in your Vercel dashboard.
4. Deploy – the site will be publicly available.

## Demo Flow

1. Navigate to the deployed portfolio.
2. Click **Projects** then **AI Resume / LinkedIn Helper**.
3. Paste sample text, choose mode/tone, and generate output.
4. Copy the result or regenerate as needed.


For more details on Next.js, visit the [documentation](https://nextjs.org/docs).
