var weSizeItApp = angular.module('weSizeItApp', [
        'ngRoute',
        'chart.js',
        'userService',
        'pbService',
        'appControllers',
        'pbController',
        'UserApp'
    ]);
//'UserApp',

var user_id = "";

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
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        }
    };
}]);

weSizeItApp.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
    .when('/login', {
        templateUrl: 'views/login.html',
        public: true,
        login: true,
    })
    .when('/signup', {
        templateUrl: 'views/signup.html',
        public: true,
    })
//    when('/product-backlog', {
//        templateUrl: 'pbd.html',
//        //controller: 'formulaBuilderCtrl'
//    }).
    .when('/play', {
        templateUrl: 'views/play.html',
        controller: 'mainViewCtrl',
    })
    .when('/organize', {
        templateUrl: 'views/pbs.html',
        //controller: 'mainController',
    })
    .otherwise({
        redirectTo: '/play',
        controller: 'mainViewCtrl',
    });
}]);

//This stuff is for login
//Please note that the btoa() function may not be supported by all browsers.
//btoa() is used to autoriz the backend API
weSizeItApp.run(function($rootScope, user,$http, PBs, UserService) {
	user.init({ appId: '563f8a3e36901' });
    $rootScope.$on('user.login', function () {
        $http.defaults.headers.common.Authorization = 'Basic ' + btoa(':' + user.token());
        console.log('User Token: ' + user.token());
        user.getCurrent().then(function (currentUser) {
            //Store user_id for reference in MongoDB call
            PBs.saveCustomer(currentUser.user_id)
            .success(function (user) {
                    console.log('Team Member Saved: ' + user);
                    UserService.setUser(user);
                });
        });
    });
    $rootScope.$on('user.logout', function () {
        $http.defaults.headers.common.Authorization = null;
        //UserService.setUser(undefined);
    });
});