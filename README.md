# Juris AI: Voice Interactive Legal Assistant

Juris AI is an innovative voice-interactive chatbot designed to provide expert legal advice based on Indian laws and jurisdiction. This project demonstrates the integration of speech recognition, natural language processing, and text-to-speech technologies to create an accessible and user-friendly legal assistance tool.

## Features

- **Voice Interaction**: Users can speak their legal queries directly to the chatbot.
- **Speech Recognition**: Utilizes the Web Speech API to convert user speech to text.
- **AI-Powered Responses**: Integrates with the Gemini API to generate informed legal responses.
- **Text-to-Speech**: Converts the AI-generated responses back into speech for a seamless interaction.
- **Intuitive UI**: Simple interface with start, pause, and cancel controls.

## Demo

[![NyayaBot Demo](https://img.youtube.com/vi/lkPTB3MxUCk/0.jpg)](https://youtu.be/lkPTB3MxUCk?si=CahQFJofHDGo9g7x)

## Screenshots

![NyayaBot Interface](https://github.com/ShahbazCoder1/Juris-AI/raw/main/Images/screenshot_JurisAI.jpg)
*NyayaBot Main Interface*

![NyayaBot Conversation](https://github.com/ShahbazCoder1/Juris-AI/raw/main/Images/screenshot_JurisAI_Convers.jpg)
*NyayaBot Conversation Example*

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Web Speech API
- Gemini API

## Workflow
![ ](https://github.com/ShahbazCoder1/Juris-AI/blob/main/Images/workflow.png)

## Setup and Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/Juris-AI.git
   ```

2. Navigate to the project directory:
   ```
   cd Juris-AI
   ```

3. Open `script.js` and replace the `API_KEY` variable with your Gemini API key:
   ```javascript
   const API_KEY = "YOUR_API_KEY_HERE";
   ```

4. Open `index.html` in a modern web browser that supports the Web Speech API (e.g., Chrome, Edge, Safari).

## Usage

1. Click the microphone icon to start recording your voice.
2. Speak your legal query clearly.
3. Wait for the AI to process your query and generate a response.
4. Listen to the spoken response or read it in the transcript area.
5. Use the play/pause button to control audio playback.
6. Click the cancel button to stop the current interaction and start a new one.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- Gemini API for powering the AI responses
- [Lottie](https://lottiefiles.com/) for the animated waveform
- Font Awesome for icons
