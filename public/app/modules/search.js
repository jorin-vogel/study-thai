!function (doc, app) {

  var el, filter;

  el     = doc.getElementById('search');
  filter = /.*/;



  app.search = {

    handle: function (item, phrase) {
      item.style.display = app.phrase.match(phrase, filter) ? '' : 'none';
    }

  };



  function filterPhrases() {
    var i, item, phrase;

    filter = new RegExp(escapeRegExp(el.value), 'i');

    for (i = 0; i < app.list.items.length; i++) {
      item = app.list.items[i];
      phrase = app.phrase.byId(item.getAttribute('data-id'));
      app.search.handle(item, phrase);
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