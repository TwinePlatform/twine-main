/*
* CONTENTS
*
* new log controller
*    store the form data
*    update total duration logged this date
*    setup datepickers
*    populate hours dropdown
*    populate minutes dropdown
*    calculate duration
*    populate user_id field
*    process the new log form
*      validate form
*      submit form
*    push to offline data
*/

/*
/*
	> new log controller
*/

	angular.module('app.controllers').controller('NewLogController', function (
		$scope, $state, $filter, $ionicLoading, $localStorage, $rootScope, $timeout,
		$$api, $$utilities, $$shout, $$offline, $q
	) {

		/*
			>> store the form data
		*/

			$scope.formData = {};

			$scope.volunteers = [];

			$scope.displayedVolunteers = [];

			$scope.volunteerNameFilter = '';

			$scope.activities = [];

			$scope.hasProjects = false;

			$scope.projects = [];

			$scope.isAdmin = $rootScope.isAdmin;

			$scope.selectedVolunteers = [];

			$scope.selectedUser = { id : '' };


			if (!$$offline.checkConnection()) {
				$$offline.enable();
			}

        /*
        >> volunteers selector filtrationa
    	*/

        	$scope.filterVolunteersByName = function (matchString) {
				if (volunteers.length !== 0) {
                    $scope.displayedVolunteers = $scope.volunteers.filter(function (each) {
						return each.name.toLowerCase().indexOf(matchString.toLowerCase()) !== -1
					});
					if ($scope.displayedVolunteers.length === 0) {
                        $scope.displayedVolunteers = $scope.volunteers;
                        $scope.noNameMatches = true;
					} else {
                        $scope.noNameMatches = false;
					}
					$scope.selectedUser.id = '';
				}
            };

        	$scope.removeFromSelected = function (id) {
				$scope.selectedVolunteers = $scope.selectedVolunteers.filter(function (value) {
					return value.id !== id;
				})
            };

        	$scope.volunteerSelected = function (id) {
        		if ($scope.isAdmin) {
        			for (var i = 0; i < $scope.selectedVolunteers.length; i++) {
        				if ($scope.selectedVolunteers[i].id === id) {
        					return;
						}
					}
                    $scope.displayedVolunteers.forEach(function (value) {
                        if (value.id === id) {
                            $scope.selectedVolunteers.push({id : value.id, name: value.name});
                        }
                    });
                    $scope.selectedUser.id = '';
				}
            };

        	$scope.isSelected = function (id) {
                for (var i = 0; i < $scope.selectedVolunteers.length; i++) {
                    if ($scope.selectedVolunteers[i].id === id) {
                        return true;
                    }
                }
                return false;
            };




        /*
            >> fill Volonters

        */
			$scope.fillVolonters = function () {
				if ($rootScope.offlineMode) {
					$scope.volunteers = $localStorage.offlineData.volunteers || [];
					$scope.displayedVolunteers = $scope.volunteers;
					return;
				}

				$$api.volunteers.getVolunteers($rootScope.currentUser.organisation_id)
					.success(function (result) {
						if (result && result.result) {
							$scope.volunteers = result.result;
							$scope.displayedVolunteers = $scope.volunteers;
							$localStorage.offlineData.volunteers = $scope.volunteers || [];
						}
					})
					.error(function (data, error) {

							// process connection error
							$$utilities.processConnectionError(data, error);

					})
            };

			if ($scope.isAdmin) {
				$scope.fillVolonters();
			}

        /*
            >> fill Activities

        */

        $scope.fillActivities = function () {
						if ($rootScope.offlineMode) {
							$scope.activities = $localStorage.offlineData.activities || [];
							return;
						}

            $$api.activities.get()
                .success(function (result) {
                    if (result !== null && result !== undefined && result.data !== null && result.data !== undefined) {
											$scope.activities = result.data;
											$localStorage.offlineData.activities = result.data;
										}
                })
        };

        $scope.fillActivities();


        $scope.calculateTotalDurationThisDate = function() {}

				function populateProjects () {
					if ($rootScope.offlineMode) {
						$scope.projects = $localStorage.offlineData.projects || [];

						if ($scope.projects.length > 0) {
							$scope.hasProjects = true;
						}

						return;
					}

					$$api.projects.getProjects().success(function (response) {
						$scope.projects = response.result;
						$localStorage.offlineData.projects = response.result;

						if ($scope.projects.length > 0) {
							$scope.hasProjects = true;
						}
					}).error(function (result, error) {
						$$utilities.processConnectionError(result, error);
					});
				}

				populateProjects();

		/*
			>> setup datepickers
		*/

			$('#createLog .datepicker').pickadate({
				min: $rootScope.isAdmin ? undefined : $$utilities.getDateFirstOfMonth(),
				date: new Date(),
				container: '.datepicker-container',
				clear: false,
				onStart: function () {
					// set date to today initially
				    var date = new Date();
				    this.set('select', [date.getFullYear(), date.getMonth(), date.getDate()] )

				    // add date to scope in correct format
				    $scope.formData.date_of_log = $filter('date')(this.component.item.select.pick, 'yyyy-MM-dd');

				    // add current time
				    $scope.formData.date_of_log = $scope.formData.date_of_log + ' ' + $$utilities.getCurrentTimeAsString();
				},
				onSet: function(context) {
					// add date to scope in correct format
					$scope.formData.date_of_log = $filter('date')(context.select, 'yyyy-MM-dd');

					// add current time
					$scope.formData.date_of_log = $scope.formData.date_of_log + ' ' + $$utilities.getCurrentTimeAsString();

					$timeout(function() {
						$scope.calculateTotalDurationThisDate();
					}, 300);
				}
			});


		/*
			>> populate hours dropdown
		*/

			$scope.hours = $$utilities.getHoursOptions();


		/*
			>> populate minutes dropdown
		*/

			$scope.minutes = $$utilities.getMinutesOptions();


		/*
			>> calculate duration
			   .. in an integer of minutes based on the hours and minutes dropdowns
		*/

			$scope.formData.duration = 0;

			$scope.calculateDuration = function(hours, minutes) {

				// set minutes to 0 if hours == 24
				if (hours === 24) {
					$scope.formData.minutes = 0;
					minutes = 0;
				}

				// get total minutes integer & update form
				$scope.formData.duration = $filter('minutesFromHoursAndMinutes')(hours, minutes);

				// update total duration for this date
				$scope.calculateTotalDurationThisDate();

			}


		/*
			>> process the new log form
		*/

			$scope.formSubmitted = false;
			$scope.processForm = function(form) {

				// >>> validate form

				// variable to show that form was submitted
				$scope.formSubmitted = true;

				// form is valid
				if (form.$valid) {

					// show loader
					$ionicLoading.show();

					if ($scope.isAdmin) {
					    var selectedIds = [];
					    $scope.selectedVolunteers.forEach(function (value) {
					        selectedIds.push(value.id);
							});
							$scope.formData.user_id = selectedIds.join(',');
					}

					// if offline mode active, push to offline data
					if ($rootScope.offlineMode) {
						// hide loader
						$ionicLoading.hide();

						var payload = {
							activity: $scope.formData.activity,
							duration: {
								minutes: $scope.formData.duration,
							},
							startedAt: $scope.formData.date_of_log,
							project: $scope.formData.project
						}
						var payloads = null;

						if ($scope.formData.user_id && $scope.formData.user_id !== $rootScope.currentUser.id) {
							if ($scope.selectedVolunteers.length > 1) { // Multiple IDs!
								payloads = $scope.selectedVolunteers.map(function (user) { return Object.assign({ userId: user.id }, payload) })
							} else { // Single ID
								payload.userId = $scope.selectedVolunteers[0].id;
							}
						} else {
							// User ID refers to own user, therefore do nothing, since this is default
							// behaviour of new API
						}

						if (payloads) {
							payloads.forEach(function (log, i) {
								var message = (i === payloads.length - 1) ? 'Log saved offline.' : undefined;
								$scope.newLogOffline(log, true, message);
							});
						} else {
							// push to offline data, mark as 'needs_pushing'
							$scope.newLogOffline(payload, true, 'Log saved offline.');
						}

						if ($rootScope.isAdmin) {
							$state.go('tabs.view-logs.hours');
						} else {
							$state.go('tabs.dashboard');
						}

					}

					// not offline mode, submit the form
					else {

						// >>> submit form
						var payload = {
							activity: $scope.formData.activity,
							duration: {
								minutes: $scope.formData.duration,
							},
							startedAt: $scope.formData.date_of_log,
							project: $scope.formData.project
						}
						var payloads = null;
						var promise = null;

						if ($scope.formData.user_id && $scope.formData.user_id !== $rootScope.currentUser.id) {
							if ($scope.selectedVolunteers.length > 1) { // Multiple IDs!
								payloads = $scope.selectedVolunteers.map(function (user) { return Object.assign({ userId: user.id }, payload); })
							} else { // Single ID
								payload.userId = $scope.selectedVolunteers[0].id;
							}
						} else {
							// User ID refers to own user, therefore do nothing, since this is default
							// behaviour of new API
						}

						try {
							promise = payloads
								? Promise.all(payloads.map($$api.logs.new))
								: $$api.logs.new(payload);
						} catch (error) {
							promise = $q.defer().reject(error);
						}

						promise.then(function (result) {
							if (Array.isArray(result)) {
								$$shout('Logs saved.');
								result = result.map(function (r) { return r.data.result; })
							} else {
								$$shout('Log saved.');
								result = result.data.result;
							}

							// hide loader
							$ionicLoading.hide();

							// push to offline data
							if (Array.isArray(result)) {
								result.forEach(function (r) { return $scope.newLogOffline(r) });
							} else {
								$scope.newLogOffline(result);
							}

							if ($rootScope.isAdmin) {
								$state.go('tabs.view-logs.hours');
							} else {
								$state.go('tabs.dashboard');
							}

						}).catch(function(error) {
							// enable offline mode
							$$offline.enable();

							// hide loader
							$ionicLoading.hide();

							// push to offline data and mark as 'needs_pushing'
							if (payloads) {
								payloads.forEach(function (log, i) {
									var message = (i === payloads.length - 1) ? 'Log saved offline.' : undefined;
									$scope.newLogOffline(log, true, message);
								});
							} else {
								// push to offline data, mark as 'needs_pushing'
								$scope.newLogOffline(payload, true, 'Log saved offline.');
							}

							// go back to dashboard
							if ($rootScope.isAdmin) {
								$state.go('tabs.view-logs.hours');
							} else {
								$state.go('tabs.dashboard');
							}

							// process connection error
							$$utilities.processConnectionError(null, error);

						});

					}
				}
				// form is invalid
				else {
					$$shout('Application error!');
				}

			};


		/*
			>> push to offline data
		*/

			$scope.newLogOffline = function(data, needs_pushing, message) {

				if (needs_pushing === undefined) {
					needs_pushing = false;
				}

				// push to offline data
				$$offline.newLog(data, needs_pushing);

				// shout message
				if (message !== undefined) {
					$$shout(message);
				}

			}


	})
