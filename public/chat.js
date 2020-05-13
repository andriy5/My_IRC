$( document ).ready(function() {
  var username;
  var channels = [];
  var socket = io();
  var commands = ["create"]

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
      console.log("Command found");
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
});
