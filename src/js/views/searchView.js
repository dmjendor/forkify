import View from './baseView';
class SearchView extends View {
  _parentElement = document.querySelector('.search');
  _errorMessage = '';

  getQuery() {
    const query = this._parentElement.querySelector('.search__field').value;
    this._clearInput();
    return query;
  }

  _clearInput() {
    this._parentElement.querySelector('.search__field').value = '';
  }

  // Part of Publisher Subscriber design pattern
  addHandlerSearch(handler) {
    ['submit'].forEach(ev =>
      window.addEventListener(ev, function (e) {
        e.preventDefault();
        handler();
      })
    );
  }
}

export default new SearchView();
