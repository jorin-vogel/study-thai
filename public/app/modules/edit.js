!function (doc, app) {

  var el, form, phrase, lang1, lang2, tags;


  el     = doc.getElementById('edit');
  form   = el.querySelector('form');
  lang1  = form.querySelector('.lang1');
  lang2  = form.querySelector('.lang2');
  tags   = form.querySelector('.tags');
  button = el.querySelector('.destroy');



  app.edit = {

    open: function (animate, id) {
      id ? load(id) : empty();

      lang1.value = phrase.lang1;
      lang2.value = phrase.lang2;
      tags.value  = phrase.tags;

      el.classList[animate ? 'add' : 'remove']('animate');
      el.classList.add('show');
    },


    close: function (animate) {
      el.classList[animate ? 'add' : 'remove']('animate');
      el.classList.remove('show');
    }

  };



  function load(id) {
    phrase = app.phrase.byId(id);
    if (!phrase) app.router.go('/');
    button.classList.remove('hide');
  }


  function empty() {
    phrase = {
      lang1: '',
      lang2: '',
      tags:  ''
    };

    button.classList.add('hide');
  }


  function loadFromDOM() {
    return {
      lang1: lang1.value,
      lang2: lang2.value,
      tags:  tags.value
    };
  }


  function goHome() {
    lang1.blur(); lang2.blur(); tags.blur();
    app.router.go('/');
  }


  function extend(source, target) {
    Object.keys(target).forEach(function (prop) {
      source[prop] = target[prop];
    });

    return source;
  }


  function temporaryId() {
    return Date.now();
  }


  function create() {
    extend(phrase, loadFromDOM());

    app.request({
      method: 'post',
      data: phrase,
      name: phrase.lang1,
      action: 'create'
    }, function (res) {

      app.list.updateId(phrase.id, res.id);
      phrase.id = res.id;
      app.phrase.add(phrase);

    });

    phrase.id = temporaryId();
    app.list.add(phrase);
    goHome();
  }


  function update() {
    var phraseUpdate = extend(extend({}, phrase), loadFromDOM());

    app.request({
      method: 'put',
      id: phraseUpdate.id,
      data: phraseUpdate,
      name: phraseUpdate.lang1,
      action: 'update'
    }, function () {

      extend(phrase, phraseUpdate);

    });

    app.list.update(phrase, phraseUpdate);
    goHome();
  }


  function destroy() {
    if (!confirm('You really want to delete this phrase?')) return;

    app.request({
      method: 'delete',
      id: phrase.id,
      name: phrase.lang1,
      action: 'delete'
    }, function () {

      app.phrase.remove(phrase);

    });

    app.list.remove(phrase);
    goHome();
  }


  // TODO: not sure if neccessary
  var submitBlocked = (function () {
    var toggle = false;
    return function () {
      if (toggle) return true;
      toggle = true;
      setTimeout(function () {
        toggle = false;
      }, 3000);
      return false;
    };
  })();




  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (submitBlocked()) return;
    phrase.id ? update() : create();
  });


  button.addEventListener('click', function (e) {
    e.preventDefault();
    destroy();
  });



}(document, slangbook);