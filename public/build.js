!function (doc) {


  window.slangbook = {};

  doc.addEventListener('DOMContentLoaded', function() {
    doc.body.style.opacity = 1;
  });

}(document);
!function (doc, app) {

  var el;


  el = doc.querySelector('#main aside');

  function focus() {
    el.classList.add('focus');
  }

  function blur() {
    el.classList.remove('focus');
  }



  app.aside = {
    focus: focus,
    blur: blur
  };

}(document, slangbook);
!function (doc, app) {

  var el, form, phrase, lang1, lang2, tags;


  el     = doc.getElementById('edit');
  form   = el.querySelector('form');
  lang1  = form.querySelector('.lang1');
  lang2  = form.querySelector('.lang2');
  tags   = form.querySelector('.tags');
  button = el.querySelector('.destroy');


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
    })
    return source;
  }

  function create() {
    extend(phrase, loadFromDOM());
    app.request({
      method: 'post',
      data: phrase,
      name: phrase.lang1,
      action: 'create'
    }, function (res) {
      phrase.id = res.id;
      app.phrase.add(phrase);
      app.list.updateLink(phrase);
    });

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



  app.edit = {
    open: open,
    close: close
  };

}(document, slangbook);
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
!function (doc, app) {

  var el;


  el = doc.getElementById('main');

  function open(animate) {
    el.classList[animate ? 'add' : 'remove']('animate');
    el.classList.remove('hide');
  }

  function close(animate) {
    el.classList[animate ? 'add' : 'remove']('animate');
    el.classList.add('hide');
  }



  app.main = {
    open: open,
    close: close
  };

}(document, slangbook);
!function (doc, app) {

  var data;

  data = window.phrases;


  function forEach(fn) {
    data.forEach(fn);
  }

  function queryMatchesForIndex(index, query) {
    var phrase, i, props;

    phrase = data[index];
    props = Object.keys(phrase);
    for (i = 0; i < props.length; i++) {
      if ( query.test(phrase[props[i]]) ) return true;
    }
    return false;
  }

  function byId(id) {
    var i, phrase;

    for (i = 0; i < data.length; i++) {
      phrase = data[i];
      if (phrase.id == id) return phrase;
    }
  }

  function indexOf(phrase) {
    return data.indexOf(phrase);
  }

  function add(phrase) {
    data.unshift(phrase);
  }

  function remove(phrase) {
    var index = data.indexOf(phrase);
    data.splice(index, 1);
  }


  app.phrase = {
    forEach: forEach,
    match: queryMatchesForIndex,
    byId: byId,
    indexOf: indexOf,
    add: add,
    remove: remove
  };

}(document, slangbook);
!function (doc, app) {

  var BASE_URL = '/api/phrases';


  function request(options, cb) {
    var request, url, method;

    request = new XMLHttpRequest();
    url = options.id ? BASE_URL +'/'+options.id : BASE_URL;
    method = options.method.toUpperCase();

    request.open(method, url, true);

    if (method == 'POST' || method == 'PUT') {
      request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    }

    request.onload = function () {
      if (request.status >= 200 && request.status < 400) {
        cb(request.responseText ? JSON.parse(request.responseText): undefined);
      } else {
        request.onerror(request.statusText);
      }
    };

    request.onerror = function (msg) {
      app.list.reload();
      err(msg, options.action, options.name);
    };

    request.send(JSON.stringify(options.data));
  }

  function err(msg, action, phrase) {
    console.log('ERROR at: '+action+' "'+phrase+'" : ',  msg);
    alert('Sorry, something went wrong while trying to '+action+' '+phrase+'. Try again.');
  }



  app.request = request;

}(document, slangbook);
!function (doc, app) {


  function go(url) {
    history.pushState(null, null, url);
    handleRoute(true);
  }

  function handleRoute (animate) {
    var url, match;

    url = location.pathname;

    // /
    if (url.match(/^\/?$/)) {
      app.edit.close(animate);
      app.main.open(animate);
    }
    // /add
    else if (url.match(/^\/add\/?$/)) {
      app.main.close(animate);
      app.edit.open(animate);
    }
    // /edit:id
    else if (match = url.match(/^\/edit\/([0-9]+)\/?$/)) {
      app.main.close(animate);
      app.edit.open(animate, match[1]);
    }
    // /*
    else {
      go('/');
    }
  };


  doc.body.addEventListener('click', function (e) {
    if (e.target && e.target.nodeName == 'A') {
      e.preventDefault();
      go(e.target.getAttribute('href'));
    }
  }, true);

  doc.addEventListener('DOMContentLoaded', function() {
    handleRoute(false);
  });

  window.onpopstate = function() {
    handleRoute(false);
  };



  app.router = {
    go: go
  };

}(document, slangbook);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsIm1vZHVsZXMvYXNpZGUuanMiLCJtb2R1bGVzL2VkaXQuanMiLCJtb2R1bGVzL2xpc3QuanMiLCJtb2R1bGVzL21haW4uanMiLCJtb2R1bGVzL3BocmFzZS5qcyIsIm1vZHVsZXMvcmVxdWVzdC5qcyIsIm1vZHVsZXMvcm91dGVyLmpzIiwibW9kdWxlcy9zZWFyY2guanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoicHVibGljL2J1aWxkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIWZ1bmN0aW9uIChkb2MpIHtcblxuXG4gIHdpbmRvdy5zbGFuZ2Jvb2sgPSB7fTtcblxuICBkb2MuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uKCkge1xuICAgIGRvYy5ib2R5LnN0eWxlLm9wYWNpdHkgPSAxO1xuICB9KTtcblxufShkb2N1bWVudCk7IiwiIWZ1bmN0aW9uIChkb2MsIGFwcCkge1xuXG4gIHZhciBlbDtcblxuXG4gIGVsID0gZG9jLnF1ZXJ5U2VsZWN0b3IoJyNtYWluIGFzaWRlJyk7XG5cbiAgZnVuY3Rpb24gZm9jdXMoKSB7XG4gICAgZWwuY2xhc3NMaXN0LmFkZCgnZm9jdXMnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGJsdXIoKSB7XG4gICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZm9jdXMnKTtcbiAgfVxuXG5cblxuICBhcHAuYXNpZGUgPSB7XG4gICAgZm9jdXM6IGZvY3VzLFxuICAgIGJsdXI6IGJsdXJcbiAgfTtcblxufShkb2N1bWVudCwgc2xhbmdib29rKTsiLCIhZnVuY3Rpb24gKGRvYywgYXBwKSB7XG5cbiAgdmFyIGVsLCBmb3JtLCBwaHJhc2UsIGxhbmcxLCBsYW5nMiwgdGFncztcblxuXG4gIGVsICAgICA9IGRvYy5nZXRFbGVtZW50QnlJZCgnZWRpdCcpO1xuICBmb3JtICAgPSBlbC5xdWVyeVNlbGVjdG9yKCdmb3JtJyk7XG4gIGxhbmcxICA9IGZvcm0ucXVlcnlTZWxlY3RvcignLmxhbmcxJyk7XG4gIGxhbmcyICA9IGZvcm0ucXVlcnlTZWxlY3RvcignLmxhbmcyJyk7XG4gIHRhZ3MgICA9IGZvcm0ucXVlcnlTZWxlY3RvcignLnRhZ3MnKTtcbiAgYnV0dG9uID0gZWwucXVlcnlTZWxlY3RvcignLmRlc3Ryb3knKTtcblxuXG4gIGZ1bmN0aW9uIG9wZW4oYW5pbWF0ZSwgaWQpIHtcbiAgICBpZCA/IGxvYWQoaWQpIDogZW1wdHkoKTtcblxuICAgIGxhbmcxLnZhbHVlID0gcGhyYXNlLmxhbmcxO1xuICAgIGxhbmcyLnZhbHVlID0gcGhyYXNlLmxhbmcyO1xuICAgIHRhZ3MudmFsdWUgID0gcGhyYXNlLnRhZ3M7XG5cbiAgICBlbC5jbGFzc0xpc3RbYW5pbWF0ZSA/ICdhZGQnIDogJ3JlbW92ZSddKCdhbmltYXRlJyk7XG4gICAgZWwuY2xhc3NMaXN0LmFkZCgnc2hvdycpO1xuICB9XG5cbiAgZnVuY3Rpb24gY2xvc2UoYW5pbWF0ZSkge1xuICAgIGVsLmNsYXNzTGlzdFthbmltYXRlID8gJ2FkZCcgOiAncmVtb3ZlJ10oJ2FuaW1hdGUnKTtcbiAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdzaG93Jyk7XG4gIH1cblxuICBmdW5jdGlvbiBsb2FkKGlkKSB7XG4gICAgcGhyYXNlID0gYXBwLnBocmFzZS5ieUlkKGlkKTtcbiAgICBpZiAoIXBocmFzZSkgYXBwLnJvdXRlci5nbygnLycpO1xuICAgIGJ1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4gIH1cblxuICBmdW5jdGlvbiBlbXB0eSgpIHtcbiAgICBwaHJhc2UgPSB7XG4gICAgICBsYW5nMTogJycsXG4gICAgICBsYW5nMjogJycsXG4gICAgICB0YWdzOiAgJydcbiAgICB9O1xuICAgIGJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gIH1cblxuICBmdW5jdGlvbiBsb2FkRnJvbURPTSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbGFuZzE6IGxhbmcxLnZhbHVlLFxuICAgICAgbGFuZzI6IGxhbmcyLnZhbHVlLFxuICAgICAgdGFnczogIHRhZ3MudmFsdWVcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gZ29Ib21lKCkge1xuICAgIGxhbmcxLmJsdXIoKTsgbGFuZzIuYmx1cigpOyB0YWdzLmJsdXIoKTtcbiAgICBhcHAucm91dGVyLmdvKCcvJyk7XG4gIH1cblxuICBmdW5jdGlvbiBleHRlbmQoc291cmNlLCB0YXJnZXQpIHtcbiAgICBPYmplY3Qua2V5cyh0YXJnZXQpLmZvckVhY2goZnVuY3Rpb24gKHByb3ApIHtcbiAgICAgIHNvdXJjZVtwcm9wXSA9IHRhcmdldFtwcm9wXTtcbiAgICB9KVxuICAgIHJldHVybiBzb3VyY2U7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGUoKSB7XG4gICAgZXh0ZW5kKHBocmFzZSwgbG9hZEZyb21ET00oKSk7XG4gICAgYXBwLnJlcXVlc3Qoe1xuICAgICAgbWV0aG9kOiAncG9zdCcsXG4gICAgICBkYXRhOiBwaHJhc2UsXG4gICAgICBuYW1lOiBwaHJhc2UubGFuZzEsXG4gICAgICBhY3Rpb246ICdjcmVhdGUnXG4gICAgfSwgZnVuY3Rpb24gKHJlcykge1xuICAgICAgcGhyYXNlLmlkID0gcmVzLmlkO1xuICAgICAgYXBwLnBocmFzZS5hZGQocGhyYXNlKTtcbiAgICAgIGFwcC5saXN0LnVwZGF0ZUxpbmsocGhyYXNlKTtcbiAgICB9KTtcblxuICAgIGFwcC5saXN0LmFkZChwaHJhc2UpO1xuICAgIGdvSG9tZSgpO1xuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgIHZhciBwaHJhc2VVcGRhdGUgPSBleHRlbmQoZXh0ZW5kKHt9LCBwaHJhc2UpLCBsb2FkRnJvbURPTSgpKTtcbiAgICBhcHAucmVxdWVzdCh7XG4gICAgICBtZXRob2Q6ICdwdXQnLFxuICAgICAgaWQ6IHBocmFzZVVwZGF0ZS5pZCxcbiAgICAgIGRhdGE6IHBocmFzZVVwZGF0ZSxcbiAgICAgIG5hbWU6IHBocmFzZVVwZGF0ZS5sYW5nMSxcbiAgICAgIGFjdGlvbjogJ3VwZGF0ZSdcbiAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICBleHRlbmQocGhyYXNlLCBwaHJhc2VVcGRhdGUpO1xuICAgIH0pO1xuXG4gICAgYXBwLmxpc3QudXBkYXRlKHBocmFzZSwgcGhyYXNlVXBkYXRlKTtcbiAgICBnb0hvbWUoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gICAgaWYgKCFjb25maXJtKCdZb3UgcmVhbGx5IHdhbnQgdG8gZGVsZXRlIHRoaXMgcGhyYXNlPycpKSByZXR1cm47XG5cbiAgICBhcHAucmVxdWVzdCh7XG4gICAgICBtZXRob2Q6ICdkZWxldGUnLFxuICAgICAgaWQ6IHBocmFzZS5pZCxcbiAgICAgIG5hbWU6IHBocmFzZS5sYW5nMSxcbiAgICAgIGFjdGlvbjogJ2RlbGV0ZSdcbiAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICBhcHAucGhyYXNlLnJlbW92ZShwaHJhc2UpO1xuICAgIH0pO1xuXG4gICAgYXBwLmxpc3QucmVtb3ZlKHBocmFzZSk7XG4gICAgZ29Ib21lKCk7XG4gIH1cblxuICB2YXIgc3VibWl0QmxvY2tlZCA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRvZ2dsZSA9IGZhbHNlO1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodG9nZ2xlKSByZXR1cm4gdHJ1ZTtcbiAgICAgIHRvZ2dsZSA9IHRydWU7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdG9nZ2xlID0gZmFsc2U7XG4gICAgICB9LCAzMDAwKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuICB9KSgpO1xuXG4gIGZvcm0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgZnVuY3Rpb24gKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgaWYgKHN1Ym1pdEJsb2NrZWQoKSkgcmV0dXJuO1xuICAgIHBocmFzZS5pZCA/IHVwZGF0ZSgpIDogY3JlYXRlKCk7XG4gIH0pO1xuXG4gIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGRlc3Ryb3koKTtcbiAgfSk7XG5cblxuXG4gIGFwcC5lZGl0ID0ge1xuICAgIG9wZW46IG9wZW4sXG4gICAgY2xvc2U6IGNsb3NlXG4gIH07XG5cbn0oZG9jdW1lbnQsIHNsYW5nYm9vayk7IiwiIWZ1bmN0aW9uIChkb2MsIGFwcCkge1xuXG4gIHZhciBlbCwgYmFzZUl0ZW0sIGl0ZW1zO1xuXG5cbiAgZWwgPSBkb2MuZ2V0RWxlbWVudEJ5SWQoJ3BocmFzZXMnKTtcbiAgYmFzZUl0ZW0gPSBlbC5yZW1vdmVDaGlsZChlbC5xdWVyeVNlbGVjdG9yKCdsaScpKTtcbiAgaXRlbXMgPSBlbC5jaGlsZHJlbjtcblxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUl0ZW0ocGhyYXNlKSB7XG4gICAgdmFyIGl0ZW0gPSBiYXNlSXRlbS5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgdXBkYXRlSXRlbShpdGVtLCBwaHJhc2UpO1xuICAgIHJldHVybiBpdGVtO1xuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlSXRlbShpdGVtLCBwaHJhc2UpIHtcbiAgICB2YXIgcGFyYWdyYXBocyA9IGl0ZW0uZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3AnKTtcbiAgICBwYXJhZ3JhcGhzWzBdLnRleHRDb250ZW50ID0gcGhyYXNlLmxhbmcxO1xuICAgIHBhcmFncmFwaHNbMV0udGV4dENvbnRlbnQgPSBwaHJhc2UubGFuZzI7XG4gICAgc2V0TGluayhpdGVtLCBwaHJhc2UpO1xuICB9XG5cbiAgZnVuY3Rpb24gc2V0TGluayhpdGVtLCBwaHJhc2UpIHtcbiAgICBpdGVtLnF1ZXJ5U2VsZWN0b3IoJ2EnKS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCAnL2VkaXQvJyArIHBocmFzZS5pZCk7XG4gIH1cblxuICBmdW5jdGlvbiBhZGQocGhyYXNlKSB7XG4gICAgZWwuaW5zZXJ0QmVmb3JlKGNyZWF0ZUl0ZW0ocGhyYXNlKSwgZWwuZmlyc3RDaGlsZCk7XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVMaW5rKHBocmFzZSkge1xuICAgIHZhciBpbmRleCA9IGFwcC5waHJhc2UuaW5kZXhPZihwaHJhc2UpO1xuICAgIHNldExpbmsoZWwuY2hpbGRyZW5baW5kZXhdLCBwaHJhc2UpO1xuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlKG9sZFBocmFzZSwgbmV3UGhyYXNlKSB7XG4gICAgdmFyIGluZGV4ID0gYXBwLnBocmFzZS5pbmRleE9mKG9sZFBocmFzZSk7XG4gICAgdXBkYXRlSXRlbShlbC5jaGlsZHJlbltpbmRleF0sIG5ld1BocmFzZSk7XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmUocGhyYXNlKSB7XG4gICAgdmFyIGluZGV4ID0gYXBwLnBocmFzZS5pbmRleE9mKHBocmFzZSk7XG4gICAgZWwucmVtb3ZlQ2hpbGQoZWwuY2hpbGRyZW5baW5kZXhdKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGxvYWQoKSB7XG4gICAgdmFyIGl0ZW1Db250YWluZXIgPSBkb2MuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgIGFwcC5waHJhc2UuZm9yRWFjaChmdW5jdGlvbiAocGhyYXNlKSB7XG4gICAgICBpdGVtQ29udGFpbmVyLmFwcGVuZENoaWxkKCBjcmVhdGVJdGVtKHBocmFzZSkgKTtcbiAgICB9KTtcbiAgICBlbC5hcHBlbmRDaGlsZChpdGVtQ29udGFpbmVyKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbG9hZCgpIHtcbiAgICBlbC5pbm5lckhUTUwgPSAnJztcbiAgICBsb2FkKCk7XG4gIH1cblxuXG4gIGRvYy5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgbG9hZCk7XG5cblxuXG4gIGFwcC5saXN0ID0ge1xuICAgIGl0ZW1zOiBpdGVtcyxcbiAgICBhZGQ6IGFkZCxcbiAgICB1cGRhdGU6IHVwZGF0ZSxcbiAgICByZW1vdmU6IHJlbW92ZSxcbiAgICByZWxvYWQ6IHJlbG9hZCxcbiAgICB1cGRhdGVMaW5rOiB1cGRhdGVMaW5rXG4gIH07XG5cbn0oZG9jdW1lbnQsIHNsYW5nYm9vayk7IiwiIWZ1bmN0aW9uIChkb2MsIGFwcCkge1xuXG4gIHZhciBlbDtcblxuXG4gIGVsID0gZG9jLmdldEVsZW1lbnRCeUlkKCdtYWluJyk7XG5cbiAgZnVuY3Rpb24gb3BlbihhbmltYXRlKSB7XG4gICAgZWwuY2xhc3NMaXN0W2FuaW1hdGUgPyAnYWRkJyA6ICdyZW1vdmUnXSgnYW5pbWF0ZScpO1xuICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNsb3NlKGFuaW1hdGUpIHtcbiAgICBlbC5jbGFzc0xpc3RbYW5pbWF0ZSA/ICdhZGQnIDogJ3JlbW92ZSddKCdhbmltYXRlJyk7XG4gICAgZWwuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICB9XG5cblxuXG4gIGFwcC5tYWluID0ge1xuICAgIG9wZW46IG9wZW4sXG4gICAgY2xvc2U6IGNsb3NlXG4gIH07XG5cbn0oZG9jdW1lbnQsIHNsYW5nYm9vayk7IiwiIWZ1bmN0aW9uIChkb2MsIGFwcCkge1xuXG4gIHZhciBkYXRhO1xuXG4gIGRhdGEgPSB3aW5kb3cucGhyYXNlcztcblxuXG4gIGZ1bmN0aW9uIGZvckVhY2goZm4pIHtcbiAgICBkYXRhLmZvckVhY2goZm4pO1xuICB9XG5cbiAgZnVuY3Rpb24gcXVlcnlNYXRjaGVzRm9ySW5kZXgoaW5kZXgsIHF1ZXJ5KSB7XG4gICAgdmFyIHBocmFzZSwgaSwgcHJvcHM7XG5cbiAgICBwaHJhc2UgPSBkYXRhW2luZGV4XTtcbiAgICBwcm9wcyA9IE9iamVjdC5rZXlzKHBocmFzZSk7XG4gICAgZm9yIChpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoIHF1ZXJ5LnRlc3QocGhyYXNlW3Byb3BzW2ldXSkgKSByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZnVuY3Rpb24gYnlJZChpZCkge1xuICAgIHZhciBpLCBwaHJhc2U7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgcGhyYXNlID0gZGF0YVtpXTtcbiAgICAgIGlmIChwaHJhc2UuaWQgPT0gaWQpIHJldHVybiBwaHJhc2U7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaW5kZXhPZihwaHJhc2UpIHtcbiAgICByZXR1cm4gZGF0YS5pbmRleE9mKHBocmFzZSk7XG4gIH1cblxuICBmdW5jdGlvbiBhZGQocGhyYXNlKSB7XG4gICAgZGF0YS51bnNoaWZ0KHBocmFzZSk7XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmUocGhyYXNlKSB7XG4gICAgdmFyIGluZGV4ID0gZGF0YS5pbmRleE9mKHBocmFzZSk7XG4gICAgZGF0YS5zcGxpY2UoaW5kZXgsIDEpO1xuICB9XG5cblxuICBhcHAucGhyYXNlID0ge1xuICAgIGZvckVhY2g6IGZvckVhY2gsXG4gICAgbWF0Y2g6IHF1ZXJ5TWF0Y2hlc0ZvckluZGV4LFxuICAgIGJ5SWQ6IGJ5SWQsXG4gICAgaW5kZXhPZjogaW5kZXhPZixcbiAgICBhZGQ6IGFkZCxcbiAgICByZW1vdmU6IHJlbW92ZVxuICB9O1xuXG59KGRvY3VtZW50LCBzbGFuZ2Jvb2spOyIsIiFmdW5jdGlvbiAoZG9jLCBhcHApIHtcblxuICB2YXIgQkFTRV9VUkwgPSAnL2FwaS9waHJhc2VzJztcblxuXG4gIGZ1bmN0aW9uIHJlcXVlc3Qob3B0aW9ucywgY2IpIHtcbiAgICB2YXIgcmVxdWVzdCwgdXJsLCBtZXRob2Q7XG5cbiAgICByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgdXJsID0gb3B0aW9ucy5pZCA/IEJBU0VfVVJMICsnLycrb3B0aW9ucy5pZCA6IEJBU0VfVVJMO1xuICAgIG1ldGhvZCA9IG9wdGlvbnMubWV0aG9kLnRvVXBwZXJDYXNlKCk7XG5cbiAgICByZXF1ZXN0Lm9wZW4obWV0aG9kLCB1cmwsIHRydWUpO1xuXG4gICAgaWYgKG1ldGhvZCA9PSAnUE9TVCcgfHwgbWV0aG9kID09ICdQVVQnKSB7XG4gICAgICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7IGNoYXJzZXQ9VVRGLTgnKTtcbiAgICB9XG5cbiAgICByZXF1ZXN0Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChyZXF1ZXN0LnN0YXR1cyA+PSAyMDAgJiYgcmVxdWVzdC5zdGF0dXMgPCA0MDApIHtcbiAgICAgICAgY2IocmVxdWVzdC5yZXNwb25zZVRleHQgPyBKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2VUZXh0KTogdW5kZWZpbmVkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcXVlc3Qub25lcnJvcihyZXF1ZXN0LnN0YXR1c1RleHQpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbiAobXNnKSB7XG4gICAgICBhcHAubGlzdC5yZWxvYWQoKTtcbiAgICAgIGVycihtc2csIG9wdGlvbnMuYWN0aW9uLCBvcHRpb25zLm5hbWUpO1xuICAgIH07XG5cbiAgICByZXF1ZXN0LnNlbmQoSlNPTi5zdHJpbmdpZnkob3B0aW9ucy5kYXRhKSk7XG4gIH1cblxuICBmdW5jdGlvbiBlcnIobXNnLCBhY3Rpb24sIHBocmFzZSkge1xuICAgIGNvbnNvbGUubG9nKCdFUlJPUiBhdDogJythY3Rpb24rJyBcIicrcGhyYXNlKydcIiA6ICcsICBtc2cpO1xuICAgIGFsZXJ0KCdTb3JyeSwgc29tZXRoaW5nIHdlbnQgd3Jvbmcgd2hpbGUgdHJ5aW5nIHRvICcrYWN0aW9uKycgJytwaHJhc2UrJy4gVHJ5IGFnYWluLicpO1xuICB9XG5cblxuXG4gIGFwcC5yZXF1ZXN0ID0gcmVxdWVzdDtcblxufShkb2N1bWVudCwgc2xhbmdib29rKTsiLCIhZnVuY3Rpb24gKGRvYywgYXBwKSB7XG5cblxuICBmdW5jdGlvbiBnbyh1cmwpIHtcbiAgICBoaXN0b3J5LnB1c2hTdGF0ZShudWxsLCBudWxsLCB1cmwpO1xuICAgIGhhbmRsZVJvdXRlKHRydWUpO1xuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlUm91dGUgKGFuaW1hdGUpIHtcbiAgICB2YXIgdXJsLCBtYXRjaDtcblxuICAgIHVybCA9IGxvY2F0aW9uLnBhdGhuYW1lO1xuXG4gICAgLy8gL1xuICAgIGlmICh1cmwubWF0Y2goL15cXC8/JC8pKSB7XG4gICAgICBhcHAuZWRpdC5jbG9zZShhbmltYXRlKTtcbiAgICAgIGFwcC5tYWluLm9wZW4oYW5pbWF0ZSk7XG4gICAgfVxuICAgIC8vIC9hZGRcbiAgICBlbHNlIGlmICh1cmwubWF0Y2goL15cXC9hZGRcXC8/JC8pKSB7XG4gICAgICBhcHAubWFpbi5jbG9zZShhbmltYXRlKTtcbiAgICAgIGFwcC5lZGl0Lm9wZW4oYW5pbWF0ZSk7XG4gICAgfVxuICAgIC8vIC9lZGl0OmlkXG4gICAgZWxzZSBpZiAobWF0Y2ggPSB1cmwubWF0Y2goL15cXC9lZGl0XFwvKFswLTldKylcXC8/JC8pKSB7XG4gICAgICBhcHAubWFpbi5jbG9zZShhbmltYXRlKTtcbiAgICAgIGFwcC5lZGl0Lm9wZW4oYW5pbWF0ZSwgbWF0Y2hbMV0pO1xuICAgIH1cbiAgICAvLyAvKlxuICAgIGVsc2Uge1xuICAgICAgZ28oJy8nKTtcbiAgICB9XG4gIH07XG5cblxuICBkb2MuYm9keS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgaWYgKGUudGFyZ2V0ICYmIGUudGFyZ2V0Lm5vZGVOYW1lID09ICdBJykge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgZ28oZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdocmVmJykpO1xuICAgIH1cbiAgfSwgdHJ1ZSk7XG5cbiAgZG9jLmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbigpIHtcbiAgICBoYW5kbGVSb3V0ZShmYWxzZSk7XG4gIH0pO1xuXG4gIHdpbmRvdy5vbnBvcHN0YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgaGFuZGxlUm91dGUoZmFsc2UpO1xuICB9O1xuXG5cblxuICBhcHAucm91dGVyID0ge1xuICAgIGdvOiBnb1xuICB9O1xuXG59KGRvY3VtZW50LCBzbGFuZ2Jvb2spOyIsIiFmdW5jdGlvbiAoZG9jLCBhcHApIHtcblxuICB2YXIgZWw7XG5cbiAgZWwgPSBkb2MuZ2V0RWxlbWVudEJ5SWQoJ3NlYXJjaCcpO1xuXG4gIGZ1bmN0aW9uIGZpbHRlclBocmFzZXMoKSB7XG4gICAgdmFyIGksIGZpbHRlciwgaXRlbTtcblxuICAgIGZpbHRlciA9IG5ldyBSZWdFeHAoZXNjYXBlUmVnRXhwKGVsLnZhbHVlKSwgJ2knKTtcblxuICAgIGZvciAoaSA9IDA7IGkgPCBhcHAubGlzdC5pdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgaXRlbSA9IGFwcC5saXN0Lml0ZW1zW2ldO1xuICAgICAgaXRlbS5zdHlsZS5kaXNwbGF5ID0gYXBwLnBocmFzZS5tYXRjaChpLCBmaWx0ZXIpID8gJycgOiAnbm9uZSc7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc2hvd0FsbCgpIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgYXBwLmxpc3QuaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFwcC5saXN0Lml0ZW1zW2ldLnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBlc2NhcGVSZWdFeHAoc3RyKSB7XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKC9bXFwtXFxbXFxdXFwvXFx7XFx9XFwoXFwpXFwqXFwrXFw/XFwuXFxcXFxcXlxcJFxcfF0vZywgXCJcXFxcJCZcIik7XG4gIH1cblxuXG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgZnVuY3Rpb24gKGUpIHtcbiAgICBhcHAuYXNpZGUuZm9jdXMoKTtcblxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgZWwuc2V0U2VsZWN0aW9uUmFuZ2UoMCwgZWwudmFsdWUubGVuZ3RoKTtcbiAgICB9LCAwKTtcbiAgfSk7XG5cbiAgZWwuYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsIGFwcC5hc2lkZS5ibHVyKTtcblxuICBlbC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgLy8gZW50ZXIgb3IgZXNjYXBlXG4gICAgaWYgKGUua2V5Q29kZSA9PSAxMyB8fCBlLmtleUNvZGUgPT0gMjcpIHtcbiAgICAgIGVsLmJsdXIoKTtcbiAgICB9XG4gIH0pO1xuXG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgZnVuY3Rpb24gKCkge1xuICAgIGVsLnZhbHVlID8gZmlsdGVyUGhyYXNlcygpIDogc2hvd0FsbCgpO1xuICB9KTtcblxufShkb2N1bWVudCwgc2xhbmdib29rKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=