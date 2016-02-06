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
    //var socket = io('https://wesizeit.herokuapp.com');
    var socket = io('http://localhost:3000');
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
    .when('/room', {
        templateUrl: 'views/room.html',
        controller: 'mainViewCtrl',
    })
    .otherwise({
        redirectTo: '/room',
    });
}]);

//This stuff is for login
//Please note that the btoa() function may not be supported by all browsers.
//btoa() is used to autoriz the backend API
weSizeItApp.run(function($rootScope, user,$http, PBs, UserService, UserApp) {
	user.init({ appId: '563f8a3e36901' });
    $rootScope.$on('user.login', function () {
        console.log('User Token: ' + user.token());
        $http.defaults.headers.common.Authorization = 'Basic ' + btoa(':' + user.token());
        UserApp.User.get({
            'user_id' : user.user_id
        }, function( error, result) {
            if(error) console.log('UserApp Error: ' + error);
            UserService.registerUsers(result[0]);
        });
//        user.getCurrent().then(function (currentUser) {
//            UserService.registerUsers(user);
//        });
//        UserService.registerUsers(currentUser);
//        user.getCurrent().then(function (currentUser) {
//            //Store user_id for reference in MongoDB call
//            PBs.saveCustomer(currentUser.user_id)
//            .success(function (user) {
//                    console.log('Team Member Saved: ' + user);
//                    UserService.setUser(user);
//                });
//        });
    });
    $rootScope.$on('user.logout', function () {
        $http.defaults.headers.common.Authorization = null;
        //UserService.setUser(undefined);
    });
});