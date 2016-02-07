'use strict';

var appControllers = angular.module('appControllers', ['chart.js']);

//Main View Controller
appControllers.controller('mainViewCtrl', ['$scope', 'socket', 'PBs', 'UserService', function ($scope, socket, PBs, UserService) {
    var team = [];
    $scope.team = team;
    $scope.stories = PBs.getCurrentProductBacklog().pbitems;
   
    $scope.currentUser = {};
    $scope.tempRoom_id = "";
    $scope.tempRoom_key = "";
    
    $scope.riskseries = [[]];
    $scope.effortseries = [[]];
    $scope.complexityseries = [[]];
    
    $scope.labels = [];
    
    $scope.maxandminvalues = {};
    
    $scope.tablevalues = {
        'minrisk' : [],
        'maxrisk' : [],
        'mincomplexity' : [],
        'maxcomplexity' : [],
        'mineffort' : [],
        'maxeffort' : [],
        'minsize'  : [],
        'maxsize' : []
    };
    
    //When User data is retrieved after login inform the server of the room is connectiong to
    $scope.$watch(
        function () {
            return UserService.getUser();
        },
        function (user) {
            if (user !== undefined && user.room_id !== undefined ) {
                $scope.initializeRoom(user);
                $scope.tempRoom_id = user.room_id;
            }
        },
        true
    );
    
    $scope.initializeRoom = function (user) {
        socket.emit('dashboardConnection', user, function (data) {
                    console.log('Connecting to room: ' + user.room_id);
    })};
    
    //On event sent from the server add the mobile-client to the team list if needed and call an update of the tables 
    socket.on('newData', function (data) {
        console.log(data.userName + ' updated size: ' + data.size);
        
        var temp = [];
        
        temp = $scope.team.filter(function (user, index, team) {
            if( user.userId === data.userId) {
                team[index] = data;
            }
            return user.userId === data.userId;
        });
        
        if (temp.length === 0) {
            $scope.team.push(data);
        }
        
        $scope.updateTable();
    });
    
    //Capture when a mobile app disconnected
    socket.on('userDisconnection', function (data) {
        // All the if the statetemt is t prevent error when you refresh the app and then kill already existing mobile app session
        if (team[data.userId] !== undefined && team[data.userId].userId !== undefined && team[data.userId].userId > -1) {
            console.log('******Team member disconnection******');
            console.log('Team member disconnection: ' + team[data.userId].userName);
            // Remove the user
            team.splice(data.userId, 1);
            console.log('Connected team members are now: ' + team.length);
            $scope.team = team;
            if (team.length >= 3) {
                $scope.updateRadarData();
            } else {
                $scope.resetRadarData();
                //$('#radar').width($('#radar').width());
            }
        }
    });
    
    $scope.updateTable = function () {
        $scope.resetMaxandMinValue();
        var parameters = ['risk', 'complexity', 'effort', 'size'];
        $.each(parameters, function (i, parameter) {
            var minSelctor = 'min' + parameter,
                maxSelctor = 'max' + parameter;
            $scope.tablevalues[minSelctor] = [];
            $scope.tablevalues[maxSelctor] = [];
            //Update Min and MAx values for each parameters
            $.each($scope.team, function (index, value) {
                if ($scope.maxandminvalues[parameter].min > value["" + parameter]) {
                    $scope.maxandminvalues[parameter].min = value["" + parameter];
                }
                if ($scope.maxandminvalues[parameter].max < value["" + parameter]) {
                    $scope.maxandminvalues[parameter].max = value["" + parameter];
                }
            });
            //Update user's name for each Min and MAx values
            $.each($scope.team, function (index, value) {
                if (value["" + parameter] === $scope.maxandminvalues[parameter].min) {
                    $scope.tablevalues[minSelctor].push(value.userName);
                }
                if (value["" + parameter] === $scope.maxandminvalues[parameter].max) {
                    $scope.tablevalues[maxSelctor].push(value.userName);
                }
            });
        });
        
        //Display radar only we have >=3 mobile client connnected
//        if ($scope.team.length >= 3) {
            $scope.updateRadarData();
//        }
    };
    
    $scope.resetRadarData = function () {
        $scope.labels = [];
        $scope.complexityseries[0] = [];
        $scope.riskseries[0] = [];
        $scope.effortseries[0] = [];
    };
    
    $scope.resetMaxandMinValue = function () {
        $scope.maxandminvalues = {
            'risk' : {'max' : 0, 'min': 1000},
            'effort' : {'max' : 0, 'min': 1000},
            'complexity' : {'max': 0, 'min': 1000},
            'size' : {'max': 0, 'min': 1000}
        };
    };
    
    //Fill data series for radar chart
    $scope.updateRadarData = function () {
        $scope.resetRadarData();
        $.each($scope.team, function (i, user) {
            $scope.labels.push(user.userName);
            $scope.complexityseries[0].push(user.complexity);
            $scope.riskseries[0].push(user.risk);
            $scope.effortseries[0].push(user.effort);
        });
    };
    
    //Send room details to the server and update the user details. this will call the fire of a socket event to notify the server
    $scope.updateRoomDetails = function () {
        UserService.getUser().room_id = $scope.tempRoom_id;
        UserService.getUser().room_key = $scope.tempRoom_key;
        UserService.updateUsers();
    };
    
}]);
