var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(80);

io.on('connection', function (socket) {
  socket.on('join', function (data) {
    socket.join(data.roomId);
    socket.room = data.roomId;
    // Put socket in the corresponding room.
    const sockets = io.of('/').in().adapter.rooms[data.roomId];
    if(sockets.length===1){
      socket.emit('init')
    }else{
      if (sockets.length===2){
        // Tell both of the peers ready.
        io.to(data.roomId).emit('ready')
      }else{
        socket.room = null
        socket.leave(data.roomId)
        socket.emit('full')
      }

    }
  });
  socket.on('signal', (data) => {
    // Redirect the signal message to both peers.
    io.to(data.room).emit('desc', data.desc)
  })
  socket.on('disconnect', () => {
    const roomId = Object.keys(socket.adapter.rooms)[0]
    if (socket.room){
      io.to(socket.room).emit('disconnected')
    }

  })
});
