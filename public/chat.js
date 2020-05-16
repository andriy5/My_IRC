$( document ).ready(function() {
  var username;
  // var username = "Username"
  var socket = io();
  var room = "default";

  $('#connect-chat').click(function(){
    username = $("#username").val();
    if (username == '') {
      alert('Please put a username');
    } 
    else {
      $(".username").fadeOut();
      socket.emit("new user", username, room)
    }   
  })

  $('form').submit(function(e){
    e.preventDefault(); // prevents page reloading
    if ($('#m').val().substr(0,1) == "/" ) {
      let msg = $('#m').val().split(" ");
      let cmd = msg[0].substr(1);

      switch (cmd) {
        case "create":
          socket.emit('create channel', msg[1]);
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

        case "list":
          msg[1] ? socket.emit('list channel', msg[1]) : socket.emit('list channel');
          $('#m').val('');
          break;  

        case "users":
          socket.emit('list users', room);
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
      socket.emit('chat message', $('#m').val(), username, room);
      $('#m').val('');
      return false;
    }
  });

  socket.on('chat message', function(msg, name){
    $('#messages').append($('<li>').text(name + ": " + msg));
  });

  socket.on('new user', (name, room) => {
    $('#messages').append($('<li>').text(name + " joined the room"));
  })

  socket.on('create channel', (name) => {
    name == 0 ? alert("Channel already exists") : $('#messages').append($('<li>').text("Channel " + name + " created successfully"));
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
    console.log(channels);
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

});
