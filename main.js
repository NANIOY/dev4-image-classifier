let webcamElement = document.getElementById('webcam');
let captureButton = document.querySelector('.captureButton');
let switchCameraButton = document.getElementById('switchCameraButton');
let facingMode = 'user';
let webcam;
let classifier;

async function initializeWebcam(facingMode) {
  try {
    if (webcam) {
      await webcam.stop();
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
    classifier = await mobilenet.load();

    captureButton.classList.remove('disabled');
    captureButton.removeAttribute('disabled');
    captureButton.textContent = "Capture Photo";
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

  let canvas = document.createElement('canvas');
  let context = canvas.getContext('2d');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  try {
    let predictions = await classifier.classify(canvas);
    let highestConfidenceResult = predictions.reduce((prev, current) => {
      return (prev.probability > current.probability) ? prev : current;
    });

    let trimmedResult = highestConfidenceResult.className.split(',')[0].trim();

    let resultParagraph = document.createElement('p');
    resultParagraph.textContent = `Prediction: ${trimmedResult}, Probability: ${highestConfidenceResult.probability.toFixed(4)}`;

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
  }
}

captureButton.addEventListener('click', captureAndClassify);

switchCameraButton.addEventListener('click', async () => {
  facingMode = (facingMode === 'user') ? 'environment' : 'user';
  await initializeWebcam(facingMode);
});