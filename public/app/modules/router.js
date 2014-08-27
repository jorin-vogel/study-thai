!function (doc, app) {



  app.router = {

    go: function (url) {
      history.pushState(null, null, url);
      handleRoute(true);
    }

  };



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
      app.router.go('/');
    }
  };




  doc.body.addEventListener('click', function (e) {
    if (e.target && e.target.nodeName == 'A') {
      e.preventDefault();
      app.router.go(e.target.getAttribute('href'));
    }
  }, true);

  doc.addEventListener('DOMContentLoaded', function() {
    handleRoute(false);
  });


  window.onpopstate = function() {
    handleRoute(false);
  };



}(document, slangbook);