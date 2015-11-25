angular.module('pbService', [])

	// super simple service
	// each function returns a promise object 
	.factory('PBs', ['$http', function ($http) {
		var currentPB = {};
        var PSList = {};
        return {              
            
            //Get all the Prodcut Backlogs
			get : function (customer_id) {
                console.log("Going to retireve data for : " + customer_id);
				return $http.get('/api/pbs/' + customer_id);
			},
            
            // Create a Product Backlog
			create : function (customer_id, pbData) {
				return $http.post('/api/pbs/' + customer_id ,pbData);
			},
			delete : function (id) {
				return $http.delete('/api/pbs/' + id);
			},
            
            // Create an User Story
            createPBItem : function (id, pbItemData) {
                return $http.post('/api/pbs/addItem/' + id, pbItemData);
            },
            
            // Save a User Story data
            save : function (id, pbItems) {
                return $http.put('/api/pbs/updateItem/' + id, pbItems);
            },
            
            setCurrentProductBacklog : function (data) {
                currentPB = data;
            },
            
            getCurrentProductBacklog : function () {
               return currentPB;
            },
            
            //Called on login handler in core.js
            saveCustomer : function (id) {
                //Adding this to fix a bug when you refresh from play view
                //customer_id = id;
                console.log("In SaveCustomer Service with data: " + id);
                return $http.get('/api/user/' + id);
            },
            
            loadTeam : function (id) {
                customer_id = id;
                console.log("In loadTeam Service with data: " + id);
                return $http.get('/api/user/team/' + id);
            },
            
            saveTeamMember : function (id, teamMember) {
                console.log("In SaveTeamMember Service with data: " + id);
                return $http.post('/api/user/saveTeamMember/' + id, teamMember)
            },
            
            saveRoomDetails : function (customer_id, roomDetails) {
                console.log("In SaveRoomDetails Service with data: " + customer_id);
                return $http.post('/api/user/saveRoom/' + customer_id, roomDetails);
            }
		};
	}]);