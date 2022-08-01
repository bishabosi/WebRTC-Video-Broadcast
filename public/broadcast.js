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
//const audioSelect = document.querySelector("select#audioSource");
//const videoSelect = document.querySelector("select#videoSource");

//audioSelect.onchange = getStream;
//videoSelect.onchange = getStream;

getStream()

function getStream() {
  if (window.stream) {
    window.stream.getTracks().forEach(track => {
      track.stop();
    });
  }
  //const audioSource = audioSelect.value;
  //const videoSource = videoSelect.value;
  const constraints = {
    audio: true,
    video: {width: 320, height: 240},
    frameRate: 15
  };
  return navigator.mediaDevices
    .getUserMedia(constraints)
    .then(gotStream)
    .catch(handleError);
}

function gotStream(stream) {
  window.stream = stream;
  
  videoElement.srcObject = stream;
  socket.emit("broadcaster");
}

function handleError(error) {
  console.error("Error: ", error);
}