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
    app = express();

// configuration ===========================================
    


// set our port
var port = process.env.PORT || 3000;

// Passport session setup
passport.serializeUser(function (user, done) {
    done(null, user.username);
});

passport.deserializeUser(function (username, done) {
    var user = _.find(users, function (user) {
        return user.username == username;
    });
    if (user === undefined) {
        done(new Error('No user with username "' + username + '" found.'));
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
        process.nextTick(function () {
            var exists = _.any(users, function (user) {
                //Retrieve user from Mongo
                return;
                //return user.id == userprofile.id;
            });
            
            if (!exists) {
                //Create user on MongoDB
                //users.push(userprofile);
            }

            return done(null, userprofile);
        });
    }
));

// Configure Express ===========================================
app.set('port', port);
app.use(cookieParser());
app.use(session({ secret: 'secret' }));
app.use(flash());


// Parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true })); 

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