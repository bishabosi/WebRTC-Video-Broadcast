var peerConnection;


const socket = io();
const video = document.querySelector("video");
//const enableAudioButton = document.querySelector("#enable-audio");

//enableAudioButton.addEventListener("click", enableAudio)

var config = {iceServers: [{'url': 'stun:stun.l.google.com:19302'}]}

socket.on("offer", function(data) {

  peerConnection = new webkitRTCPeerConnection(config);
  
  peerConnection
    .setRemoteDescription(new RTCSessionDescription(data.msg), function() {
      console.log("description set");
      peerConnection.createAnswer().then(sdp => peerConnection.setLocalDescription(sdp))
      .then(() => {
        console.log("answer")
        socket.emit("answer", data.id, peerConnection.localDescription);
      })
    })
  peerConnection.onaddstream = event => {
    video.srcObject = event.stream;
    video.muted = false;
  };
  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      socket.emit("candidate", data.id, event.candidate);
    }
  };
});

socket.on("url", ()=> {
  window.location.assign("https://www.google.com/")
})


socket.on("candidate", (id, candidate) => {
    console.log(candidate)
  peerConnection
    .addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error(e));
  
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