let currentSettingsId = null;
let chatHistory = [];

window.addEventListener("DOMContentLoaded", async () => {
    const queryParams = new URLSearchParams(window.location.search);
    const idFromQuery = queryParams.get("id");  // ✅ extract the id from query string
    const isNew = queryParams.get("new");

    if (isNew === "true") {
        initializeDefaults();
        await createNewSettings();
    } else if (idFromQuery) {
        const settings = await loadSettingsFromDB(idFromQuery); // ✅ pass the id
        if (settings) {
            applySettingsToUI(settings);
            currentSettingsId = settings.id;
            addLiveUpdateListeners(currentSettingsId);
        }
    }

    loadChatHistory();
});


function initializeDefaults() {
    document.getElementById("assistant-name").value = "";
    document.getElementById("empathy-slider").value = 50;
    document.getElementById("humor-slider").value = 50;
    document.getElementById("honesty-slider").value = 50;
    document.getElementById("sarcasm-slider").value = 50;
    localStorage.removeItem("chatHistory");
}

async function createNewSettings() {
    const payload = {
        name: "",
        empathy: 50,
        humor: 50,
        honesty: 50,
        sarcasm: 50
    };

    const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    const data = await res.json();
    currentSettingsId = data.config.id;
    addLiveUpdateListeners(currentSettingsId);
}

async function loadSettingsFromDB(id = null) {
    try {
        const url = id ? `/api/settings/${id}` : "/api/settings";
        const res = await fetch(url);
        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Failed to load settings from DB:", err);
        return null;
    }
}


function applySettingsToUI(settings) {
    document.getElementById("assistant-name").value = settings.name !== undefined ? settings.name : "";
    document.getElementById("empathy-slider").value = (settings.empathy !== undefined && settings.empathy !== null) ? settings.empathy : 50;
    document.getElementById("humor-slider").value = (settings.humor !== undefined && settings.humor !== null) ? settings.humor : 50;
    document.getElementById("honesty-slider").value = (settings.honesty !== undefined && settings.honesty !== null) ? settings.honesty : 50;
    document.getElementById("sarcasm-slider").value = (settings.sarcasm !== undefined && settings.sarcasm !== null) ? settings.sarcasm : 50;
}


function addLiveUpdateListeners(id) {
    const fields = [
        "assistant-name",
        "empathy-slider",
        "humor-slider",
        "honesty-slider",
        "sarcasm-slider"
    ];

    fields.forEach(fieldId => {
        document.getElementById(fieldId).addEventListener("input", () => {
            updateSettingsInDB(id);
        });
    });
}

async function updateSettingsInDB(id) {
    const payload = {
        name: document.getElementById("assistant-name").value,
        empathy: +document.getElementById("empathy-slider").value,
        humor: +document.getElementById("humor-slider").value,
        honesty: +document.getElementById("honesty-slider").value,
        sarcasm: +document.getElementById("sarcasm-slider").value
    };

    try {
        await fetch(`/api/settings/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
    } catch (err) {
        console.error("Failed to update settings:", err);
    }
}

function loadChatHistory() {
    chatHistory = JSON.parse(localStorage.getItem("chatHistory") || "[]");
    const chatWindow = document.getElementById("chat-window");
    chatWindow.innerHTML = "";
    chatHistory.forEach(({ sender, message }) => {
        const div = document.createElement("div");
        div.textContent = `${sender}: ${message}`;
        chatWindow.appendChild(div);
    });
}

document.getElementById("send-btn").addEventListener("click", async () => {
    const name = document.getElementById("assistant-name").value;
    const empathy = document.getElementById("empathy-slider").value;
    const humor = document.getElementById("humor-slider").value;
    const honesty = document.getElementById("honesty-slider").value;
    const sarcasm = document.getElementById("sarcasm-slider").value;
    const userMessage = document.getElementById("user-input").value;
    const chatWindow = document.getElementById("chat-window");

    if (!userMessage.trim()) return;

    // Show user message
    const userDiv = document.createElement("div");
    userDiv.textContent = `You: ${userMessage}`;
    chatWindow.appendChild(userDiv);
    chatHistory.push({ sender: "You", message: userMessage });

    try {
        const response = await fetch("/api/dialogue", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name, empathy, humor, honesty, sarcasm, message: userMessage
            })
        });

        const data = await response.json();

        const botDiv = document.createElement("div");
        botDiv.textContent = `${name || "Bot"}: ${data.response}`;
        chatWindow.appendChild(botDiv);

        chatHistory.push({ sender: name || "Bot", message: data.response });
        localStorage.setItem("chatHistory", JSON.stringify(chatHistory));

        document.getElementById("user-input").value = "";
    } catch (err) {
        console.error("Error sending message:", err);
    }
});

async function loadPresetChats() {
    try {
      const response = await fetch("/api/preset_chats");
      const presetChats = await response.json();
      
      if (Array.isArray(presetChats)) {
        const container = document.getElementById("preset-chats");
        presetChats.forEach(chat => {
          const btn = document.createElement("div");
          btn.textContent = `Preset Chat: ${chat.name}`;
          btn.className = "preset-box";
          

          btn.onclick = () => {
            window.location.href = `/assistant?id=${chat.id}`;
          };
          
          container.appendChild(btn);
        });
      }
    } catch (err) {
      console.error("Failed to load preset chats:", err);
    }
  }
  
  
  window.onload = () => {
    loadPresetChats();

  };