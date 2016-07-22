var app = angular.module('managemedia', []);

var photoIndex = 0;

app.factory('updateDesc', function($scope) {
    return {
        desc : $scope.desc,
        disabled: $scope.disabled
    };
});

app.controller('MainCtrl', function($scope, $http) {

    $http.get('/admin/mediadata').success(function(data) {
        $scope.category = data.category;
        $scope.basenav = data.basenav;
        $scope.folderList = data.folderList;
        $scope.photoArray = data.photoArray;
        $scope.folder = data.folderList[data.basenav[0]];
        $scope.themeSet = data.basenav[0];
        $scope.key = $scope.themeSet + $scope.folder[0];
        $scope.$broadcast('photochange', $scope.photoArray[$scope.key][0][1]);
    });

    this.callDelete = function() {
        var data = {category: null,
                    photo: $scope.photoArray[$scope.key][photoIndex][0],
                    description: $scope.photoArray[$scope.key][photoIndex][2]
                    };
        $http.post('/admin/setCategory', data).success(function() {
            $scope.photoArray[$scope.key][photoIndex][1] = null;
            $scope.$broadcast('photochange', null);
        });
    };

    $scope.$on('themechange', function(event, data) {
        $scope.themeSet = $scope.basenav[data];
        $scope.folder = $scope.folderList[$scope.themeSet];
        $scope.key = $scope.themeSet + $scope.folder[0];
        $scope.$broadcast('photochange', $scope.photoArray[$scope.key][0][1]);
    });

    $scope.$on('folderchange', function(event, data) {
        $scope.key = $scope.themeSet + $scope.folder[data];
        $scope.$broadcast('photochange', $scope.photoArray[$scope.key][0][1]);
    });

});

app.controller('TabController1', function($scope, $rootScope) {
    this.tab = 0;

    this.setTab = function(newValue, flag) {
        this.tab = newValue;
        $rootScope.tabc2 = 0;
        $scope.$parent.$broadcast('themechange', newValue);
    };

    this.isSet = function(tabName) {
        return this.tab === tabName;
    };

});

app.controller('TabController2', function($scope, $rootScope) {
    $rootScope.tabc2 = 0;

    this.setTab = function(newValue, flag) {
        $rootScope.tabc2 = newValue;
        $scope.$parent.$broadcast('folderchange', newValue);
    };

    this.isSet = function(tabName) {
        return $rootScope.tabc2 === tabName;
    };

});

app.controller('CatController', function($scope, $http) {
    $scope.tab = -1;

    this.setTab = function(newValue) {
        $scope.tab = newValue;
        $scope.photoArray[$scope.key][photoIndex][1] = $scope.category[newValue];
        $scope.$parent.$broadcast('categoryset');
    };

    this.isSet = function(tabName) {
        return $scope.tab === tabName;
    };

    $scope.$on('photochange', function(event, data) {
        $scope.tab = $scope.category.indexOf(data);
    });

});

app.controller('DescController', function($scope, $http) {
    $scope.desc = '';
    $scope.disable = true;

    $scope.addDesc = function(newDesc) {
        var data = {category: $scope.category[$scope.tab],
                    photo: $scope.photoArray[$scope.key][photoIndex][0],
                    description: newDesc
                    };
        $http.post('/admin/setCategory', data).success(function() {
            $scope.desc = newDesc;
            $scope.photoArray[$scope.key][photoIndex][2] = newDesc;
            $scope.disable = true;
        });
    };

    $scope.$on('categoryset', function(event, data) {
        $scope.desc = $scope.photoArray[$scope.key][photoIndex][2];
        $scope.disable = false;
    });

    $scope.$on('photochange', function(event, data) {
        $scope.desc = $scope.photoArray[$scope.key][photoIndex][2];
        $scope.disable = true;
    });

});

app.controller('GalleryController', function($scope) {
    $scope.current = 0;
    this.setCurrent = function(newGallery) {
        $scope.current = newGallery || 0;
    };
    this.incCurrent = function() {
        $scope.current += 1;
        photoIndex += 1;
        $scope.$parent.$broadcast('photochange', $scope.photoArray[$scope.key][$scope.current][1]);
    };
    this.decCurrent = function() {
        $scope.current -= 1;
        photoIndex -= 1;
        $scope.$parent.$broadcast('photochange', $scope.photoArray[$scope.key][$scope.current][1]);
    };
    $scope.$on('themechange', function(event, data) {
        $scope.current = 0;
        photoIndex = 0;
    });

    $scope.$on('folderchange', function(event, data) {
        $scope.current = 0;
        photoIndex = 0;
    });
});

