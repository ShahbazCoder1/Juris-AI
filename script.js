const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', function () {
  navLinks.classList.toggle('active');
});


document.getElementById('chat-button').addEventListener('click', function () {
  document.getElementById('chat-box').style.display = 'flex';  // Show the chat box
});

document.getElementById('close-chat').addEventListener('click', function () {
  document.getElementById('chat-box').style.display = 'none';  // Hide the chat box
});

document.getElementById('chat-tab').addEventListener('click', function () {
  document.getElementById('chat-body').style.display = 'block';
  document.getElementById('voice-body').style.display = 'none';
  document.getElementById('chat-msg').style.display = 'flex';
  this.classList.add('active');
  document.getElementById('voice-tab').classList.remove('active');
});

document.getElementById('voice-tab').addEventListener('click', function () {
  document.getElementById('voice-body').style.display = 'block';
  document.getElementById('chat-body').style.display = 'none';
  document.getElementById('chat-msg').style.display = 'none';
  this.classList.add('active');
  document.getElementById('chat-tab').classList.remove('active');
});


const startRecordButton = document.getElementById("start-record");
const transcriptDiv = document.getElementById("transcript");
const playPauseButton = document.getElementById("play-pause");
const cancelButton = document.getElementById("cancel-record");
const controlsDiv = document.getElementById("controls");
let isPlaying = false;
let utterance = null;

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
  alert("Speech Recognition API is not supported in this browser.");
  throw new Error("Speech Recognition API is not supported in this browser.");
}

const recognition = new SpeechRecognition();
recognition.lang = "en-US";
recognition.interimResults = false;
recognition.maxAlternatives = 1;

function toggleUIState(isRecording) {
  startRecordButton.style.display = isRecording ? "none" : "flex";
  controlsDiv.style.display = isRecording ? "flex" : "none";
}

function updatePlayPauseIcon(isPlaying) {
  playPauseButton.querySelector("i").className = isPlaying ? "fa fa-pause" : "fa fa-play";
}

startRecordButton.addEventListener("click", startListening);

cancelButton.addEventListener("click", () => {
  transcriptDiv.textContent = "";
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
    console.error("Error generating content from the server:", error);
    alert(`Error generating content: ${error.message}`);
  }
};

recognition.onspeechend = () => recognition.stop();

recognition.onerror = (event) => {
  console.error("Speech recognition error detected:", event.error);
  transcriptDiv.textContent = `Error: ${event.error}`;
};

async function generateAPIResponse(inputText) {
  const API_KEY = "AIzaSyAXLx8gB48tMR7WCT-1YIdXAYyIwMK5s28";
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent?key=${API_KEY}`;

  // Prepare the request payload
  const payload = {
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
            text: "I understand. I am ready to assist you with your legal questions based on Indian laws and jurisdiction. Please tell me about your legal matter, and I will do my best to provide you with accurate and helpful information."
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
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to generate response');

    const apiResponse = data.candidates[0].content.parts[0].text;

    return apiResponse || "No response from server";
  } catch (error) {
    console.error("Error generating content from server:", error);
    alert(`Error generating content: ${error.message}`);
    return "Error generating response";
  }
}

function speakResponse(responseText) {
  const cleanedResponse = removeFormatting(responseText);
  utterance = new SpeechSynthesisUtterance(cleanedResponse);
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
    speechSynthesis.pause();
    isPlaying = false;
    updatePlayPauseIcon(false);
  } else if (speechSynthesis.paused) {
    speechSynthesis.cancel();
    startListening();
  } else if (!speechSynthesis.speaking && !recognition.running) {
    startListening();
  } else {
    console.log("Already listening...");
  }
});

function removeFormatting(text) {
  return text
    .replace(/\*{1,2}/g, '')
    .replace(/_{1,2}/g, '')
    .replace(/`+/g, '')
    .replace(/<\/?[^>]+(>|$)/g, '');
}

