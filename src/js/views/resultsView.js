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
class ResultsView extends View {
  _parentElement = document.querySelector('.results');
  _message = '';
  _errorMessage = 'No Recipes found for your query! Please try again.';
  _generateMarkup() {
    // Defensive: if no data or empty array, return an empty string and let
    // the render call handle showing messages / errors.
    if (!this._data || !Array.isArray(this._data) || this._data.length === 0)
      return '';

    // Map each item using an arrow function to maintain `this` binding.
    // Map each item using an arrow function to maintain `this` binding.
    return this._data.map(result => previewView.render(result, false));
  }

  _generateMarkupPreview(data) {
    // Use the passed-in `data` for per-item IDs (not `this._data`) and the
    // local `icons` import for SVG references.
    const id = window.location.hash.slice(1);

    return `
    <li class="preview">
            <a class="preview__link ${
              id === data.id ? 'preview__link--active' : ''
            }" href="#${data.id}">
              <figure class="preview__fig">
                <img src="${data.image}" alt="${data.title}" />
              </figure>
              <div class="preview__data">
                <h4 class="preview__title">${data.title}</h4>
                <p class="preview__publisher">${data.publisher}</p>
                <!-- <div class="preview__user-generated">
                  <svg>
                    <use href="${icons}#icon-user"></use>
                  </svg>
                </div>-->
              </div>
            </a>
          </li>
    `;
  }
}

export default new ResultsView();
