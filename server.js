var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var team = []; //Store a list of client
var websizeclient;

require('./router/main')(app);

server.listen(port);

app.set('port', port);
app.use(express.static(__dirname + '/public'));

/*TO DO: Link data.size to the view.
/*I should create another angular desktop applicationthat shoul register to this message ans show it on screen
*/

app.set('views',__dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

server.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

io.on('connection', function (socket) {
    team.push(socket);
    console.log('Another application is connected');
    console.log('Connected applications are: ' + team.length);
    
    socket.on('updateModel', function(data){
        console.log('Riceived an Update from ' + data.userName);
        socket.broadcast.emit('newData', {
            risk: data.risk,
            effort: data.effort,
            complexity: data.complexity,
            size: data.size,
            userName: data.userName,
            userId: team.indexOf(socket)
        });
        console.log('Emitted Size: ' + data.size);
    })
    
    //WHen mobile register with a name
    socket.on('newUser', function(data){
        console.log('User Joined: ' + data.userName);
        socket.broadcast.emit('userName', {
            userName: data.userName,
            userId: this.id
                });
        console.log('Emitted User Name: ' + data.userName + ' with userid: ' + this.id);
    })
    
    

    socket.on('disconnect', function() {
        team.splice(team.indexOf(socket), 1);
        socket.broadcast.emit('userDisconnection', {
            userId: team.indexOf(socket)
                });
    });
    
    socket.on('client-connection', function(){
        console.log('Client application is now connected');
        team.splice(team.indexOf(socket), 1);
        websizeclient = socket;
        console.log('At the moment the connected applications are: ' + team.length);
        /*
        clients.forEach(function(socket, index) {
            socket.emit('teamMember', listings);   // send jobs
            });
        });
        */
    });
    
    
});