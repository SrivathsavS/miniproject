const name = prompt("What's your name?");
const log = document.getElementById("log");

// Set WebSocket URL based on environment
const isLocalhost = window.location.hostname === "localhost";
const wsUrl = isLocalhost ? "ws://localhost:5001" : `wss://${window.location.hostname}`;
const sock = new WebSocket(wsUrl);

function addMessage(text, isUser, senderName = null) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');
        
    if (senderName) {
        const nameSpan = document.createElement('span');
        nameSpan.classList.add('sender-name');
        nameSpan.textContent = senderName + ': ';
        messageDiv.appendChild(nameSpan);
    }
        
    const contentSpan = document.createElement('span');
    contentSpan.textContent = text;
    messageDiv.appendChild(contentSpan);
        
    log.appendChild(messageDiv);
    log.scrollTop = log.scrollHeight; // Auto-scroll to the bottom
    }

sock.onopen = () => {
    sock.send(JSON.stringify({
        type: "name",
        data: name
    }));
}

sock.onmessage = (event) => {
    console.log(event);
    const json = JSON.parse(event.data);
    addMessage(json.data, false, json.name);
};

document.querySelector("button").onclick = () => {
    const text = document.getElementById("text").value;
    if (text.trim() !== '') {
        sock.send(JSON.stringify({
            type: "message",
            data: text
        }));
        addMessage(text, true);
        document.getElementById("text").value = ''; // Clear input after sending
    }
    }

    // Add event listener for Enter key
document.getElementById("text").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        document.querySelector("button").click();
    }
    });