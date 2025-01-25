const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const ffmpeg = require('fluent-ffmpeg');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = 3000;

app.use(express.static('public')); // Serve client files

// WebSocket connection for WebRTC signaling
wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    // Start FFmpeg to stream the video
    const ffmpegProcess = ffmpeg('sample.mp4')
        .format('webm')
        .videoCodec('libvpx')
        .noAudio()
        .outputOptions('-movflags', 'frag_keyframe+empty_moov')
        .on('error', (err) => console.error('FFmpeg error:', err))
        .pipe();

    ffmpegProcess.on('data', (chunk) => {
        ws.send(chunk); // Send video data to client
    });

    ws.on('close', () => {
        ffmpegProcess.kill();
        console.log('WebSocket client disconnected');
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
