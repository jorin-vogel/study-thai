angular.module('study').controller('EditController', function ($scope, $rootScope, $http, $location) {


  $scope.empty = function () {
    $scope.id   = null;
    $scope.en   = '';
    $scope.th   = '';
    $scope.tags = '';
  }

  $scope.edit = function (phrase) {
    angular.extend($scope, phrase);
  }


  $scope.add = function () {

    var phrase = getData();

    $http.post('api/phrases', phrase)
      .success(function (res) {
        phrase.id = res.id;
        $rootScope.phrases.unshift(phrase);
      })
      .error(err);

    $location.url('/');

  };


  $scope.update = function () {

    var phrase = getData();

    $http.put('api/phrases/' + $scope.id, phrase)
      .success(function () {
        updatePhrase($scope.id, phrase);
      })
      .error(err);

    $location.url('/');

  };

  $scope.destroy = function ($event) {

    $event.preventDefault();

    if (!confirm('You really want to delete this phrase?')) return;

    $http.delete('api/phrases/' + $scope.id)
      .success(function () {
        removePhrase($scope.id);
      })
      .error(err);

    $location.url('/');

  };


  function getData() {
    return {
      en: $scope.en,
      th: $scope.th,
      tags: $scope.tags
    };
  }

  function updatePhrase(id, data) {
    for (var i = 0; i < $rootScope.phrases.length; i++) {
      var phrase = $rootScope.phrases[i];
      if (phrase.id === id) {
        angular.extend(phrase, data)
        return;
      }
    }
  }

  function removePhrase(id) {
    for (var i = 0; i < $rootScope.phrases.length; i++) {
      if ($rootScope.phrases[i].id === id) {
        $rootScope.phrases.splice(i, 1);
        return;
      }
    }
  }

  function err(msg) {
    console.log(msg);
    alert('Sorry, something went wrong. Try again.');
  }



  if (angular.isObject($rootScope.edit)) {
    $scope.edit($rootScope.edit);
  } else {
    $scope.empty();
  }


});