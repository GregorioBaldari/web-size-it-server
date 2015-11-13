var weSizeItApp = angular.module('weSizeItApp', [
    'ngRoute',
    'chart.js',
    'pbService',
    'appControllers',
    'pbController'
    ]);
//'UserApp',

weSizeItApp.factory('socket', ['$rootScope', function ($rootScope) {
    //The following namespace is used on server side.
    //TO DO
    //Let's the user create a namespace, register it on server, and connet to it
    //var projectSpace = 'projectSpace';
    //var socket = io('https://secret-lake-6472.herokuapp.com/' + projectSpace);
    //var socket = io('http://localhost:3000/' + projectSpace);
    var socket = io('https://wesizeit.herokuapp.com');
    //var socket = io('http://localhost:3000');
    return {
        on: function (eventName, callback) {
            function wrapper() {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            }
        
            socket.on(eventName, wrapper);

            return function () {
                socket.removeListener(eventName, wrapper);
            };
        },

        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if(callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        }
    };
}]);

weSizeItApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
//    when('/login', {
//        templateUrl: 'login.html', 
//        public: true, 
//        login: true,
//    }).
//    when('/signup', {
//        templateUrl: 'signup.html', 
//        public: true,
//    }).
//    when('/product-backlog', {
//        templateUrl: 'pbd.html',
//        //controller: 'formulaBuilderCtrl'
//    }).
    when('/play', {
        templateUrl: 'views/play.html',
        controller: 'mainViewCtrl',
    }).
     when('/organize', {
        templateUrl: 'views/organize.html',
        controller: 'mainController',
    }).
    otherwise({
        redirectTo: '/play',
        controller: 'mainViewCtrl',
    });
}]);


//Please note that the btoa() function may not be supported by all browsers.
//btoa() is used to autoriz the backend API
//weSizeItApp.run(function($rootScope, user, $http) {
//	user.init({ appId: '563f8a3e36901' });
//    $rootScope.$on('user.login', function() {
//        $http.defaults.headers.common.Authorization = 'Basic ' + btoa(':' + user.token());
//        console.log('User Token: ' + user.token());
//    });  
//    $rootScope.$on('user.logout', function() {
//        $http.defaults.headers.common.Authorization = null;
//    });
//});