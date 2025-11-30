import icons from 'url:../../img/icons.svg'; // NO SPACE AFTER URL:
import fracty from 'fracty';

/**
 * Base View class used by all concrete view modules.
 *
 * Responsibilities:
 * - Hold a reference to a `_parentElement` DOM node where markup will be inserted
 * - Provide shared helper methods used across views, e.g. `render`,
 *   `renderSpinner`, `renderError`, `renderMessage` and `_clear`.
 *
 * Concrete view classes should extend this class and implement a
 * `_generateMarkup()` method which returns a markup string for the
 * provided `this._data`.
 *
 * Conventions:
 * - `_parentElement` is a DOM element specific for each view (assigned in subclasses)
 * - `_data` contains the most recent data set for the view (object or array)
 */
export default class View {
  _parentElement = document.querySelector('.recipe');
  _data;
  /**
   * Render the received object to the DOM
   * @param {Object | Object[]} data The data to be rendered (e.g. recipe)
   * @param {boolean} [render=true] If false, create markup string instead of rendering to the DOM
   * @returns {undefined | string} A markup string is returned if render=false
   * @this {Object} View instance
   * @author Lee Vaughan
   * @todo Finish implementation
   */
  render(data, render = true) {
    if (!data || (Array.isArray(data) && data.length === 0))
      return this.renderError();

    this._data = data;
    const markup = this._generateMarkup();

    if (!render) return markup;

    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  update(data) {
    this._data = data;
    const newMarkup = this._generateMarkup();

    const newDOM = document.createRange().createContextualFragment(newMarkup);
    const newElements = Array.from(newDOM.querySelectorAll('*'));
    const curElements = Array.from(this._parentElement.querySelectorAll('*'));

    newElements.forEach((newEl, i) => {
      const curEl = curElements[i];

      // Updates changed TEXT
      if (
        !newEl.isEqualNode(curEl) &&
        newEl.firstChild?.nodeValue.trim() !== ''
      ) {
        curEl.textContent = newEl.textContent;
      }

      // Updates changed ATTRIBUES
      if (!newEl.isEqualNode(curEl))
        Array.from(newEl.attributes).forEach(attr =>
          curEl.setAttribute(attr.name, attr.value)
        );
    });
  }

  _clear() {
    this._parentElement.innerHTML = '';
  }

  /**
   * Show a loading spinner in the view.
   * This clears the view and inserts a small loader mark-up.
   */
  renderSpinner() {
    const markup = `<div class="spinner">
              <svg>
                <use href="${icons}#icon-loader"></use>
              </svg>
            </div>`;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  /**
   * Represent decimals as friendly cooking fractions (mixed fractions where apropriate).
   * Accepts numeric-like values (string or number) and returns a display-friendly string.
   * The function attempts simple denominators first (2,3,4) and falls back to `fracty`.
   *
   * @param {number|string|null|undefined} val - Quantity to convert
   * @returns {string} - Human-friendly fraction/number or an empty string if input is nullish
   */
  _prettyFraction(val) {
    if (val == null || val === '') return '';

    const num = Number(val);
    if (Number.isNaN(num)) return val;

    // Whole number? Just show it.
    if (Math.abs(num % 1) < 1e-6) return String(num);

    const sign = num < 0 ? -1 : 1;
    const abs = Math.abs(num);
    let whole = Math.trunc(abs);
    const frac = abs - whole;

    // Only allow denominators 2, 3, 4
    const denominators = [2, 3, 4];

    let bestNum = 0;
    let bestDen = 1;
    let minDiff = Infinity;

    for (const den of denominators) {
      const rawNum = frac * den;
      const roundNum = Math.round(rawNum);
      const approx = roundNum / den;
      const diff = Math.abs(frac - approx);

      if (diff < minDiff) {
        minDiff = diff;
        bestNum = roundNum;
        bestDen = den;
      }
    }

    // If it's very close to 0 or 1, fold into the whole
    if (Math.abs(frac - 0) < 0.08 || bestNum === 0) {
      // basically whole number
      const valWhole = sign * whole;
      return String(valWhole);
    }
    if (Math.abs(frac - 1) < 0.08 || bestNum === bestDen) {
      whole += 1;
      const res = sign < 0 ? `-${whole}` : String(whole);
      return res;
    }

    // Build nice mixed fraction
    let result = '';
    if (whole > 0) result += whole;
    const fracStr = `${bestNum}/${bestDen}`;
    if (result) result += ' ';
    result += fracStr;

    if (sign < 0) result = '-' + result;
    return result;
  }

  /**
   * Render a friendly message box inside the view.
   * The message will replace existing view content.
   *
   * @param {string} [message] – Text to show to the user
   */
  renderMessage(message = this._message) {
    const markup = `<div class="message">
            <div>
              <svg>
                <use href="${icons}#icon-smile"></use>
              </svg>
            </div>
            <p>${message}</p>
          </div>`;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  /**
   * Render a standardized error UI inside the view.
   * Useful for displaying fetch/validation errors.
   *
   * @param {string} [message] – Error message to show (defaults to view's `_errorMessage`)
   */
  renderError(message = this._errorMessage) {
    const markup = `<div class="error">
              <div>
                <svg>
                  <use href="${icons}#icon-alert-triangle"></use>
                </svg>
              </div>
              <p>${message}</p>
            </div>`;

    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }
}
