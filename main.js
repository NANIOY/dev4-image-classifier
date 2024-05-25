let webcamElement = document.getElementById('webcam');
let captureButton = document.querySelector('.captureButton');
let switchCameraButton = document.getElementById('switchCameraButton');
let facingMode = 'user';
let webcam;
let model;

class Webcam {
  constructor(webcamElement, facingMode) {
    this.webcamElement = webcamElement;
    this.facingMode = facingMode;
    this.stream = null;
  }

  async start() {
    const constraints = {
      video: {
        facingMode: this.facingMode
      }
    };
    this.stream = await navigator.mediaDevices.getUserMedia(constraints);
    this.webcamElement.srcObject = this.stream;
    return new Promise((resolve) => {
      this.webcamElement.onloadedmetadata = () => {
        resolve();
      };
    });
  }

  async stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }
}

async function initializeWebcam(facingMode) {
  try {
    if (webcam) {
      await webcam.stop();
      webcamElement.remove();
      webcamElement = document.createElement('video');
      webcamElement.setAttribute('id', 'webcam');
      webcamElement.setAttribute('autoplay', 'true');
      webcamElement.setAttribute('playsinline', 'true');
      webcamElement.setAttribute('width', '640');
      webcamElement.setAttribute('height', '480');
      document.body.insertBefore(webcamElement, document.body.childNodes[2]);
    }
    webcam = new Webcam(webcamElement, facingMode);
    await webcam.start();
    console.log(`Webcam started with facing mode: ${facingMode}`);
  } catch (error) {
    console.error("Webcam start error:", error);
  }
}

async function setup() {
  try {
    model = await cocoSsd.load();
    captureButton.classList.remove('disabled');
    captureButton.removeAttribute('disabled');
    captureButton.textContent = "Capture Photo";
    console.log("Model loaded successfully");
  } catch (error) {
    console.error("Failed to load model:", error);
  }
}

captureButton.classList.add('disabled');
captureButton.textContent = "Model loading...";

initializeWebcam(facingMode).then(setup);

async function captureAndClassify() {
  let video = webcamElement;
  if (!video.srcObject) {
    console.error("No video stream available.");
    return;
  }

  await new Promise((resolve) => setTimeout(resolve, 500));

  let canvas = document.createElement('canvas');
  let context = canvas.getContext('2d');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  try {
    let predictions = await model.detect(canvas);

    if (predictions.length === 0) {
      alert("No objects detected.");
      return;
    }

    let highestConfidenceResult = predictions.reduce((prev, current) => {
      return (prev.score > current.score) ? prev : current;
    });

    let trimmedResult = highestConfidenceResult.class;

    let resultParagraph = document.createElement('p');
    resultParagraph.textContent = `Prediction: ${trimmedResult}, Probability: ${highestConfidenceResult.score.toFixed(4)}`;

    let imgElement = new Image();
    imgElement.src = canvas.toDataURL('image/jpeg');

    let cardDiv = document.createElement('div');
    cardDiv.classList.add('card');

    let imageContainer = document.createElement('div');
    imageContainer.classList.add('image-container');
    imageContainer.appendChild(imgElement);

    let resultContainer = document.createElement('div');
    resultContainer.classList.add('result-container');
    resultContainer.appendChild(resultParagraph);

    cardDiv.appendChild(imageContainer);
    cardDiv.appendChild(resultContainer);

    let capturedImageContainer = document.getElementById('capturedImage');
    capturedImageContainer.appendChild(cardDiv);

  } catch (error) {
    console.error("Error processing image:", error);
    alert("Error processing image: " + error.message);
  }
}

captureButton.addEventListener('click', captureAndClassify);

switchCameraButton.addEventListener('click', async () => {
  facingMode = (facingMode === 'user') ? 'environment' : 'user';
  await initializeWebcam(facingMode);
});