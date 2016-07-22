var app = angular.module('gallery', []);

app.controller('MainCtrl', function($scope, $http) {

});

app.controller('CatController', function($scope, $http) {
    $scope.tab = 0;

    this.setTab = function(newValue) {
        $scope.tab = newValue;
        $http.get('/gallery/gallerydata/' + $scope.category).success(function(data) {
            $scope.basenav = data.basenav;
            $scope.category = data.category;
            $scope.photoArray = data.photoArray;
        });
    };

    this.isSet = function(tabName) {
        return $scope.tab === tabName;
    };

    $scope.$on('photochange', function(event, data) {
        $scope.tab = $scope.category.indexOf(data);
    });

});

