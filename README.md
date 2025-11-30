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
  ind

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

## Future Improvement Ideas

- Display the number of pages between the pagination buttons;
- bility to sort search results
- Perform ingredient validation in veiw before submitting the form.
  -- Change the ingredient input, to be multiple inputs
  -- Add ability to add more than 6
- Use AI to import images of recipes from books.
- Shopping list feature that exports the list of ingredients
  -- print page, or send email
- Weekly/Monthly meal planning feature
  -- weekly/monthly shopping list.
- Get nutrition data on each ingredient from spponacular API (https://spoonactular.com/food-api)
  Then display nutrition value, ie calories, etc.
