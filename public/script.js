const socket = io('/')
const videoGrid = document.getElementById('video-grid')

//PeerJS provides a complete, configurable, and easy-to-use peer-to-peer API built on top of WebRTC, supporting both data channels and media streams.
const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001'
})
const myVideo = document.createElement('video')
//mute our microphone
myVideo.muted = true
const peers = {}

//get permission for audio and video
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  //start streaming
  addVideoStream(myVideo, stream)

  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  //let other user connect
  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)
  })
})

//disconnect
socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  //myPeer will generate a random User id
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })
  peers[userId] = call
}

function addVideoStream(video, stream) {
  //set the source
  video.srcObject = stream
  //add an event to video
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  //will add the video to videoGrid
  videoGrid.append(video)
}