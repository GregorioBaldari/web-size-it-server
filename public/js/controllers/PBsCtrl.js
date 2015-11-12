angular.module('pbController', ['ui.sortable'])

	// inject the Todo service factory into our controller
	.controller('mainController', ['$scope','$filter','$http','PBs', function($scope, $filter, $http, PBs) {
		$scope.formData = {};
        $scope.formPBItemData = {}
		$scope.loading = true;
        $scope.pbs = {};
        $scope.selectedPBId = "";
        $scope.pbitems = {};
        

		// GET =====================================================================
		// when landing on the page, get all todos and show them
		// use the service to get all the todos
		PBs.get()
			.success(function (data) {
				$scope.pbs = data;
				$scope.loading = false;
			});

		// CREATE A NEW PRODUCT BACKLOG ==================================================================
		$scope.createPb = function () {

			// validate the formData to make sure that something is there
			// if form is empty, nothing will happen
			if ($scope.formData.text != undefined) {
				$scope.loading = true;

				// call the create function from our service (returns a promise object)
				PBs.create($scope.formData)

					// if successful creation, call our get function to get all the new todos
					.success(function (data) {
						$scope.loading = false;
						$scope.formData = {}; // clear the form so our user is ready to enter another
						$scope.pbs = data; // assign our new list of todos
					});
			}
		};

        // CREATE A NEW USER STORY ==================================================================
		$scope.createPbItem = function () {

			// validate the formData to make sure that something is there
			// if form is empty, nothing will happen
			if ($scope.formPBItemData != undefined && $scope.selectedPBId !=undefined) {
				$scope.loading = true;

				// call the create function from our service (returns a promise object)
				PBs.createPBItem($scope.selectedPBId, $scope.formPBItemData)

                // if successful creation, call our get function to get all the new todos
                .success(function (data) {
                    $scope.formPBItemData = {}; // clear the form so our user is ready to enter another
                    $scope.pbs = data; // assign our new list of todos
                    $scope.loadPB($scope.selectedPBId);
                    $scope.loading = false;
                });
			}
		};
		
        // LOAD PRODUCT BACKLOG USER STORIES ==================================================================
		$scope.loadPB = function (id) {
            $scope.selectedPBId = id;
			$scope.loading = true;
            $scope.pbitems = $filter('filter')($scope.pbs, {_id: id})[0].pbitems;
            $scope.loading = false;
		};
        
        // LOAD USER STORY ==================================================================
		$scope.loadPBItem = function (item) {
			$scope.loading = true;
            $scope.pbitem = item;
            $scope.loading = false;
		};
        
        // UPDATE USER STORY ==================================================================
        $scope.updateUserStory = function (){
            console.log($scope.pbitems[$scope.selectedPBId]);
        };
        
       // SORT USER STORY ==================================================================    
        $scope.sortableOptions = {  
            activate: function() {
                //console.log("activate");
            },
            beforeStop: function() {
                //console.log("beforeStop");
            },
            change: function() {
                console.log("change");
            },
            create: function() {
                //console.log("create");
            },
            deactivate: function() {
                //console.log("deactivate");
            },
            out: function() {
                //console.log("out");
            },
            over: function() {
                //console.log("over");
            },
            receive: function() {
                //console.log("receive");
            },
            remove: function() {
                //console.log("remove");
            },
            sort: function() {
                //console.log("sort");
            },
            start: function() {
                //console.log("start");
            },
            update: function(e, ui) {
                console.log("update: " + ui.item.sortable.index);

            },
            
            // UPdate the rank of the User Story 
            stop: function(e, ui) {
                $scope.updateUserStoryOrder();

            }
        };
        
        $scope.updateUserStoryOrder = function () {
            $scope.pbitems.forEach( function(value, index) {
                value.rank = index;
            })
            
             PBs.save($scope.selectedPBId, $scope.pbitems)
                // if successful creation, call our get function to get all the new todos
                .success(function (data) {
                    console.log('User Story List Order Saved')
                });
        }
        
	}]);
