<p align="center">
  <a href="https://ewacuna.github.io/handwriting-generator/">
    <img src="public/images/logo.png" alt="App Logo" width="96" height="96">
  </a>
</p>

<h3 align="center">Cursive Worksheet Generator</h3>

<p align="center">
  Create printable cursive handwriting worksheets from your own practice text.
</p>

<p align="center">
  <a href="https://ewacuna.github.io/handwriting-generator/">Live Demo</a>
  ·
  <a href="#features">Features</a>
  ·
  <a href="#getting-started">Getting Started</a>
</p>

## Overview

Cursive Worksheet Generator is a small web app for building custom handwriting practice sheets. Enter the words or sentences you want to practice, preview the worksheet layout, and download a ready-to-print PDF.

It is designed for parents, teachers, tutors, and students who need quick, personalized cursive worksheets without preparing a document manually.

## Demo

View the app here: [https://ewacuna.github.io/handwriting-generator/](https://ewacuna.github.io/handwriting-generator/)

## Features

- Generate cursive handwriting worksheets as downloadable PDF files.
- Add, remove, and clear worksheet rows.
- Add a full extra page of practice rows in one click.
- Preview worksheet pages before generating the PDF.
- Icon-enhanced controls for row editing, preview, language, and PDF actions.
- Enforces a 30-character limit per row to keep text readable on the worksheet.
- Supports English and Spanish UI text with saved language preference.
- Uses a custom dashed cursive font for practice text.

## Tech Stack

- [Angular](https://angular.dev/) web application framework
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Lucide Angular](https://lucide.dev/guide/packages/angular) for interface icons
- [pdf-lib](https://pdf-lib.js.org/) for creating PDF worksheets in the browser
- [@ngx-translate](https://github.com/ngx-translate/core) for internationalization
- [@pdf-lib/fontkit](https://github.com/Hopding/fontkit) for embedding the cursive font

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

```bash
npm install
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:5100/](http://localhost:5100/) in your browser. The development server reloads automatically when source files change.

## Available Scripts

```bash
npm run dev
```

Starts the local development server on port `5100`.

```bash
npm run build
```

Builds the app for production.

```bash
npm run build-gh-page
```

Builds the production app into `docs/` with the GitHub Pages base href.

```bash
npm test
```

Runs the Angular test suite.

## Project Structure

```text
src/app/features/generator/     Worksheet editor, preview, and PDF action
src/app/features/settings/      Language selector
src/app/core/services/          PDF generation service
public/fonts/                   Custom worksheet font
public/i18n/                    English and Spanish translations
public/images/                  App images and logo
```

## Deployment

The project includes a GitHub Pages build script:

```bash
npm run build-gh-page
```

This writes the production build to `docs/`, using the configured GitHub Pages URL as the base href.

## License

This project is licensed under the terms in [LICENSE](LICENSE).
