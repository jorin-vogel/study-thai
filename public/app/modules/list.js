!function (doc, app) {

  var el, baseItem, items;


  el = doc.getElementById('phrases');
  baseItem = el.removeChild(el.querySelector('li'));
  items = el.children;


  function createItem(phrase) {
    var item = baseItem.cloneNode(true);
    updateItem(item, phrase);
    return item;
  }

  function updateItem(item, phrase) {
    var paragraphs = item.getElementsByTagName('p');
    paragraphs[0].textContent = phrase.lang1;
    paragraphs[1].textContent = phrase.lang2;
    setItemId(item, phrase.id);
  }

  function setItemId(item, id) {
    item.setAttribute('data-id', id);
    item.querySelector('a').setAttribute('href', '/edit/' + id);
  }

  function add(phrase) {
    var item = createItem(phrase);
    item.querySelector('a').display = 'none';
    el.insertBefore(item, el.firstChild);
  }

  function updateId(oldId, newId) {
    var item = byId(oldId);
    setItemId(item, newId);
    item.querySelector('a').display = '';
  }

  function update(oldPhrase, newPhrase) {
    updateItem(byId(oldPhrase.id), newPhrase);
  }

  function remove(phrase) {
    el.removeChild(byId(phrase.id));
  }

  function byId(id) {
    return el.querySelector('[data-id="' + id + '"]');
  }

  function load() {
    var itemContainer = doc.createDocumentFragment();
    app.phrase.forEach(function (phrase) {
      itemContainer.appendChild( createItem(phrase) );
    });
    el.appendChild(itemContainer);
  }

  function reload() {
    el.innerHTML = '';
    load();
  }


  doc.addEventListener('DOMContentLoaded', load);



  app.list = {
    items: items,
    add: add,
    update: update,
    remove: remove,
    reload: reload,
    updateId: updateId
  };

}(document, slangbook);