import { RESULTS_PER_PAGE } from '../config';
import View from './baseView';
import icons from 'url:../../img/icons.svg';

class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');
  _errorMessage = '';

  _generateMarkup() {
    const currentPage = this._data.currentPage;
    const numPages = Math.ceil(
      this._data.results.length / this._data.resultsPerPage
    );
    this._clear();
    const prevButton = `
          <button class="btn--inline pagination__btn--prev" data-goto="${
            currentPage - 1
          }">
            <svg class="search__icon">
              <use href="${icons}#icon-arrow-left"></use>
            </svg>
            <span>Page ${currentPage - 1}</span>
          </button>`;
    const nextButton = `
          <button class="btn--inline pagination__btn--next" data-goto="${
            currentPage + 1
          }">
            <span>Page ${currentPage + 1}</span>
            <svg class="search__icon">
              <use href="${icons}#icon-arrow-right"></use>
            </svg>
          </button>`;
    // page 1, and there are other pages
    if (this._data.currentPage === 1 && numPages > 1) {
      return nextButton;
    }

    // the last page
    if (this._data.currentPage === numPages && numPages > 1) {
      return prevButton;
    }

    // Other Page
    if (this._data.currentPage < numPages) {
      return prevButton + nextButton;
    }
  }
  addHandlerClick(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--inline');
      if (!btn) return;
      handler(+btn.dataset.goto);
    });
  }
}

export default new PaginationView();
