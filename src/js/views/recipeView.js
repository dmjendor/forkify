import View from './baseView.js';
import icons from 'url:../../img/icons.svg'; // NO SPACE AFTER URL:
// fracty functionality is provided by the base View (imported there)
/**
 * RecipeView - renders the single recipe panel
 *
 * Data shape expected in `this._data` (typical):
 * {
 *   id: string,
 *   title: string,
 *   publisher: string,
 *   sourceUrl: string,
 *   image: string,
 *   servings: number,
 *   cookingTime: number,
 *   ingredients: [{ quantity:number, unit:string, description:string }, ...]
 * }
 */
class RecipeView extends View {
  _parentElement = document.querySelector('.recipe');
  _data;
  _message = 'Start by searching for a recipe or an ingredient. Have fun!';
  _errorMessage = '';

  /**
   * Round the numeric value to a cooking-friendly fraction (common fractions)
   * Example: 0.333 -> 1/3, 1.25 -> 1 1/4
   *
   * @param {number} value
   * @returns {number} rounded value (may be mixed number like 1.25)
   */
  _roundToCookingFraction(value) {
    if (value === 0) return 0;

    const sign = value < 0 ? -1 : 1;
    const abs = Math.abs(value);
    let whole = Math.trunc(abs);
    let frac = abs - whole;

    // Fractions we consider “nice” for cooking
    const options = [0, 1 / 4, 1 / 3, 1 / 2, 2 / 3, 3 / 4, 1];

    let best = 0;
    let minDiff = Infinity;

    for (const opt of options) {
      const diff = Math.abs(frac - opt);
      if (diff < minDiff) {
        minDiff = diff;
        best = opt;
      }
    }

    // If we picked 1, roll into the whole number
    if (best === 1) {
      whole += 1;
      frac = 0;
    } else {
      frac = best;
    }

    return sign * (whole + frac);
  }

  /**
   * Convert a raw quantity + unit into a friendly display pair.
   * The returned object contains `displayQuantity` and `displayUnit`.
   * For volume units (cup/tbsp/tsp) we normalize and choose the best unit
   * for display (e.g., mixed tbsp + tsp if needed).
   *
   * @param {number} quantity
   * @param {string} unit
   * @returns {{displayQuantity: string, displayUnit: string}}
   */
  _normalizeUnit(quantity, unit) {
    if (!quantity || quantity <= 0) {
      return { displayQuantity: '', displayUnit: unit ?? '' };
    }

    if (!unit) {
      // no unit: just format the number nicely
      return {
        displayQuantity: this._formatCookingNumber(quantity),
        displayUnit: '',
      };
    }

    let u = unit.toLowerCase();

    const isCup = x => x === 'cup' || x === 'cups';
    const isTbsp = x => x === 'tbsp' || x === 'tbsps';
    const isTsp = x => x === 'tsp' || x === 'tsps';

    const isVolume = isCup(u) || isTbsp(u) || isTsp(u);

    // If it's not a volume unit (g, ml, etc), just pretty-print as is
    if (!isVolume) {
      return {
        displayQuantity: this._formatCookingNumber(quantity),
        displayUnit: unit,
      };
    }

    // Normalize plurals to singular internally
    if (u === 'cups') u = 'cup';
    if (u === 'tbsps') u = 'tbsp';
    if (u === 'tsps') u = 'tsp';

    // Base units: 1/8 tsp
    const EIGHTH_PER_TSP = 8;
    const EIGHTH_PER_TBSP = 3 * EIGHTH_PER_TSP; // 24
    const EIGHTH_PER_CUP = 16 * EIGHTH_PER_TBSP; // 384

    // 1) Convert to integer count of 1/8 tsp
    let base;
    if (isCup(u)) base = quantity * EIGHTH_PER_CUP;
    else if (isTbsp(u)) base = quantity * EIGHTH_PER_TBSP;
    else base = quantity * EIGHTH_PER_TSP;

    base = Math.round(base); // integer

    if (base <= 0) {
      return { displayQuantity: '', displayUnit: '' };
    }

    // 2) Decide best unit based on size
    // >= 1/4 cup -> use cups
    if (base >= EIGHTH_PER_CUP / 4) {
      // 96 eighths = 1/4 cup
      const cups = base / EIGHTH_PER_CUP;
      return {
        displayQuantity: this._formatCookingNumber(cups),
        displayUnit: cups > 1.01 ? 'cups' : 'cup',
      };
    }

    // between 1 tbsp and 1/4 cup -> use tbsp, possibly mixed with tsp
    if (base >= EIGHTH_PER_TBSP) {
      const wholeTbsp = Math.floor(base / EIGHTH_PER_TBSP);
      const rem = base - wholeTbsp * EIGHTH_PER_TBSP; // remainder in eighths

      // If it divides nicely, just show tbsp
      if (rem === 0) {
        return {
          displayQuantity: this._formatCookingNumber(wholeTbsp),
          displayUnit: 'tbsp',
        };
      }

      // Otherwise show mixed tbsp + tsp
      const tsp = rem / EIGHTH_PER_TSP; // in teaspoons

      const parts = [];
      parts.push(`${this._formatCookingNumber(wholeTbsp)} tbsp`);
      if (tsp > 0) {
        parts.push(`${this._formatCookingNumber(tsp)} tsp`);
      }

      return {
        displayQuantity: '',
        displayUnit: parts.join(' '), // e.g. "1 tbsp 1 tsp"
      };
    }

    // below 1 tbsp -> use tsp
    const tsp = base / EIGHTH_PER_TSP;
    return {
      displayQuantity: this._formatCookingNumber(tsp),
      displayUnit: 'tsp',
    };
  }

