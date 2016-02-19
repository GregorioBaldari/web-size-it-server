var User = require('../models/user'),
    randomstring = require("randomstring");

module.exports = function (app) {
    
    var customer_id = "";
    
    //Find or create an user is loggin on the Desktop App
    //If find send back found information (i.e. room_id)
    app.post('/api/users', function (req, res) {
        console.log('**ROUTER**');
        console.log('Registering connected user');
        User.findOrCreate(
            {email: req.body.email, },
            {name: req.body.givenName},
            function (error, user, created) {
                if (error) res.status(500).send(error)
                res.send(user.toJSON());
            });
    });
    
    //Find user and update is details
    //So far used for update the room_id only
    app.put('/api/users/:_id', function (req, res) {
        console.log('**ROUTER**');
        console.log('Udating details for: ' + req.body.name);
        User.findOne({_id: req.params._id   }, function (err, user) {
            if (err) res.status(500).send(err);
            user.room_name = req.body.room_name;
            user.room_key = req.body.room_key;
            user.save(function (err) {
                if (err) res.status(500).send(err);
                res.send(user.toJSON());
            });
        });
    });
    
    //Generate a randoom room_key
    app.get('/api/users/room_key', function (req, res) {
        console.log('**ROUTER**');
        console.log('Generating a Room Key');
        var room_key = randomstring.generate({
            length: 5,
            readable: true,
            charset: 'alphabetic'
        });
        res.send(room_key);
    });
};