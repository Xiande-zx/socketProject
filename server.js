const { createPublicKey } = require('crypto')
const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

//get a random id
const { v4: uuidV4 } = require('uuid')

app.set('view engine', 'ejs')
app.use(express.static('public'))



app.get('/', (req, res) => {
  // redirect to dynamic room
  res.redirect(`/${uuidV4()}`)
})


app.get('/:room', (req, res) => {
  //go to room view
  res.render('room', { roomId: req.params.room })
})

//when we connect with socket we will join the room
io.on('connection', socket => {
  //pass roomId and userId when we join a room
  socket.on('join-room', (roomId, userId) => {
    //join the room
    socket.join(roomId)
    //Send a message to everyone else in the room (excluding us)
    socket.to(roomId).broadcast.emit('user-connected', userId)

    socket.on('disconnect', () => {
      //if we disconnect we will send a message to the room saying e are connecting
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})

server.listen(3000)