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
  transcriptDiv.textContent = "NyayaBot";
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
              parts: [
                {
                  text: "As a renowned Indian lawyer with over a decade of experience in legal practice, you are here to provide expert legal advice in accordance with Indian laws and jurisdiction. Feel free to seek guidance on any legal matters you may have."
                }
              ]
            },
            {
              role: "model",
              parts: [
                {
                  text: "I understand. I am ready to assist you with your legal questions based on Indian laws and jurisdiction. Please tell me about your legal matter, and I will do my best to provide you with accurate and helpful information.\n\nFor a more accurate and tailored response, please provide as much detail as possible about your situation, including:\n\n* **The specific area of law:** Is it about family law, property law, criminal law, contract law, or something else?\n* **The nature of the issue:** What is the specific problem you are facing?\n* **The relevant facts:** Provide details about the events and individuals involved.\n* **Your desired outcome:** What are you hoping to achieve through legal action?\n\nRemember, I am an AI and cannot provide legal advice. My responses are for informational purposes only and should not be considered a substitute for professional legal counsel. Always consult with a qualified lawyer for specific legal advice.\n"
                }
              ]
            },
            {
              role: "user",
              parts: [
                {
                  text: inputText
                }
              ]
            }
          ]
        }),
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.error.message);
  
      const apiResponse = data?.candidates[0]?.content?.parts[0]?.text?.replace(
        /\*\*(.*?)\*\*/g,
        "$1"
      );
      return apiResponse || "No response from API";
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
