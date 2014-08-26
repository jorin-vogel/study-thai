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


  function open(id) {
    id ? load(id) : empty();

    lang1.value = phrase.lang1;
    lang2.value = phrase.lang2;
    tags.value  = phrase.tags;

    el.classList.add('show');
  }

  function close() {
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

  function open() {
    el.classList.remove('hide');
  }

  function close() {
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
    handleRoute();
  }

  function handleRoute () {
    var url, match;

    url = location.pathname;

    // /
    if (url.match(/^\/?$/)) {
      app.edit.close();
      app.main.open();
    }
    // /add
    else if (url.match(/^\/add\/?$/)) {
      app.main.close();
      app.edit.open();
    }
    // /edit:id
    else if (match = url.match(/^\/edit\/([0-9]+)\/?$/)) {
      app.main.close();
      app.edit.open(match[1]);
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
    handleRoute();
  });

  window.onpopstate = handleRoute;



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

  el.addEventListener('input', function () {
    el.value ? filterPhrases() : showAll();
  });

}(document, slangbook);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsIm1vZHVsZXMvYXNpZGUuanMiLCJtb2R1bGVzL2VkaXQuanMiLCJtb2R1bGVzL2xpc3QuanMiLCJtb2R1bGVzL21haW4uanMiLCJtb2R1bGVzL3BocmFzZS5qcyIsIm1vZHVsZXMvcmVxdWVzdC5qcyIsIm1vZHVsZXMvcm91dGVyLmpzIiwibW9kdWxlcy9zZWFyY2guanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJwdWJsaWMvYnVpbGQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIhZnVuY3Rpb24gKGRvYykge1xuXG5cbiAgd2luZG93LnNsYW5nYm9vayA9IHt9O1xuXG4gIGRvYy5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oKSB7XG4gICAgZG9jLmJvZHkuc3R5bGUub3BhY2l0eSA9IDE7XG4gIH0pO1xuXG59KGRvY3VtZW50KTsiLCIhZnVuY3Rpb24gKGRvYywgYXBwKSB7XG5cbiAgdmFyIGVsO1xuXG5cbiAgZWwgPSBkb2MucXVlcnlTZWxlY3RvcignI21haW4gYXNpZGUnKTtcblxuICBmdW5jdGlvbiBmb2N1cygpIHtcbiAgICBlbC5jbGFzc0xpc3QuYWRkKCdmb2N1cycpO1xuICB9XG5cbiAgZnVuY3Rpb24gYmx1cigpIHtcbiAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdmb2N1cycpO1xuICB9XG5cblxuXG4gIGFwcC5hc2lkZSA9IHtcbiAgICBmb2N1czogZm9jdXMsXG4gICAgYmx1cjogYmx1clxuICB9O1xuXG59KGRvY3VtZW50LCBzbGFuZ2Jvb2spOyIsIiFmdW5jdGlvbiAoZG9jLCBhcHApIHtcblxuICB2YXIgZWwsIGZvcm0sIHBocmFzZSwgbGFuZzEsIGxhbmcyLCB0YWdzO1xuXG5cbiAgZWwgICAgID0gZG9jLmdldEVsZW1lbnRCeUlkKCdlZGl0Jyk7XG4gIGZvcm0gICA9IGVsLnF1ZXJ5U2VsZWN0b3IoJ2Zvcm0nKTtcbiAgbGFuZzEgID0gZm9ybS5xdWVyeVNlbGVjdG9yKCcubGFuZzEnKTtcbiAgbGFuZzIgID0gZm9ybS5xdWVyeVNlbGVjdG9yKCcubGFuZzInKTtcbiAgdGFncyAgID0gZm9ybS5xdWVyeVNlbGVjdG9yKCcudGFncycpO1xuICBidXR0b24gPSBlbC5xdWVyeVNlbGVjdG9yKCdidXR0b24nKTtcblxuXG4gIGZ1bmN0aW9uIG9wZW4oaWQpIHtcbiAgICBpZCA/IGxvYWQoaWQpIDogZW1wdHkoKTtcblxuICAgIGxhbmcxLnZhbHVlID0gcGhyYXNlLmxhbmcxO1xuICAgIGxhbmcyLnZhbHVlID0gcGhyYXNlLmxhbmcyO1xuICAgIHRhZ3MudmFsdWUgID0gcGhyYXNlLnRhZ3M7XG5cbiAgICBlbC5jbGFzc0xpc3QuYWRkKCdzaG93Jyk7XG4gIH1cblxuICBmdW5jdGlvbiBjbG9zZSgpIHtcbiAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdzaG93Jyk7XG4gIH1cblxuICBmdW5jdGlvbiBsb2FkKGlkKSB7XG4gICAgcGhyYXNlID0gYXBwLnBocmFzZS5ieUlkKGlkKTtcbiAgICBpZiAoIXBocmFzZSkgYXBwLnJvdXRlci5nbygnLycpO1xuICAgIGJ1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4gIH1cblxuICBmdW5jdGlvbiBlbXB0eSgpIHtcbiAgICBwaHJhc2UgPSB7XG4gICAgICBsYW5nMTogJycsXG4gICAgICBsYW5nMjogJycsXG4gICAgICB0YWdzOiAgJydcbiAgICB9O1xuICAgIGJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gIH1cblxuICBmdW5jdGlvbiBsb2FkRnJvbURPTSgpIHtcbiAgICBwaHJhc2UubGFuZzEgPSBsYW5nMS52YWx1ZTtcbiAgICBwaHJhc2UubGFuZzIgPSBsYW5nMi52YWx1ZTtcbiAgICBwaHJhc2UudGFncyAgPSB0YWdzLnZhbHVlO1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlKCkge1xuICAgIGxvYWRGcm9tRE9NKCk7XG4gICAgYXBwLnJlcXVlc3Qoe1xuICAgICAgbWV0aG9kOiAncG9zdCcsXG4gICAgICBkYXRhOiBwaHJhc2UsXG4gICAgICBuYW1lOiBwaHJhc2UubGFuZzEsXG4gICAgICBhY3Rpb246ICdjcmVhdGUnXG4gICAgfSwgZnVuY3Rpb24gKHJlcykge1xuICAgICAgcGhyYXNlLmlkID0gcmVzLmlkO1xuICAgICAgYXBwLmxpc3QuYWRkKHBocmFzZSk7XG4gICAgfSk7XG5cbiAgICBhcHAucm91dGVyLmdvKCcvJyk7XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGUoKSB7XG4gICAgbG9hZEZyb21ET00oKTtcbiAgICBhcHAucmVxdWVzdCh7XG4gICAgICBtZXRob2Q6ICdwdXQnLFxuICAgICAgaWQ6IHBocmFzZS5pZCxcbiAgICAgIGRhdGE6IHBocmFzZSxcbiAgICAgIG5hbWU6IHBocmFzZS5sYW5nMSxcbiAgICAgIGFjdGlvbjogJ3VwZGF0ZSdcbiAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICBhcHAubGlzdC51cGRhdGUocGhyYXNlKTtcbiAgICB9KTtcblxuICAgIGFwcC5yb3V0ZXIuZ28oJy8nKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gICAgaWYgKCFjb25maXJtKCdZb3UgcmVhbGx5IHdhbnQgdG8gZGVsZXRlIHRoaXMgcGhyYXNlPycpKSByZXR1cm47XG5cbiAgICBhcHAucmVxdWVzdCh7XG4gICAgICBtZXRob2Q6ICdkZWxldGUnLFxuICAgICAgaWQ6IHBocmFzZS5pZCxcbiAgICAgIG5hbWU6IHBocmFzZS5sYW5nMSxcbiAgICAgIGFjdGlvbjogJ2RlbGV0ZSdcbiAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICBhcHAubGlzdC5yZW1vdmUocGhyYXNlKTtcbiAgICB9KTtcblxuICAgIGFwcC5yb3V0ZXIuZ28oJy8nKTtcbiAgfVxuXG5cbiAgZm9ybS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCBmdW5jdGlvbiAoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBwaHJhc2UuaWQgPyB1cGRhdGUoKSA6IGNyZWF0ZSgpO1xuICB9KTtcblxuICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBkZXN0cm95KCk7XG4gIH0pO1xuXG5cblxuICBhcHAuZWRpdCA9IHtcbiAgICBvcGVuOiBvcGVuLFxuICAgIGNsb3NlOiBjbG9zZVxuICB9O1xuXG59KGRvY3VtZW50LCBzbGFuZ2Jvb2spOyIsIiFmdW5jdGlvbiAoZG9jLCBhcHApIHtcblxuICB2YXIgZWwsIGJhc2VJdGVtLCBpdGVtcztcblxuXG4gIGVsID0gZG9jLmdldEVsZW1lbnRCeUlkKCdwaHJhc2VzJyk7XG4gIGJhc2VJdGVtID0gZWwucmVtb3ZlQ2hpbGQoZWwucXVlcnlTZWxlY3RvcignbGknKSk7XG4gIGl0ZW1zID0gZWwuY2hpbGRyZW47XG5cblxuICBmdW5jdGlvbiBjcmVhdGVJdGVtKHBocmFzZSkge1xuICAgIHZhciBpdGVtID0gYmFzZUl0ZW0uY2xvbmVOb2RlKHRydWUpO1xuICAgIHVwZGF0ZUl0ZW0oaXRlbSwgcGhyYXNlKTtcbiAgICByZXR1cm4gaXRlbTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZUl0ZW0oaXRlbSwgcGhyYXNlKSB7XG4gICAgdmFyIHBhcmFncmFwaHMgPSBpdGVtLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdwJyk7XG4gICAgcGFyYWdyYXBoc1swXS50ZXh0Q29udGVudCA9IHBocmFzZS5sYW5nMTtcbiAgICBwYXJhZ3JhcGhzWzFdLnRleHRDb250ZW50ID0gcGhyYXNlLmxhbmcyO1xuICAgIGl0ZW0ucXVlcnlTZWxlY3RvcignYScpLnNldEF0dHJpYnV0ZSgnaHJlZicsICcvZWRpdC8nICsgcGhyYXNlLmlkKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZChwaHJhc2UpIHtcbiAgICBlbC5pbnNlcnRCZWZvcmUoIGNyZWF0ZUl0ZW0ocGhyYXNlKSwgZWwuZmlyc3RDaGlsZCApO1xuICAgIGFwcC5waHJhc2UuYWRkKHBocmFzZSk7XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGUocGhyYXNlKSB7XG4gICAgdmFyIGluZGV4ID0gYXBwLnBocmFzZS5pbmRleE9mKHBocmFzZSk7XG4gICAgdXBkYXRlSXRlbShlbC5jaGlsZHJlbltpbmRleF0sIHBocmFzZSk7XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmUocGhyYXNlKSB7XG4gICAgdmFyIGluZGV4ID0gYXBwLnBocmFzZS5yZW1vdmUocGhyYXNlKTtcbiAgICBlbC5yZW1vdmVDaGlsZChlbC5jaGlsZHJlbltpbmRleF0pO1xuICB9XG5cbiAgZnVuY3Rpb24gbG9hZCgpIHtcbiAgICB2YXIgaXRlbUNvbnRhaW5lciA9IGRvYy5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgYXBwLnBocmFzZS5mb3JFYWNoKGZ1bmN0aW9uIChwaHJhc2UpIHtcbiAgICAgIGl0ZW1Db250YWluZXIuYXBwZW5kQ2hpbGQoIGNyZWF0ZUl0ZW0ocGhyYXNlKSApO1xuICAgIH0pO1xuICAgIGVsLmFwcGVuZENoaWxkKGl0ZW1Db250YWluZXIpO1xuICB9XG5cblxuICBkb2MuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGxvYWQpO1xuXG5cblxuICBhcHAubGlzdCA9IHtcbiAgICBpdGVtczogaXRlbXMsXG4gICAgYWRkOiBhZGQsXG4gICAgdXBkYXRlOiB1cGRhdGUsXG4gICAgcmVtb3ZlOiByZW1vdmVcbiAgfTtcblxufShkb2N1bWVudCwgc2xhbmdib29rKTsiLCIhZnVuY3Rpb24gKGRvYywgYXBwKSB7XG5cbiAgdmFyIGVsO1xuXG5cbiAgZWwgPSBkb2MuZ2V0RWxlbWVudEJ5SWQoJ21haW4nKTtcblxuICBmdW5jdGlvbiBvcGVuKCkge1xuICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNsb3NlKCkge1xuICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgfVxuXG5cblxuICBhcHAubWFpbiA9IHtcbiAgICBvcGVuOiBvcGVuLFxuICAgIGNsb3NlOiBjbG9zZVxuICB9O1xuXG59KGRvY3VtZW50LCBzbGFuZ2Jvb2spOyIsIiFmdW5jdGlvbiAoZG9jLCBhcHApIHtcblxuICB2YXIgZGF0YTtcblxuICBkYXRhID0gd2luZG93LnBocmFzZXM7XG5cblxuICBmdW5jdGlvbiBmb3JFYWNoKGZuKSB7XG4gICAgZGF0YS5mb3JFYWNoKGZuKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHF1ZXJ5TWF0Y2hlc0ZvckluZGV4KGluZGV4LCBxdWVyeSkge1xuICAgIHZhciBwaHJhc2UsIGksIHByb3BzO1xuXG4gICAgcGhyYXNlID0gZGF0YVtpbmRleF07XG4gICAgcHJvcHMgPSBPYmplY3Qua2V5cyhwaHJhc2UpO1xuICAgIGZvciAoaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKCBxdWVyeS50ZXN0KHBocmFzZVtwcm9wc1tpXV0pICkgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGJ5SWQoaWQpIHtcbiAgICB2YXIgaSwgcGhyYXNlO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgIHBocmFzZSA9IGRhdGFbaV07XG4gICAgICBpZiAocGhyYXNlLmlkID09IGlkKSByZXR1cm4gcGhyYXNlO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGluZGV4T2YocGhyYXNlKSB7XG4gICAgcmV0dXJuIGRhdGEuaW5kZXhPZihwaHJhc2UpO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkKHBocmFzZSkge1xuICAgIGRhdGEudW5zaGlmdChwaHJhc2UpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlKHBocmFzZSkge1xuICAgIHZhciBpbmRleCA9IGRhdGEuaW5kZXhPZihwaHJhc2UpO1xuICAgIGRhdGEuc3BsaWNlKGluZGV4LCAxKTtcbiAgICByZXR1cm4gaW5kZXg7XG4gIH1cblxuXG4gIGFwcC5waHJhc2UgPSB7XG4gICAgZm9yRWFjaDogZm9yRWFjaCxcbiAgICBtYXRjaDogcXVlcnlNYXRjaGVzRm9ySW5kZXgsXG4gICAgYnlJZDogYnlJZCxcbiAgICBpbmRleE9mOiBpbmRleE9mLFxuICAgIGFkZDogYWRkLFxuICAgIHJlbW92ZTogcmVtb3ZlXG4gIH07XG5cbn0oZG9jdW1lbnQsIHNsYW5nYm9vayk7IiwiIWZ1bmN0aW9uIChkb2MsIGFwcCkge1xuXG4gIHZhciBCQVNFX1VSTCA9ICcvYXBpL3BocmFzZXMnO1xuXG5cbiAgZnVuY3Rpb24gcmVxdWVzdChvcHRpb25zLCBjYikge1xuICAgIHZhciByZXF1ZXN0LCB1cmwsIG1ldGhvZDtcblxuICAgIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB1cmwgPSBvcHRpb25zLmlkID8gQkFTRV9VUkwgKycvJytvcHRpb25zLmlkIDogQkFTRV9VUkw7XG4gICAgbWV0aG9kID0gb3B0aW9ucy5tZXRob2QudG9VcHBlckNhc2UoKTtcblxuICAgIHJlcXVlc3Qub3BlbihtZXRob2QsIHVybCwgdHJ1ZSk7XG5cbiAgICBpZiAobWV0aG9kID09ICdQT1NUJyB8fCBtZXRob2QgPT0gJ1BVVCcpIHtcbiAgICAgIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDsgY2hhcnNldD1VVEYtOCcpO1xuICAgIH1cblxuICAgIHJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHJlcXVlc3Quc3RhdHVzID49IDIwMCAmJiByZXF1ZXN0LnN0YXR1cyA8IDQwMCkge1xuICAgICAgICBjYihyZXF1ZXN0LnJlc3BvbnNlVGV4dCA/IEpTT04ucGFyc2UocmVxdWVzdC5yZXNwb25zZVRleHQpOiB1bmRlZmluZWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVxdWVzdC5vbmVycm9yKHJlcXVlc3Quc3RhdHVzVGV4dCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlcXVlc3Qub25lcnJvciA9IGZ1bmN0aW9uIChtc2cpIHtcbiAgICAgIGVycihtc2csIG9wdGlvbnMuYWN0aW9uLCBvcHRpb25zLm5hbWUpO1xuICAgIH07XG5cbiAgICByZXF1ZXN0LnNlbmQoSlNPTi5zdHJpbmdpZnkob3B0aW9ucy5kYXRhKSk7XG4gIH1cblxuICBmdW5jdGlvbiBlcnIobXNnLCBhY3Rpb24sIHBocmFzZSkge1xuICAgIGNvbnNvbGUubG9nKCdFUlJPUiBhdDogJythY3Rpb24rJyBcIicrcGhyYXNlKydcIiA6ICcsICBtc2cpO1xuICAgIGFsZXJ0KCdTb3JyeSwgc29tZXRoaW5nIHdlbnQgd3Jvbmcgd2hpbGUgdHJ5aW5nIHRvICcrYWN0aW9uKycgJytwaHJhc2UrJy4gVHJ5IGFnYWluLicpO1xuICB9XG5cblxuXG4gIGFwcC5yZXF1ZXN0ID0gcmVxdWVzdDtcblxufShkb2N1bWVudCwgc2xhbmdib29rKTsiLCIhZnVuY3Rpb24gKGRvYywgYXBwKSB7XG5cblxuICBmdW5jdGlvbiBnbyh1cmwpIHtcbiAgICBoaXN0b3J5LnB1c2hTdGF0ZShudWxsLCBudWxsLCB1cmwpO1xuICAgIGhhbmRsZVJvdXRlKCk7XG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVSb3V0ZSAoKSB7XG4gICAgdmFyIHVybCwgbWF0Y2g7XG5cbiAgICB1cmwgPSBsb2NhdGlvbi5wYXRobmFtZTtcblxuICAgIC8vIC9cbiAgICBpZiAodXJsLm1hdGNoKC9eXFwvPyQvKSkge1xuICAgICAgYXBwLmVkaXQuY2xvc2UoKTtcbiAgICAgIGFwcC5tYWluLm9wZW4oKTtcbiAgICB9XG4gICAgLy8gL2FkZFxuICAgIGVsc2UgaWYgKHVybC5tYXRjaCgvXlxcL2FkZFxcLz8kLykpIHtcbiAgICAgIGFwcC5tYWluLmNsb3NlKCk7XG4gICAgICBhcHAuZWRpdC5vcGVuKCk7XG4gICAgfVxuICAgIC8vIC9lZGl0OmlkXG4gICAgZWxzZSBpZiAobWF0Y2ggPSB1cmwubWF0Y2goL15cXC9lZGl0XFwvKFswLTldKylcXC8/JC8pKSB7XG4gICAgICBhcHAubWFpbi5jbG9zZSgpO1xuICAgICAgYXBwLmVkaXQub3BlbihtYXRjaFsxXSk7XG4gICAgfVxuICAgIC8vIC8qXG4gICAgZWxzZSB7XG4gICAgICBnbygnLycpO1xuICAgIH1cbiAgfTtcblxuXG4gIGRvYy5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAoZS50YXJnZXQgJiYgZS50YXJnZXQubm9kZU5hbWUgPT0gJ0EnKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBnbyhlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSk7XG4gICAgfVxuICB9LCB0cnVlKTtcblxuICBkb2MuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uKCkge1xuICAgIGhhbmRsZVJvdXRlKCk7XG4gIH0pO1xuXG4gIHdpbmRvdy5vbnBvcHN0YXRlID0gaGFuZGxlUm91dGU7XG5cblxuXG4gIGFwcC5yb3V0ZXIgPSB7XG4gICAgZ286IGdvXG4gIH07XG5cbn0oZG9jdW1lbnQsIHNsYW5nYm9vayk7IiwiIWZ1bmN0aW9uIChkb2MsIGFwcCkge1xuXG4gIHZhciBlbDtcblxuICBlbCA9IGRvYy5nZXRFbGVtZW50QnlJZCgnc2VhcmNoJyk7XG5cbiAgZnVuY3Rpb24gZmlsdGVyUGhyYXNlcygpIHtcbiAgICB2YXIgaSwgZmlsdGVyLCBpdGVtO1xuXG4gICAgZmlsdGVyID0gbmV3IFJlZ0V4cChlc2NhcGVSZWdFeHAoZWwudmFsdWUpLCAnaScpO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IGFwcC5saXN0Lml0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpdGVtID0gYXBwLmxpc3QuaXRlbXNbaV07XG4gICAgICBpdGVtLnN0eWxlLmRpc3BsYXkgPSBhcHAucGhyYXNlLm1hdGNoKGksIGZpbHRlcikgPyAnJyA6ICdub25lJztcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzaG93QWxsKCkge1xuICAgIGZvciAoaSA9IDA7IGkgPCBhcHAubGlzdC5pdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgYXBwLmxpc3QuaXRlbXNbaV0uc3R5bGUuZGlzcGxheSA9ICcnO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGVzY2FwZVJlZ0V4cChzdHIpIHtcbiAgICByZXR1cm4gc3RyLnJlcGxhY2UoL1tcXC1cXFtcXF1cXC9cXHtcXH1cXChcXClcXCpcXCtcXD9cXC5cXFxcXFxeXFwkXFx8XS9nLCBcIlxcXFwkJlwiKTtcbiAgfVxuXG5cbiAgZWwuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCBhcHAuYXNpZGUuZm9jdXMpO1xuICBlbC5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgYXBwLmFzaWRlLmJsdXIpO1xuXG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgZnVuY3Rpb24gKCkge1xuICAgIGVsLnZhbHVlID8gZmlsdGVyUGhyYXNlcygpIDogc2hvd0FsbCgpO1xuICB9KTtcblxufShkb2N1bWVudCwgc2xhbmdib29rKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=