# Forkify (Section 18)

This project is a sample recipe app built in JavaScript (parcel-based). The workspace includes a small MVC-like structure with a `model` for data, `views` responsible for rendering DOM sections, and a `controller` to glue them.

This repo is used for tutorial / learning purposes.

## Structure

- `index.html` - app entrypoint
- `src/js/controller.js` - application controller (wires event handlers and controls flow)
- `src/js/model.js` - app state & API calls
- `src/js/views/` - view classes rendering parts of the UI:
  - `View.js` - shared base View class (render, renderSpinner, renderError, etc.)
  - `recipeView.js` - recipe panel UI
  - `resultsView.js` - search results list
  - other view files for search/pagination/preview

## Important view patterns and gotchas

This project uses a base `View` class that the concrete view classes extend. The base class provides these commonly used API methods:

- `render(data)` — renders provided data into the view's `_parentElement`.
- `renderSpinner()` — shows a loader in the view.
- `renderMessage(message?)` — show a user-friendly message box in the view.
- `renderError(message?)` — show an error UI message in the view.
- `_clear()` — internal helper to clear the view's content.

Notes / gotchas to be aware of:

- Keep method names consistent — the `controller` expects `renderSpinner()` (not `_renderSpinner`) and expects concrete views to expose `render`, `renderError` etc.
- When mapping over `this._data` to generate repeated preview markup, do not pass an unbound method directly to `.map(...)` because the callback will lose the intended `this` binding. Use arrow functions such as `.map(item => this._generateMarkupPreview(item))` so the callback runs with the correct `this`.
- When a per-item method needs an item `id`, use the `data` object passed to that callback, not `this._data` (the latter is the entire array), for example `href="#${data.id}`.
- Keep shared imports (like the `fracty` helper) in the base `View` so children can rely on it — avoid requiring/importing the same helper in multiple views.

## Recent fixes applied

- Fixed `View.js` so API method names match expected usage (renamed `_renderSpinner` to `renderSpinner`, replaced private `#clear()` with `_clear()`, and imported `fracty`).
- Removed duplicate `fracty` import from `recipeView.js`.
- Fixed `resultsView.js` mapping bug where `.map(this._generateMarkupPreview)` lost `this` — changed to `.map(el => this._generateMarkupPreview(el))`, imported `icons`, and used `data.id` in the per-item link instead of `this._data.id`.

## How to run

1. Install dependencies

```powershell
npm install
```

2. Start the local dev server

```powershell
npm start
```

3. Build for production

```powershell
npm run build
```

## Want improvements?

If you'd like, I can:

- Add unit tests for view helpers
- Add a dedicated `docs/` page for the view architecture
- Add a short CONTRIBUTING guide describing the development flow

---

If you'd like me to proceed with inline JSDoc comments for the Views next, say "yes — add JSDoc" and I'll start annotating the view files. Otherwise tell me what you prefer documented next.
