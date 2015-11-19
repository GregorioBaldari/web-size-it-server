angular.module('pbService', [])

	// super simple service
	// each function returns a promise object 
	.factory('PBs', ['$http', function ($http) {
		var currentPB = {};
        var customer_id;
        var PSList = {};
        return {  
            
            setCustomerId : function (id) {
                customer_id = id;
            },
            
            getCustomerId : function () {
                return customer_id;
            },
            
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
            }
		};
	}]);