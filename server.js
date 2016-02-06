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
    app             = express();

// configuration ===========================================

//Local Storage for Users
var users = [];
var User = require('./app/models/user');

// set our port
var port = process.env.PORT || 3000;

// Passport session setup
passport.serializeUser(function (user, done) {
    console.log('**PASSPORT**');
    console.log('Serializing User');
    done(null, user.email);
});

passport.deserializeUser(function (email, done) {
    console.log('**PASSPORT**');
    console.log('Deserializing User');
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
// Retrieve user_id from UserApp and store with name in MongoDb
passport.use( new UserAppStrategy({ appId: '563f8a3e36901'},
    function (userprofile, done) {
        console.log('**PASSPORT**');
        console.log('Registering User in Node');
        process.nextTick(function () {
            User.findOrCreate(
                {customer_id: userprofile.id},
                {email: userprofile.email, name: userprofile._raw.first_name},
                function(err, userprofile, created) {
            if (created) console.log("User: " + userprofile.customer_id + ": Has been created for: " + userprofile.email);
            if (!created) console.log("User: " + userprofile.customer_id +": Already exists");
        });
        });
    }
));

// Configure Express ===========================================
app.set('port', port);
app.use(cookieParser());
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
app.use(flash());
app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method-Override')); 

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
// All the statics file will be served from the public folder
app.use(express.static('public'));
// Redirect to index.html file when load the app
app.get('/', function(req, res){
    res.sendFile(__dirname + '/public/views/index.html');
});

// Data Base Stuff ===========================================

// Config files
// this is a temporaly solution to keep the connection open for some hours.
//You need to find a way to store a cookie in front end and that's it!
var options = { server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 3000000 } }, 
                replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 3000000 } } };       

var dbCong = require('./config/db');

// connect to our mongoDB database
mongoose.connect(dbCong.url, options);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
    console.log("**MONGODB**");
    console.log("Mongo Db is connected");
});


// routes ==================================================
require('./app/routes/routes')(app);
app.use(express.static(__dirname + './public'));

app.use(logger({path: "./log/logfile.txt"}));
var server = require('http').createServer(app);
var io = require('socket.io')(server);
//var team = []; //Store a list of (mobile)client
var websizeclient; //Store a reference tot eh webapplication client (the one that receive sizes)


// start app ===============================================
server.listen(app.get('port'), function() {
    console.log("**NODE**");
    console.log('Running on port', app.get('port'));
});

//SocketIo configurations
//You need to imporeve a lot here mate!!!!!
io.on('connection', function (socket) {
    //team.push(socket);
    console.log('**SOCKET**');
    console.log('ID: ' + socket.id + ':Connetion');
    console.log('In room: ' + socket.room);
    socket.type = 'Mobile App';
    //On updateModel event sent by the application get the data and send to the web app for visualization
    // NOw client send message direactly to Desktop Application
    socket.on('updateModel', function(data){
        console.log('**SOCKET**');
        console.log('ID: ' + socket.id);
        console.log('Riceived an Update from ' + data.userName);
        console.log('In Room ' + socket.room);
        socket.broadcast.to(socket.room).emit('newData', {
            risk: data.risk,
            effort: data.effort,
            complexity: data.complexity,
            size: data.size,
            connected: data.connected,
            userName: data.userName,
            userId: socket.id
        });
        console.log('**Emitted Data**');
        console.log('Size: ' + data.size);
        console.log('Risk: ' + data.risk);
        console.log('Complexity: ' + data.complexity);
        console.log('Effort: ' + data.effort);
    })
    
    socket.on('joiningRoom', function(userData,fn){
        console.log('**SOCKET**');
        console.log('ID: ' + socket.id)
        console.log('Joining Room: ' + userData.room);
        //To be sure the client is not in any more room
        socket.leave(socket.room);
        socket.room = userData.room;
        socket.join(userData.room);
        fn(true);
    });
    //When Mobile app send 'disconnect' event, remove the client from the team array
    //If it's not in team array ( team.indexOf(socket) == -1) this means that the Client is disconnected!
    socket.on('disconnect', function() {
        console.log('**SOCKET**');
        console.log('ID: ' + socket.id + ':Disconnetion');
        if (socket.type === 'Desktop App') {
            socket.broadcast.emit('clientDisconnection', {
                userId: socket.id
            });
            console.log('Other Mobile App notified in room: ' + socket.room);
        } else {
            socket.broadcast.emit('userDisconnection', {
                userId: socket.id
            });
            console.log('Client App notified in room: ' + socket.room);
        }
    });
    
    //When Client send 'client-connection' event, remove the client from the team array and store it in websizeclient variable.
    socket.on('client-connection', function(data){
        console.log('**SOCKET**');
        console.log('ID: ' + socket.id + ':Client application');
        console.log('In Room :' + data);
        socket.type = 'Desktop App';
        socket.leave(socket.room);
        socket.room = data;
        socket.join(data);
    });  
    
});

exports = module.exports = app;