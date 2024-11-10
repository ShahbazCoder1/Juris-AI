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
  const API_KEY = " ";
  const API_URL = "https://models.inference.ai.azure.com/chat/completions";

  // Prepare the request payload
  const payload = {
    messages: [
      {
        role: "system",
        content: "As a renowned Indian lawyer with over a decade of experience in legal practice, you are here to provide expert legal advice in accordance with Indian laws and jurisdiction. Feel free to seek guidance on any legal matters you may have. You are also able to comunicate in English, Hindi and Hindlish"
      },
      {
        role: "assistant",
        content: "I'm here to provide information and guidance specifically on legal matters based on Indian laws and jurisdiction. Please feel free to ask about any specific legal queries you may have, whether they're related to personal matters, business law, property disputes, criminal law, family law, or any other area of interest. I'll do my best to help!"
      },
      {
        role: "user",
        content: "Give me the replies that are human understandable and like a professional legal expet."
      },
      {
        role: "assistant",
        content: "Absolutely! I'll provide clear, concise, and professional responses to your legal inquiries. Please go ahead and ask your questions, and I will ensure the information is accessible and easy to understand."
      },
      {
        role: "user",
        content: inputText
      }
    ],
    model: "gpt-4o-mini",
    temperature: 1,
    max_tokens: 4096,
    top_p: 1
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate response');
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "No response from server";

  } catch (error) {
    console.error("Error generating content from server:", error);
    throw new Error(`Error generating content: ${error.message}`);
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
    .replace(/\*{1,3}(.*?)\*{1,3}/g, '$1')
    .replace(/_{1,3}(.*?)_{1,3}/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[.*?\]\(.*?\)/g, '')
    .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/&[^;\s]+;/g, '')
    .replace(/^>\s+/gm, '')
    .replace(/^---$/gm, '')
    .replace(/^\s*([-*+]|\d+\.)\s+/gm, '')
    .replace(/\|.*?\|/g, '')
    .replace(/\s\s+/g, ' ')
    .trim();
}

// Chat functionality
document.addEventListener('DOMContentLoaded', () => {
  const chatBody = document.getElementById('chat-body');
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.querySelector('.chat-footer button');
  const chatContainer = document.querySelector('.chat-container');
  const quickReplyButtons = document.querySelectorAll('.quick-reply-btn');

  // Helper function to display the AI response in real-time (typing effect)
  function typeMessage(targetElement, message, typingSpeed = 50) {
    let index = 0;
    let accumulatedText = '';

    function typeNextChunk() {
      const nextSpace = message.indexOf(' ', index + 1);
      const nextChunk = nextSpace === -1 ? message.length : nextSpace;
      accumulatedText = message.slice(0, nextChunk + 1);

      targetElement.innerHTML = marked?.parse(accumulatedText) || accumulatedText;

      index = nextChunk + 1;
      if (index < message.length) {
        setTimeout(typeNextChunk, typingSpeed);
      }
    }
    typeNextChunk();
  }

  function calculateTypingDelay(messageLength) {
    if (messageLength <= 30) {
      return 35;
    } else if (messageLength <= 100) {
      return 25;
    } else if (messageLength <= 300) {
      return 15;
    } else if (messageLength <= 600) {
      return 10;
    } else {
      return 5;
    }

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
        likeBtn.style.color = 'blue';
        likeBtn.disabled = true;
      });

      // Dislike button functionality
      buttonsDiv.querySelector('.dislike-btn').addEventListener('click', () => {
        const dislikeBtn = buttonsDiv.querySelector('.dislike-btn');
        dislikeBtn.style.color = 'red';
        dislikeBtn.disabled = true;
        openReportModal(content);
      });
    }

    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;

    if (role === 'ai') {
      typeMessage(bubbleDiv, content, calculateTypingDelay(content.length));
    } else {
      bubbleDiv.textContent = content;
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
    // Input validation
    if (!inputText?.trim()) {
      throw new Error('Input text is required');
    }

    try {
      // Display user message
      appendMessage(inputText, 'user');

      // Hide chat container
      hideChatContainer();

      const API_KEY = process.env.API_KEY;
      const API_URL = "https://models.inference.ai.azure.com/chat/completions";

      // Prepare the request payload
      const payload = {
        messages: [
          {
            role: "system",
            content: "As a renowned Indian lawyer with over a decade of experience in legal practice, you are here to provide expert legal advice in accordance with Indian laws and jurisdiction. Feel free to seek guidance on any legal matters you may have."
          },
          {
            role: "assistant",
            content: "I'm here to provide information and guidance specifically on legal matters based on Indian laws and jurisdiction. Please feel free to ask about any specific legal queries you may have, whether they're related to personal matters, business law, property disputes, criminal law, family law, or any other area of interest. I'll do my best to help!"
          },
          {
            role: "user",
            content: "Give me the replies that are human understandable and like a professional legal expet."
          },
          {
            role: "assistant",
            content: "Absolutely! I'll provide clear, concise, and professional responses to your legal inquiries. Please go ahead and ask your questions, and I will ensure the information is accessible and easy to understand."
          },
          {
            role: "user",
            content: inputText
          }
        ],
        model: "gpt-4o-mini",
        temperature: 1,
        max_tokens: 4096,
        top_p: 1
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Check if we have a valid response structure
      if (!data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid response structure from API');
      }

      const cleanedResponse = data.choices[0].message.content;

      // Display AI response
      appendMessage(cleanedResponse, 'ai');

      return cleanedResponse;

    } catch (error) {
      console.error('Error in sendMessage:', error);
      appendMessage('Error: Unable to fetch response. Please try again later.', 'ai');
      throw error;
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