  /**
   * Format a number using a small set of cooking-friendly fractions
   * (e.g. 1/4 | 1/3 | 1/2 | 2/3 | 3/4) and whole numbers. Returns a
   * string suitable for display in the material UI.
   *
   * @param {number|string} val
   * @returns {string}
   */
  _formatCookingNumber(val) {
    if (val == null || val === '') return '';

    const num = Number(val);
    if (Number.isNaN(num)) return String(val);

    const sign = num < 0 ? -1 : 1;
    const abs = Math.abs(num);

    // Whole number?
    if (Math.abs(abs % 1) < 1e-6) {
      return String(sign * Math.round(abs));
    }

    let whole = Math.trunc(abs);
    const frac = abs - whole;

    // Only allow these cooking fractions
    const options = [
      { value: 1 / 4, label: '1/4' },
      { value: 1 / 3, label: '1/3' },
      { value: 1 / 2, label: '1/2' },
      { value: 2 / 3, label: '2/3' },
      { value: 3 / 4, label: '3/4' },
    ];

    // Find the closest allowed fraction
    let best = options[0];
    let minDiff = Infinity;

    for (const opt of options) {
      const diff = Math.abs(frac - opt.value);
      if (diff < minDiff) {
        minDiff = diff;
        best = opt;
      }
    }

    // If the frac is tiny, treat it as 0
    if (frac < 0.125) {
      const resultWhole = sign * whole;
      return String(resultWhole);
    }

    // If we are very close to a full unit, roll into the whole
    if (1 - frac < 0.125) {
      whole += 1;
      const resultWhole = sign * whole;
      return String(resultWhole);
    }

    // Otherwise use the best cooking fraction
    let result = '';
    if (whole > 0) result += whole;
    if (best.label) {
      if (result) result += ' ';
      result += best.label;
    }

    if (sign < 0) result = '-' + result;
    return result;
  }

  // Part of Publisher Subscriber design pattern — these are public helpers
  addHandlerRender(handler) {
    ['hashchange', 'load'].forEach(ev => window.addEventListener(ev, handler));
  }

