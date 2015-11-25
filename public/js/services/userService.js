angular.module('userService', [])

	.factory('UserService', [function () {
        var user = {};
        
        return {
            setUser : function (userData) {
                user = userData;
            },
            
            getUser : function () {
                return user;
            }
        };
    }]);