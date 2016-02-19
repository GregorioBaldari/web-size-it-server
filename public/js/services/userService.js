angular.module('userService', [])

	.factory('UserService', ['$http', function ($http) {
        var currentUser = {};
        
        return {
            setUser : function (userData) {
                currentUser = userData;
            },
            
            getUser : function () {
                return currentUser;
            },
            
            //Called soon after to login. Register and, for the first time, record the user details in the DB.
            //Return user details (i.e. room details fir an existing users)
            registerUsers : function (user) {
                console.log("In Register User service for: " + user.email);
                return $http.post('/api/users', user).then( 
                    //Success
                    function(res){
                        currentUser = res.data;
                        console.log("User successfully registered: " + res.data.name);
                    },
                    //Unsucess
                    function(res) {
                        console.log("User registration unsuccessfully: " + res.status);
                        console.log("Error Code: " + res.status);
                    });
            },
            
            //Update the users details (i.e. room details)
            updateUsers : function () {
                console.log("In Update User service for: " + currentUser.name);
                return $http.put('/api/users/' + currentUser._id, currentUser).then( 
                    //Success
                    function(res){
                        console.log("User successfully upadted: " + res.data.name);
                    },
                    //Unsucess
                    function(res) {
                        console.log("User registration updated: " + res.status);
                        console.log("Error Code: " + res.status);
                    });
            },
            
            generateRoomKey : function () {
                console.log("In Generare Room Key service for: " + currentUser.name);
                return $http.get('/api/users/room_key').then( 
                    //Success
                    function(res){
                        console.log("User successfully upadted: " + res.data);
                        currentUser.room_key = res.data;
                    },
                    //Unsucess
                    function(res) {
                        console.log("User registration updated: " + res.status);
                        console.log("Error Code: " + res.status);
                    });
            }
            
        };
    }]);