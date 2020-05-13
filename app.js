var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Aller chercher les fichiers statiques
app.use('/public', express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/chat.html');
});

io.on('connection', (socket) => {
  socket.on('chat message', (msg, name) => {
    io.emit('chat message', msg, name);
  });

  socket.on('new user', (name) => {
    io.emit('new user', name)
  })
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});