  /**
   * Wire update-servings buttons (delegated on the _parentElement).
   * The view expects elements with `.btn--update-servings` and a
   * `data-update-to` attribute that contains the new servings number.
   *
   * @param {(newServings:number) => void} handler
   */
  addHandlerUpdateServings(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--update-servings');
      if (!btn) return;
      const { updateTo } = btn.dataset;
      if (+updateTo > 0) handler(+updateTo);
    });
  }

  addHandlerUpdateBookmark(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--bookmark');
      if (!btn) return;
      handler();
    });
  }

  /**
   * Generate the full markup for the recipe view.
   * This uses the `this._data` object (see the class-level doc above) and
   * produces the main recipe HTML (title, details, ingredients, directions).
   *
   * @returns {string} HTML markup
   */
  _generateMarkup() {
    if (!this._data.hasOwnProperty('id')) throw new Error('No data');
    return `
        <figure class="recipe__fig">
          <img src="${this._data.image}" alt="${
      this._data.title
    }" class="recipe__img" />
          <h1 class="recipe__title">
            <span>${this._data.title}</span>
          </h1>
        </figure>

        <div class="recipe__details">
          <div class="recipe__info">
            <svg class="recipe__info-icon">
              <use href="${icons}#icon-clock"></use>
            </svg>
            <span class="recipe__info-data recipe__info-data--minutes">${
              this._data.cookingTime
            }</span>
            <span class="recipe__info-text">minutes</span>
          </div>
          <div class="recipe__info">
            <svg class="recipe__info-icon">
              <use href="${icons}#icon-users"></use>
            </svg>
            <span class="recipe__info-data recipe__info-data--people">${
              this._data.servings
            }</span>
            <span class="recipe__info-text">servings</span>

            <div class="recipe__info-buttons">
              <button class="btn--tiny btn--update-servings" data-update-to="${
                this._data.servings - 1
              }">
                <svg>
                  <use href="${icons}#icon-minus-circle"></use>
                </svg>
              </button>
              <button class="btn--tiny btn--update-servings" data-update-to="${
                this._data.servings + 1
              }">
                <svg>
                  <use href="${icons}#icon-plus-circle"></use>
                </svg>
              </button>
            </div>
          </div>

          <div class="recipe__user-generated ${this._data.key ? '' : 'hidden'}">
                <svg><use href="${icons}#icon-user"></use></svg>
          </div>
          <button class="btn--round btn--bookmark">
            <svg class="">
              <use href="${icons}#icon-bookmark${
      this._data.bookmarked ? '-fill' : ''
    }"></use>
            </svg>
          </button>
        </div>

        <div class="recipe__ingredients">
          <h2 class="heading--2">Recipe ingredients</h2>
          <ul class="recipe__ingredient-list">
${
  this._data.ingredients
    ? this._data.ingredients
        .map(ingredient => {
          const { displayQuantity, displayUnit } = this._normalizeUnit(
            ingredient.quantity,
            ingredient.unit
          );

          return `<li class="recipe__ingredient">
            <svg class="recipe__icon">
              <use href="${icons}#icon-check"></use>
            </svg>
            <div class="recipe__quantity">${displayQuantity}</div>
            <div class="recipe__description">
              <span class="recipe__unit">${displayUnit}</span>
              ${ingredient.description}
            </div>
          </li>`;
        })
        .join('')
    : ''
}



          </ul>
        </div>

        <div class="recipe__directions">
          <h2 class="heading--2">How to cook it</h2>
          <p class="recipe__directions-text">
            This recipe was carefully designed and tested by
            <span class="recipe__publisher">${this._data.publisher}
          </p>
          <a
            class="btn--small recipe__btn"
            href="${this._data.sourceUrl}"
            target="_blank"
          >
            <span>Directions</span>
            <svg class="search__icon">
              <use href="${icons}#icon-arrow-right"></use>
            </svg>
          </a>
        </div>
      `;
  }
}
export default new RecipeView();
