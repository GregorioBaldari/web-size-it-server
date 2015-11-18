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
            
			get : function (customer_id) {
                console.log("Going to retireve data for : " + customer_id);
				return $http.get('/api/pbs/' + customer_id);
			},
            
			create : function (customer_id, pbData) {
				return $http.post('/api/pbs/' + customer_id ,pbData);
			},
			delete : function (id) {
				return $http.delete('/api/pbs/' + id);
			},
            
            createPBItem : function (id, pbItemData) {
                return $http.post('/api/pbs/addItem/' + id, pbItemData);
            },
            
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