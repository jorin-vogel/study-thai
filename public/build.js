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
    phrase.lang1 = lang1.value;
    phrase.lang2 = lang2.value;
    phrase.tags  = tags.value;
  }

  function submit() {
    loadFromDOM();
    phrase.id ? update() : create();
    goHome();
  }

  function goHome() {
    lang1.blur(); lang2.blur(); tags.blur();
    app.router.go('/');
  }

  function create() {
    app.request({
      method: 'post',
      data: phrase,
      name: phrase.lang1,
      action: 'create'
    }, function (res) {
      phrase.id = res.id;
      app.list.add(phrase);
    });
  }

  function update() {
    app.request({
      method: 'put',
      id: phrase.id,
      data: phrase,
      name: phrase.lang1,
      action: 'update'
    }, function () {
      app.list.update(phrase);
    });
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

    goHome();
  }


  form.addEventListener('submit', function (e) {
    e.preventDefault();
    submit();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsIm1vZHVsZXMvYXNpZGUuanMiLCJtb2R1bGVzL2VkaXQuanMiLCJtb2R1bGVzL2xpc3QuanMiLCJtb2R1bGVzL21haW4uanMiLCJtb2R1bGVzL3BocmFzZS5qcyIsIm1vZHVsZXMvcmVxdWVzdC5qcyIsIm1vZHVsZXMvcm91dGVyLmpzIiwibW9kdWxlcy9zZWFyY2guanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InB1YmxpYy9idWlsZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiFmdW5jdGlvbiAoZG9jKSB7XG5cblxuICB3aW5kb3cuc2xhbmdib29rID0ge307XG5cbiAgZG9jLmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbigpIHtcbiAgICBkb2MuYm9keS5zdHlsZS5vcGFjaXR5ID0gMTtcbiAgfSk7XG5cbn0oZG9jdW1lbnQpOyIsIiFmdW5jdGlvbiAoZG9jLCBhcHApIHtcblxuICB2YXIgZWw7XG5cblxuICBlbCA9IGRvYy5xdWVyeVNlbGVjdG9yKCcjbWFpbiBhc2lkZScpO1xuXG4gIGZ1bmN0aW9uIGZvY3VzKCkge1xuICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2ZvY3VzJyk7XG4gIH1cblxuICBmdW5jdGlvbiBibHVyKCkge1xuICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2ZvY3VzJyk7XG4gIH1cblxuXG5cbiAgYXBwLmFzaWRlID0ge1xuICAgIGZvY3VzOiBmb2N1cyxcbiAgICBibHVyOiBibHVyXG4gIH07XG5cbn0oZG9jdW1lbnQsIHNsYW5nYm9vayk7IiwiIWZ1bmN0aW9uIChkb2MsIGFwcCkge1xuXG4gIHZhciBlbCwgZm9ybSwgcGhyYXNlLCBsYW5nMSwgbGFuZzIsIHRhZ3M7XG5cblxuICBlbCAgICAgPSBkb2MuZ2V0RWxlbWVudEJ5SWQoJ2VkaXQnKTtcbiAgZm9ybSAgID0gZWwucXVlcnlTZWxlY3RvcignZm9ybScpO1xuICBsYW5nMSAgPSBmb3JtLnF1ZXJ5U2VsZWN0b3IoJy5sYW5nMScpO1xuICBsYW5nMiAgPSBmb3JtLnF1ZXJ5U2VsZWN0b3IoJy5sYW5nMicpO1xuICB0YWdzICAgPSBmb3JtLnF1ZXJ5U2VsZWN0b3IoJy50YWdzJyk7XG4gIGJ1dHRvbiA9IGVsLnF1ZXJ5U2VsZWN0b3IoJy5kZXN0cm95Jyk7XG5cblxuICBmdW5jdGlvbiBvcGVuKGFuaW1hdGUsIGlkKSB7XG4gICAgaWQgPyBsb2FkKGlkKSA6IGVtcHR5KCk7XG5cbiAgICBsYW5nMS52YWx1ZSA9IHBocmFzZS5sYW5nMTtcbiAgICBsYW5nMi52YWx1ZSA9IHBocmFzZS5sYW5nMjtcbiAgICB0YWdzLnZhbHVlICA9IHBocmFzZS50YWdzO1xuXG4gICAgZWwuY2xhc3NMaXN0W2FuaW1hdGUgPyAnYWRkJyA6ICdyZW1vdmUnXSgnYW5pbWF0ZScpO1xuICAgIGVsLmNsYXNzTGlzdC5hZGQoJ3Nob3cnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNsb3NlKGFuaW1hdGUpIHtcbiAgICBlbC5jbGFzc0xpc3RbYW5pbWF0ZSA/ICdhZGQnIDogJ3JlbW92ZSddKCdhbmltYXRlJyk7XG4gICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpO1xuICB9XG5cbiAgZnVuY3Rpb24gbG9hZChpZCkge1xuICAgIHBocmFzZSA9IGFwcC5waHJhc2UuYnlJZChpZCk7XG4gICAgaWYgKCFwaHJhc2UpIGFwcC5yb3V0ZXIuZ28oJy8nKTtcbiAgICBidXR0b24uY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuICB9XG5cbiAgZnVuY3Rpb24gZW1wdHkoKSB7XG4gICAgcGhyYXNlID0ge1xuICAgICAgbGFuZzE6ICcnLFxuICAgICAgbGFuZzI6ICcnLFxuICAgICAgdGFnczogICcnXG4gICAgfTtcbiAgICBidXR0b24uY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICB9XG5cbiAgZnVuY3Rpb24gbG9hZEZyb21ET00oKSB7XG4gICAgcGhyYXNlLmxhbmcxID0gbGFuZzEudmFsdWU7XG4gICAgcGhyYXNlLmxhbmcyID0gbGFuZzIudmFsdWU7XG4gICAgcGhyYXNlLnRhZ3MgID0gdGFncy52YWx1ZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHN1Ym1pdCgpIHtcbiAgICBsb2FkRnJvbURPTSgpO1xuICAgIHBocmFzZS5pZCA/IHVwZGF0ZSgpIDogY3JlYXRlKCk7XG4gICAgZ29Ib21lKCk7XG4gIH1cblxuICBmdW5jdGlvbiBnb0hvbWUoKSB7XG4gICAgbGFuZzEuYmx1cigpOyBsYW5nMi5ibHVyKCk7IHRhZ3MuYmx1cigpO1xuICAgIGFwcC5yb3V0ZXIuZ28oJy8nKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZSgpIHtcbiAgICBhcHAucmVxdWVzdCh7XG4gICAgICBtZXRob2Q6ICdwb3N0JyxcbiAgICAgIGRhdGE6IHBocmFzZSxcbiAgICAgIG5hbWU6IHBocmFzZS5sYW5nMSxcbiAgICAgIGFjdGlvbjogJ2NyZWF0ZSdcbiAgICB9LCBmdW5jdGlvbiAocmVzKSB7XG4gICAgICBwaHJhc2UuaWQgPSByZXMuaWQ7XG4gICAgICBhcHAubGlzdC5hZGQocGhyYXNlKTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICBhcHAucmVxdWVzdCh7XG4gICAgICBtZXRob2Q6ICdwdXQnLFxuICAgICAgaWQ6IHBocmFzZS5pZCxcbiAgICAgIGRhdGE6IHBocmFzZSxcbiAgICAgIG5hbWU6IHBocmFzZS5sYW5nMSxcbiAgICAgIGFjdGlvbjogJ3VwZGF0ZSdcbiAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICBhcHAubGlzdC51cGRhdGUocGhyYXNlKTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gICAgaWYgKCFjb25maXJtKCdZb3UgcmVhbGx5IHdhbnQgdG8gZGVsZXRlIHRoaXMgcGhyYXNlPycpKSByZXR1cm47XG5cbiAgICBhcHAucmVxdWVzdCh7XG4gICAgICBtZXRob2Q6ICdkZWxldGUnLFxuICAgICAgaWQ6IHBocmFzZS5pZCxcbiAgICAgIG5hbWU6IHBocmFzZS5sYW5nMSxcbiAgICAgIGFjdGlvbjogJ2RlbGV0ZSdcbiAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICBhcHAubGlzdC5yZW1vdmUocGhyYXNlKTtcbiAgICB9KTtcblxuICAgIGdvSG9tZSgpO1xuICB9XG5cblxuICBmb3JtLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHN1Ym1pdCgpO1xuICB9KTtcblxuICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBkZXN0cm95KCk7XG4gIH0pO1xuXG5cblxuICBhcHAuZWRpdCA9IHtcbiAgICBvcGVuOiBvcGVuLFxuICAgIGNsb3NlOiBjbG9zZVxuICB9O1xuXG59KGRvY3VtZW50LCBzbGFuZ2Jvb2spOyIsIiFmdW5jdGlvbiAoZG9jLCBhcHApIHtcblxuICB2YXIgZWwsIGJhc2VJdGVtLCBpdGVtcztcblxuXG4gIGVsID0gZG9jLmdldEVsZW1lbnRCeUlkKCdwaHJhc2VzJyk7XG4gIGJhc2VJdGVtID0gZWwucmVtb3ZlQ2hpbGQoZWwucXVlcnlTZWxlY3RvcignbGknKSk7XG4gIGl0ZW1zID0gZWwuY2hpbGRyZW47XG5cblxuICBmdW5jdGlvbiBjcmVhdGVJdGVtKHBocmFzZSkge1xuICAgIHZhciBpdGVtID0gYmFzZUl0ZW0uY2xvbmVOb2RlKHRydWUpO1xuICAgIHVwZGF0ZUl0ZW0oaXRlbSwgcGhyYXNlKTtcbiAgICByZXR1cm4gaXRlbTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZUl0ZW0oaXRlbSwgcGhyYXNlKSB7XG4gICAgdmFyIHBhcmFncmFwaHMgPSBpdGVtLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdwJyk7XG4gICAgcGFyYWdyYXBoc1swXS50ZXh0Q29udGVudCA9IHBocmFzZS5sYW5nMTtcbiAgICBwYXJhZ3JhcGhzWzFdLnRleHRDb250ZW50ID0gcGhyYXNlLmxhbmcyO1xuICAgIGl0ZW0ucXVlcnlTZWxlY3RvcignYScpLnNldEF0dHJpYnV0ZSgnaHJlZicsICcvZWRpdC8nICsgcGhyYXNlLmlkKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZChwaHJhc2UpIHtcbiAgICBlbC5pbnNlcnRCZWZvcmUoIGNyZWF0ZUl0ZW0ocGhyYXNlKSwgZWwuZmlyc3RDaGlsZCApO1xuICAgIGFwcC5waHJhc2UuYWRkKHBocmFzZSk7XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGUocGhyYXNlKSB7XG4gICAgdmFyIGluZGV4ID0gYXBwLnBocmFzZS5pbmRleE9mKHBocmFzZSk7XG4gICAgdXBkYXRlSXRlbShlbC5jaGlsZHJlbltpbmRleF0sIHBocmFzZSk7XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmUocGhyYXNlKSB7XG4gICAgdmFyIGluZGV4ID0gYXBwLnBocmFzZS5yZW1vdmUocGhyYXNlKTtcbiAgICBlbC5yZW1vdmVDaGlsZChlbC5jaGlsZHJlbltpbmRleF0pO1xuICB9XG5cbiAgZnVuY3Rpb24gbG9hZCgpIHtcbiAgICB2YXIgaXRlbUNvbnRhaW5lciA9IGRvYy5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgYXBwLnBocmFzZS5mb3JFYWNoKGZ1bmN0aW9uIChwaHJhc2UpIHtcbiAgICAgIGl0ZW1Db250YWluZXIuYXBwZW5kQ2hpbGQoIGNyZWF0ZUl0ZW0ocGhyYXNlKSApO1xuICAgIH0pO1xuICAgIGVsLmFwcGVuZENoaWxkKGl0ZW1Db250YWluZXIpO1xuICB9XG5cblxuICBkb2MuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGxvYWQpO1xuXG5cblxuICBhcHAubGlzdCA9IHtcbiAgICBpdGVtczogaXRlbXMsXG4gICAgYWRkOiBhZGQsXG4gICAgdXBkYXRlOiB1cGRhdGUsXG4gICAgcmVtb3ZlOiByZW1vdmVcbiAgfTtcblxufShkb2N1bWVudCwgc2xhbmdib29rKTsiLCIhZnVuY3Rpb24gKGRvYywgYXBwKSB7XG5cbiAgdmFyIGVsO1xuXG5cbiAgZWwgPSBkb2MuZ2V0RWxlbWVudEJ5SWQoJ21haW4nKTtcblxuICBmdW5jdGlvbiBvcGVuKGFuaW1hdGUpIHtcbiAgICBlbC5jbGFzc0xpc3RbYW5pbWF0ZSA/ICdhZGQnIDogJ3JlbW92ZSddKCdhbmltYXRlJyk7XG4gICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuICB9XG5cbiAgZnVuY3Rpb24gY2xvc2UoYW5pbWF0ZSkge1xuICAgIGVsLmNsYXNzTGlzdFthbmltYXRlID8gJ2FkZCcgOiAncmVtb3ZlJ10oJ2FuaW1hdGUnKTtcbiAgICBlbC5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gIH1cblxuXG5cbiAgYXBwLm1haW4gPSB7XG4gICAgb3Blbjogb3BlbixcbiAgICBjbG9zZTogY2xvc2VcbiAgfTtcblxufShkb2N1bWVudCwgc2xhbmdib29rKTsiLCIhZnVuY3Rpb24gKGRvYywgYXBwKSB7XG5cbiAgdmFyIGRhdGE7XG5cbiAgZGF0YSA9IHdpbmRvdy5waHJhc2VzO1xuXG5cbiAgZnVuY3Rpb24gZm9yRWFjaChmbikge1xuICAgIGRhdGEuZm9yRWFjaChmbik7XG4gIH1cblxuICBmdW5jdGlvbiBxdWVyeU1hdGNoZXNGb3JJbmRleChpbmRleCwgcXVlcnkpIHtcbiAgICB2YXIgcGhyYXNlLCBpLCBwcm9wcztcblxuICAgIHBocmFzZSA9IGRhdGFbaW5kZXhdO1xuICAgIHByb3BzID0gT2JqZWN0LmtleXMocGhyYXNlKTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICggcXVlcnkudGVzdChwaHJhc2VbcHJvcHNbaV1dKSApIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiBieUlkKGlkKSB7XG4gICAgdmFyIGksIHBocmFzZTtcblxuICAgIGZvciAoaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBwaHJhc2UgPSBkYXRhW2ldO1xuICAgICAgaWYgKHBocmFzZS5pZCA9PSBpZCkgcmV0dXJuIHBocmFzZTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBpbmRleE9mKHBocmFzZSkge1xuICAgIHJldHVybiBkYXRhLmluZGV4T2YocGhyYXNlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZChwaHJhc2UpIHtcbiAgICBkYXRhLnVuc2hpZnQocGhyYXNlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZShwaHJhc2UpIHtcbiAgICB2YXIgaW5kZXggPSBkYXRhLmluZGV4T2YocGhyYXNlKTtcbiAgICBkYXRhLnNwbGljZShpbmRleCwgMSk7XG4gICAgcmV0dXJuIGluZGV4O1xuICB9XG5cblxuICBhcHAucGhyYXNlID0ge1xuICAgIGZvckVhY2g6IGZvckVhY2gsXG4gICAgbWF0Y2g6IHF1ZXJ5TWF0Y2hlc0ZvckluZGV4LFxuICAgIGJ5SWQ6IGJ5SWQsXG4gICAgaW5kZXhPZjogaW5kZXhPZixcbiAgICBhZGQ6IGFkZCxcbiAgICByZW1vdmU6IHJlbW92ZVxuICB9O1xuXG59KGRvY3VtZW50LCBzbGFuZ2Jvb2spOyIsIiFmdW5jdGlvbiAoZG9jLCBhcHApIHtcblxuICB2YXIgQkFTRV9VUkwgPSAnL2FwaS9waHJhc2VzJztcblxuXG4gIGZ1bmN0aW9uIHJlcXVlc3Qob3B0aW9ucywgY2IpIHtcbiAgICB2YXIgcmVxdWVzdCwgdXJsLCBtZXRob2Q7XG5cbiAgICByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgdXJsID0gb3B0aW9ucy5pZCA/IEJBU0VfVVJMICsnLycrb3B0aW9ucy5pZCA6IEJBU0VfVVJMO1xuICAgIG1ldGhvZCA9IG9wdGlvbnMubWV0aG9kLnRvVXBwZXJDYXNlKCk7XG5cbiAgICByZXF1ZXN0Lm9wZW4obWV0aG9kLCB1cmwsIHRydWUpO1xuXG4gICAgaWYgKG1ldGhvZCA9PSAnUE9TVCcgfHwgbWV0aG9kID09ICdQVVQnKSB7XG4gICAgICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7IGNoYXJzZXQ9VVRGLTgnKTtcbiAgICB9XG5cbiAgICByZXF1ZXN0Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChyZXF1ZXN0LnN0YXR1cyA+PSAyMDAgJiYgcmVxdWVzdC5zdGF0dXMgPCA0MDApIHtcbiAgICAgICAgY2IocmVxdWVzdC5yZXNwb25zZVRleHQgPyBKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2VUZXh0KTogdW5kZWZpbmVkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcXVlc3Qub25lcnJvcihyZXF1ZXN0LnN0YXR1c1RleHQpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbiAobXNnKSB7XG4gICAgICBlcnIobXNnLCBvcHRpb25zLmFjdGlvbiwgb3B0aW9ucy5uYW1lKTtcbiAgICB9O1xuXG4gICAgcmVxdWVzdC5zZW5kKEpTT04uc3RyaW5naWZ5KG9wdGlvbnMuZGF0YSkpO1xuICB9XG5cbiAgZnVuY3Rpb24gZXJyKG1zZywgYWN0aW9uLCBwaHJhc2UpIHtcbiAgICBjb25zb2xlLmxvZygnRVJST1IgYXQ6ICcrYWN0aW9uKycgXCInK3BocmFzZSsnXCIgOiAnLCAgbXNnKTtcbiAgICBhbGVydCgnU29ycnksIHNvbWV0aGluZyB3ZW50IHdyb25nIHdoaWxlIHRyeWluZyB0byAnK2FjdGlvbisnICcrcGhyYXNlKycuIFRyeSBhZ2Fpbi4nKTtcbiAgfVxuXG5cblxuICBhcHAucmVxdWVzdCA9IHJlcXVlc3Q7XG5cbn0oZG9jdW1lbnQsIHNsYW5nYm9vayk7IiwiIWZ1bmN0aW9uIChkb2MsIGFwcCkge1xuXG5cbiAgZnVuY3Rpb24gZ28odXJsKSB7XG4gICAgaGlzdG9yeS5wdXNoU3RhdGUobnVsbCwgbnVsbCwgdXJsKTtcbiAgICBoYW5kbGVSb3V0ZSh0cnVlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZVJvdXRlIChhbmltYXRlKSB7XG4gICAgdmFyIHVybCwgbWF0Y2g7XG5cbiAgICB1cmwgPSBsb2NhdGlvbi5wYXRobmFtZTtcblxuICAgIC8vIC9cbiAgICBpZiAodXJsLm1hdGNoKC9eXFwvPyQvKSkge1xuICAgICAgYXBwLmVkaXQuY2xvc2UoYW5pbWF0ZSk7XG4gICAgICBhcHAubWFpbi5vcGVuKGFuaW1hdGUpO1xuICAgIH1cbiAgICAvLyAvYWRkXG4gICAgZWxzZSBpZiAodXJsLm1hdGNoKC9eXFwvYWRkXFwvPyQvKSkge1xuICAgICAgYXBwLm1haW4uY2xvc2UoYW5pbWF0ZSk7XG4gICAgICBhcHAuZWRpdC5vcGVuKGFuaW1hdGUpO1xuICAgIH1cbiAgICAvLyAvZWRpdDppZFxuICAgIGVsc2UgaWYgKG1hdGNoID0gdXJsLm1hdGNoKC9eXFwvZWRpdFxcLyhbMC05XSspXFwvPyQvKSkge1xuICAgICAgYXBwLm1haW4uY2xvc2UoYW5pbWF0ZSk7XG4gICAgICBhcHAuZWRpdC5vcGVuKGFuaW1hdGUsIG1hdGNoWzFdKTtcbiAgICB9XG4gICAgLy8gLypcbiAgICBlbHNlIHtcbiAgICAgIGdvKCcvJyk7XG4gICAgfVxuICB9O1xuXG5cbiAgZG9jLmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgIGlmIChlLnRhcmdldCAmJiBlLnRhcmdldC5ub2RlTmFtZSA9PSAnQScpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGdvKGUudGFyZ2V0LmdldEF0dHJpYnV0ZSgnaHJlZicpKTtcbiAgICB9XG4gIH0sIHRydWUpO1xuXG4gIGRvYy5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oKSB7XG4gICAgaGFuZGxlUm91dGUoZmFsc2UpO1xuICB9KTtcblxuICB3aW5kb3cub25wb3BzdGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGhhbmRsZVJvdXRlKGZhbHNlKTtcbiAgfTtcblxuXG5cbiAgYXBwLnJvdXRlciA9IHtcbiAgICBnbzogZ29cbiAgfTtcblxufShkb2N1bWVudCwgc2xhbmdib29rKTsiLCIhZnVuY3Rpb24gKGRvYywgYXBwKSB7XG5cbiAgdmFyIGVsO1xuXG4gIGVsID0gZG9jLmdldEVsZW1lbnRCeUlkKCdzZWFyY2gnKTtcblxuICBmdW5jdGlvbiBmaWx0ZXJQaHJhc2VzKCkge1xuICAgIHZhciBpLCBmaWx0ZXIsIGl0ZW07XG5cbiAgICBmaWx0ZXIgPSBuZXcgUmVnRXhwKGVzY2FwZVJlZ0V4cChlbC52YWx1ZSksICdpJyk7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgYXBwLmxpc3QuaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGl0ZW0gPSBhcHAubGlzdC5pdGVtc1tpXTtcbiAgICAgIGl0ZW0uc3R5bGUuZGlzcGxheSA9IGFwcC5waHJhc2UubWF0Y2goaSwgZmlsdGVyKSA/ICcnIDogJ25vbmUnO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHNob3dBbGwoKSB7XG4gICAgZm9yIChpID0gMDsgaSA8IGFwcC5saXN0Lml0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhcHAubGlzdC5pdGVtc1tpXS5zdHlsZS5kaXNwbGF5ID0gJyc7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZXNjYXBlUmVnRXhwKHN0cikge1xuICAgIHJldHVybiBzdHIucmVwbGFjZSgvW1xcLVxcW1xcXVxcL1xce1xcfVxcKFxcKVxcKlxcK1xcP1xcLlxcXFxcXF5cXCRcXHxdL2csIFwiXFxcXCQmXCIpO1xuICB9XG5cblxuICBlbC5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIGFwcC5hc2lkZS5mb2N1cyk7XG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCBhcHAuYXNpZGUuYmx1cik7XG5cbiAgZWwuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBmdW5jdGlvbiAoZSkge1xuICAgIC8vIGVudGVyIG9yIGVzY2FwZVxuICAgIGlmIChlLmtleUNvZGUgPT0gMTMgfHwgZS5rZXlDb2RlID09IDI3KSBlbC5ibHVyKCk7XG4gIH0pO1xuXG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgZnVuY3Rpb24gKCkge1xuICAgIGVsLnZhbHVlID8gZmlsdGVyUGhyYXNlcygpIDogc2hvd0FsbCgpO1xuICB9KTtcblxufShkb2N1bWVudCwgc2xhbmdib29rKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=