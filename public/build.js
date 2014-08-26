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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiLCJjb250cm9sbGVycy9FZGl0Q29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoicHVibGljL2J1aWxkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiYW5ndWxhci5tb2R1bGUoJ3N0dWR5JywgW10pXG5cbiAgLnJ1bihmdW5jdGlvbiAoJHJvb3RTY29wZSwgJGxvY2F0aW9uLCAkd2luZG93LCAkdGltZW91dCkge1xuXG4gICAgJHJvb3RTY29wZS5zZWFyY2ggICAgICA9ICcnO1xuICAgICRyb290U2NvcGUucGhyYXNlcyAgICAgPSB3aW5kb3cucGhyYXNlcztcbiAgICAkcm9vdFNjb3BlLmVkaXQgICAgICAgID0gZmFsc2U7XG4gICAgJHJvb3RTY29wZS5zZWFyY2hGb2N1cyA9IGZhbHNlO1xuICAgICRyb290U2NvcGUuc2Nyb2xsVG9wICAgPSAwO1xuXG4gICAgJHJvb3RTY29wZS5mb2N1c1NlYXJjaCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICRyb290U2NvcGUuc2VhcmNoRm9jdXMgPSB0cnVlO1xuICAgIH07XG5cbiAgICAkcm9vdFNjb3BlLm9wZW4gPSBmdW5jdGlvbiAocGhyYXNlKSB7XG4gICAgICAkbG9jYXRpb24udXJsKCdlZGl0LycgKyBwaHJhc2UuaWQpO1xuICAgIH07XG5cbiAgICAkcm9vdFNjb3BlLiRvbignJGxvY2F0aW9uQ2hhbmdlU3VjY2VzcycsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBtYXRjaDtcbiAgICAgIGlmICgkbG9jYXRpb24udXJsKCkgPT09ICcvYWRkJykge1xuICAgICAgICAkcm9vdFNjb3BlLnNjcm9sbFRvcCA9IGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wO1xuICAgICAgICBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCA9IDA7XG4gICAgICAgICRyb290U2NvcGUuZWRpdCA9IHRydWU7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChtYXRjaCA9ICRsb2NhdGlvbi51cmwoKS5tYXRjaCgvXlxcL2VkaXRcXC8oLispLykpIHtcbiAgICAgICAgJHJvb3RTY29wZS5zY3JvbGxUb3AgPSBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcDtcbiAgICAgICAgJHJvb3RTY29wZS5lZGl0ID0gZmluZFBocmFzZShtYXRjaFsxXSk7XG4gICAgICAgIGlmICghJHJvb3RTY29wZS5lZGl0KSAkbG9jYXRpb24udXJsKCcvJyk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgaWYgKCRsb2NhdGlvbi51cmwoKSAhPT0gJy8nKSByZXR1cm4gJGxvY2F0aW9uLnVybCgnLycpO1xuICAgICAgICAkcm9vdFNjb3BlLmVkaXQgPSBmYWxzZTtcbiAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wID0gJHJvb3RTY29wZS5zY3JvbGxUb3A7XG4gICAgICAgIH0sIDApO1xuICAgICAgfVxuICAgIH0pO1xuXG5cbiAgICBmdW5jdGlvbiBmaW5kUGhyYXNlKGlkKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8ICRyb290U2NvcGUucGhyYXNlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgcGhyYXNlID0gJHJvb3RTY29wZS5waHJhc2VzW2ldO1xuICAgICAgICBpZiAocGhyYXNlLmlkID09IGlkKSByZXR1cm4gcGhyYXNlO1xuICAgICAgfVxuICAgIH1cblxuICB9KTtcblxuIiwiYW5ndWxhci5tb2R1bGUoJ3N0dWR5JykuY29udHJvbGxlcignRWRpdENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkcm9vdFNjb3BlLCAkaHR0cCwgJGxvY2F0aW9uKSB7XG5cblxuICAkc2NvcGUuZW1wdHkgPSBmdW5jdGlvbiAoKSB7XG4gICAgJHNjb3BlLmlkICAgPSBudWxsO1xuICAgICRzY29wZS5lbiAgID0gJyc7XG4gICAgJHNjb3BlLnRoICAgPSAnJztcbiAgICAkc2NvcGUudGFncyA9ICcnO1xuICB9XG5cbiAgJHNjb3BlLmVkaXQgPSBmdW5jdGlvbiAocGhyYXNlKSB7XG4gICAgYW5ndWxhci5leHRlbmQoJHNjb3BlLCBwaHJhc2UpO1xuICB9XG5cblxuICAkc2NvcGUuYWRkID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIHBocmFzZSA9IGdldERhdGEoKTtcblxuICAgICRodHRwLnBvc3QoJ2FwaS9waHJhc2VzJywgcGhyYXNlKVxuICAgICAgLnN1Y2Nlc3MoZnVuY3Rpb24gKHJlcykge1xuICAgICAgICBwaHJhc2UuaWQgPSByZXMuaWQ7XG4gICAgICAgICRyb290U2NvcGUucGhyYXNlcy51bnNoaWZ0KHBocmFzZSk7XG4gICAgICB9KVxuICAgICAgLmVycm9yKGZ1bmN0aW9uIChtc2cpIHtcbiAgICAgICAgZXJyKG1zZywgJ2FkZCcsIHBocmFzZS5lbik7XG4gICAgICB9KTtcblxuICAgICRsb2NhdGlvbi51cmwoJy8nKTtcblxuICB9O1xuXG5cbiAgJHNjb3BlLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBwaHJhc2UgPSBnZXREYXRhKCk7XG5cbiAgICAkaHR0cC5wdXQoJ2FwaS9waHJhc2VzLycgKyAkc2NvcGUuaWQsIHBocmFzZSlcbiAgICAgIC5zdWNjZXNzKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdXBkYXRlUGhyYXNlKCRzY29wZS5pZCwgcGhyYXNlKTtcbiAgICAgIH0pXG4gICAgICAuZXJyb3IoZnVuY3Rpb24gKG1zZykge1xuICAgICAgICBlcnIobXNnLCAndXBkYXRlJywgcGhyYXNlLmVuKTtcbiAgICAgIH0pO1xuXG4gICAgJGxvY2F0aW9uLnVybCgnLycpO1xuXG4gIH07XG5cbiAgJHNjb3BlLmRlc3Ryb3kgPSBmdW5jdGlvbiAoJGV2ZW50KSB7XG5cbiAgICAkZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIGlmICghY29uZmlybSgnWW91IHJlYWxseSB3YW50IHRvIGRlbGV0ZSB0aGlzIHBocmFzZT8nKSkgcmV0dXJuO1xuXG4gICAgJGh0dHAuZGVsZXRlKCdhcGkvcGhyYXNlcy8nICsgJHNjb3BlLmlkKVxuICAgICAgLnN1Y2Nlc3MoZnVuY3Rpb24gKCkge1xuICAgICAgICByZW1vdmVQaHJhc2UoJHNjb3BlLmlkKTtcbiAgICAgIH0pXG4gICAgICAuZXJyb3IoZnVuY3Rpb24gKG1zZykge1xuICAgICAgICBlcnIobXNnLCAnZGVsZXRlJywgcGhyYXNlLmVuKTtcbiAgICAgIH0pO1xuXG4gICAgJGxvY2F0aW9uLnVybCgnLycpO1xuXG4gIH07XG5cblxuICBmdW5jdGlvbiBnZXREYXRhKCkge1xuICAgIHJldHVybiB7XG4gICAgICBlbjogJHNjb3BlLmVuLFxuICAgICAgdGg6ICRzY29wZS50aCxcbiAgICAgIHRhZ3M6ICRzY29wZS50YWdzXG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZVBocmFzZShpZCwgZGF0YSkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgJHJvb3RTY29wZS5waHJhc2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgcGhyYXNlID0gJHJvb3RTY29wZS5waHJhc2VzW2ldO1xuICAgICAgaWYgKHBocmFzZS5pZCA9PT0gaWQpIHtcbiAgICAgICAgYW5ndWxhci5leHRlbmQocGhyYXNlLCBkYXRhKVxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlUGhyYXNlKGlkKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAkcm9vdFNjb3BlLnBocmFzZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICgkcm9vdFNjb3BlLnBocmFzZXNbaV0uaWQgPT09IGlkKSB7XG4gICAgICAgICRyb290U2NvcGUucGhyYXNlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBlcnIobXNnLCBhY3Rpb24sIHBocmFzZSkge1xuICAgIGNvbnNvbGUubG9nKCdFUlJPUiBhdDogJythY3Rpb24rJyBcIicrcGhyYXNlKydcIiA6ICcsICBtc2cpO1xuICAgIGFsZXJ0KCdTb3JyeSwgc29tZXRoaW5nIHdlbnQgd3Jvbmcgd2hpbGUgdHJ5aW5nIHRvICcrYWN0aW9uKycgJytwaHJhc2UrJy4gVHJ5IGFnYWluLicpO1xuICB9XG5cblxuXG4gIGlmIChhbmd1bGFyLmlzT2JqZWN0KCRyb290U2NvcGUuZWRpdCkpIHtcbiAgICAkc2NvcGUuZWRpdCgkcm9vdFNjb3BlLmVkaXQpO1xuICB9IGVsc2Uge1xuICAgICRzY29wZS5lbXB0eSgpO1xuICB9XG5cblxufSk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9