// modules =================================================
var express         = require('express'),
    logger          = require('express-logger'),
    cookieParser    = require('cookie-parser'),
    session         = require('express-session')
    http            = require('http'),
    randomstring    = require("randomstring"),
    path            = require('path');
    stormpath       = require('express-stormpath');
    flash           = require('connect-flash'),
    bodyParser      = require('body-parser'),
    methodOverride  = require('method-override'),
    mongoose        = require('mongoose'),
    _               = require('underscore'),
    app             = express();



//DB STUFF configuration ===========================================
console.log('Initializing DB');
var options = {
  server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 3000000 } },
  replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 3000000 } }
};

var dbCong = require('./config/db');

// MongoDB configuration and connection
mongoose.connect(dbCong.url, options);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
    console.log("**DB**");
    console.log("Your DB is now connected");
});



// STORMPATH configuration ===========================================
/**
 * The 'trust proxy' setting is required if you will be deploying your
 * application to Heroku, or any other environment where you will be behind an
 * HTTPS proxy.
 */
app.set('trust proxy',true);

//Serve the static js files in ../libs folder from root when on production
//WELCOME IS A MORE ELEGANT WAY!!
// Before configure Stormpath becouse we don't neeed authentication ti serve these files
if ('development' !== app.get('env')) {
  app.use('..libs/', express.static(__dirname + 'public/libs'));
} 


console.log('Initializing Stormpath');

app.use(stormpath.init(app, {
  website: true,
  expand: {
    customData: true
  },
  web: {
    spaRoot: path.join(__dirname, 'public', 'views','home.html')
  }
}));

var User = require('./app/models/user');

// set our port
var port = process.env.PORT || 3000;

// Configure Express ===========================================
app.set('port', port);
app.use(cookieParser());
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
app.use(flash());
app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method-Override'));

// All the statics file will be served from the public folder
app.use(express.static('public'));

// Redirect to index.html file when load the app
app.get('/', function(req, res){
    res.sendFile(__dirname + '/public/views/home.html');
});

// App Configuaration ==================================================
require('./app/routes/routes')(app);
app.use(express.static(__dirname + './public'));

/**
 * Now that our static file server and Stormpath are configured, we let Express
 * know that any other route that hasn't been defined should load the Angular
 * application.  It then becomes the responsiliby of the Angular application
 * to define all view routes, and rediret to the home page if the URL is not
 * defined.
 */

app.route('/*')
  .get(function(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'views','home.html'));
  });
    
app.put('/profile', bodyParser.json(), stormpath.loginRequired, require('./app/routes/profile'));

app.use(logger({path: "./log/logfile.txt"}));
var server = require('http').createServer(app);
var io = require('socket.io')(server);

//Start app
server.listen(app.get('port'), function() {
    console.log("**NODE**");
    console.log('Running on port', app.get('port'));
});
    
/**
 * Start the web server.
 */
//app.on('stormpath.ready',function () {
//  console.log('Stormpath Ready');
//  var port = process.env.PORT || 3000;
//  app.listen(port, function () {
//    console.log('Application running at http://localhost:'+port);
//  });
//});

//SocketIo configurations
io.on('connection', function (socket) {
    console.log('**SOCKET**');
    console.log('Connection established for : ' + socket.id);

    // Called when the dashboard app connect for the first time, but only if a room ID has been defined
    socket.on('dashboardConnection', function (user) {
        console.log('**SOCKET**');
        console.log('Dashboard connetion In Progress for User ID: ' + user._id);
        console.log('In room: ' + user.room_name);
        //To be sure the client is not in any more room
        socket.leave(socket.room);
        socket.room = user.room_name;
        socket.join(user.room_name);
        socket.type = 'Dashboard';
        console.log('Dashboard joined room: ' + user.room_name);
    });

    //Called when the mobile app send a new data to the Dashboard App
    socket.on('updateModel', function(data){
        console.log('**SOCKET**');
        console.log('Receiving new data from Socket: ' + socket.id);
        console.log('By user: ' + data.model.userName);
        console.log('In Room ' + socket.room);
        data.model.userId= socket.id;
        socket.broadcast.to(socket.room).emit('newData', {
              model: data.model
        });
        console.log('**Emitted Data**');
        console.log('Size: ' + data.model.size);
        console.log('Risk: ' + data.model.risk);
        console.log('Complexity: ' + data.model.complexity);
        console.log('Effort: ' + data.model.effort);
    })

    //Called when the mobile app send a request to join the room
    socket.on('joiningRoom', function(userData,fn){
        console.log('**SOCKET**');
        socket.type = 'Mobile';
        console.log('Request for socket: ' + socket.id);
        console.log('To join room: ' + userData.room);
        console.log('From User: ' + userData.userName);
        //To be sure the client is not in any more room
        socket.leave(socket.room);
        socket.room = userData.room;
        socket.userName = userData.userName;
        socket.join(userData.room);
        fn(true);
    });

    //TO BE CLEANED!!!!!!
    //When Mobile app send 'disconnect' event, remove the client from the team array
    //If it's not in team array ( team.indexOf(socket) == -1) this means that the Client is disconnected!
    socket.on('disconnect', function() {
        console.log('**SOCKET**');
        console.log('ID: ' + socket.id + ':Disconnetion');
        if (socket.type === 'Dashboard') {
            socket.broadcast.to(socket.room).emit('DesktopDisconnection', {
                userId: socket.id
            });
            console.log('Mobile App notified of closing room for: ' + socket.room);
        } else {
            socket.broadcast.to(socket.room).emit('mobileDisconnection', {
                userId: socket.id,
                userName: socket.userName
            });
            console.log('Desktop App notified in room: ' + socket.room);
        }
        socket.disconnect();
    });
});

exports = module.exports = app;
