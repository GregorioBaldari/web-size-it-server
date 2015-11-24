// modules =================================================
var express         = require('express'),
    logger          = require('express-logger'),
    cookieParser    = require('cookie-parser'),
    session         = require('express-session')
    http            = require('http'),
    passport        = require('passport'),
    flash           = require('connect-flash'),
    UserAppStrategy = require('passport-userapp').Strategy,
    bodyParser      = require('body-parser'),
    methodOverride  = require('method-override'),
    mongoose        = require('mongoose'),
    _               = require('underscore'),
    app = express();

// configuration ===========================================

//Local Storage for Users
var users = [];

// set our port
var port = process.env.PORT || 3000;

// Passport session setup
passport.serializeUser(function (user, done) {
    console.log('Serializing User with Passport');
    done(null, user.email);
});

passport.deserializeUser(function (email, done) {
    console.log('Deserializing User Passport');
    var user = _.find(users, function (user) {
        return user.email == email;
    });
    if (user === undefined) {
        done(new Error('No user with email "' + email + '" found.'));
    } else {
        done(null, user);
    }
});

// Use the UserAppStrategy within Passport
passport.use(
    new UserAppStrategy({
        appId: '563f8a3e36901' // Your UserApp App Id: https://help.userapp.io/customer/portal/articles/1322336-how-do-i-find-my-app-id-
    },
    function (userprofile, done) {
        console.log('*************************************');
        console.log('Registering User in Node');
        process.nextTick(function () {
            var exists = _.any(users, function (user) {
                return user.id == userprofile.id;
            });
            
            if (!exists) {
                users.push(userprofile);
            }

            return done(null, userprofile);
        });
    }
));

// Configure Express ===========================================
app.set('port', port);
app.use(cookieParser());
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
app.use(flash());

app.use(bodyParser.json());
// Parse application/vnd.api+json as json
//app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

// Parse application/x-www-form-urlencoded
//app.use(bodyParser.urlencoded({ extended: true })); 

// override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override')); 

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));

// Data Base Stuff ===========================================

// Config files
var options = { server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }, 
                replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } } };       

var dbCong = require('./config/db');

// connect to our mongoDB database
mongoose.connect(dbCong.url, options);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
    console.log("Mongo Db is connected");
});


//
//// get all data/stuff of the body (POST) parameters
//// parse application/json 
//app.use(bodyParser.json()); 

// routes ==================================================
require('./app/routes/routes')(app);

app.use(logger({path: "./log/logfile.txt"}));
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var team = []; //Store a list of (mobile)client
var websizeclient; //Store a reference tot eh webapplication client (the one that receive sizes)


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
    console.log('SOCKET');
    console.log('Connection Request from socket: ' + socket.id);
    //console.log('Connected applications are: ' + team.length);
    
    //On updateModel event sent by the application get the data and send to the web app for visualization
    // NOw client send message direactly to Desktop Application
    socket.on('updateModel', function(data){
        console.log('SOCKET');
        console.log('Riceived an Update from ' + data.userName);
        socket.broadcast.to(socket.room).emit('newData', {
            risk: data.risk,
            effort: data.effort,
            complexity: data.complexity,
            size: data.size,
            connected: data.connected,
            userName: data.userName,
            userId: team.indexOf(socket)
        });
        console.log('Emitted Size: ' + data.size + ' User: ' + data.userName);
    })
    
    socket.on('joiningRoom', function(userData,fn){
        console.log('SOCKET');
        console.log('Socket: ' + socket.id + ':Joining Room: ' + userData.room);
        //To be sure the client is not in any more room
        socket.leave(socket.room);
        socket.room = userData.room;
        socket.join(userData.room);
        fn(true);
    });
    //When Mobile app send 'disconnect' event, remove the client from the team array
    //If it's not in team array ( team.indexOf(socket) == -1) this means that the Client is disconnected!
    socket.on('disconnect', function() {
        console.log('SOCKET');
        console.log('Socket: ' + socket.id + ':Disconnetion');
        if(team.indexOf(socket) == -1){
            console.log('It was the a desktop app');
            //websizeclient = undefined;
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
    socket.on('client-connection', function(data){
        console.log('*****Client application connected******');
        console.log('*****Room :' + data);
        team.splice(team.indexOf(socket), 1);
        socket.leave(socket.room);
        socket.room = data;
        socket.join(data);
        //console.log('Room on Server are: ' + server.sockets.manager.rooms);
        //websizeclient = socket;
        console.log('At the moment the connected applications are: ' + team.length);
        console.log('*************************************');
    });  
    
});

exports = module.exports = app;