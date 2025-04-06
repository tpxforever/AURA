window.addEventListener("DOMContentLoaded", () => {
    const savedSettings = localStorage.getItem("savedSettings");

    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        document.getElementById("assistant-name").value = settings.name || "";
        document.getElementById("empathy-slider").value = settings.empathy || 50;
        document.getElementById("humor-slider").value = settings.humor || 50;
        document.getElementById("honesty-slider").value = settings.honesty || 50;
        document.getElementById("sarcasm-slider").value = settings.sarcasm || 50;
    }

    // Load chat history
    const chatHistory = JSON.parse(localStorage.getItem("chatHistory") || "[]");
    const chatWindow = document.getElementById("chat-window");
    chatHistory.forEach(({ sender, message }) => {
        const msgDiv = document.createElement("div");
        msgDiv.textContent = `${sender}: ${message}`;
        chatWindow.appendChild(msgDiv);
    });
});

document.getElementById("send-btn").addEventListener("click", async () => {
    const name = document.getElementById("assistant-name").value;
    const empathy = document.getElementById("empathy-slider").value;
    const humor = document.getElementById("humor-slider").value;
    const honesty = document.getElementById("honesty-slider").value;
    const sarcasm = document.getElementById("sarcasm-slider").value;
    const userMessage = document.getElementById("user-input").value;

    const chatWindow = document.getElementById("chat-window");

    // Append user message
    const userDiv = document.createElement("div");
    userDiv.textContent = `You: ${userMessage}`;
    chatWindow.appendChild(userDiv);

    // Update chat history
    const chatHistory = JSON.parse(localStorage.getItem("chatHistory") || "[]");
    chatHistory.push({ sender: "You", message: userMessage });

    try {
        const response = await fetch("/api/dialogue", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                empathy: empathy,
                humor: humor,
                honesty: honesty,
                sarcasm: sarcasm,
                message: userMessage
            })
        });

        const data = await response.json();

        const botDiv = document.createElement("div");
        botDiv.textContent = `${name || "Bot"}: ${data.response}`;
        chatWindow.appendChild(botDiv);

        // Update chat history
        chatHistory.push({ sender: name || "Bot", message: data.response });
        localStorage.setItem("chatHistory", JSON.stringify(chatHistory));

        document.getElementById("user-input").value = "";
    } catch (error) {
        console.error("Error:", error);
        const errorDiv = document.createElement("div");
        errorDiv.textContent = "Error: Unable to get a response from the server.";
        chatWindow.appendChild(errorDiv);
    }
});
