angular.module('pbService', [])

	// super simple service
	// each function returns a promise object 
	.factory('PBs', ['$http', function ($http) {
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
            }
//          Playing with MOngoDb everytime I retrive the all list of PB in ti there are PB Item
//          At that point I should only modfiy and update
//          If this strategy is correct remove the findById method in routes.js
//            findById : function (id) {
//				return $http.get('api/pbs/find/' + id);
//			},
//            
//            createPBItem : function (id, pbItemData) {
//                return $http.post('/api/pbs', pbData);
//            }
//            
            
		};
	}]);