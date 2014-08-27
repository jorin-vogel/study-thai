!function (doc, app) {

  var el;


  el = doc.querySelector('#main aside');



  app.aside = {

    focus: function () {
      el.classList.add('focus');
    },


    blur: function () {
      el.classList.remove('focus');
    }

  };



}(document, slangbook);