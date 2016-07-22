var app = angular.module('searchmedia', []);

app.controller('MainCtrl', function($scope, $http) {

    $http.get('/admin/searchfolder').success(function(data) {
        $scope.basenav = data.basenav;
        $scope.folderList = data.folderList;
        $scope.photoArray = data.photoArray;
        $scope.folder = data.folderList[data.basenav[0]];
        $scope.themeSet = data.basenav[0];
        $scope.key = $scope.themeSet + ',' + $scope.folder[0];
    });

    $scope.$on('themechange', function(event, data) {
        $scope.themeSet = $scope.basenav[data];
        $scope.folder = $scope.folderList[$scope.themeSet];
        $scope.key = $scope.themeSet + ',' + $scope.folder[0];
    });

    $scope.$on('folderchange', function(event, data) {
        $scope.key = $scope.themeSet + ',' + $scope.folder[data];
    });

});

app.controller('TabController', function($scope) {
    this.tab = 0;

    this.setTab = function(newValue, flag) {
        this.tab = newValue;
        if (flag === 1) {
            $scope.$parent.$broadcast('themechange', newValue);
        }
        if (flag === 2) {
            $scope.$parent.$broadcast('folderchange', newValue);
        }
    };

    this.isSet = function(tabName) {
        return this.tab === tabName;
    };

});

app.controller('GalleryController', function($scope) {
    $scope.current = 0;
    this.setCurrent = function(newGallery) {
        $scope.current = newGallery || 0;
    };
    this.incCurrent = function() {
        $scope.current += 1;
    };
    this.decCurrent = function() {
        $scope.current -= 1;
    };
    $scope.$on('themechange', function(event, data) {
        $scope.current = 0;
    });

    $scope.$on('folderchange', function(event, data) {
        $scope.current = 0;
    });
});

app.controller('ButtonController', function($scope, $http) {
    this.callLoad = function() {
        $http.get('/admin/addphotos/' + $scope.key).success(function() {

        });
    };
});
