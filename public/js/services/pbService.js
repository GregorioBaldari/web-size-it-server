angular.module('pbService', [])

	// super simple service
	// each function returns a promise object 
	.factory('PBs', ['$http', function ($http) {
		var currentPB = {};
        var PSList = {};
        return {     
            
			get : function () {
				return $http.get('/api/pbs');
			},
			create : function (pbData) {
				return $http.post('/api/pbs', pbData);
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