/**
 * This file defines the main server. It can be configured in the future to use HTTPS:
 * https://stackoverflow.com/questions/11744975/enabling-https-on-express-js
 */

import express from 'express'; // Web app framework.
import http from 'http'; // Serving over HTTP.
import path from 'path'; // Filesystem paths.
import socketio from 'socket.io'; // Inter-process socket communication.
import dotenv from 'dotenv'; // Environment configuration.

// Load environment configuration variable into `process.env`.
dotenv.config();

// Create an Express.js server to handle requests **from** the client using REST, and push realtime
// updates **to** the client using SocketIO.
const app = express();
const serverHttp = http.createServer(app);
let io = socketio(serverHttp);

// =================================================================================================
// Frontend request handlers.

// Set directory to serve files from (e.g. React client).
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
}

/**
 * GET /hello
 * Sends an acknowledgement string, so that a client can check whether the server is up and running.
 */
app.get('/hello', function(req, resp) {
    resp.send(`Server is up and running!`);
});

// =================================================================================================
// Socket handlers.

const program = io.of('/program');
const frontend = io.of('/frontend');

/**
 * NAMESPACE /program
 * Channel through which backend loggers communicate log records to this server.
 */
program.on('connect', (socket) => {
    console.debug(`Program connected: ${socket.id}`);
    socket.on('disconnect', () => {
        console.debug(`Program disconnected: ${socket.id}`);
    });

    socket.on('ProgramToServer', (msg) => {
        console.debug('Received message:', msg);
        frontend.emit('ServerToFrontend', msg);
        // TODO: append to file on disk (must be thread-safe)
    });

    // Some clients will experience issues if they attempt to disconnect before 
    // the server has finished processing its messages. Those clients, when 
    // seeking to disconnect, will instead send "ProgramRequestDisconnect", 
    // to which the server will reply and tell the client that all messages have
    // been consumed and it may safely disconnect.
    socket.on('ProgramRequestDisconnect', () => {
        socket.emit('ServerApproveDisconnect');
    })
});

/**
 * NAMESPACE /frontend
 * Channel through which new log records are pushed to the frontend.
 */
frontend.on('connect', (socket) => {
    console.debug(`Frontend connected: ${socket.id}`);
    socket.on('disconnect', () => {
        console.debug(`Frontend disconnected: ${socket.id}`);
    });

    // TODO: send previous N logs from file on disk
});

// =================================================================================================
// Start server on HTTP (and/or HTTPS).

const portHttp = process.env.SERVER_PORT_HTTP || 4000;
serverHttp.listen(portHttp, () => {
    console.log(`Server running at http://localhost:${portHttp}.`);
});
