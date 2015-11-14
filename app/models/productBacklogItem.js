var mongoose = require('mongoose');

var Schema = mongoose.Schema;

//Product Backlog Item Schema
var PBItemSchema = mongoose.Schema({
        pbID: String,
        title: String,
        narrative: String,
        acceptanceCriteria: String,
        rank: Number,
        size: Number,
        risk: Number,
        effort: Number,
        complexity: Number
    });

module.exports = mongoose.model('UserStory', PBItemSchema);