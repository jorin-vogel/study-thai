angular.module('study', [])

  .run(function ($rootScope, $location) {

    $rootScope.page    = 'main';
    $rootScope.search  = '';
    $rootScope.phrases = window.phrases;
    $rootScope.edit    = false;

    $rootScope.open = function (phrase) {
      $location.url('edit/' + phrase.id);
    };

    $rootScope.$on('$locationChangeSuccess', function () {
      var match;
      if ($location.url() === '/add') {
        $rootScope.edit = true;
      }
      else if (match = $location.url().match(/^\/edit\/(.+)/)) {
        $rootScope.edit = findPhrase(match[1]);
        if (!$rootScope.edit) $location.url('/');
      }
      else {
        $rootScope.edit = false;
        if ($location.url() !== '/') $location.url('/');
      }
    });


    function findPhrase(id) {
      for (var i = 0; i < $rootScope.phrases.length; i++) {
        var phrase = $rootScope.phrases[i];
        if (phrase.id == id) return phrase;
      }
    }

  });

