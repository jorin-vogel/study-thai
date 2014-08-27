!function (doc, app) {

  var el;

  el = doc.getElementById('search');

  function filterPhrases() {
    var i, filter, item;

    filter = new RegExp(escapeRegExp(el.value), 'i');

    for (i = 0; i < app.list.items.length; i++) {
      item = app.list.items[i];
      item.style.display = app.phrase.match(i, filter) ? '' : 'none';
    }
  }

  function showAll() {
    for (i = 0; i < app.list.items.length; i++) {
      app.list.items[i].style.display = '';
    }
  }

  function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  }


  el.addEventListener('focus', function (e) {
    app.aside.focus();

    setTimeout(function () {
      el.setSelectionRange(0, el.value.length);
    }, 0);
  });

  el.addEventListener('blur', app.aside.blur);

  el.addEventListener('keyup', function (e) {
    // enter or escape
    if (e.keyCode == 13 || e.keyCode == 27) {
      el.blur();
    }
  });

  el.addEventListener('input', function () {
    el.value ? filterPhrases() : showAll();
  });

}(document, slangbook);