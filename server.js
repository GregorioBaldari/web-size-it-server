// modules =================================================
var express = require('express');
var app = express();
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var mongoose = require('mongoose');

// configuration ===========================================
    


// set our port
var port = process.env.PORT || 3000;

;

// Data Base Stuff ===========================================

// config files
var options = { server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }, 
                replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } } };       

var dbCong = require('./config/db');

// connect to our mongoDB database
mongoose.connect(dbCong.url, options);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
    console.log("Mongo Db connected");
    
//    var PBItemSchema2 = mongoose.Schema({
//        title: String,
//        narrative: String,
//        acceptanceCriteria: String,
//        size: Number,
//        risk: Number,
//        effort: Number,
//        complexity: Number
//    });
//
//var pbitems = mongoose.Schema({
//        name: String
//        //pbitems: [PBItemSchema2]
//    });
//var Temp2 = mongoose.model('PB2', pbitems);
//
//var temp2 = new Temp2({name: 'tempNAme'});
//temp2.save(function (err) {
//    if(err){} 
//    else{ 
//        console.log('saved in server.js')
//    }
//});    
    /*
    var PBSchema = mongoose.Schema({
        name: String
    });
    var PBItem = mongoose.model('PBItem', PBSchema);
    var OnePBItem = new PBItem({ name: 'Some Title' });
    console.log(OnePBItem.name); // 'Silence
    
    OnePBItem.save(function (err, fluffy) {
        if (err) return console.error(err);
    });
    */
});



// get all data/stuff of the body (POST) parameters
// parse application/json 
app.use(bodyParser.json()); 

// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); 

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true })); 

// override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override')); 

// set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/public'));

// routes ==================================================
require('./app/routes/routes')(app);

var server = require('http').createServer(app);
var io = require('socket.io')(server);
var team = []; //Store a list of (mobile)client
var websizeclient; //Store a reference tot eh webapplication client (the one that receive sizes)

//
//server.listen(port);
//

app.set('port', port);
//app.use(express.static(__dirname + '/public'));
//app.set('views',__dirname + '/views');
//app.set('view engine', 'ejs');
//app.engine('html', require('ejs').renderFile);

// start app ===============================================
server.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

//Project Space.
//TO DO
// Let User Create Name Space
// Let mmobile app link to created Name Space
//Commented becouse it works on local but not on remote
//var nsp = io.of('/projectSpace');
// io.on('connection', function (socket) {


io.on('connection', function (socket) {
    team.push(socket);
    console.log('Another application is connected');
    console.log('Connected applications are: ' + team.length);
    
    //On updateModel event sent by the application get the data and send to the web app for visualization
    socket.on('updateModel', function(data){
        console.log('Riceived an Update from ' + data.userName);
        socket.broadcast.emit('newData', {
            risk: data.risk,
            effort: data.effort,
            complexity: data.complexity,
            size: data.size,
            connected: data.connected,
            userName: data.userName,
            userId: team.indexOf(socket)
        });
        console.log('Emitted Size: ' + data.size + ' from UserID: ' + team.indexOf(socket) + ' with UserName: ' + data.userName);
    })
    
    //When Mobile app send 'disconnect' event, remove the client from the team array
    //If it's not in team array ( team.indexOf(socket) == -1) this means that the Client is disconnected!
    socket.on('disconnect', function() {
        if(team.indexOf(socket) == -1){
            console.log('*****Desktop App is disconnected*****');
            websizeclient = undefined;
        } else{
            console.log('*****Mobile App user disconnected****');
            console.log('User index: ' + team.indexOf(socket));
            console.log('User username: ' + team.indexOf(socket).userName);
            console.log('*************************************');
            socket.broadcast.emit('userDisconnection', {
                userId: team.indexOf(socket)
            });
            team.splice(team.indexOf(socket), 1);
        }
    });
    
    //When Client send 'client-connection' event, remove the client from the team array and store it in websizeclient variable.
    socket.on('client-connection', function(){
        console.log('*****Client application connected******');
        team.splice(team.indexOf(socket), 1);
        websizeclient = socket;
        console.log('At the moment the connected applications are: ' + team.length);
        console.log('*************************************');
    });
    
    
});

exports = module.exports = app;