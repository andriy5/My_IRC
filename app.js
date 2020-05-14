var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Aller chercher les fichiers statiques
app.use('/public', express.static('public'))


var channels = ["default"];


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/chat.html');
});

io.on('connection', (socket) => {
  socket.join("default");

  //Send this event to everyone in the room.
  
  
  
  socket.on('test',(username, room) => {
    console.log(username, channels, room);
  })

  socket.on('chat message', (msg, name, room) => {
    console.log(room);
    io.to(room).emit('chat message', msg, name);
  });

  socket.on('new user', (name) => {
    // io.sockets.in("default").emit('current room', "You are in room default");
    io.emit('new user', name)
  })

  socket.on('create channel', (name) => {
    // Check channel etc...
    
    if (channels.indexOf(name) < 0) {
      channels.push(name);
      socket.emit('create channel', name);
    }
    else {
      socket.emit('create channel', 0);
    }
  })

  socket.on('join channel', (room, currentRoom) => {
    if (channels.indexOf(room) < 0) {
      socket.emit('join channel', 0);
    }
    else {
      socket.leave(currentRoom);
      socket.join(room);
      socket.emit('join channel', room);
    }
  })

  socket.on('part channel', (room) => {
    if (channels.indexOf(room) < 0) {
      socket.emit('join channel', 0);
    }
    else {
      socket.leave(room);
      socket.join('default');
      socket.emit('join channel', 'default');
    }
  })

  socket.on('list channel', (filter) => {
    if (filter) {
      let channelSpecific = [];
      channels.forEach(element => {
        element.includes(filter) ? channelSpecific.push(element) : null;
      });
      socket.emit('list channel', channelSpecific == [] ? 0 : channelSpecific);
    }
    else {
      socket.emit('list channel', channels);
    }
  })
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});