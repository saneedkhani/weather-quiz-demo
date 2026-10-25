# Generative AI disclosure

## Tools used

- **Claude (Anthropic), through Claude Code:** used as a coding assistant.

## What it was used for

- Drafting the first version of the HTML structure, CSS styling and the JavaScript quiz engine
- Drafting the demo quiz questions and explanations from official guidance pages
- Drafting documentation (this file, the README and the dependency list)

## How the output was checked

- **Code:** every file was reviewed line by line. Content from `quiz.json` is always inserted as text, never as HTML, to avoid injection. Nothing is sent anywhere and no external code is loaded.
- **Functionality:** all three scenarios were played through by hand, with both correct and wrong answers, checking feedback, links, scoring, "Try again", "Choose another scenario" and browser back/forward navigation.
- **Validation:** a broken `quiz.json` (missing fields, a wrong `correctIndex`) was tested to confirm the app shows a clear error message.
- **Responsive design and accessibility:** tested at phone (375 px) and desktop widths, in light and dark mode, and with keyboard-only navigation.
- **Content accuracy:** each explanation was compared with the linked official page (Natural Hazards Portal, FOPH, MeteoSwiss), and every link was opened to confirm it works (checked 25 October 2026).

The final responsibility for the code and content lies with the developer, Saneed Ullah.
