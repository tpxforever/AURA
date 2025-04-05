document.getElementById("send-btn").addEventListener("click", async () => {
    const empathy = document.getElementById("empathy-slider").value;
    const humor = document.getElementById("humor-slider").value;
    const honesty = document.getElementById("honesty-slider").value;
    const sarcasm = document.getElementById("sarcasm-slider").value;
    const userMessage = document.getElementById("user-input").value;

    const chatWindow = document.getElementById("chat-window");

    // Add user's message to chat window
    const userDiv = document.createElement("div");
    userDiv.textContent = `You: ${userMessage}`;
    chatWindow.appendChild(userDiv);

    // Send data to the backend
    const response = await fetch("/api/dialogue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            empathy: empathy,
            humor: humor,
            honesty: honesty,
            sarcasm: sarcasm,
            message: userMessage
        })
    });

    const data = await response.json();

    // Add chatbot's response to chat window
    const botDiv = document.createElement("div");
    botDiv.textContent = `Bot: ${data.response}`;
    chatWindow.appendChild(botDiv);

    document.getElementById("user-input").value = ""; // Clear input
});
