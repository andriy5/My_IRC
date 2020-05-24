import $ from 'jquery';
import openSocket from 'socket.io-client';
const socket = openSocket('http://localhost:4000');

function ConnectionToSocket(username, room, cb) {
  socket.emit("new user", username, room)
}

function sendMessage(message, username, room, cb) {
  console.log("msg", message, 'username', username, "room", room);
  // socket.emit('chat message', message, username, room);

  if (message.substr(0,1) == "/" ) {
    let msg = message.split(" ");
    let cmd = msg[0].substr(1);

    switch (cmd) {
      case "create":
        socket.emit('create channel', msg[1], username);
        $('#m').val('');
        break;

      case "join":
        socket.emit('join channel', msg[1], room, username);
        room = msg[1];
        $('#m').val('');
        break;

      case "part":
        socket.emit('part channel', msg[1], username);
        room = "default";
        $('#m').val('');
        break;

      case "delete":
        socket.emit('delete channel', msg[1], username);
        $('#m').val('');
        break;
  
      case "list":
        msg[1] ? socket.emit('list channel', msg[1]) : socket.emit('list channel');
        $('#m').val('');
        break;  

      case "users":
        socket.emit('list users', room);
        $('#m').val('');
        break;

      case "nick":
        socket.emit('nickname', msg[1], username);
        $('#m').val('');
        break;
        
      case "msg":
        let receiver = msg[1];
        let message = msg.shift();
        message = msg.shift();
        message = msg.join(" ");
        socket.emit('private message', receiver, message, username);
        $('#m').val('');
        break;

      // JUSTE POUR FAIRE LES TESTS
      case "test":
        socket.emit('test', username, room);
        $('#m').val('');
        break;
    }
  }
  else {
    socket.emit('chat message', message, username, room);
    return false;
  }
}

socket.on('new user', (name) => {
  if (name !== 0) {
    $('.welcome').fadeOut();
  }
  else {
    alert("Username already exist");
  }
})

socket.on('chat message', (msg, sender) => {
  $('#messages').append($('<li>').text(sender + ": " + msg));
});

socket.on('create channel', (name) => {
  name == 0 ? alert("Channel already exist") : $('#messages').append($('<li>').text("Channel " + name + " created successfully"));
})

socket.on('join channel', (room) => {
  if (room == 0) {
    alert("Channel doesn't exists")
  }
  else {
    $('#messages').empty();
    $('#messages').append($('<li>').text("You're in channel: " + room));
  }
})

socket.on('list channel', (channels) => {
  if (channels == 0) {
    $('#messages').append($('<li>').text('There is no channels with this name...'));
  }
  else {
    let stringChannels = '';
    channels.forEach(element => {
        stringChannels += "• " + element + " ";
    })
    $('#messages').append($('<li>').text('Channels: ' + stringChannels));      
  }
})

socket.on('list users', (users) => {
  if (users == []) {
    $('#messages').append($('<li>').text('There is no users on this channel...'));
  }
  else {
    let stringUsers = '';
    users.forEach(element => {
      stringUsers += "• " + element + " ";
    })
    $('#messages').append($('<li>').text('Users: ' + stringUsers));
  }
})

socket.on('nickname', (nickname, username) => {
  $('#messages').append($('<li>').text("Congrats ! You're now " + nickname + " !!"));
})

// socket.on('force part', (oldRoom) => {
//   socket.emit('part channel', oldRoom, username);
//   room="default";
// })

socket.on('delete channel', (message) => {
  $('#messages').append($('<li>').text(message));
})

socket.on("announce", (message) => {
  $('#messages').append($('<li>').text(message));
})

export { ConnectionToSocket };
export { sendMessage };
