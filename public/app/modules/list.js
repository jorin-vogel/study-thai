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
    setLink(item, phrase);
  }

  function setLink(item, phrase) {
    item.querySelector('a').setAttribute('href', '/edit/' + phrase.id);
  }

  function add(phrase) {
    el.insertBefore(createItem(phrase), el.firstChild);
  }

  function updateLink(phrase) {
    var index = app.phrase.indexOf(phrase);
    setLink(el.children[index], phrase);
  }

  function update(oldPhrase, newPhrase) {
    var index = app.phrase.indexOf(oldPhrase);
    updateItem(el.children[index], newPhrase);
  }

  function remove(phrase) {
    var index = app.phrase.indexOf(phrase);
    el.removeChild(el.children[index]);
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
    updateLink: updateLink
  };

}(document, slangbook);