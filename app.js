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

var infoUsers = {

};

var countdownChannels = {

};

// == PROTOTYPE ==
// var channels = {
//   default: {users: ["andriy", 'bertrand']},
//   bikinibottom: {users: ['victor', 'antonio', 'bob', 'patrick'], creator: "bob"},
//   gotham: {users: ['batman', 'joker', 'robin'], creator: "tyler"},
//   tokyo: {users: []}
// }

// var infoUsers = {
//   andriy: {nickname: "andrusz"},
//   batman: {channels: "gotham"},
//   bob: {nickname: "spongbob", channels: "bikinibottom"}
// }

function deleteChannel(channel, automatic) {
  // Check si user à l'int de channel ?
  if (automatic == true) {
    io.to(channel).emit('force part', channel);
    io.emit('announce', "📣 " + channel + " channel has been deleted automatically for no activities.");
  }

  console.log(typeof(channels)[channel]);
  setTimeout(function(){
    delete channels[channel];
    delete countdownChannels[channel];
  },1000);
  
}

function checkCountdown(channelsToCheck) {
  // Check every X minutes (or seconds) if the time limit of the channel is reached
  
  let currentTime = new Date();

  for (var key in channelsToCheck) {
    // console.log(channelsToCheck[key], currentTime)
    if (channelsToCheck[key].timeLimite < currentTime) {
      console.log('Delete channel : ' + key)
      deleteChannel(key, true)
    }
  }
}

function setCountdown(channel, minutes) {
  if (channel != "default" && Number.isInteger(minutes)) {
    let date = new Date();
    let limit = date.setMinutes( date.getMinutes() + 1 );
    countdownChannels[channel] = {timeLimite: limit};
  }
  setInterval(function(){checkCountdown(countdownChannels)},1000);
}

function checkUserExist (username) {
  let check = typeof(infoUsers[username]);
  if (check != 'undefined' ){
    return infoUsers[username].id
  }
  else {
    return null;
  }
}

function findNickname (username) {
  let check = typeof(infoUsers[username]);
  
  if (check != 'undefined' ){
    let doublecheck = infoUsers[username].nickname;
    
    if (doublecheck != undefined) {
      return infoUsers[username].nickname
    }
    return username;
  }
  else {
    return username;
  }
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/chat.html');
});

io.on('connection', (socket) => {
  socket.join("default");
  
  socket.on('test',(username, room) => {
    let nickname = findNickname(username);
    // console.log("Nickname ->", nickname)
    // console.log(username, channels, room);
    console.log("Channels : ", channels)
    console.log("Info users : ", infoUsers);
    console.log("Coutdown Channels : ", countdownChannels);
    // console.log("Chan. Default : ", channels.tokyo)
  })

  socket.on('chat message', (msg, name, room) => {
    name = findNickname(name);
    setCountdown(room, 2);
    io.to(room).emit('chat message', msg, name);
  });

  socket.on('new user', (username, roomname) => {
    if (checkUserExist(username) == null) {
      channels[roomname].users.push(username);
      console.log("New User", channels[roomname].users);
      infoUsers[username] = {id: socket.id};
      // io.sockets.in("default").emit('current room', "You are in room default");
      io.emit('new user', username)
    }
    else {
      socket.emit('new user', 0)
    }


  })

  socket.on('create channel', (name, username) => {
    console.log("1st", channels);
    let keys =  Object.keys(channels);
    console.log(keys.indexOf(name));
    if (keys.indexOf(name) == -1) {
      console.log("existe pas")
      setCountdown(name, 2);
      channels[name] = {users: [], creator: username};
      socket.emit('create channel', name);
      io.emit('announce', "📣 "+ findNickname(username)+' have created a new channel: ' + name);
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
      console.log(channels[currentRoom]);
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
      console.log("part channel array channels", channels[room].users)
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

  socket.on('delete channel', (roomToDelete, username) => {
    // TO-DO: 
    // - Détruire le channel (a voir avec le timeout auto-delete...)
    // - messages coté client

    let keys =  Object.keys(channels);
    console.log(keys.indexOf(roomToDelete));
    if (keys.indexOf(roomToDelete) == -1) {
      socket.emit("delete channel", "This channel doesn't exist.")
    }
    else {
      let room = "default";
      if (channels[roomToDelete].creator == username) {
        io.to(roomToDelete).emit('force part', roomToDelete);
        socket.emit("delete channel", roomToDelete + " is now deleted.")
        io.emit('announce', "📣 "+ findNickname(username)+' have deleted this channel: ' + roomToDelete);
      }
      else {
        socket.emit("delete channel", "You don't have rights to delete this channel")
      }
      setTimeout(function(){deleteChannel(roomToDelete, false)},3000);
    }
  })

  socket.on('list channel', (filter) => {
    if (filter) {
      let arrayChannels = Object.keys(channels)
      let channelSpecific = [];
      arrayChannels.forEach(element => {
        element.includes(filter) ? channelSpecific.push(element) : null;
      });
      socket.emit('list channel', channelSpecific == [] ? 0 : channelSpecific);
    }
    else {
      socket.emit('list channel', Object.keys(channels));
    }
  })

  socket.on('list users', (room) => {
    let arrayUsers = [];
    channels[room].users.forEach(element => {
      let nickname = findNickname(element);
      arrayUsers.push(nickname);
    })
    socket.emit('list users', arrayUsers);
  })

  socket.on('nickname', (nickname, username)=>{
    infoUsers[username] = {nickname: nickname};
    socket.emit('nickname', nickname, username)
    io.emit('announce', "📣 "+ username + " just changed his name to " + nickname);
  
  })

  socket.on('private message', (receiver, message, sender) => {
    let checkReceiver = checkUserExist(receiver);
    
    sender = findNickname(sender);
    sender = "🕶 " + sender
    if (checkReceiver != null) {
      io.to(checkReceiver).emit('chat message', message, sender );
    }
    else {
      // Alerter message pas envoyé
    }
  })

});

http.listen(3000, () => {
  console.log('listening on *:3000');
});