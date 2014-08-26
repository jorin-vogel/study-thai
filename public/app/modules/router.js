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