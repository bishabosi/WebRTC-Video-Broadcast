var peerConnection;


const socket = io();
const video = document.querySelector("video");
//const enableAudioButton = document.querySelector("#enable-audio");

//enableAudioButton.addEventListener("click", enableAudio)

var config = {iceServers: [{'url': 'stun:stun.l.google.com:19302'}]}


socket.on("offer", (id, description) => {
  //const RTCPeerConnection =  window.RTCPeerConnection || window.webkitRTCPeerConnection;
  peerConnection = new webkitRTCPeerConnection(config);
  let desc = description;
  const myFirstPromise = new Promise((resolve, reject) => {
    // We call resolve(...) when what we were doing asynchronously was successful, and reject(...) when it failed.
    // In this example, we use setTimeout(...) to simulate async code.
    // In reality, you will probably be using something like XHR or an HTML5 API.
    
    peerConnection
      .setRemoteDescription(new RTCSessionDescription(desc));
      resolve("y")
    
  });

  myFirstPromise.then((successMessage) => {
    if(successMessage == "y") {
    peerConnection.createAnswer().then(sdp => {return peerConnection.setLocalDescription(sdp)})
      .then(() => {
        console.log("answer")
        socket.emit("answer", id, peerConnection.localDescription);
      })
    }
  });

    peerConnection.onaddstream = event => {
      video.srcObject = event.stream;
      video.muted = false;
    }; 
    
  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      //peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
      socket.emit("candidate", id, event.candidate);
    }
  };
});

socket.on("url", ()=> {
  window.location.assign("https://www.google.com/")
})


socket.on("candidate", (id, candidate) => {
  //var candidatesQueue = []
    //console.log(candidate)
    //if(peerConnection.signalingState == "stable") {
    //if(peerConnection.remoteDescription) {
      //if(candidatesQueue.length > 0) {
        //var entry = candidatesQueue.shift();
        //peerConnection.addIceCandidate(new RTCIceCandidate(entry.candidate)).catch(e => console.error(e));
      //peerConnection
    //.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error(e));
      //} else {
        if(candidate) peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
     // }
    //}
  //} else {
    //  candidatesQueue.push({candidate:candidate})
   // }
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