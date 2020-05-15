var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Aller chercher les fichiers statiques
app.use('/public', express.static('public'))

var channels = {
  default: { users: []}
};

// var channels = {
//   default: {users: ['andriy', 'bertrand']},
//   bikinibottom: {users: ['victor', 'antonio', 'bob', 'patrick']},
//   gotham: {users: ['batman', 'joker', 'robin']},
//   tokyo: {users: []}
// }


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/chat.html');
});

io.on('connection', (socket) => {
  socket.join("default");
  
  socket.on('test',(username, room) => {
    // console.log(username, channels, room);
    console.log("Channels : ", channels)
    // console.log("Chan. Default : ", channels.tokyo)
  })

  socket.on('chat message', (msg, name, room) => {
    io.to(room).emit('chat message', msg, name);
  });

  socket.on('new user', (username, roomname) => {
    // console.log(channels[roomname]);
    channels[roomname].users.push(username);
    console.log("New User", channels[roomname].users);
    // io.sockets.in("default").emit('current room', "You are in room default");
    io.emit('new user', username)
  })

  socket.on('create channel', (name) => {
    console.log("1st", channels);
    let keys =  Object.keys(channels);
    console.log(keys.indexOf(name));
    if (keys.indexOf(name) == -1) {
      console.log("existe pas")
      channels[name] = {users: []};
      // socket.emit('create channel', name);
    }
    else {
      socket.emit('create channel', 0);
    }
    console.log("LAST", channels);
  })

  socket.on('join channel', (room, currentRoom, username) => {
    let keys =  Object.keys(channels);
    console.log(keys.indexOf(room));
    if (keys.indexOf(room) == -1) {
      socket.emit('join channel', 0);
    }
    else {
      channels[currentRoom].users.forEach((element, index) => {
        if (element == username) {
          channels[currentRoom].users.splice(index, 1)
        }
      })

      channels[room].users.push(username);
      socket.leave(currentRoom);
      socket.join(room);
      socket.emit('join channel', room);
    }
  })

  socket.on('part channel', (room, username) => {
    let keys =  Object.keys(channels);
    console.log(keys.indexOf(room));
    if (keys.indexOf(room) == -1) {
      socket.emit('join channel', 0);
    }
    else {
      channels[room].users.forEach((element, index) => {
        if (element == username) {
          channels[room].users.splice(index, 1)
        }
      })

      channels["default"].users.push(username);
      socket.leave(room);
      socket.join("default");
      socket.emit('join channel', "default");
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

  socket.on('list users', (room) => {
    socket.emit('list users', channels[room].users);
  })

});

http.listen(3000, () => {
  console.log('listening on *:3000');
});