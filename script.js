const startRecordButton = document.getElementById("start-record");
const transcriptDiv = document.getElementById("transcript");
const playPauseButton = document.getElementById("play-pause");
const cancelButton = document.getElementById("cancel-record");
const controlsDiv = document.getElementById("controls");
let isPlaying = false;
let utterance = null;

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
  alert("Speech Recognition API is not supported in this browser.");
  throw new Error("Speech Recognition API is not supported in this browser.");
}

const recognition = new SpeechRecognition();
recognition.lang = "en-US";
recognition.interimResults = false;
recognition.maxAlternatives = 1;

// API configuration
const API_KEY = "AIzaSyAXLx8gB48tMR7WCT-1YIdXAYyIwMK5s28"; // Replace with your valid API key
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

function toggleUIState(isRecording) {
  startRecordButton.style.display = isRecording ? "none" : "flex";
  controlsDiv.style.display = isRecording ? "flex" : "none";
}

function updatePlayPauseIcon(isPlaying) {
  playPauseButton.querySelector("i").className = isPlaying
    ? "fa fa-pause"
    : "fa fa-play";
}

startRecordButton.addEventListener("click", startListening);

cancelButton.addEventListener("click", () => {
  transcriptDiv.textContent = "Your Legal Assistant";
  toggleUIState(false);
  stopEverything();
});

recognition.onresult = async (event) => {
  const speechResult = event.results[0][0].transcript;
  transcriptDiv.textContent = `You said: "${speechResult}"`;
  console.log("User speech:", speechResult);

  try {
    const responseText = await generateAPIResponse(speechResult);
    speakResponse(responseText);
  } catch (error) {
    console.error("Error generating content from Gemini API:", error);
    alert(`Error generating content: ${error.message}`);
  }
};

recognition.onspeechend = () => recognition.stop();

recognition.onerror = (event) => {
  console.error("Speech recognition error detected:", event.error);
  transcriptDiv.textContent = `Error: ${event.error}`;
};

async function generateAPIResponse(inputText) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: inputText }],
          },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);

    const apiResponse = data?.candidates[0]?.content?.parts[0]?.text.replace(
      /\*\*(.*?)\*\*/g,
      "$1"
    );
    return apiResponse;
  } catch (error) {
    console.error("Error generating content from Gemini API:", error);
    alert(`Error generating content: ${error.message}`);
    return "Error generating response";
  }
}

function speakResponse(responseText) {
  utterance = new SpeechSynthesisUtterance(responseText);
  utterance.lang = "en-US";

  utterance.onstart = () => {
    isPlaying = true;
    updatePlayPauseIcon(true);
  };

  utterance.onend = () => {
    isPlaying = false;
    updatePlayPauseIcon(false);
    startListening();
  };

  speechSynthesis.speak(utterance);
  isPlaying = true;
  updatePlayPauseIcon(true);
}

function startListening() {
  recognition.start();
  transcriptDiv.textContent = "Listening...";
  toggleUIState(true);
}

function stopEverything() {
  recognition.stop();
  speechSynthesis.cancel();
  isPlaying = false;
  updatePlayPauseIcon(false);
}

playPauseButton.addEventListener("click", () => {
  if (speechSynthesis.speaking && !speechSynthesis.paused) {
    // If speaking and not paused, pause the speech
    speechSynthesis.pause();
    isPlaying = false;
    updatePlayPauseIcon(false);
  } else if (speechSynthesis.paused) {
    // If paused, start listening again instead of resuming
    speechSynthesis.cancel(); // Cancel the paused speech
    startListening();
  } else if (!speechSynthesis.speaking && !recognition.running) {
    // If not speaking and not listening, start listening
    startListening();
  } else {
    // If already listening, do nothing (optional: provide feedback)
    console.log("Already listening...");
  }
});
