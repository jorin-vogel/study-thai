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