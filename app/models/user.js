var mongoose = require('mongoose');
var TeamMember = require('../models/teamMember').schema;

var findOrCreate = require('mongoose-findorcreate');

//Product Backlog Schema
var UserSchema = mongoose.Schema({
        user_id: String,
        customer_id : String,
        room_id: String,
        room_key: String,
        name: String,
        email: String,
        team: [TeamMember]
    });

UserSchema.plugin(findOrCreate);

module.exports = mongoose.model('user', UserSchema);
//module.exports = mongoose.model('PBItem', PBItemSchema);