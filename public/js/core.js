
var weSizeItApp = angular.module('weSizeItApp', [
        'config',
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

weSizeItApp.factory('socket', ['$rootScope', 'ENV', function ($rootScope, ENV) {
    //The following namespace is used on server side.
    //TO DO
    //Let's the user create a namespace, register it on server, and connet to it
    //var projectSpace = 'projectSpace';
    //var socket = io('https://secret-lake-6472.herokuapp.com/' + projectSpace);
    //var socket = io('http://localhost:3000/' + projectSpace);
    
    //var socket = io('https://wesizeit.herokuapp.com');
    var socket = io(ENV.apiEndpoint);
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
            }
        });
});

//This stuff is for login/logout
weSizeItApp.run(function($stormpath,$rootScope,$state) {
    
    $stormpath.uiRouter({
      loginState: 'login',
      defaultPostLoginState: 'room'
    });
    
    $rootScope.$on('$sessionEnd',function () {
      $state.transitionTo('home');
    });
});