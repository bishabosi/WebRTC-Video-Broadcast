let peerConnection;


const socket = io();
const video = document.querySelector("video");
const enableAudioButton = document.querySelector("#enable-audio");

enableAudioButton.addEventListener("click", enableAudio)

socket.on("offer", (id, description) => {
  peerConnection = new RTCPeerConnection();
  peerConnection
    .setRemoteDescription(description)
    .then(function(){ peerConnection.createAnswer()})
    .then(function(sdp){ peerConnection.setLocalDescription(sdp)})
    .then(function() {
      socket.emit("answer", id, peerConnection.localDescription);
    });
  peerConnection.ontrack = async function(event) {
    video.srcObject = event.streams[0];
    await video.play();
  };
  peerConnection.onicecandidate = function(event) {
    if (event.candidate) {
      socket.emit("candidate", id, event.candidate);
    }
  };
});


socket.on("candidate", function(id, candidate)  {
  peerConnection
    .addIceCandidate(new RTCIceCandidate(candidate))
    .catch(e => console.error(e));
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