var mongoose = require('mongoose');

var Schema = mongoose.Schema;

//Product Backlog Item Schema
var TeamMemberSchema = mongoose.Schema({
        name: String,
        email: String
    });

module.exports = mongoose.model('TeamMember', TeamMemberSchema);