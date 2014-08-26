!function (doc, app) {

  var el, form, phrase, lang1, lang2, tags;


  el     = doc.getElementById('edit');
  form   = el.querySelector('form');
  lang1  = form.querySelector('.lang1');
  lang2  = form.querySelector('.lang2');
  tags   = form.querySelector('.tags');
  button = el.querySelector('button');


  function open(animate, id) {
    id ? load(id) : empty();

    lang1.value = phrase.lang1;
    lang2.value = phrase.lang2;
    tags.value  = phrase.tags;

    el.classList[animate ? 'add' : 'remove']('animate');
    el.classList.add('show');
  }

  function close(animate) {
    el.classList[animate ? 'add' : 'remove']('animate');
    el.classList.remove('show');
  }

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
    phrase.lang1 = lang1.value;
    phrase.lang2 = lang2.value;
    phrase.tags  = tags.value;
  }

  function create() {
    loadFromDOM();
    app.request({
      method: 'post',
      data: phrase,
      name: phrase.lang1,
      action: 'create'
    }, function (res) {
      phrase.id = res.id;
      app.list.add(phrase);
    });

    app.router.go('/');
  }

  function update() {
    loadFromDOM();
    app.request({
      method: 'put',
      id: phrase.id,
      data: phrase,
      name: phrase.lang1,
      action: 'update'
    }, function () {
      app.list.update(phrase);
    });

    app.router.go('/');
  }

  function destroy() {
    if (!confirm('You really want to delete this phrase?')) return;

    app.request({
      method: 'delete',
      id: phrase.id,
      name: phrase.lang1,
      action: 'delete'
    }, function () {
      app.list.remove(phrase);
    });

    app.router.go('/');
  }


  form.addEventListener('submit', function (e) {
    e.preventDefault();
    phrase.id ? update() : create();
  });

  button.addEventListener('click', function (e) {
    e.preventDefault();
    destroy();
  });



  app.edit = {
    open: open,
    close: close
  };

}(document, slangbook);