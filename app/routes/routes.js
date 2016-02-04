var PB = require('../models/productBacklog');
var UserStory = require('../models/productBacklogItem');
var User = require('../models/user');
var TeamMember = require('../models/teamMember');

module.exports = function (app) {
    
    var customer_id = "";

	// Api ---------------------------------------------------------------------
	// Get all Product Backlogs
	app.get('/api/pbs/:customer_id', function (req, res) {
        console.log('**ROUTER**');
        console.log('Retrieving all the product backlogs of the user');
        customer_id = req.params.customer_id;
        console.log("Seraching for customer: " + customer_id);
		PB.find({'customer_id': customer_id}, function (err, pbs) {
            if (err) res.send(err);
            res.json(pbs); // return all todos in JSON format
        });
	});

	// Create a Product Backlog send back all pbs after creation
	app.post('/api/pbs/:customer_id', function (req, res) {
        console.log('**ROUTER**');
        console.log('Adding a Product Backlog');
        customer_id = req.params.customer_id;
		var pb = new PB({customer_id: customer_id, name: req.body.name});
        pb.save(function (err) {
            if (err) res.send(err);
            PB.find({'customer_id': customer_id}, function (err, pbs) {
                if (err) res.send(err);
                res.json(pbs);
            });
        });
	});

	// Delete a pb. NEVER TRIED
	app.delete('/api/pbs/:pb_id', function (req, res) {
		console.log('**ROUTER**');
        console.log('Deleting a Product Backlog');
        PB.remove({
			_id : req.params.pb_id
		}, function (err, pb) {
			if (err) res.send(err);
			PB.find({'customer_id': customer_id}, function (err, pbs) {
                if (err) res.send(err);
                res.json(pbs);
            });
		});
	});

    // Update a pb by pb_id. Used to add a User Stories
    app.post('/api/pbs/addItem/:pb_id', function (req, res) {
        console.log('**ROUTER**');
        console.log('Adding an User Story to a Product Backlog');
        PB.findOne({
            _id : req.params.pb_id
        }, function (err, pb) {
            if (err) res.send(err);
            var pbItem = new UserStory({title : req.body.text});
            pb.pbitems.push(pbItem);
            pb.save(function (err) {
                if(err) res.send(err);
                PB.find({'customer_id': customer_id}, function (err, pbs) {
                    if (err) res.send(err);
                    res.json(pbs);
                });
            });
        });
    });
    
    // Update a pb by pb_id. Used to modify User Stories
    app.put('/api/pbs/updateItem/:pb_id', function (req, res) {
        console.log('**ROUTER**');
        console.log('Updating product backlog list');
        PB.findOne({_id : req.params.pb_id}, function (err, pb) {
            if (err) res.send(err);
            pb.pbitems = req.body;
            pb.save(function (err) {
                if(err) res.send(err);
                PB.find({'customer_id': customer_id}, function (err, pbs) {
                    if (err) res.send(err);
                    res.json(pbs);
                });
            })
        });
    });
    
    //Find User if not create
    app.get('/api/user/:customer_id', passport.authenticate('userapp'), function (req, res){
        console.log('**ROUTER**');
        console.log('Find or Create an User');
        User.findOrCreate({customer_id: req.params.customer_id}, function(err, user, created) {
            if (err) res.send(err);
            if (created) console.log("User has been created for :" + user.customer_id);
            else console.log("User: " + user.customer_id +"already existed");
            res.json(user);
        });
    });
    
    app.get('/api/user/team/:customer_id', function (req, res){
        console.log('**ROUTER**');
        console.log('Retrieving Team Members');
        User.findOne({'customer_id': customer_id}, function (err, user) {
            if (err) res.send(err);
            res.json(user); // return all todos in JSON format
        });
    }),
    
    //Save Team       
    app.post('/api/user/saveTeamMember/:customer_id', function (req, res) {
        console.log('**ROUTER**');
        console.log('Saving a Team Member');
        customer_id = req.params.customer_id;
		User.findOne({customer_id: req.params.customer_id}, function (err, user) {
            if (err) res.send(err);
            var teamMember = new TeamMember({email : req.body.email});
            user.team.push(teamMember);
            user.save(function (err) {
                if (err) res.send(err);
//                User.find({'customer_id': customer_id}, function (err, users) {
//                    if (err) res.send(err);
//                    res.json(pbs);
//                });
            });
        });
    });
    
    app.post('/api/user/saveRoom/:customer_id', function (req, res) {
        console.log('**ROUTER**');
        console.log('Saving Room Details');
        customer_id = req.params.customer_id;
        User.findOne({customer_id: req.params.customer_id}, function (err, user) {
            if (err) res.send(err);
            user.room_id =req.body.room_id;
            user.room_key =req.body.room_key;
            user.save(function (err) {
                if (err) res.send(err);
                res.json(user);
//                User.find({'customer_id': customer_id}, function (err, users) {
//                    if (err) res.send(err);
//                    res.json(pbs);
//                });
            });
        });
    });
    
    //Load the single view file (angular should handle the page changes on the front-end)
//    app.get('*', function (req, res) {
//        var path = require('path');
//        console.log('**ROUTER**');
//        console.log('Redirecting to index.html');
//        res.sendFile(path.resolve(__dirname + '../../../public/views/index.html'));
//    });
    
        //Method above is deprecated. It should be replaced with the one above but it doen't wirk at the moment
        //res.sendFile(__dirname + '../public/views/index.html');
};