angular.module('pbController', ['ui.sortable'])

	// inject the Todo service factory into our controller
	.controller('mainController', ['$scope', '$filter', 'PBs', 'UserService', function ($scope, $filter, PBs, UserService) {
		$scope.formData = {};
        $scope.formPBItemData = {};
		$scope.loading = true;
        $scope.pbs = {};
        $scope.selectedPBId = "";
        $scope.pbitems = {};
        $scope.pbitem = {};
        $scope.customer_id = "";
        $scope.pb = {};
        $scope.teamMember = {};
        $scope.team =[];

		
         $scope.$watch( 
        function () { 
            return UserService.getUser();
        },
        function (value) {
            if (value !== {}) {
                $scope.customer_id = value.customer_id;
                PBs.get($scope.customer_id)
                    .success(function (data) {
                        $scope.pbs = data;
                        $scope.loading = false;
                        PBs.loadTeam($scope.customer_id)
                        .success(function (data) {
                            $scope.team = data.team;    
                        });
                    });
            }
        }, true
        );
        
		// CREATE A NEW PRODUCT BACKLOG ==================================================================
		$scope.createPb = function () {

			// validate the formData to make sure that something is there
			// if form is empty, nothing will happen
			if ($scope.formData.name !== undefined) {
				//$scope.formData.customer_id = $scope.customer_id;
				// call the create function from our service (returns a promise object)
				PBs.create($scope.customer_id, $scope.formData)

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
			if ($scope.formPBItemData !== undefined && $scope.selectedPBId !== undefined) {
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
            PBs.setCurrentProductBacklog($filter('filter')($scope.pbs, {_id: id})[0]);
            $scope.pbitems = PBs.getCurrentProductBacklog().pbitems;
            $scope.loading = false;
		};
        
        // LOAD USER STORY ==================================================================
		$scope.loadPBItem = function (item) {
			$scope.loading = true;
            $scope.pbitem = item;
            $scope.loading = false;
		};
        
        // UPDATE USER STORY ==================================================================
        $scope.updateUserStory = function () {
            console.log($scope.pbitems[$scope.selectedPBId]);
        };
        
       // SORT USER STORY ==================================================================    
        $scope.sortableOptions = {  
            activate: function () {
                //console.log("activate");
            },
            beforeStop: function () {
                //console.log("beforeStop");
            },
            change: function () {
                console.log("change");
            },
            create: function () {
                //console.log("create");
            },
            deactivate: function() {
                //console.log("deactivate");
            },
            out: function () {
                //console.log("out");
            },
            over: function () {
                //console.log("over");
            },
            receive: function () {
                //console.log("receive");
            },
            remove: function () {
                //console.log("remove");
            },
            sort: function () {
                //console.log("sort");
            },
            start: function () {
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
            });
            $scope.updateUserStory();
        }
        
        //Called when the User Story data is saved in the form or the User Story is ordered
        $scope.updateUserStory = function() {
            PBs.save($scope.selectedPBId, $scope.pbitems)
                // if successful creation, call our get function to get all the new pbs
                .success(function (data) {
                    console.log('User Story List Order Saved');
                });
        }
        
        // CREATE A TEAM MEMBER================================================================== 
        $scope.saveTeamMember = function () {
            if ($scope.teamMember !== "") {
                // We should check if the email already exist in team array!
                $scope.team.push($scope.teamMember);
                PBs.saveTeamMember($scope.customer_id, $scope.teamMember)
                    .success(function (data) {
                    console.log('Team Member Saved: ' + data);
                    $scope.teamMember = {};
                });
            }
        };
	}]);
