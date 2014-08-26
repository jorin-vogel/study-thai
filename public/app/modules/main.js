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