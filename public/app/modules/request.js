!function (doc, app) {

  var BASE_URL = '/api/phrases';


  app.request = function (options, cb) {
    var req, url, method;

    req = new XMLHttpRequest();
    url = options.id ? BASE_URL +'/'+options.id : BASE_URL;
    method = options.method.toUpperCase();

    req.open(method, url, true);

    if (method == 'POST' || method == 'PUT') {
      req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    }

    req.onload = function () {
      if (req.status >= 200 && req.status < 400) {
        cb(req.responseText ? JSON.parse(req.responseText): undefined);
      } else {
        req.onerror(req.statusText);
      }
    };

    req.onerror = function (msg) {
      app.list.reload();
      err(msg, options.action, options.name);
    };

    req.send(JSON.stringify(options.data));
  };



  function err(msg, action, phrase) {
    console.log('ERROR at: '+action+' "'+phrase+'" : ',  msg);
    alert('Sorry, something went wrong while trying to '+action+' '+phrase+'. Try again.');
  }



}(document, slangbook);