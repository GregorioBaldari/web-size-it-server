var mongoose = require('mongoose');
var UserStory = require('../models/productBacklogItem').schema;

//Product Backlog Schema
var PBSchema = mongoose.Schema({
        name: String,
        pbitems: [UserStory]
    });

module.exports = mongoose.model('pbitems', PBSchema);
//module.exports = mongoose.model('PBItem', PBItemSchema);