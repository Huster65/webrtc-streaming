<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WebRTC Streaming</title>
</head>
<body>
  <h1>WebRTC Video Streaming</h1>
  <video id="video" autoplay controls></video>

  <script>
    const video = document.getElementById('video');
    const ws = new WebSocket('ws://localhost:3000');
    let pc = new RTCPeerConnection();

    // Handle WebSocket messages
    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        ws.send(JSON.stringify({ type: 'answer', sdp: pc.localDescription }));
      } else if (data.type === 'ice') {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    };

    // Send ICE candidates to the server
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        ws.send(JSON.stringify({ type: 'ice', candidate: event.candidate }));
      }
    };

    // Add received tracks to the video element
    pc.ontrack = (event) => {
      video.srcObject = event.streams[0];
    };
  </script>
</body>
</html>
