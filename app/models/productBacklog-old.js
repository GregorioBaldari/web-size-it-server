var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var PBItemSchema = new Schema({
        title: String,
        narrative: String,
        acceptanceCriteria: String,
        size: Number,
        risk: Number,
        effort: Number,
        complexity: Number
    });

var PBSchema = mongoose.Schema({
        name: String,
        pbitems: [PBItemSchema]
    });

module.exports = mongoose.model('PB', PBSchema);
module.exports = mongoose.model('PBItem', PBItemSchema);