// our backend server logic here
const path = require("path");
const express = require("express");
const webSocket = require("ws");
const helmet = require("helmet");
const cors = require("cors");

const app = express();
const port = 443;

// Helmet to set various HTTP headers for security
app.use(helmet());

// Set Content Security Policy (CSP) header
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "wss://titanium-grizzled-texture.glitch.me"],
    },
  })
);
// CORS to allow cross-origin requests
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

const server = app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

const wss = new webSocket.Server({ server });

wss.on("connection", (ws) => {
    console.log("One more client added");

    ws.on("message", (message) => {
        message = JSON.parse(message);
        if (message.type === "name") {
            ws.personName = message.data;
            return;
        }

        wss.clients.forEach((client) => {
            if (client.readyState === webSocket.OPEN && client !== ws) {
                client.send(JSON.stringify({
                    name: ws.personName,
                    data: message.data
                }));
            }
        });
    });

    ws.on("close", () => {
        console.log("Client lost");
    });
});