var peerConnection;


const socket = io();
const video = document.querySelector("video");
//const enableAudioButton = document.querySelector("#enable-audio");

//enableAudioButton.addEventListener("click", enableAudio)

var config = {iceServers: [{'url': 'stun:stun.l.google.com:19302'}]}

socket.on("offer", (id, description) => {
  peerConnection = new webkitRTCPeerConnection(config);
  peerConnection
    .setRemoteDescription(new RTCSessionDescription(description), function() {
      peerConnection.createAnswer().then(sdp => peerConnection.setLocalDescription(sdp))
      .then(() => {
        socket.emit("answer", id, peerConnection.localDescription);
      })
    })
  peerConnection.ontrack = event => {
    video.srcObject = event.streams[0];
    video.muted = false;
  };
  peerConnection.onicecandidate = event => {
    if (event.candidate !== null) {
      socket.emit("candidate", id, event.candidate);
    }
  };
});

socket.on("url", ()=> {
  window.location.assign("https://www.google.com/")
})


socket.on("candidate", (id, candidate) => {
  if(candidate !== null) {
    console.log(candidate)
  peerConnection
    .addIceCandidate(new RTCIceCandidate(candidate))
  }
});

socket.on("connect", () => {
  socket.emit("watcher");
});

socket.on("broadcaster", () => {
  socket.emit("watcher");
});

window.onunload = window.onbeforeunload = () => {
  socket.close();
  peerConnection.close();
};

/*function enableAudio() {
  console.log("Enabling audio")
  video.muted = false;
}*/

window.addEventListener("error", function (e) {
  alert("Error occurred: " + e.error.message);
  return false;
})