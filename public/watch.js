let peerConnection;


const socket = io();
const video = document.querySelector("video");
video.addEventListener('canplay', (event) => {
  video.play()
});
const enableAudioButton = document.querySelector("#enable-audio");

enableAudioButton.addEventListener("click", enableAudio)

socket.on("offer", (id, description) => {
  peerConnection = new RTCPeerConnection();
  peerConnection
    .setRemoteDescription(description)
    .then(async function(){ await peerConnection.createAnswer()})
    .then(async function(sdp){ socket.emit("sdp", sdp); await peerConnection.setLocalDescription(sdp)})
    .then(async function() {
      socket.emit("answer", id, peerConnection.localDescription);
    });
  peerConnection.ontrack = function(event) {
    video.srcObject = event.streams[0];
  };
  peerConnection.onicecandidate = function(event) {
    if (event.candidate) {
      socket.emit("candidate", id, event.candidate);
    }
  };
});


socket.on("candidate", function(id, candidate)  {
  if (candidate) {
  peerConnection
    .addIceCandidate(new RTCIceCandidate(candidate))
    .catch(e => console.error(e));
  }
});

socket.on("connect", function() {
  socket.emit("watcher");
});

socket.on("broadcaster", function() {
  socket.emit("watcher");
});

window.onunload = window.onbeforeunload = function() {
  socket.close();
  peerConnection.close();
};

function enableAudio() {
  console.log("Enabling audio")
  video.muted = false;
}