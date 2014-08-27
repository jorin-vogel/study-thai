!function (doc, app) {

  var el;


  el = doc.getElementById('main');



  app.main = {

    open: function (animate) {
      el.classList[animate ? 'add' : 'remove']('animate');
      el.classList.remove('hide');
    },


    close: function (animate) {
      el.classList[animate ? 'add' : 'remove']('animate');
      el.classList.add('hide');
    }

  };



}(document, slangbook);