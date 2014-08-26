angular.module('study', [])

  .run(function ($rootScope, $location, $window, $timeout) {

    $rootScope.search      = '';
    $rootScope.phrases     = window.phrases;
    $rootScope.edit        = false;
    $rootScope.searchFocus = false;
    $rootScope.scrollTop   = 0;

    $rootScope.focusSearch = function () {
      $rootScope.searchFocus = true;
    };

    $rootScope.open = function (phrase) {
      $location.url('edit/' + phrase.id);
    };

    $rootScope.$on('$locationChangeSuccess', function () {
      var match;
      if ($location.url() === '/add') {
        $rootScope.scrollTop = document.body.scrollTop;
        document.body.scrollTop = 0;
        $rootScope.edit = true;
      }
      else if (match = $location.url().match(/^\/edit\/(.+)/)) {
        $rootScope.scrollTop = document.body.scrollTop;
        $rootScope.edit = findPhrase(match[1]);
        if (!$rootScope.edit) $location.url('/');
      }
      else {
        if ($location.url() !== '/') return $location.url('/');
        $rootScope.edit = false;
        $timeout(function () {
          document.body.scrollTop = $rootScope.scrollTop;
        }, 0);
      }
    });


    function findPhrase(id) {
      for (var i = 0; i < $rootScope.phrases.length; i++) {
        var phrase = $rootScope.phrases[i];
        if (phrase.id == id) return phrase;
      }
    }

  });

