var mongoose = require('mongoose');
var TeamMember = require('../models/teamMember').schema;

var findOrCreate = require('mongoose-findorcreate');

//Product Backlog Schema
var UserSchema = mongoose.Schema({
        customer_id : String,
        room_id: String,
        room_password: String,
        name: String,
        email: String,
        team: [TeamMember]
    });

UserSchema.plugin(findOrCreate);

module.exports = mongoose.model('user', UserSchema);
//module.exports = mongoose.model('PBItem', PBItemSchema);