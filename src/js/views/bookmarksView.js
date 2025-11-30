import { hasIn } from 'immutable';
import View from './baseView';
import previewView from './previewView';
import icons from 'url:../../img/icons.svg';

/**
 * ResultsView
 * Renders the search results list.
 * Expects `this._data` to be an array of items with shape:
 *   { id: string, title: string, publisher: string, image: string }
 *
 * Important: use a mapping callback that preserves `this` (arrow fn) or
 * bind the handler — otherwise `this` inside `_generateMarkupPreview` will be undefined.
 */
class BookmarksView extends View {
  _parentElement = document.querySelector('.bookmarks__list');
  _message = '';
  _errorMessage = 'No bookmarks yet, find a nice recipe and bookmark it.';

  addHandlerRender(handler) {
    window.addEventListener('load', handler);
  }
  _generateMarkup() {
    // Defensive: if no data or empty array, return an empty string and let
    // the render call handle showing messages / errors.
    if (!this._data || !Array.isArray(this._data) || this._data.length === 0)
      return '';

    // Map each item using an arrow function to maintain `this` binding.
    return this._data.map(bookmark => previewView.render(bookmark, false));
  }
}

export default new BookmarksView();
