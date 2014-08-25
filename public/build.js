angular.module('study', [])

  .run(["$rootScope", "$location", "$window", "$timeout", function ($rootScope, $location, $window, $timeout) {

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

  }]);


angular.module('study').controller('EditController', ["$scope", "$rootScope", "$http", "$location", function ($scope, $rootScope, $http, $location) {


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
      .error(function (msg) {
        err(msg, 'add', phrase.en);
      });

    $location.url('/');

  };


  $scope.update = function () {

    var phrase = getData();

    $http.put('api/phrases/' + $scope.id, phrase)
      .success(function () {
        updatePhrase($scope.id, phrase);
      })
      .error(function (msg) {
        err(msg, 'update', phrase.en);
      });

    $location.url('/');

  };

  $scope.destroy = function ($event) {

    $event.preventDefault();

    if (!confirm('You really want to delete this phrase?')) return;

    $http.delete('api/phrases/' + $scope.id)
      .success(function () {
        removePhrase($scope.id);
      })
      .error(function (msg) {
        err(msg, 'delete', phrase.en);
      });

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

  function err(msg, action, phrase) {
    console.log('ERROR at: '+action+' "'+phrase+'" : ',  msg);
    alert('Sorry, something went wrong while trying to '+action+' '+phrase+'. Try again.');
  }



  if (angular.isObject($rootScope.edit)) {
    $scope.edit($rootScope.edit);
  } else {
    $scope.empty();
  }


}]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN0dWR5LmpzIiwiY29udHJvbGxlcnMvRWRpdENvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJwdWJsaWMvYnVpbGQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJhbmd1bGFyLm1vZHVsZSgnc3R1ZHknLCBbXSlcblxuICAucnVuKGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkbG9jYXRpb24sICR3aW5kb3csICR0aW1lb3V0KSB7XG5cbiAgICAkcm9vdFNjb3BlLnNlYXJjaCAgICAgID0gJyc7XG4gICAgJHJvb3RTY29wZS5waHJhc2VzICAgICA9IHdpbmRvdy5waHJhc2VzO1xuICAgICRyb290U2NvcGUuZWRpdCAgICAgICAgPSBmYWxzZTtcbiAgICAkcm9vdFNjb3BlLnNlYXJjaEZvY3VzID0gZmFsc2U7XG4gICAgJHJvb3RTY29wZS5zY3JvbGxUb3AgICA9IDA7XG5cbiAgICAkcm9vdFNjb3BlLmZvY3VzU2VhcmNoID0gZnVuY3Rpb24gKCkge1xuICAgICAgJHJvb3RTY29wZS5zZWFyY2hGb2N1cyA9IHRydWU7XG4gICAgfTtcblxuICAgICRyb290U2NvcGUub3BlbiA9IGZ1bmN0aW9uIChwaHJhc2UpIHtcbiAgICAgICRsb2NhdGlvbi51cmwoJ2VkaXQvJyArIHBocmFzZS5pZCk7XG4gICAgfTtcblxuICAgICRyb290U2NvcGUuJG9uKCckbG9jYXRpb25DaGFuZ2VTdWNjZXNzJywgZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIG1hdGNoO1xuICAgICAgaWYgKCRsb2NhdGlvbi51cmwoKSA9PT0gJy9hZGQnKSB7XG4gICAgICAgICRyb290U2NvcGUuc2Nyb2xsVG9wID0gZG9jdW1lbnQuYm9keS5zY3JvbGxUb3A7XG4gICAgICAgICRyb290U2NvcGUuZWRpdCA9IHRydWU7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChtYXRjaCA9ICRsb2NhdGlvbi51cmwoKS5tYXRjaCgvXlxcL2VkaXRcXC8oLispLykpIHtcbiAgICAgICAgJHJvb3RTY29wZS5zY3JvbGxUb3AgPSBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcDtcbiAgICAgICAgJHJvb3RTY29wZS5lZGl0ID0gZmluZFBocmFzZShtYXRjaFsxXSk7XG4gICAgICAgIGlmICghJHJvb3RTY29wZS5lZGl0KSAkbG9jYXRpb24udXJsKCcvJyk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgaWYgKCRsb2NhdGlvbi51cmwoKSAhPT0gJy8nKSByZXR1cm4gJGxvY2F0aW9uLnVybCgnLycpO1xuICAgICAgICAkcm9vdFNjb3BlLmVkaXQgPSBmYWxzZTtcbiAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wID0gJHJvb3RTY29wZS5zY3JvbGxUb3A7XG4gICAgICAgIH0sIDApO1xuICAgICAgfVxuICAgIH0pO1xuXG5cbiAgICBmdW5jdGlvbiBmaW5kUGhyYXNlKGlkKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8ICRyb290U2NvcGUucGhyYXNlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgcGhyYXNlID0gJHJvb3RTY29wZS5waHJhc2VzW2ldO1xuICAgICAgICBpZiAocGhyYXNlLmlkID09IGlkKSByZXR1cm4gcGhyYXNlO1xuICAgICAgfVxuICAgIH1cblxuICB9KTtcblxuIiwiYW5ndWxhci5tb2R1bGUoJ3N0dWR5JykuY29udHJvbGxlcignRWRpdENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkcm9vdFNjb3BlLCAkaHR0cCwgJGxvY2F0aW9uKSB7XG5cblxuICAkc2NvcGUuZW1wdHkgPSBmdW5jdGlvbiAoKSB7XG4gICAgJHNjb3BlLmlkICAgPSBudWxsO1xuICAgICRzY29wZS5lbiAgID0gJyc7XG4gICAgJHNjb3BlLnRoICAgPSAnJztcbiAgICAkc2NvcGUudGFncyA9ICcnO1xuICB9XG5cbiAgJHNjb3BlLmVkaXQgPSBmdW5jdGlvbiAocGhyYXNlKSB7XG4gICAgYW5ndWxhci5leHRlbmQoJHNjb3BlLCBwaHJhc2UpO1xuICB9XG5cblxuICAkc2NvcGUuYWRkID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIHBocmFzZSA9IGdldERhdGEoKTtcblxuICAgICRodHRwLnBvc3QoJ2FwaS9waHJhc2VzJywgcGhyYXNlKVxuICAgICAgLnN1Y2Nlc3MoZnVuY3Rpb24gKHJlcykge1xuICAgICAgICBwaHJhc2UuaWQgPSByZXMuaWQ7XG4gICAgICAgICRyb290U2NvcGUucGhyYXNlcy51bnNoaWZ0KHBocmFzZSk7XG4gICAgICB9KVxuICAgICAgLmVycm9yKGZ1bmN0aW9uIChtc2cpIHtcbiAgICAgICAgZXJyKG1zZywgJ2FkZCcsIHBocmFzZS5lbik7XG4gICAgICB9KTtcblxuICAgICRsb2NhdGlvbi51cmwoJy8nKTtcblxuICB9O1xuXG5cbiAgJHNjb3BlLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBwaHJhc2UgPSBnZXREYXRhKCk7XG5cbiAgICAkaHR0cC5wdXQoJ2FwaS9waHJhc2VzLycgKyAkc2NvcGUuaWQsIHBocmFzZSlcbiAgICAgIC5zdWNjZXNzKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdXBkYXRlUGhyYXNlKCRzY29wZS5pZCwgcGhyYXNlKTtcbiAgICAgIH0pXG4gICAgICAuZXJyb3IoZnVuY3Rpb24gKG1zZykge1xuICAgICAgICBlcnIobXNnLCAndXBkYXRlJywgcGhyYXNlLmVuKTtcbiAgICAgIH0pO1xuXG4gICAgJGxvY2F0aW9uLnVybCgnLycpO1xuXG4gIH07XG5cbiAgJHNjb3BlLmRlc3Ryb3kgPSBmdW5jdGlvbiAoJGV2ZW50KSB7XG5cbiAgICAkZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIGlmICghY29uZmlybSgnWW91IHJlYWxseSB3YW50IHRvIGRlbGV0ZSB0aGlzIHBocmFzZT8nKSkgcmV0dXJuO1xuXG4gICAgJGh0dHAuZGVsZXRlKCdhcGkvcGhyYXNlcy8nICsgJHNjb3BlLmlkKVxuICAgICAgLnN1Y2Nlc3MoZnVuY3Rpb24gKCkge1xuICAgICAgICByZW1vdmVQaHJhc2UoJHNjb3BlLmlkKTtcbiAgICAgIH0pXG4gICAgICAuZXJyb3IoZnVuY3Rpb24gKG1zZykge1xuICAgICAgICBlcnIobXNnLCAnZGVsZXRlJywgcGhyYXNlLmVuKTtcbiAgICAgIH0pO1xuXG4gICAgJGxvY2F0aW9uLnVybCgnLycpO1xuXG4gIH07XG5cblxuICBmdW5jdGlvbiBnZXREYXRhKCkge1xuICAgIHJldHVybiB7XG4gICAgICBlbjogJHNjb3BlLmVuLFxuICAgICAgdGg6ICRzY29wZS50aCxcbiAgICAgIHRhZ3M6ICRzY29wZS50YWdzXG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZVBocmFzZShpZCwgZGF0YSkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgJHJvb3RTY29wZS5waHJhc2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgcGhyYXNlID0gJHJvb3RTY29wZS5waHJhc2VzW2ldO1xuICAgICAgaWYgKHBocmFzZS5pZCA9PT0gaWQpIHtcbiAgICAgICAgYW5ndWxhci5leHRlbmQocGhyYXNlLCBkYXRhKVxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlUGhyYXNlKGlkKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAkcm9vdFNjb3BlLnBocmFzZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICgkcm9vdFNjb3BlLnBocmFzZXNbaV0uaWQgPT09IGlkKSB7XG4gICAgICAgICRyb290U2NvcGUucGhyYXNlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBlcnIobXNnLCBhY3Rpb24sIHBocmFzZSkge1xuICAgIGNvbnNvbGUubG9nKCdFUlJPUiBhdDogJythY3Rpb24rJyBcIicrcGhyYXNlKydcIiA6ICcsICBtc2cpO1xuICAgIGFsZXJ0KCdTb3JyeSwgc29tZXRoaW5nIHdlbnQgd3Jvbmcgd2hpbGUgdHJ5aW5nIHRvICcrYWN0aW9uKycgJytwaHJhc2UrJy4gVHJ5IGFnYWluLicpO1xuICB9XG5cblxuXG4gIGlmIChhbmd1bGFyLmlzT2JqZWN0KCRyb290U2NvcGUuZWRpdCkpIHtcbiAgICAkc2NvcGUuZWRpdCgkcm9vdFNjb3BlLmVkaXQpO1xuICB9IGVsc2Uge1xuICAgICRzY29wZS5lbXB0eSgpO1xuICB9XG5cblxufSk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9