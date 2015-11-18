var PB = require('../models/productBacklog');
var UserStory = require('../models/productBacklogItem');

//NOt using any more. I need to find away to share among the app the customer_Id. This becouse I need in any function below to retireve the list of product backlog linked t the customer. At the moment I'm repeting a lot of line of code in each fucntion!!
//function getPBs(req, res) {
//    console.log("Seraching for customer: " + "rO3JSsSfQJOiNpsQd4melg");
//    PB.find({'customer_id': "rO3JSsSfQJOiNpsQd4melg"}, function (err, pbs) {
//        if (err) res.send(err);
//        res.json(pbs); // return all todos in JSON format
//    });
//};


module.exports = function (app) {
    
    var customer_id = "";

	// Api ---------------------------------------------------------------------
	// Get all Product Backlogs
	app.get('/api/pbs/:customer_id', function (req, res) {
        customer_id = req.params.customer_id;
        console.log("Seraching for customer: " + customer_id);
		PB.find({'customer_id': customer_id}, function (err, pbs) {
            if (err) res.send(err);
            res.json(pbs); // return all todos in JSON format
        });   
	});

	// Create a Product Backlog send back all pbs after creation
	app.post('/api/pbs/:customer_id', function (req, res) {
        customer_id = req.params.customer_id;
		var pb = new PB({customer_id: customer_id, name: req.body.name});
        pb.save (function(err) {
            if (err) res.send(err);
            PB.find({'customer_id': customer_id}, function (err, pbs) {
                if (err) res.send(err);
                res.json(pbs);
            });
        });
	});

	// Delete a pb. NEVER TRIED
	app.delete('/api/pbs/:pb_id', function (req, res) {
		PB.remove({
			_id : req.params.pb_id
		}, function (err, pb) {
			if (err) res.send(err);
			getPBs(res);
		});
	});

    // Update a pb by pb_id. Used to add a User Stories
    app.post('/api/pbs/addItem/:pb_id', function (req, res) {
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
        PB.findOne({
            _id : req.params.pb_id
        }, function (err, pb) {
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
  
    //Load the single view file (angular should handle the page changes on the front-end)
    app.get('*', function (req, res) {
        res.sendfile('./public/views/index.html'); });
};