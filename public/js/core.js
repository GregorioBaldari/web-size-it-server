
var weSizeItApp = angular.module('weSizeItApp', [
        'ui.router',   
        'stormpath',
        'stormpath.templates',
        'chart.js',
        'userService',
        'appControllers',
        'angulartics', 
        'angulartics.google.analytics',
    ]);

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
    var socket;
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

weSizeItApp.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
    
    $urlRouterProvider.otherwise('/home');
    
    $locationProvider.html5Mode(true);
    
    $stateProvider
        
        .state('home', {
            url: '/home',
            views: {
                nav: {
                  templateUrl: 'views/general-bar.html'
                },
                content: {
                  templateUrl: 'views/landing.html'
                }
            }
        })
        
        .state('login', {
            url: '/login',
            views: {
                nav: {
                  templateUrl: 'views/general-bar.html'
                },
                content: {
                  templateUrl: 'views/login.html'
                }
            }
        })
        
        .state('forgot', {
            url: '/forgot',
            views: {
                nav: {
                  templateUrl: 'views/general-bar.html'
                },
                content: {
                  templateUrl: 'views/forgot-password.html'
                }
            }
        })
        
        // nested list with just some random string data
        .state('register', {
            url: '/register',
            views: {
                nav: {
                  templateUrl: 'views/general-bar.html'
                },
                content: {
                  templateUrl: 'views/register.html'
                }
            }
        })
        
        // ABOUT PAGE AND MULTIPLE NAMED VIEWS =================================
        .state('room', {
            url: '/room',
            sp: {
                authenticate: true
            },
            views: {
                nav: {
                  templateUrl: 'views/room-bar.html'
                },
                content: {
                  templateUrl: 'views/room.html'
                }
            },
            controller: 'mainViewCtrl'
        });
});
//
//weSizeItApp.config(['$routeProvider', function ($routeProvider) {
//    $routeProvider
//    .when('/login', {
//        templateUrl: 'views/login.html',
//        public: true,
//        login: true,
//    })
//    .when('/signup', {
//        templateUrl: 'views/signup.html',
//        public: true,
//    })
//    .when('/room', {
//        templateUrl: 'views/room.html',
//        controller: 'mainViewCtrl',
//    })
//    .otherwise({
//        redirectTo: '/room',
//    });
//}]);

//This stuff is for login
//The btoa() function may not be supported by all browsers.
//btoa() is used to autoriz the backend API
//weSizeItApp.run(function($rootScope, user,$http, PBs, UserService, UserApp) {
weSizeItApp.run(function($stormpath,$rootScope,$state) {
    
    $stormpath.uiRouter({
      loginState: 'login',
      defaultPostLoginState: 'room'
    });
    
    $rootScope.$on('$sessionEnd',function () {
      $state.transitionTo('home');
    });
//	user.init({ appId: '563f8a3e36901' });
//    $rootScope.$on('user.login', function () {
//        console.log('User Token: ' + user.token());
//        $http.defaults.headers.common.Authorization = 'Basic ' + btoa(':' + user.token());
//        UserApp.User.get({
//            'user_id' : user.user_id
//        }, function( error, result) {
//            if(error) console.log('UserApp Error: ' + error);
//            UserService.registerUsers(result[0]);
//        });
//    });
//    $rootScope.$on('user.logout', function () {
//        $http.defaults.headers.common.Authorization = null;
//        //UserService.setUser(undefined);
//    });
});