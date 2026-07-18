---
inclusion: always
---

# Life Dashboard — Project Steering

## Overview
A homepage-style daily dashboard built with vanilla HTML, CSS, and JavaScript.
No frameworks, no build tools, no backend required.

## Tech Stack
- HTML5 (structure)
- CSS3 with custom properties (styling, light/dark theme)
- Vanilla JavaScript ES6+ (logic, LocalStorage)

## File Structure
```
index.html          — Main page
css/style.css       — All styles (single file)
js/app.js           — All logic (single file)
.kiro/steering/     — Kiro project context
```

## Features
- Live clock with time-based greeting
- Focus timer (Pomodoro) with configurable duration
- To-do list with add, edit, delete, sort, and LocalStorage persistence
- Quick links with favicon support and LocalStorage persistence
- Light / Dark mode toggle with LocalStorage persistence

## Code Conventions
- No external libraries or CDN dependencies
- All data stored in `localStorage` with keys prefixed `dashboard_`
- JS sections separated by clear block comments
- CSS uses `[data-theme]` attribute on `<html>` for theming
