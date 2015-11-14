//var PBItem = require('../models/productBacklog');
var PB = require('../models/productBacklog');
var UserStory = require('../models/productBacklogItem');

//in the comment pb == productbacklog

function getPBs(res) {
	PB.find(function (err, pbs) {

		// if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err) {
            res.send(err);
        }
        //console.log("Routes: PBs List updated");
        res.json(pbs); // return all todos in JSON format
    });
};


module.exports = function (app) {

	// api ---------------------------------------------------------------------
	// get all todos
	app.get('/api/pbs', function (req, res) {

		// use mongoose to get all pbs in the database
		getPBs(res);
	});

	// create pb and send back all pbs after creation
	app.post('/api/pbs', function (req, res) {

		// create a todo, information comes from AJAX request from Angular
		var pb = new PB({name: req.body.text});
        pb.save (function(err) {
            if (err) { res.send(err); }
            //console.log("Routes: New PB Created");
            getPBs(res);
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