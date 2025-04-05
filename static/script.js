document.getElementById("send-btn").addEventListener("click", async () => {
    const name = document.getElementById("assistant-name").value;
    const empathy = document.getElementById("empathy-slider").value;
    const humor = document.getElementById("humor-slider").value;
    const honesty = document.getElementById("honesty-slider").value;
    const sarcasm = document.getElementById("sarcasm-slider").value;
    const userMessage = document.getElementById("user-input").value;

    const chatWindow = document.getElementById("chat-window");

    // Add the user's message to the chat window
    const userDiv = document.createElement("div");
    userDiv.textContent = `You: ${userMessage}`;
    chatWindow.appendChild(userDiv);

    try {
        // Send data to the backend
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

        // Add the bot's response to the chat window
        const botDiv = document.createElement("div");
        botDiv.textContent = `${name || "Bot"}: ${data.response}`;
        chatWindow.appendChild(botDiv);

        document.getElementById("user-input").value = ""; // Clear input
    } catch (error) {
        console.error("Error:", error);
        const errorDiv = document.createElement("div");
        errorDiv.textContent = "Error: Unable to get a response from the server.";
        chatWindow.appendChild(errorDiv);
    }
});
