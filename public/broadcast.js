const peerConnections = {};

var peerConnection;

const socket = io();

var config = {iceServers: [{'url': 'stun:stun.l.google.com:19302'}]}

socket.on("answer", async (id, description) => {
  await peerConnections[id].setRemoteDescription(description);
});

socket.on("watcher", (id) => {
  const peerConnection = new RTCPeerConnection(config);
  peerConnections[id] = peerConnection;

  let stream = videoElement.srcObject;
  peerConnection.addStream(stream)

/*  peerConnection.addEventListener("signalingstatechange", (ev) => {
    switch(peerConnection.signalingState) {
      case "stable":
        peerConnection.addStream(stream)
        break;
    }
  }, false);*/

  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      //peerConnection.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error(e));
      socket.emit("candidate", id, event.candidate);
    }
  };

/* {
      offerToReceiveAudio: 0,
      offerToReceiveVideo: 0,
    }*/

  peerConnection
    .createOffer({
      offerToReceiveAudio: 0,
      offerToReceiveVideo: 0,
    })
    .then(sdp => peerConnection.setLocalDescription(sdp))
    .then(() => {

      socket.emit("offer", id, peerConnection.localDescription);
    });
});

socket.on("candidate", (id, candidate) => {
  if(candidate) {
  peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
  }
});

socket.on("disconnectPeer", id => {
  peerConnections[id].close();
  delete peerConnections[id];
});

window.onunload = window.onbeforeunload = () => {
  socket.close();
};

// Get camera and microphone
const videoElement = document.querySelector("video");

startCapture({
  video: true,
  audio: true
})

  async function startCapture(displayMediaOptions) {
    let captureStream;
  
    try {
      captureStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
      videoElement.srcObject = captureStream;
    } catch (err) {
      console.error(`Error: ${err}`);
    }
  }


function handleError(error) {
  console.error("Error: ", error);
}

window.addEventListener("error", function (e) {
  alert("Error occurred: " + e.error.message);
  return false;
})