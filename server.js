var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

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
    console.log('An application is connected');
    socket.on('newSize', function(data){
        console.log('Riceived Size: ' + data.size);
        socket.broadcast.emit('resultSize', {
          size: data.size
        });
        console.log('Emitted Size: ' + data.size);
    })
    
    socket.on('changeName', function(data){
        console.log('Riceived a change Name: ' + data.userName);
        socket.broadcast.emit('userName', {
          userName: data.userName
        });
        console.log('Emitted User Name: ' + data.userName);
    })
});