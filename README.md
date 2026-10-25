# Extreme Weather Safety Quiz

A small, responsive web app that teaches extreme weather safety in Switzerland through short multiple-choice quizzes.

**Live demo:** https://saneedkhani.github.io/weather-quiz-demo/

## Features

- Home page with three scenarios: **flooding**, **heatwaves** and **severe thunderstorms**
- Three multiple-choice questions per scenario
- Instant feedback after each answer, with an explanation and links to official Swiss guidance
- Final score and summary with a per-question recap, plus **Try again** and **Choose another scenario**
- Works on mobile and desktop, in light and dark mode
- Keyboard and screen-reader friendly (focus management, text and icons as well as colour)
- All content lives in one editable file: [`data/quiz.json`](data/quiz.json)
- No accounts, database, tracking, build step or third-party libraries

## Run it locally

You need a browser and **one** of the following (both are free):

- **Python 3** (already installed on most macOS/Linux machines), or
- **Node.js**

> Why a local server? Browsers block a page opened straight from your disk (`file://…`) from loading `quiz.json`. A tiny local server fixes that.

1. Download the code: **Code → Download ZIP** on GitHub and unzip it, or run:
   ```bash
   git clone https://github.com/saneedkhani/weather-quiz-demo.git
   cd weather-quiz-demo
   ```
2. Start a local server in that folder:
   ```bash
   python -m http.server 8000
   ```
   (on some systems the command is `python3`), or with Node.js:
   ```bash
   npx serve -l 8000
   ```
3. Open **http://localhost:8000** in your browser.
4. Stop the server with `Ctrl + C`.

## Editing the content

Everything shown on screen comes from [`data/quiz.json`](data/quiz.json). Edit it in any text editor and reload the page.

```jsonc
{
  "app": { "title": "…", "eyebrow": "…", "intro": "…", "disclaimer": "…" },
  "ui":  { "next": "Next question", "…": "…" },        // optional: button and label text
  "scenarios": [
    {
      "id": "flooding",                // used in the URL: #/flooding
      "title": "Flooding",
      "icon": "flood",                 // flood | heat | storm (icon and colour)
      "description": "…",
      "enabled": true,                 // optional: false shows the card as "Coming soon"
      "questions": [
        {
          "situation": "…",            // optional short context
          "question": "What should you do?",
          "options": ["Answer A", "Answer B", "Answer C", "Answer D"],
          "correctIndex": 1,           // 0 = first option, 1 = second, …
          "explanation": "…",
          "sources": [{ "label": "Official page title", "url": "https://…" }]
        }
      ]
    }
  ]
}
```

The app checks the file when it loads. If something is missing or wrong (for example a `correctIndex` that points to no option), it shows a clear message naming the scenario and question instead of a blank page.

Tip: paste the file into https://jsonlint.com to find a missing comma or quote.

## Project structure

```
index.html        Page shell (header, main area, footer)
css/styles.css    All styling, mobile-first, light/dark themes
js/app.js         Quiz engine: loading, validation, routing, views, scoring
data/quiz.json    All quiz content (editable)
DEPENDENCIES.md   Dependencies, third-party assets and licences
AI_DISCLOSURE.md  Use of generative AI tools and how outputs were checked
```

## Browser support

Current versions of Chrome, Edge, Firefox and Safari (desktop, Android and iOS).

## Content and disclaimer

The demo questions were written for this project based on official Swiss guidance from the [Natural Hazards Portal](https://www.natural-hazards.ch), the [Federal Office of Public Health (FOPH)](https://www.bag.admin.ch/en/heat) and [MeteoSwiss](https://www.meteoswiss.admin.ch). Links were checked on 25 October 2026. This app is an educational demo and not a warning service. In an emergency, always follow official warnings and instructions.

## Copyright

© 2026 Saneed Ullah. All rights reserved.
This project is shared for viewing only. See [LICENSE](LICENSE).
