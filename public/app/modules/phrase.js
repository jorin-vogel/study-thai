!function (doc, app) {

  var data;


  data = window.phrases;



  app.phrase = {

    forEach: function (fn) {
      data.forEach(fn);
    },


    match: function (phrase, query) {
      var i, props;

      props = Object.keys(phrase);

      for (i = 0; i < props.length; i++) {
        if ( query.test(phrase[props[i]]) ) return true;
      }

      return false;
    },


    byId: function (id) {
      var i, phrase;

      for (i = 0; i < data.length; i++) {
        phrase = data[i];
        if (phrase.id == id) return phrase;
      }
    },


    add: function (phrase) {
      data.unshift(phrase);
    },


    remove: function (phrase) {
      var index = data.indexOf(phrase);
      data.splice(index, 1);
    }

  };



}(document, slangbook);