// Chat functionality
document.addEventListener('DOMContentLoaded', () => {
  const chatBody = document.getElementById('chat-body');
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.querySelector('.chat-footer button');
  const chatContainer = document.querySelector('.chat-container');
  const quickReplyButtons = document.querySelectorAll('.quick-reply-btn');

  // Helper function to display the AI response in real-time (typing effect)
  function typeMessage(targetElement, message, delay = 20) {
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < message.length) {
        targetElement.textContent += message.charAt(i);
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, delay);
  }

  function appendMessage(content, role) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', role);

    const bubbleDiv = document.createElement('div');
    bubbleDiv.classList.add('message-bubble');
    messageDiv.appendChild(bubbleDiv);

    // Add like, dislike, and copy buttons for AI response
    if (role === 'ai') {
      const buttonsDiv = document.createElement('div');
      buttonsDiv.classList.add('message-buttons');

      buttonsDiv.innerHTML = `
        <button class="like-btn">
            <i class="fas fa-thumbs-up"></i>
        </button>
        <button class="dislike-btn">
            <i class="fas fa-thumbs-down"></i>
        </button>
        <button class="copy-btn">
            <i class="fas fa-copy"></i>
        </button>
      `;

      messageDiv.appendChild(buttonsDiv);

      // Add functionality for copy to clipboard
      buttonsDiv.querySelector('.copy-btn').addEventListener('click', () => {
        navigator.clipboard.writeText(content);
        alert('Text copied to clipboard!');
      });

      // Like button functionality
      buttonsDiv.querySelector('.like-btn').addEventListener('click', () => {
        const likeBtn = buttonsDiv.querySelector('.like-btn');
        likeBtn.style.color = 'blue'; // Change color to indicate like
        likeBtn.disabled = true; // Disable button after liking
      });

      // Dislike button functionality
      buttonsDiv.querySelector('.dislike-btn').addEventListener('click', () => {
        const dislikeBtn = buttonsDiv.querySelector('.dislike-btn');
        dislikeBtn.style.color = 'red'; // Change color to indicate dislike
        dislikeBtn.disabled = true; // Disable button after disliking
        openReportModal(content); // Open report modal
      });
    }

    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;

    if (role === 'ai') {
      typeMessage(bubbleDiv, content); // Show AI message in typing effect
    } else {
      bubbleDiv.textContent = content; // Show user message immediately
    }
  }

  function openReportModal(content) {
    const modal = document.createElement('div');
    modal.classList.add('modal');

    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');
    modalContent.innerHTML = `
      <span class="close-button">&times;</span>
      <h4>Report this response?</h4>
      <textarea rows="4" placeholder="Enter report message here..."></textarea>
      <button class="submit-report">Submit</button>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Close modal when clicking the close button
    modal.querySelector('.close-button').addEventListener('click', () => {
      modal.remove();
    });

    // Add event listener to the submit button
    modal.querySelector('.submit-report').addEventListener('click', () => {
      alert('Thank you for your feedback!'); // Dummy submit action
      modal.remove(); // Remove the modal after submission
    });

    // Close modal when clicking outside the modal content
    window.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.remove();
      }
    });
  }

  // Hide the chat-container
  function hideChatContainer() {
    chatContainer.style.display = 'none';
  }

  async function sendMessage(inputText) {
    appendMessage(inputText, 'user');
    hideChatContainer(); // Hide the chat-container after sending the first message

    const API_KEY = "AIzaSyAXLx8gB48tMR7WCT-1YIdXAYyIwMK5s28";
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

    // Prepare the request payload
    const payload = {
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
              text: "I understand. I am ready to assist you with your legal questions based on Indian laws and jurisdiction. Please tell me about your legal matter, and I will do my best to provide you with accurate and helpful information."
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
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const cleanedResponse = removeFormatting(data.candidates[0].content.parts[0].text);
      appendMessage(cleanedResponse, 'ai'); // Display AI response with typing effect
    } catch (error) {
      console.error('Error:', error);
      appendMessage('Error: Unable to fetch response.', 'ai');
    }
  }


  // Send message when the user types and clicks "Send"
  sendBtn.addEventListener('click', () => {
    const inputText = chatInput.value.trim();
    if (!inputText) return;
    sendMessage(inputText);
    chatInput.value = '';
  });

  // Handle 'Enter' key to send the message
  chatInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const inputText = chatInput.value.trim();
      if (!inputText) return;
      sendMessage(inputText);
      chatInput.value = '';
    }
  });

  // Send quick reply when clicked
  quickReplyButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const quickReplyText = button.textContent.trim();
      sendMessage(quickReplyText);
      hideChatContainer();
    });
  });
});
