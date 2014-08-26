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
    item.querySelector('a').setAttribute('href', '/edit/' + phrase.id);
  }

  function add(phrase) {
    el.insertBefore( createItem(phrase), el.firstChild );
    app.phrase.add(phrase);
  }

  function update(phrase) {
    var index = app.phrase.indexOf(phrase);
    updateItem(el.children[index], phrase);
  }

  function remove(phrase) {
    var index = app.phrase.remove(phrase);
    el.removeChild(el.children[index]);
  }

  function load() {
    var itemContainer = doc.createDocumentFragment();
    app.phrase.forEach(function (phrase) {
      itemContainer.appendChild( createItem(phrase) );
    });
    el.appendChild(itemContainer);
  }


  doc.addEventListener('DOMContentLoaded', load);



  app.list = {
    items: items,
    add: add,
    update: update,
    remove: remove
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
    return index;
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


  el.addEventListener('focus', app.aside.focus);
  el.addEventListener('blur', app.aside.blur);

  el.addEventListener('keyup', function (e) {
    // enter or escape
    if (e.keyCode == 13 || e.keyCode == 27) el.blur();
  });

  el.addEventListener('input', function () {
    el.value ? filterPhrases() : showAll();
  });

}(document, slangbook);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsIm1vZHVsZXMvYXNpZGUuanMiLCJtb2R1bGVzL2VkaXQuanMiLCJtb2R1bGVzL2xpc3QuanMiLCJtb2R1bGVzL21haW4uanMiLCJtb2R1bGVzL3BocmFzZS5qcyIsIm1vZHVsZXMvcmVxdWVzdC5qcyIsIm1vZHVsZXMvcm91dGVyLmpzIiwibW9kdWxlcy9zZWFyY2guanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoicHVibGljL2J1aWxkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIWZ1bmN0aW9uIChkb2MpIHtcblxuXG4gIHdpbmRvdy5zbGFuZ2Jvb2sgPSB7fTtcblxuICBkb2MuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uKCkge1xuICAgIGRvYy5ib2R5LnN0eWxlLm9wYWNpdHkgPSAxO1xuICB9KTtcblxufShkb2N1bWVudCk7IiwiIWZ1bmN0aW9uIChkb2MsIGFwcCkge1xuXG4gIHZhciBlbDtcblxuXG4gIGVsID0gZG9jLnF1ZXJ5U2VsZWN0b3IoJyNtYWluIGFzaWRlJyk7XG5cbiAgZnVuY3Rpb24gZm9jdXMoKSB7XG4gICAgZWwuY2xhc3NMaXN0LmFkZCgnZm9jdXMnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGJsdXIoKSB7XG4gICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZm9jdXMnKTtcbiAgfVxuXG5cblxuICBhcHAuYXNpZGUgPSB7XG4gICAgZm9jdXM6IGZvY3VzLFxuICAgIGJsdXI6IGJsdXJcbiAgfTtcblxufShkb2N1bWVudCwgc2xhbmdib29rKTsiLCIhZnVuY3Rpb24gKGRvYywgYXBwKSB7XG5cbiAgdmFyIGVsLCBmb3JtLCBwaHJhc2UsIGxhbmcxLCBsYW5nMiwgdGFncztcblxuXG4gIGVsICAgICA9IGRvYy5nZXRFbGVtZW50QnlJZCgnZWRpdCcpO1xuICBmb3JtICAgPSBlbC5xdWVyeVNlbGVjdG9yKCdmb3JtJyk7XG4gIGxhbmcxICA9IGZvcm0ucXVlcnlTZWxlY3RvcignLmxhbmcxJyk7XG4gIGxhbmcyICA9IGZvcm0ucXVlcnlTZWxlY3RvcignLmxhbmcyJyk7XG4gIHRhZ3MgICA9IGZvcm0ucXVlcnlTZWxlY3RvcignLnRhZ3MnKTtcbiAgYnV0dG9uID0gZWwucXVlcnlTZWxlY3RvcignYnV0dG9uJyk7XG5cblxuICBmdW5jdGlvbiBvcGVuKGFuaW1hdGUsIGlkKSB7XG4gICAgaWQgPyBsb2FkKGlkKSA6IGVtcHR5KCk7XG5cbiAgICBsYW5nMS52YWx1ZSA9IHBocmFzZS5sYW5nMTtcbiAgICBsYW5nMi52YWx1ZSA9IHBocmFzZS5sYW5nMjtcbiAgICB0YWdzLnZhbHVlICA9IHBocmFzZS50YWdzO1xuXG4gICAgZWwuY2xhc3NMaXN0W2FuaW1hdGUgPyAnYWRkJyA6ICdyZW1vdmUnXSgnYW5pbWF0ZScpO1xuICAgIGVsLmNsYXNzTGlzdC5hZGQoJ3Nob3cnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNsb3NlKGFuaW1hdGUpIHtcbiAgICBlbC5jbGFzc0xpc3RbYW5pbWF0ZSA/ICdhZGQnIDogJ3JlbW92ZSddKCdhbmltYXRlJyk7XG4gICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpO1xuICB9XG5cbiAgZnVuY3Rpb24gbG9hZChpZCkge1xuICAgIHBocmFzZSA9IGFwcC5waHJhc2UuYnlJZChpZCk7XG4gICAgaWYgKCFwaHJhc2UpIGFwcC5yb3V0ZXIuZ28oJy8nKTtcbiAgICBidXR0b24uY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuICB9XG5cbiAgZnVuY3Rpb24gZW1wdHkoKSB7XG4gICAgcGhyYXNlID0ge1xuICAgICAgbGFuZzE6ICcnLFxuICAgICAgbGFuZzI6ICcnLFxuICAgICAgdGFnczogICcnXG4gICAgfTtcbiAgICBidXR0b24uY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICB9XG5cbiAgZnVuY3Rpb24gbG9hZEZyb21ET00oKSB7XG4gICAgcGhyYXNlLmxhbmcxID0gbGFuZzEudmFsdWU7XG4gICAgcGhyYXNlLmxhbmcyID0gbGFuZzIudmFsdWU7XG4gICAgcGhyYXNlLnRhZ3MgID0gdGFncy52YWx1ZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZSgpIHtcbiAgICBsb2FkRnJvbURPTSgpO1xuICAgIGFwcC5yZXF1ZXN0KHtcbiAgICAgIG1ldGhvZDogJ3Bvc3QnLFxuICAgICAgZGF0YTogcGhyYXNlLFxuICAgICAgbmFtZTogcGhyYXNlLmxhbmcxLFxuICAgICAgYWN0aW9uOiAnY3JlYXRlJ1xuICAgIH0sIGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgIHBocmFzZS5pZCA9IHJlcy5pZDtcbiAgICAgIGFwcC5saXN0LmFkZChwaHJhc2UpO1xuICAgIH0pO1xuXG4gICAgYXBwLnJvdXRlci5nbygnLycpO1xuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgIGxvYWRGcm9tRE9NKCk7XG4gICAgYXBwLnJlcXVlc3Qoe1xuICAgICAgbWV0aG9kOiAncHV0JyxcbiAgICAgIGlkOiBwaHJhc2UuaWQsXG4gICAgICBkYXRhOiBwaHJhc2UsXG4gICAgICBuYW1lOiBwaHJhc2UubGFuZzEsXG4gICAgICBhY3Rpb246ICd1cGRhdGUnXG4gICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgYXBwLmxpc3QudXBkYXRlKHBocmFzZSk7XG4gICAgfSk7XG5cbiAgICBhcHAucm91dGVyLmdvKCcvJyk7XG4gIH1cblxuICBmdW5jdGlvbiBkZXN0cm95KCkge1xuICAgIGlmICghY29uZmlybSgnWW91IHJlYWxseSB3YW50IHRvIGRlbGV0ZSB0aGlzIHBocmFzZT8nKSkgcmV0dXJuO1xuXG4gICAgYXBwLnJlcXVlc3Qoe1xuICAgICAgbWV0aG9kOiAnZGVsZXRlJyxcbiAgICAgIGlkOiBwaHJhc2UuaWQsXG4gICAgICBuYW1lOiBwaHJhc2UubGFuZzEsXG4gICAgICBhY3Rpb246ICdkZWxldGUnXG4gICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgYXBwLmxpc3QucmVtb3ZlKHBocmFzZSk7XG4gICAgfSk7XG5cbiAgICBhcHAucm91dGVyLmdvKCcvJyk7XG4gIH1cblxuXG4gIGZvcm0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgZnVuY3Rpb24gKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgcGhyYXNlLmlkID8gdXBkYXRlKCkgOiBjcmVhdGUoKTtcbiAgfSk7XG5cbiAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgZGVzdHJveSgpO1xuICB9KTtcblxuXG5cbiAgYXBwLmVkaXQgPSB7XG4gICAgb3Blbjogb3BlbixcbiAgICBjbG9zZTogY2xvc2VcbiAgfTtcblxufShkb2N1bWVudCwgc2xhbmdib29rKTsiLCIhZnVuY3Rpb24gKGRvYywgYXBwKSB7XG5cbiAgdmFyIGVsLCBiYXNlSXRlbSwgaXRlbXM7XG5cblxuICBlbCA9IGRvYy5nZXRFbGVtZW50QnlJZCgncGhyYXNlcycpO1xuICBiYXNlSXRlbSA9IGVsLnJlbW92ZUNoaWxkKGVsLnF1ZXJ5U2VsZWN0b3IoJ2xpJykpO1xuICBpdGVtcyA9IGVsLmNoaWxkcmVuO1xuXG5cbiAgZnVuY3Rpb24gY3JlYXRlSXRlbShwaHJhc2UpIHtcbiAgICB2YXIgaXRlbSA9IGJhc2VJdGVtLmNsb25lTm9kZSh0cnVlKTtcbiAgICB1cGRhdGVJdGVtKGl0ZW0sIHBocmFzZSk7XG4gICAgcmV0dXJuIGl0ZW07XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVJdGVtKGl0ZW0sIHBocmFzZSkge1xuICAgIHZhciBwYXJhZ3JhcGhzID0gaXRlbS5nZXRFbGVtZW50c0J5VGFnTmFtZSgncCcpO1xuICAgIHBhcmFncmFwaHNbMF0udGV4dENvbnRlbnQgPSBwaHJhc2UubGFuZzE7XG4gICAgcGFyYWdyYXBoc1sxXS50ZXh0Q29udGVudCA9IHBocmFzZS5sYW5nMjtcbiAgICBpdGVtLnF1ZXJ5U2VsZWN0b3IoJ2EnKS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCAnL2VkaXQvJyArIHBocmFzZS5pZCk7XG4gIH1cblxuICBmdW5jdGlvbiBhZGQocGhyYXNlKSB7XG4gICAgZWwuaW5zZXJ0QmVmb3JlKCBjcmVhdGVJdGVtKHBocmFzZSksIGVsLmZpcnN0Q2hpbGQgKTtcbiAgICBhcHAucGhyYXNlLmFkZChwaHJhc2UpO1xuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlKHBocmFzZSkge1xuICAgIHZhciBpbmRleCA9IGFwcC5waHJhc2UuaW5kZXhPZihwaHJhc2UpO1xuICAgIHVwZGF0ZUl0ZW0oZWwuY2hpbGRyZW5baW5kZXhdLCBwaHJhc2UpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlKHBocmFzZSkge1xuICAgIHZhciBpbmRleCA9IGFwcC5waHJhc2UucmVtb3ZlKHBocmFzZSk7XG4gICAgZWwucmVtb3ZlQ2hpbGQoZWwuY2hpbGRyZW5baW5kZXhdKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGxvYWQoKSB7XG4gICAgdmFyIGl0ZW1Db250YWluZXIgPSBkb2MuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgIGFwcC5waHJhc2UuZm9yRWFjaChmdW5jdGlvbiAocGhyYXNlKSB7XG4gICAgICBpdGVtQ29udGFpbmVyLmFwcGVuZENoaWxkKCBjcmVhdGVJdGVtKHBocmFzZSkgKTtcbiAgICB9KTtcbiAgICBlbC5hcHBlbmRDaGlsZChpdGVtQ29udGFpbmVyKTtcbiAgfVxuXG5cbiAgZG9jLmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBsb2FkKTtcblxuXG5cbiAgYXBwLmxpc3QgPSB7XG4gICAgaXRlbXM6IGl0ZW1zLFxuICAgIGFkZDogYWRkLFxuICAgIHVwZGF0ZTogdXBkYXRlLFxuICAgIHJlbW92ZTogcmVtb3ZlXG4gIH07XG5cbn0oZG9jdW1lbnQsIHNsYW5nYm9vayk7IiwiIWZ1bmN0aW9uIChkb2MsIGFwcCkge1xuXG4gIHZhciBlbDtcblxuXG4gIGVsID0gZG9jLmdldEVsZW1lbnRCeUlkKCdtYWluJyk7XG5cbiAgZnVuY3Rpb24gb3BlbihhbmltYXRlKSB7XG4gICAgZWwuY2xhc3NMaXN0W2FuaW1hdGUgPyAnYWRkJyA6ICdyZW1vdmUnXSgnYW5pbWF0ZScpO1xuICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNsb3NlKGFuaW1hdGUpIHtcbiAgICBlbC5jbGFzc0xpc3RbYW5pbWF0ZSA/ICdhZGQnIDogJ3JlbW92ZSddKCdhbmltYXRlJyk7XG4gICAgZWwuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICB9XG5cblxuXG4gIGFwcC5tYWluID0ge1xuICAgIG9wZW46IG9wZW4sXG4gICAgY2xvc2U6IGNsb3NlXG4gIH07XG5cbn0oZG9jdW1lbnQsIHNsYW5nYm9vayk7IiwiIWZ1bmN0aW9uIChkb2MsIGFwcCkge1xuXG4gIHZhciBkYXRhO1xuXG4gIGRhdGEgPSB3aW5kb3cucGhyYXNlcztcblxuXG4gIGZ1bmN0aW9uIGZvckVhY2goZm4pIHtcbiAgICBkYXRhLmZvckVhY2goZm4pO1xuICB9XG5cbiAgZnVuY3Rpb24gcXVlcnlNYXRjaGVzRm9ySW5kZXgoaW5kZXgsIHF1ZXJ5KSB7XG4gICAgdmFyIHBocmFzZSwgaSwgcHJvcHM7XG5cbiAgICBwaHJhc2UgPSBkYXRhW2luZGV4XTtcbiAgICBwcm9wcyA9IE9iamVjdC5rZXlzKHBocmFzZSk7XG4gICAgZm9yIChpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoIHF1ZXJ5LnRlc3QocGhyYXNlW3Byb3BzW2ldXSkgKSByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZnVuY3Rpb24gYnlJZChpZCkge1xuICAgIHZhciBpLCBwaHJhc2U7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgcGhyYXNlID0gZGF0YVtpXTtcbiAgICAgIGlmIChwaHJhc2UuaWQgPT0gaWQpIHJldHVybiBwaHJhc2U7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaW5kZXhPZihwaHJhc2UpIHtcbiAgICByZXR1cm4gZGF0YS5pbmRleE9mKHBocmFzZSk7XG4gIH1cblxuICBmdW5jdGlvbiBhZGQocGhyYXNlKSB7XG4gICAgZGF0YS51bnNoaWZ0KHBocmFzZSk7XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmUocGhyYXNlKSB7XG4gICAgdmFyIGluZGV4ID0gZGF0YS5pbmRleE9mKHBocmFzZSk7XG4gICAgZGF0YS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIHJldHVybiBpbmRleDtcbiAgfVxuXG5cbiAgYXBwLnBocmFzZSA9IHtcbiAgICBmb3JFYWNoOiBmb3JFYWNoLFxuICAgIG1hdGNoOiBxdWVyeU1hdGNoZXNGb3JJbmRleCxcbiAgICBieUlkOiBieUlkLFxuICAgIGluZGV4T2Y6IGluZGV4T2YsXG4gICAgYWRkOiBhZGQsXG4gICAgcmVtb3ZlOiByZW1vdmVcbiAgfTtcblxufShkb2N1bWVudCwgc2xhbmdib29rKTsiLCIhZnVuY3Rpb24gKGRvYywgYXBwKSB7XG5cbiAgdmFyIEJBU0VfVVJMID0gJy9hcGkvcGhyYXNlcyc7XG5cblxuICBmdW5jdGlvbiByZXF1ZXN0KG9wdGlvbnMsIGNiKSB7XG4gICAgdmFyIHJlcXVlc3QsIHVybCwgbWV0aG9kO1xuXG4gICAgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIHVybCA9IG9wdGlvbnMuaWQgPyBCQVNFX1VSTCArJy8nK29wdGlvbnMuaWQgOiBCQVNFX1VSTDtcbiAgICBtZXRob2QgPSBvcHRpb25zLm1ldGhvZC50b1VwcGVyQ2FzZSgpO1xuXG4gICAgcmVxdWVzdC5vcGVuKG1ldGhvZCwgdXJsLCB0cnVlKTtcblxuICAgIGlmIChtZXRob2QgPT0gJ1BPU1QnIHx8IG1ldGhvZCA9PSAnUFVUJykge1xuICAgICAgcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkOyBjaGFyc2V0PVVURi04Jyk7XG4gICAgfVxuXG4gICAgcmVxdWVzdC5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAocmVxdWVzdC5zdGF0dXMgPj0gMjAwICYmIHJlcXVlc3Quc3RhdHVzIDwgNDAwKSB7XG4gICAgICAgIGNiKHJlcXVlc3QucmVzcG9uc2VUZXh0ID8gSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlVGV4dCk6IHVuZGVmaW5lZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXF1ZXN0Lm9uZXJyb3IocmVxdWVzdC5zdGF0dXNUZXh0KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24gKG1zZykge1xuICAgICAgZXJyKG1zZywgb3B0aW9ucy5hY3Rpb24sIG9wdGlvbnMubmFtZSk7XG4gICAgfTtcblxuICAgIHJlcXVlc3Quc2VuZChKU09OLnN0cmluZ2lmeShvcHRpb25zLmRhdGEpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGVycihtc2csIGFjdGlvbiwgcGhyYXNlKSB7XG4gICAgY29uc29sZS5sb2coJ0VSUk9SIGF0OiAnK2FjdGlvbisnIFwiJytwaHJhc2UrJ1wiIDogJywgIG1zZyk7XG4gICAgYWxlcnQoJ1NvcnJ5LCBzb21ldGhpbmcgd2VudCB3cm9uZyB3aGlsZSB0cnlpbmcgdG8gJythY3Rpb24rJyAnK3BocmFzZSsnLiBUcnkgYWdhaW4uJyk7XG4gIH1cblxuXG5cbiAgYXBwLnJlcXVlc3QgPSByZXF1ZXN0O1xuXG59KGRvY3VtZW50LCBzbGFuZ2Jvb2spOyIsIiFmdW5jdGlvbiAoZG9jLCBhcHApIHtcblxuXG4gIGZ1bmN0aW9uIGdvKHVybCkge1xuICAgIGhpc3RvcnkucHVzaFN0YXRlKG51bGwsIG51bGwsIHVybCk7XG4gICAgaGFuZGxlUm91dGUodHJ1ZSk7XG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVSb3V0ZSAoYW5pbWF0ZSkge1xuICAgIHZhciB1cmwsIG1hdGNoO1xuXG4gICAgdXJsID0gbG9jYXRpb24ucGF0aG5hbWU7XG5cbiAgICAvLyAvXG4gICAgaWYgKHVybC5tYXRjaCgvXlxcLz8kLykpIHtcbiAgICAgIGFwcC5lZGl0LmNsb3NlKGFuaW1hdGUpO1xuICAgICAgYXBwLm1haW4ub3BlbihhbmltYXRlKTtcbiAgICB9XG4gICAgLy8gL2FkZFxuICAgIGVsc2UgaWYgKHVybC5tYXRjaCgvXlxcL2FkZFxcLz8kLykpIHtcbiAgICAgIGFwcC5tYWluLmNsb3NlKGFuaW1hdGUpO1xuICAgICAgYXBwLmVkaXQub3BlbihhbmltYXRlKTtcbiAgICB9XG4gICAgLy8gL2VkaXQ6aWRcbiAgICBlbHNlIGlmIChtYXRjaCA9IHVybC5tYXRjaCgvXlxcL2VkaXRcXC8oWzAtOV0rKVxcLz8kLykpIHtcbiAgICAgIGFwcC5tYWluLmNsb3NlKGFuaW1hdGUpO1xuICAgICAgYXBwLmVkaXQub3BlbihhbmltYXRlLCBtYXRjaFsxXSk7XG4gICAgfVxuICAgIC8vIC8qXG4gICAgZWxzZSB7XG4gICAgICBnbygnLycpO1xuICAgIH1cbiAgfTtcblxuXG4gIGRvYy5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAoZS50YXJnZXQgJiYgZS50YXJnZXQubm9kZU5hbWUgPT0gJ0EnKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBnbyhlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSk7XG4gICAgfVxuICB9LCB0cnVlKTtcblxuICBkb2MuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uKCkge1xuICAgIGhhbmRsZVJvdXRlKGZhbHNlKTtcbiAgfSk7XG5cbiAgd2luZG93Lm9ucG9wc3RhdGUgPSBmdW5jdGlvbigpIHtcbiAgICBoYW5kbGVSb3V0ZShmYWxzZSk7XG4gIH07XG5cblxuXG4gIGFwcC5yb3V0ZXIgPSB7XG4gICAgZ286IGdvXG4gIH07XG5cbn0oZG9jdW1lbnQsIHNsYW5nYm9vayk7IiwiIWZ1bmN0aW9uIChkb2MsIGFwcCkge1xuXG4gIHZhciBlbDtcblxuICBlbCA9IGRvYy5nZXRFbGVtZW50QnlJZCgnc2VhcmNoJyk7XG5cbiAgZnVuY3Rpb24gZmlsdGVyUGhyYXNlcygpIHtcbiAgICB2YXIgaSwgZmlsdGVyLCBpdGVtO1xuXG4gICAgZmlsdGVyID0gbmV3IFJlZ0V4cChlc2NhcGVSZWdFeHAoZWwudmFsdWUpLCAnaScpO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IGFwcC5saXN0Lml0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpdGVtID0gYXBwLmxpc3QuaXRlbXNbaV07XG4gICAgICBpdGVtLnN0eWxlLmRpc3BsYXkgPSBhcHAucGhyYXNlLm1hdGNoKGksIGZpbHRlcikgPyAnJyA6ICdub25lJztcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzaG93QWxsKCkge1xuICAgIGZvciAoaSA9IDA7IGkgPCBhcHAubGlzdC5pdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgYXBwLmxpc3QuaXRlbXNbaV0uc3R5bGUuZGlzcGxheSA9ICcnO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGVzY2FwZVJlZ0V4cChzdHIpIHtcbiAgICByZXR1cm4gc3RyLnJlcGxhY2UoL1tcXC1cXFtcXF1cXC9cXHtcXH1cXChcXClcXCpcXCtcXD9cXC5cXFxcXFxeXFwkXFx8XS9nLCBcIlxcXFwkJlwiKTtcbiAgfVxuXG5cbiAgZWwuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCBhcHAuYXNpZGUuZm9jdXMpO1xuICBlbC5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgYXBwLmFzaWRlLmJsdXIpO1xuXG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZnVuY3Rpb24gKGUpIHtcbiAgICAvLyBlbnRlciBvciBlc2NhcGVcbiAgICBpZiAoZS5rZXlDb2RlID09IDEzIHx8IGUua2V5Q29kZSA9PSAyNykgZWwuYmx1cigpO1xuICB9KTtcblxuICBlbC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIGZ1bmN0aW9uICgpIHtcbiAgICBlbC52YWx1ZSA/IGZpbHRlclBocmFzZXMoKSA6IHNob3dBbGwoKTtcbiAgfSk7XG5cbn0oZG9jdW1lbnQsIHNsYW5nYm9vayk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9