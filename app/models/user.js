var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');

//MongoDB User Schema
var UserSchema = mongoose.Schema({
  user_id: String,
  room_name: String,
  room_key: String,
  name: String,
  email: String,
});

UserSchema.plugin(findOrCreate);

module.exports = mongoose.model('user', UserSchema);
