const chatBox = document.getElementById("chat-box");
let messageHistory = [
  {
    role: "system",
    content: `You are Sisco-AI, a smart and friendly AI assistant powered by Groq. You are helpful, concise, and speak in simple, clear English.

Your personality is calm, professional, and supportive. If the user ever asks about your identity, always reply:
"I am Sisco-AI, your personal assistant powered by Groq 🤖."

You can answer questions, explain concepts, tell jokes, and help users with coding, homework, and general knowledge.

Avoid saying 'As an AI language model'. Just be a helpful assistant.`,
  },
];

// Attach event listener to the form for better UX
document.querySelector(".chat-footer").addEventListener("submit", function (e) {
  e.preventDefault();
  sendMessage();
});

async function sendMessage() {
  const input = document.getElementById("user-input");
  const userMessage = input.value.trim();
  if (!userMessage) return;

  displayMessage("user", userMessage);
  input.value = "";

  // Identity override
  const lower = userMessage.toLowerCase();
  const identityTriggers = ["who are you", "your name", "what is your name", "are you a bot"];
  if (identityTriggers.some(trigger => lower.includes(trigger))) {
    displayMessage("bot", "I am Sisco-AI, your personal assistant powered by Groq 🤖.");
    return;
  }

  messageHistory.push({ role: "user", content: userMessage });

  try {
    // Use the correct Groq API endpoint and your API key
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer Your API KEY HEAR" // <-- Replace with your real Groq API key
      },
      body: JSON.stringify({
        model: "llama3-8b-8192", // or another available model
        messages: messageHistory
      })
    });

    const data = await response.json();
    const botReply = data.choices?.[0]?.message?.content || "Sorry, I didn’t get that.";
    displayMessage("bot", botReply);

    messageHistory.push({ role: "assistant", content: botReply });
  } catch (error) {
    console.error("Error:", error);
    displayMessage("bot", "Oops! Something went wrong.");
  }
}

function renderMessageContent(message) {
  // Replace triple backtick code blocks with <pre><code>
  return message.replace(/```(\w*)\n?([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre class="chat-code"><code>${escapeHtml(code)}</code></pre>`;
  });
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function displayMessage(sender, message) {
  const msgElement = document.createElement("div");
  msgElement.classList.add("message");
  msgElement.classList.add(sender === "user" ? "user" : "bot");
  msgElement.innerHTML = renderMessageContent(message);
  chatBox.appendChild(msgElement);
  chatBox.scrollTop = chatBox.scrollHeight;
  // Highlight code blocks after adding
  msgElement.querySelectorAll('pre code').forEach((el) => {
    hljs.highlightElement(el);
  });
}
