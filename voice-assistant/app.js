const statusEl = document.getElementById("status");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const transcriptEl = document.getElementById("transcript");
const replyEl = document.getElementById("reply");
const voiceSelect = document.getElementById("voiceSelect");
const scriptedReply = document.getElementById("scriptedReply");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const supportsRecognition = Boolean(SpeechRecognition);
const supportsSpeech = "speechSynthesis" in window;

let voiceChoices = [];

let recognition = null;
let isListening = false;
let isSpeaking = false;
let shouldRestart = false;

const setStatus = (text) => {
  statusEl.textContent = text;
};

const populateVoices = () => {
  if (!supportsSpeech) {
    voiceSelect.innerHTML = "";
    const option = document.createElement("option");
    option.textContent = "Speech synthesis not supported";
    option.value = "";
    voiceSelect.appendChild(option);
    voiceSelect.disabled = true;
    return;
  }

  const voices = window.speechSynthesis.getVoices();
  voiceSelect.innerHTML = "";

  const filtered = voices.filter((voice) => voice.lang && voice.lang.toLowerCase().startsWith("en"));
  voiceChoices = filtered.length > 0 ? filtered : voices;

  voiceChoices.forEach((voice, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `${voice.name} (${voice.lang})`;
    voiceSelect.appendChild(option);
  });

  if (voiceChoices.length === 0) {
    const option = document.createElement("option");
    option.textContent = "No voices available";
    option.value = "";
    voiceSelect.appendChild(option);
    voiceSelect.disabled = true;
  } else {
    voiceSelect.disabled = false;
  }
};

const getSelectedVoice = () => {
  if (!supportsSpeech) return null;
  const index = Number(voiceSelect.value);
  return (
    voiceChoices[index] ||
    voiceChoices.find((voice) => voice.lang && voice.lang.toLowerCase().startsWith("en")) ||
    voiceChoices[0] ||
    null
  );
};

const speakReply = (text) => {
  replyEl.textContent = text;

  if (!supportsSpeech) {
    setStatus("Speech synthesis not supported");
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = getSelectedVoice();
  if (voice) {
    utterance.voice = voice;
  }

  isSpeaking = true;
  if (isListening && recognition) {
    recognition.stop();
  }

  utterance.onend = () => {
    isSpeaking = false;
    if (shouldRestart) {
      startRecognition();
    } else {
      setStatus("Idle");
    }
  };

  utterance.onerror = () => {
    isSpeaking = false;
    setStatus("Speech synthesis error");
  };

  window.speechSynthesis.speak(utterance);
};

const handleFinalTranscript = (text) => {
  if (!text) return;
  const replyText = scriptedReply.value.trim() || "Thanks for reaching out.";
  speakReply(replyText);
};

const startRecognition = () => {
  if (!supportsRecognition) {
    setStatus("SpeechRecognition not supported in this browser");
    return;
  }

  if (!recognition) {
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onstart = () => {
      isListening = true;
      setStatus("Listening...");
      startBtn.disabled = true;
      stopBtn.disabled = false;
    };

    recognition.onend = () => {
      isListening = false;
      if (!isSpeaking && shouldRestart) {
        recognition.start();
      } else if (!isSpeaking) {
        setStatus("Idle");
        startBtn.disabled = false;
        stopBtn.disabled = true;
      }
    };

    recognition.onerror = (event) => {
      setStatus(`Error: ${event.error}`);
      startBtn.disabled = false;
      stopBtn.disabled = true;
      shouldRestart = false;
    };

    recognition.onresult = (event) => {
      let interim = "";
      let finalText = "";

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        if (result.isFinal) {
          finalText += transcript;
        } else {
          interim += transcript;
        }
      }

      const combined = `${finalText}${interim ? ` ${interim}` : ""}`.trim();
      transcriptEl.textContent = combined || "Listening...";

      if (finalText.trim().length > 0) {
        handleFinalTranscript(finalText.trim());
      }
    };
  }

  shouldRestart = true;
  recognition.start();
};

const stopRecognition = () => {
  shouldRestart = false;
  if (recognition && isListening) {
    recognition.stop();
  }
  startBtn.disabled = false;
  stopBtn.disabled = true;
  setStatus("Idle");
};

startBtn.addEventListener("click", () => {
  startRecognition();
});

stopBtn.addEventListener("click", () => {
  stopRecognition();
});

if (!supportsRecognition) {
  setStatus("SpeechRecognition not supported in this browser");
  startBtn.disabled = true;
}

if (supportsSpeech) {
  populateVoices();
  window.speechSynthesis.onvoiceschanged = populateVoices;
}
