$( document ).ready(function() {
  var username;
  var socket = io();
  var commands = ["create"];

  $('#connect-chat').click(function(){
    username = $("#username").val();
    if (username == '') {
      alert('Please put a username');
    } 
    else {
      $(".username").fadeOut();
      socket.emit("new user", username)
    }   
  })

  // $('modify-btn').click(function(){
  // })

  $('form').submit(function(e){
    e.preventDefault(); // prevents page reloading
    if ($('#m').val().substr(0,1) == "/" ) {
      let msg = $('#m').val().split(" ");
      let cmd = msg[0].substr(1);

      // console.log("message", msg);
      // console.log(cmd);
      // console.log("Command found");

      switch (cmd) {
        case "create":
          socket.emit('create channel', msg[1]);
          $('#m').val('');
          break;

        // JUSTE POUR FAIRE LES TESTS
        case "test":
          socket.emit('test', username);
          $('#m').val('');
          break;

      }
    }
    else {
      socket.emit('chat message', $('#m').val(), username);
      $('#m').val('');
      return false;
    }

  });

  socket.on('chat message', function(msg, name){
    $('#messages').append($('<li>').text(name + ": " + msg));
  });

  socket.on('new user', (name) => {
    $('#messages').append($('<li>').text(name + " joined the room"));
  })

  socket.on('create channel', (name) => {
    name == 0 ? alert("Channel already exists") : $('#messages').append($('<li>').text("Channel " + name + " created successfully"));
  })

});
