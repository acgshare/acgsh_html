
var app = angular.module('acgshApp', ['ngAnimate','ngSanitize','ngEmbed']);
app.controller('customersCtrl', function($scope, $http,$location,$anchorScroll,$timeout) {
    // PageType: all, category, publisher, search
    $scope.currentPageType="all";
    $scope.currentPublisher="";
    $scope.currentCategory="";
    $scope.currentPage=0;
    $scope.searchString="";

    $scope.options = {
        'linkTarget': '_blank',
        'image'     : {
            'embed': true
        },
        tweetEmbed       : false
    };

    $scope.showDesc={};
    $http.get("./api/posts/0")
        .then(function(response) {
            $scope.posts = response.data;
            angular.forEach($scope.posts, function(value, key) {
                $scope.showDesc[value.n+value.k] = false;
                value.replies=[];
            });
            //console.log($scope.showDesc);

        });


    $anchorScroll.yOffset=65;
    $scope.setShowDesc = function(event,index,post) {
        $timeout(function() {
            if(elementInViewport(event.target)){

                location.hash='anchor'+index;
                $location.hash('anchor'+index);
                $anchorScroll();
            }

        }, 50);


        if($scope.showDesc[post.n+post.k]==false){
            angular.forEach($scope.showDesc, function(value, key) {
                $scope.showDesc[key] = false;
            });

            $http.get("./api/pubreply/"+post.n+"/"+post.k)
                .then(function(response) {
                    post.replies = response.data;
                });
        }

        $scope.showDesc[post.n+post.k] = !$scope.showDesc[post.n+post.k];


    };


    function getRequestStr(page) {
        if ($scope.currentPageType=="category"){
            return "./api/categoryposts/"+$scope.currentCategory+"/"+page;
        }
        if ($scope.currentPageType=="publisher"){
            return "./api/pubposts/"+$scope.currentPublisher+"/"+page;
        }
        if ($scope.currentPageType=="search"){
            return "./api/search/"+page+"/"+$scope.searchString;
        }
        return "./api/posts/"+page;
    }
    $scope.prevPage = function() {
        if($scope.currentPage>0){
            $scope.currentPage=$scope.currentPage-1;
            $http.get(getRequestStr($scope.currentPage))
                .then(function(response) {
                    $scope.posts = response.data;
                    angular.forEach($scope.posts, function(value, key) {
                        $scope.showDesc[value.n+value.k] = false;
                        value.replies=[];

                    });
                });
        }
    };
    $scope.nextPage = function() {
        $scope.currentPage=$scope.currentPage+1;
            $http.get(getRequestStr($scope.currentPage))
                .then(function(response) {
                    $scope.posts = response.data;
                    angular.forEach($scope.posts, function(value, key) {
                        $scope.showDesc[value.n+value.k] = false;
                        value.replies=[];

                    });
                });

    };

    $scope.showCategory = function(category) {
        console.log(category);
        $scope.currentPage=0;
        $scope.currentPageType="category";
        $scope.currentCategory=category;
        $http.get("./api/categoryposts/"+category+"/0")
            .then(function(response) {
                $scope.posts = response.data;
                angular.forEach($scope.posts, function(value, key) {
                    $scope.showDesc[value.n+value.k] = false;
                    value.replies=[];
                });
                //console.log($scope.showDesc);

            });
    }
    $scope.showPublisher = function(n) {
        $scope.currentPage=0;
        $scope.currentPageType="publisher";
        $scope.currentPublisher=n;

        $http.get("./api/pubposts/"+n+"/0")
            .then(function(response) {
                $scope.posts = response.data;
                angular.forEach($scope.posts, function(value, key) {
                    $scope.showDesc[value.n+value.k] = false;
                    value.replies=[];
                });
                //console.log($scope.showDesc);

            });
    }

    $scope.search = function(n) {
        $scope.currentPage=0;
        $scope.currentPageType="search";

        $http.get("./api/search/0/"+$scope.searchString)
            .then(function(response) {
                $scope.posts = response.data;
                angular.forEach($scope.posts, function(value, key) {
                    $scope.showDesc[value.n+value.k] = false;
                    value.replies=[];
                });
                //console.log($scope.showDesc);

            });
    }

    // table order
    $scope.predicate = '';
    $scope.reverse = false;
    $scope.order = function(predicate) {
        $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : true;
        $scope.predicate = predicate;
    };
    $scope.order("time");

});

app.config(function($compileProvider){
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|magnet):/);
});

app.filter('bytes', function() {
    return function(bytes, precision) {
        if (bytes === 0) { return '0 bytes' }
        if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
        if (typeof precision === 'undefined') precision = 1;

        var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
            number = Math.floor(Math.log(bytes) / Math.log(1024)),
            val = (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision);

        return  (val.match(/\.0*$/) ? val.substr(0, val.indexOf('.')) : val) +  ' ' + units[number];
    }
});

function elementInViewport(el) {
    var top = el.offsetTop;

    while(el.offsetParent) {
        el = el.offsetParent;
        top += el.offsetTop;
    }


    return top - window.pageYOffset<55;
}

// todo: url encode space in magnet link