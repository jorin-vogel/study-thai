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
      el.select();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsIm1vZHVsZXMvYXNpZGUuanMiLCJtb2R1bGVzL2VkaXQuanMiLCJtb2R1bGVzL2xpc3QuanMiLCJtb2R1bGVzL21haW4uanMiLCJtb2R1bGVzL3BocmFzZS5qcyIsIm1vZHVsZXMvcmVxdWVzdC5qcyIsIm1vZHVsZXMvcm91dGVyLmpzIiwibW9kdWxlcy9zZWFyY2guanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoicHVibGljL2J1aWxkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIWZ1bmN0aW9uIChkb2MpIHtcblxuXG4gIHdpbmRvdy5zbGFuZ2Jvb2sgPSB7fTtcblxuICBkb2MuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uKCkge1xuICAgIGRvYy5ib2R5LnN0eWxlLm9wYWNpdHkgPSAxO1xuICB9KTtcblxufShkb2N1bWVudCk7IiwiIWZ1bmN0aW9uIChkb2MsIGFwcCkge1xuXG4gIHZhciBlbDtcblxuXG4gIGVsID0gZG9jLnF1ZXJ5U2VsZWN0b3IoJyNtYWluIGFzaWRlJyk7XG5cbiAgZnVuY3Rpb24gZm9jdXMoKSB7XG4gICAgZWwuY2xhc3NMaXN0LmFkZCgnZm9jdXMnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGJsdXIoKSB7XG4gICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZm9jdXMnKTtcbiAgfVxuXG5cblxuICBhcHAuYXNpZGUgPSB7XG4gICAgZm9jdXM6IGZvY3VzLFxuICAgIGJsdXI6IGJsdXJcbiAgfTtcblxufShkb2N1bWVudCwgc2xhbmdib29rKTsiLCIhZnVuY3Rpb24gKGRvYywgYXBwKSB7XG5cbiAgdmFyIGVsLCBmb3JtLCBwaHJhc2UsIGxhbmcxLCBsYW5nMiwgdGFncztcblxuXG4gIGVsICAgICA9IGRvYy5nZXRFbGVtZW50QnlJZCgnZWRpdCcpO1xuICBmb3JtICAgPSBlbC5xdWVyeVNlbGVjdG9yKCdmb3JtJyk7XG4gIGxhbmcxICA9IGZvcm0ucXVlcnlTZWxlY3RvcignLmxhbmcxJyk7XG4gIGxhbmcyICA9IGZvcm0ucXVlcnlTZWxlY3RvcignLmxhbmcyJyk7XG4gIHRhZ3MgICA9IGZvcm0ucXVlcnlTZWxlY3RvcignLnRhZ3MnKTtcbiAgYnV0dG9uID0gZWwucXVlcnlTZWxlY3RvcignLmRlc3Ryb3knKTtcblxuXG4gIGZ1bmN0aW9uIG9wZW4oYW5pbWF0ZSwgaWQpIHtcbiAgICBpZCA/IGxvYWQoaWQpIDogZW1wdHkoKTtcblxuICAgIGxhbmcxLnZhbHVlID0gcGhyYXNlLmxhbmcxO1xuICAgIGxhbmcyLnZhbHVlID0gcGhyYXNlLmxhbmcyO1xuICAgIHRhZ3MudmFsdWUgID0gcGhyYXNlLnRhZ3M7XG5cbiAgICBlbC5jbGFzc0xpc3RbYW5pbWF0ZSA/ICdhZGQnIDogJ3JlbW92ZSddKCdhbmltYXRlJyk7XG4gICAgZWwuY2xhc3NMaXN0LmFkZCgnc2hvdycpO1xuICB9XG5cbiAgZnVuY3Rpb24gY2xvc2UoYW5pbWF0ZSkge1xuICAgIGVsLmNsYXNzTGlzdFthbmltYXRlID8gJ2FkZCcgOiAncmVtb3ZlJ10oJ2FuaW1hdGUnKTtcbiAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdzaG93Jyk7XG4gIH1cblxuICBmdW5jdGlvbiBsb2FkKGlkKSB7XG4gICAgcGhyYXNlID0gYXBwLnBocmFzZS5ieUlkKGlkKTtcbiAgICBpZiAoIXBocmFzZSkgYXBwLnJvdXRlci5nbygnLycpO1xuICAgIGJ1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4gIH1cblxuICBmdW5jdGlvbiBlbXB0eSgpIHtcbiAgICBwaHJhc2UgPSB7XG4gICAgICBsYW5nMTogJycsXG4gICAgICBsYW5nMjogJycsXG4gICAgICB0YWdzOiAgJydcbiAgICB9O1xuICAgIGJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gIH1cblxuICBmdW5jdGlvbiBsb2FkRnJvbURPTSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbGFuZzE6IGxhbmcxLnZhbHVlLFxuICAgICAgbGFuZzI6IGxhbmcyLnZhbHVlLFxuICAgICAgdGFnczogIHRhZ3MudmFsdWVcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gZ29Ib21lKCkge1xuICAgIGxhbmcxLmJsdXIoKTsgbGFuZzIuYmx1cigpOyB0YWdzLmJsdXIoKTtcbiAgICBhcHAucm91dGVyLmdvKCcvJyk7XG4gIH1cblxuICBmdW5jdGlvbiBleHRlbmQoc291cmNlLCB0YXJnZXQpIHtcbiAgICBPYmplY3Qua2V5cyh0YXJnZXQpLmZvckVhY2goZnVuY3Rpb24gKHByb3ApIHtcbiAgICAgIHNvdXJjZVtwcm9wXSA9IHRhcmdldFtwcm9wXTtcbiAgICB9KVxuICAgIHJldHVybiBzb3VyY2U7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGUoKSB7XG4gICAgZXh0ZW5kKHBocmFzZSwgbG9hZEZyb21ET00oKSk7XG4gICAgYXBwLnJlcXVlc3Qoe1xuICAgICAgbWV0aG9kOiAncG9zdCcsXG4gICAgICBkYXRhOiBwaHJhc2UsXG4gICAgICBuYW1lOiBwaHJhc2UubGFuZzEsXG4gICAgICBhY3Rpb246ICdjcmVhdGUnXG4gICAgfSwgZnVuY3Rpb24gKHJlcykge1xuICAgICAgcGhyYXNlLmlkID0gcmVzLmlkO1xuICAgICAgYXBwLnBocmFzZS5hZGQocGhyYXNlKTtcbiAgICAgIGFwcC5saXN0LnVwZGF0ZUxpbmsocGhyYXNlKTtcbiAgICB9KTtcblxuICAgIGFwcC5saXN0LmFkZChwaHJhc2UpO1xuICAgIGdvSG9tZSgpO1xuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgIHZhciBwaHJhc2VVcGRhdGUgPSBleHRlbmQoZXh0ZW5kKHt9LCBwaHJhc2UpLCBsb2FkRnJvbURPTSgpKTtcbiAgICBhcHAucmVxdWVzdCh7XG4gICAgICBtZXRob2Q6ICdwdXQnLFxuICAgICAgaWQ6IHBocmFzZVVwZGF0ZS5pZCxcbiAgICAgIGRhdGE6IHBocmFzZVVwZGF0ZSxcbiAgICAgIG5hbWU6IHBocmFzZVVwZGF0ZS5sYW5nMSxcbiAgICAgIGFjdGlvbjogJ3VwZGF0ZSdcbiAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICBleHRlbmQocGhyYXNlLCBwaHJhc2VVcGRhdGUpO1xuICAgIH0pO1xuXG4gICAgYXBwLmxpc3QudXBkYXRlKHBocmFzZSwgcGhyYXNlVXBkYXRlKTtcbiAgICBnb0hvbWUoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gICAgaWYgKCFjb25maXJtKCdZb3UgcmVhbGx5IHdhbnQgdG8gZGVsZXRlIHRoaXMgcGhyYXNlPycpKSByZXR1cm47XG5cbiAgICBhcHAucmVxdWVzdCh7XG4gICAgICBtZXRob2Q6ICdkZWxldGUnLFxuICAgICAgaWQ6IHBocmFzZS5pZCxcbiAgICAgIG5hbWU6IHBocmFzZS5sYW5nMSxcbiAgICAgIGFjdGlvbjogJ2RlbGV0ZSdcbiAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICBhcHAucGhyYXNlLnJlbW92ZShwaHJhc2UpO1xuICAgIH0pO1xuXG4gICAgYXBwLmxpc3QucmVtb3ZlKHBocmFzZSk7XG4gICAgZ29Ib21lKCk7XG4gIH1cblxuXG4gIGZvcm0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgZnVuY3Rpb24gKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgcGhyYXNlLmlkID8gdXBkYXRlKCkgOiBjcmVhdGUoKTtcbiAgfSk7XG5cbiAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgZGVzdHJveSgpO1xuICB9KTtcblxuXG5cbiAgYXBwLmVkaXQgPSB7XG4gICAgb3Blbjogb3BlbixcbiAgICBjbG9zZTogY2xvc2VcbiAgfTtcblxufShkb2N1bWVudCwgc2xhbmdib29rKTsiLCIhZnVuY3Rpb24gKGRvYywgYXBwKSB7XG5cbiAgdmFyIGVsLCBiYXNlSXRlbSwgaXRlbXM7XG5cblxuICBlbCA9IGRvYy5nZXRFbGVtZW50QnlJZCgncGhyYXNlcycpO1xuICBiYXNlSXRlbSA9IGVsLnJlbW92ZUNoaWxkKGVsLnF1ZXJ5U2VsZWN0b3IoJ2xpJykpO1xuICBpdGVtcyA9IGVsLmNoaWxkcmVuO1xuXG5cbiAgZnVuY3Rpb24gY3JlYXRlSXRlbShwaHJhc2UpIHtcbiAgICB2YXIgaXRlbSA9IGJhc2VJdGVtLmNsb25lTm9kZSh0cnVlKTtcbiAgICB1cGRhdGVJdGVtKGl0ZW0sIHBocmFzZSk7XG4gICAgcmV0dXJuIGl0ZW07XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVJdGVtKGl0ZW0sIHBocmFzZSkge1xuICAgIHZhciBwYXJhZ3JhcGhzID0gaXRlbS5nZXRFbGVtZW50c0J5VGFnTmFtZSgncCcpO1xuICAgIHBhcmFncmFwaHNbMF0udGV4dENvbnRlbnQgPSBwaHJhc2UubGFuZzE7XG4gICAgcGFyYWdyYXBoc1sxXS50ZXh0Q29udGVudCA9IHBocmFzZS5sYW5nMjtcbiAgICBzZXRMaW5rKGl0ZW0sIHBocmFzZSk7XG4gIH1cblxuICBmdW5jdGlvbiBzZXRMaW5rKGl0ZW0sIHBocmFzZSkge1xuICAgIGl0ZW0ucXVlcnlTZWxlY3RvcignYScpLnNldEF0dHJpYnV0ZSgnaHJlZicsICcvZWRpdC8nICsgcGhyYXNlLmlkKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZChwaHJhc2UpIHtcbiAgICBlbC5pbnNlcnRCZWZvcmUoY3JlYXRlSXRlbShwaHJhc2UpLCBlbC5maXJzdENoaWxkKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZUxpbmsocGhyYXNlKSB7XG4gICAgdmFyIGluZGV4ID0gYXBwLnBocmFzZS5pbmRleE9mKHBocmFzZSk7XG4gICAgc2V0TGluayhlbC5jaGlsZHJlbltpbmRleF0sIHBocmFzZSk7XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGUob2xkUGhyYXNlLCBuZXdQaHJhc2UpIHtcbiAgICB2YXIgaW5kZXggPSBhcHAucGhyYXNlLmluZGV4T2Yob2xkUGhyYXNlKTtcbiAgICB1cGRhdGVJdGVtKGVsLmNoaWxkcmVuW2luZGV4XSwgbmV3UGhyYXNlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZShwaHJhc2UpIHtcbiAgICB2YXIgaW5kZXggPSBhcHAucGhyYXNlLmluZGV4T2YocGhyYXNlKTtcbiAgICBlbC5yZW1vdmVDaGlsZChlbC5jaGlsZHJlbltpbmRleF0pO1xuICB9XG5cbiAgZnVuY3Rpb24gbG9hZCgpIHtcbiAgICB2YXIgaXRlbUNvbnRhaW5lciA9IGRvYy5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgYXBwLnBocmFzZS5mb3JFYWNoKGZ1bmN0aW9uIChwaHJhc2UpIHtcbiAgICAgIGl0ZW1Db250YWluZXIuYXBwZW5kQ2hpbGQoIGNyZWF0ZUl0ZW0ocGhyYXNlKSApO1xuICAgIH0pO1xuICAgIGVsLmFwcGVuZENoaWxkKGl0ZW1Db250YWluZXIpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVsb2FkKCkge1xuICAgIGVsLmlubmVySFRNTCA9ICcnO1xuICAgIGxvYWQoKTtcbiAgfVxuXG5cbiAgZG9jLmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBsb2FkKTtcblxuXG5cbiAgYXBwLmxpc3QgPSB7XG4gICAgaXRlbXM6IGl0ZW1zLFxuICAgIGFkZDogYWRkLFxuICAgIHVwZGF0ZTogdXBkYXRlLFxuICAgIHJlbW92ZTogcmVtb3ZlLFxuICAgIHJlbG9hZDogcmVsb2FkLFxuICAgIHVwZGF0ZUxpbms6IHVwZGF0ZUxpbmtcbiAgfTtcblxufShkb2N1bWVudCwgc2xhbmdib29rKTsiLCIhZnVuY3Rpb24gKGRvYywgYXBwKSB7XG5cbiAgdmFyIGVsO1xuXG5cbiAgZWwgPSBkb2MuZ2V0RWxlbWVudEJ5SWQoJ21haW4nKTtcblxuICBmdW5jdGlvbiBvcGVuKGFuaW1hdGUpIHtcbiAgICBlbC5jbGFzc0xpc3RbYW5pbWF0ZSA/ICdhZGQnIDogJ3JlbW92ZSddKCdhbmltYXRlJyk7XG4gICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuICB9XG5cbiAgZnVuY3Rpb24gY2xvc2UoYW5pbWF0ZSkge1xuICAgIGVsLmNsYXNzTGlzdFthbmltYXRlID8gJ2FkZCcgOiAncmVtb3ZlJ10oJ2FuaW1hdGUnKTtcbiAgICBlbC5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gIH1cblxuXG5cbiAgYXBwLm1haW4gPSB7XG4gICAgb3Blbjogb3BlbixcbiAgICBjbG9zZTogY2xvc2VcbiAgfTtcblxufShkb2N1bWVudCwgc2xhbmdib29rKTsiLCIhZnVuY3Rpb24gKGRvYywgYXBwKSB7XG5cbiAgdmFyIGRhdGE7XG5cbiAgZGF0YSA9IHdpbmRvdy5waHJhc2VzO1xuXG5cbiAgZnVuY3Rpb24gZm9yRWFjaChmbikge1xuICAgIGRhdGEuZm9yRWFjaChmbik7XG4gIH1cblxuICBmdW5jdGlvbiBxdWVyeU1hdGNoZXNGb3JJbmRleChpbmRleCwgcXVlcnkpIHtcbiAgICB2YXIgcGhyYXNlLCBpLCBwcm9wcztcblxuICAgIHBocmFzZSA9IGRhdGFbaW5kZXhdO1xuICAgIHByb3BzID0gT2JqZWN0LmtleXMocGhyYXNlKTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICggcXVlcnkudGVzdChwaHJhc2VbcHJvcHNbaV1dKSApIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiBieUlkKGlkKSB7XG4gICAgdmFyIGksIHBocmFzZTtcblxuICAgIGZvciAoaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBwaHJhc2UgPSBkYXRhW2ldO1xuICAgICAgaWYgKHBocmFzZS5pZCA9PSBpZCkgcmV0dXJuIHBocmFzZTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBpbmRleE9mKHBocmFzZSkge1xuICAgIHJldHVybiBkYXRhLmluZGV4T2YocGhyYXNlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZChwaHJhc2UpIHtcbiAgICBkYXRhLnVuc2hpZnQocGhyYXNlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZShwaHJhc2UpIHtcbiAgICB2YXIgaW5kZXggPSBkYXRhLmluZGV4T2YocGhyYXNlKTtcbiAgICBkYXRhLnNwbGljZShpbmRleCwgMSk7XG4gIH1cblxuXG4gIGFwcC5waHJhc2UgPSB7XG4gICAgZm9yRWFjaDogZm9yRWFjaCxcbiAgICBtYXRjaDogcXVlcnlNYXRjaGVzRm9ySW5kZXgsXG4gICAgYnlJZDogYnlJZCxcbiAgICBpbmRleE9mOiBpbmRleE9mLFxuICAgIGFkZDogYWRkLFxuICAgIHJlbW92ZTogcmVtb3ZlXG4gIH07XG5cbn0oZG9jdW1lbnQsIHNsYW5nYm9vayk7IiwiIWZ1bmN0aW9uIChkb2MsIGFwcCkge1xuXG4gIHZhciBCQVNFX1VSTCA9ICcvYXBpL3BocmFzZXMnO1xuXG5cbiAgZnVuY3Rpb24gcmVxdWVzdChvcHRpb25zLCBjYikge1xuICAgIHZhciByZXF1ZXN0LCB1cmwsIG1ldGhvZDtcblxuICAgIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB1cmwgPSBvcHRpb25zLmlkID8gQkFTRV9VUkwgKycvJytvcHRpb25zLmlkIDogQkFTRV9VUkw7XG4gICAgbWV0aG9kID0gb3B0aW9ucy5tZXRob2QudG9VcHBlckNhc2UoKTtcblxuICAgIHJlcXVlc3Qub3BlbihtZXRob2QsIHVybCwgdHJ1ZSk7XG5cbiAgICBpZiAobWV0aG9kID09ICdQT1NUJyB8fCBtZXRob2QgPT0gJ1BVVCcpIHtcbiAgICAgIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDsgY2hhcnNldD1VVEYtOCcpO1xuICAgIH1cblxuICAgIHJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHJlcXVlc3Quc3RhdHVzID49IDIwMCAmJiByZXF1ZXN0LnN0YXR1cyA8IDQwMCkge1xuICAgICAgICBjYihyZXF1ZXN0LnJlc3BvbnNlVGV4dCA/IEpTT04ucGFyc2UocmVxdWVzdC5yZXNwb25zZVRleHQpOiB1bmRlZmluZWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVxdWVzdC5vbmVycm9yKHJlcXVlc3Quc3RhdHVzVGV4dCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlcXVlc3Qub25lcnJvciA9IGZ1bmN0aW9uIChtc2cpIHtcbiAgICAgIGFwcC5saXN0LnJlbG9hZCgpO1xuICAgICAgZXJyKG1zZywgb3B0aW9ucy5hY3Rpb24sIG9wdGlvbnMubmFtZSk7XG4gICAgfTtcblxuICAgIHJlcXVlc3Quc2VuZChKU09OLnN0cmluZ2lmeShvcHRpb25zLmRhdGEpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGVycihtc2csIGFjdGlvbiwgcGhyYXNlKSB7XG4gICAgY29uc29sZS5sb2coJ0VSUk9SIGF0OiAnK2FjdGlvbisnIFwiJytwaHJhc2UrJ1wiIDogJywgIG1zZyk7XG4gICAgYWxlcnQoJ1NvcnJ5LCBzb21ldGhpbmcgd2VudCB3cm9uZyB3aGlsZSB0cnlpbmcgdG8gJythY3Rpb24rJyAnK3BocmFzZSsnLiBUcnkgYWdhaW4uJyk7XG4gIH1cblxuXG5cbiAgYXBwLnJlcXVlc3QgPSByZXF1ZXN0O1xuXG59KGRvY3VtZW50LCBzbGFuZ2Jvb2spOyIsIiFmdW5jdGlvbiAoZG9jLCBhcHApIHtcblxuXG4gIGZ1bmN0aW9uIGdvKHVybCkge1xuICAgIGhpc3RvcnkucHVzaFN0YXRlKG51bGwsIG51bGwsIHVybCk7XG4gICAgaGFuZGxlUm91dGUodHJ1ZSk7XG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVSb3V0ZSAoYW5pbWF0ZSkge1xuICAgIHZhciB1cmwsIG1hdGNoO1xuXG4gICAgdXJsID0gbG9jYXRpb24ucGF0aG5hbWU7XG5cbiAgICAvLyAvXG4gICAgaWYgKHVybC5tYXRjaCgvXlxcLz8kLykpIHtcbiAgICAgIGFwcC5lZGl0LmNsb3NlKGFuaW1hdGUpO1xuICAgICAgYXBwLm1haW4ub3BlbihhbmltYXRlKTtcbiAgICB9XG4gICAgLy8gL2FkZFxuICAgIGVsc2UgaWYgKHVybC5tYXRjaCgvXlxcL2FkZFxcLz8kLykpIHtcbiAgICAgIGFwcC5tYWluLmNsb3NlKGFuaW1hdGUpO1xuICAgICAgYXBwLmVkaXQub3BlbihhbmltYXRlKTtcbiAgICB9XG4gICAgLy8gL2VkaXQ6aWRcbiAgICBlbHNlIGlmIChtYXRjaCA9IHVybC5tYXRjaCgvXlxcL2VkaXRcXC8oWzAtOV0rKVxcLz8kLykpIHtcbiAgICAgIGFwcC5tYWluLmNsb3NlKGFuaW1hdGUpO1xuICAgICAgYXBwLmVkaXQub3BlbihhbmltYXRlLCBtYXRjaFsxXSk7XG4gICAgfVxuICAgIC8vIC8qXG4gICAgZWxzZSB7XG4gICAgICBnbygnLycpO1xuICAgIH1cbiAgfTtcblxuXG4gIGRvYy5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAoZS50YXJnZXQgJiYgZS50YXJnZXQubm9kZU5hbWUgPT0gJ0EnKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBnbyhlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSk7XG4gICAgfVxuICB9LCB0cnVlKTtcblxuICBkb2MuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uKCkge1xuICAgIGhhbmRsZVJvdXRlKGZhbHNlKTtcbiAgfSk7XG5cbiAgd2luZG93Lm9ucG9wc3RhdGUgPSBmdW5jdGlvbigpIHtcbiAgICBoYW5kbGVSb3V0ZShmYWxzZSk7XG4gIH07XG5cblxuXG4gIGFwcC5yb3V0ZXIgPSB7XG4gICAgZ286IGdvXG4gIH07XG5cbn0oZG9jdW1lbnQsIHNsYW5nYm9vayk7IiwiIWZ1bmN0aW9uIChkb2MsIGFwcCkge1xuXG4gIHZhciBlbDtcblxuICBlbCA9IGRvYy5nZXRFbGVtZW50QnlJZCgnc2VhcmNoJyk7XG5cbiAgZnVuY3Rpb24gZmlsdGVyUGhyYXNlcygpIHtcbiAgICB2YXIgaSwgZmlsdGVyLCBpdGVtO1xuXG4gICAgZmlsdGVyID0gbmV3IFJlZ0V4cChlc2NhcGVSZWdFeHAoZWwudmFsdWUpLCAnaScpO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IGFwcC5saXN0Lml0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpdGVtID0gYXBwLmxpc3QuaXRlbXNbaV07XG4gICAgICBpdGVtLnN0eWxlLmRpc3BsYXkgPSBhcHAucGhyYXNlLm1hdGNoKGksIGZpbHRlcikgPyAnJyA6ICdub25lJztcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzaG93QWxsKCkge1xuICAgIGZvciAoaSA9IDA7IGkgPCBhcHAubGlzdC5pdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgYXBwLmxpc3QuaXRlbXNbaV0uc3R5bGUuZGlzcGxheSA9ICcnO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGVzY2FwZVJlZ0V4cChzdHIpIHtcbiAgICByZXR1cm4gc3RyLnJlcGxhY2UoL1tcXC1cXFtcXF1cXC9cXHtcXH1cXChcXClcXCpcXCtcXD9cXC5cXFxcXFxeXFwkXFx8XS9nLCBcIlxcXFwkJlwiKTtcbiAgfVxuXG5cbiAgZWwuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCBmdW5jdGlvbiAoZSkge1xuICAgIGFwcC5hc2lkZS5mb2N1cygpO1xuXG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBlbC5zZWxlY3QoKTtcbiAgICB9LCAwKTtcbiAgfSk7XG5cbiAgZWwuYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsIGFwcC5hc2lkZS5ibHVyKTtcblxuICBlbC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgLy8gZW50ZXIgb3IgZXNjYXBlXG4gICAgaWYgKGUua2V5Q29kZSA9PSAxMyB8fCBlLmtleUNvZGUgPT0gMjcpIHtcbiAgICAgIGVsLmJsdXIoKTtcbiAgICB9XG4gIH0pO1xuXG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgZnVuY3Rpb24gKCkge1xuICAgIGVsLnZhbHVlID8gZmlsdGVyUGhyYXNlcygpIDogc2hvd0FsbCgpO1xuICB9KTtcblxufShkb2N1bWVudCwgc2xhbmdib29rKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=