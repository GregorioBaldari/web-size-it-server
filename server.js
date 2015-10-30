var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var team = []; //Store a list of (mobile)client
var websizeclient; //Store a reference tot eh webapplication client (the one that receive sizes)

require('./router/main')(app);

server.listen(port);

app.set('port', port);
app.use(express.static(__dirname + '/public'));
app.set('views',__dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

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