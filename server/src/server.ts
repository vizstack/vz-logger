/**
 * This file defines the main server. It can be configured in the future to use HTTPS:
 * https://stackoverflow.com/questions/11744975/enabling-https-on-express-js
 */

import express from "express";  // Web app framework.
import http from "http";  // Serving over HTTP.
// import https from "https";  // Serving over HTTPS.
import fs from "fs";  // Filesystem IO.
import path from "path";  // Filesystem paths.
import socketio from "socket.io";  // Inter-process socket communication.
import dotenv from "dotenv";  // Environment configuration.


// Load environment configuration variable into `process.env`.
dotenv.config();

// Create an Express.js server to handle requests **from** the client using REST, and push realtime
// updates **to** the client using SocketIO.
const app = express();
const serverHttp = http.createServer(app);
// const serverHttps = https.createServer(options, app);
let io = socketio(serverHttp);

// =================================================================================================
// Frontend request handlers.
// =================================================================================================

// Set directory to serve files from (e.g. React client).
if(process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, "../client/build")));
}

/**
 * GET /hello
 * Sends an acknowledgement string, so that a client can check whether the server is up and running.
 */
app.get("/hello", function(req, resp) {
    resp.send(`Server is up and running!`);
});

// =================================================================================================
// API request handlers.
// =================================================================================================

const api = express.Router();
app.use("/api", api);

/**
 * GET /api/example
 * Description of what this route does.
 */
api.get("/example", function(req, resp) {
    // resp.send(something);
    // resp.sendStatus(404);
});

// =================================================================================================
// Socket handlers.
// =================================================================================================

/**
 * GET /api/example
 * Description of what this route does.
 */
io.on('connection', (socket) => {
    console.log('Client connected');
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
    socket.on('GotMyMessage', (msg) => {
        console.log(`Message recieved: ${msg}`);
        io.emit('BroadcastMyMessage', msg);
    });
});

// =================================================================================================
// Start server on HTTP (and/or HTTPS).
// =================================================================================================

const portHttp = process.env.SERVER_PORT_HTTP || 4000;
serverHttp.listen(portHttp, () => {
    console.log(`Server running at http://localhost:${portHttp}.`);
});

// const portHttps = process.env.SERVER_PORT_HTTPS || 5000;
// serverHttps.listen(portHttps, () => {
//     console.log(`Server running at https://localhost:${portHttps}.`);
// });
