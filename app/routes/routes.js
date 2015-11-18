//var PBItem = require('../models/productBacklog');
var PB = require('../models/productBacklog');
var UserStory = require('../models/productBacklogItem');

//in the comment pb == productbacklog

function getPBs(req, res) {
    console.log("Seraching for customer: " + "rO3JSsSfQJOiNpsQd4melg");
    PB.find({'customer_id': "rO3JSsSfQJOiNpsQd4melg"}, function (err, pbs) {
        if (err) res.send(err);
        res.json(pbs); // return all todos in JSON format
    });
};


module.exports = function (app) {

	// api ---------------------------------------------------------------------
	// get all todos
	app.get('/api/pbs/:customer_id', function (req, res) {
        console.log("Seraching for customer: " + req.params.customer_id);
		PB.find({'customer_id': req.params.customer_id}, function (err, pbs) {
        if (err) res.send(err);
        res.json(pbs); // return all todos in JSON format
    });
        // use mongoose to get all pbs in the database
		//getPBs(req, res);
	});

	// create pb and send back all pbs after creation
	app.post('/api/pbs/:customer_id', function (req, res) {

		// create a todo, information comes from AJAX request from Angular
		var pb = new PB({customer_id: req.params.customer_id, name: req.body.name});
        pb.save (function(err) {
            if (err) { res.send(err); }
            //console.log("Routes: New PB Created");
            PB.find({'customer_id': req.params.customer_id}, function (err, pbs) {
                if (err) res.send(err);
                res.json(pbs); // return all todos in JSON format
            });
        });
	});

	// delete a pb
	app.delete('/api/pbs/:pb_id', function (req, res) {
		PB.remove({
			_id : req.params.pb_id
		}, function (err, pb) {
			if (err)
				res.send(err);
            //console.log("Routes: PB Removed");
			getPBs(res);
		});
	});

    // update a pb by pb_id
    app.post('/api/pbs/addItem/:pb_id', function (req, res) {
        PB.findOne({
            _id : req.params.pb_id
        }, function (err, pb) {
            if (err) {
                res.send(err);
                //console.log("ERR: " + err)
            } else {
                var pbItem = new UserStory({title : req.body.text});
                pb.pbitems.push(pbItem);
                pb.save(function (err) {
                    if(err) res.send(err);
                    //console.log("Routes: New User Story Created");
                    getPBs(res);
                })
            }
        });
    });
    
    app.put('/api/pbs/updateItem/:pb_id', function (req, res) {
        PB.findOne({
            _id : req.params.pb_id
        }, function (err, pb) {
            if (err) {
                res.send(err);
                console.log("ERR: " + err)
            } else {
                pb.pbitems = req.body;
                pb.save(function (err) {
                    if(err) res.send(err);
                    //console.log("Routes: User Story Updated");
                    getPBs(res);
                })
            };
        });
    });

//  
//    app.get('/organize', function (req, res) {
//		res.sendfile('./public/views/pbs.html'); // load the single view file (angular will handle the page changes on the front-end)
//	});
//    
    app.get('*', function (req, res) {
        //console.log("Routes: Redirection to index");
		res.sendfile('./public/views/index.html'); // load the single view file (angular will handle the page changes on the front-end)
	});
};