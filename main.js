let webcamElement = document.getElementById('webcam');
let captureButton = document.querySelector('.captureButton');
let webcam = new Webcam(webcamElement, 'user');
let classifier;

async function setup() {
  try {
    // load mobilenet model
    classifier = await mobilenet.load();

    // enable capture button
    captureButton.classList.remove('disabled');
    captureButton.removeAttribute('disabled');
    captureButton.textContent = "Capture Photo";
  } catch (error) {
    console.error("Failed to load model:", error);
  }
}

captureButton.classList.add('disabled');
captureButton.textContent = "Model loading...";

webcam.start()
  .then(result => {
    console.log("Webcam started:", result);
    setup();
  })
  .catch(err => console.error("Webcam start error:", err));

// capture and classify image
async function captureAndClassify() {
  let video = webcamElement;
  if (!video.srcObject) {
    console.error("No video stream available.");
    return;
  }

  // capture image from webcam
  let canvas = document.createElement('canvas');
  let context = canvas.getContext('2d');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  try {
    // classify image using mobilenet model and get predictions
    let predictions = await classifier.classify(canvas);
    let highestConfidenceResult = predictions.reduce((prev, current) => {
      return (prev.probability > current.probability) ? prev : current;
    });

    // trim down result to remove extra information
    let trimmedResult = highestConfidenceResult.className.split(',')[0].trim();

    // create p element for displaying prediction result
    let resultParagraph = document.createElement('p');
    resultParagraph.textContent = `Prediction: ${trimmedResult}, Probability: ${highestConfidenceResult.probability.toFixed(4)}`;

    // create image element for captured image
    let imgElement = new Image();
    imgElement.src = canvas.toDataURL('image/jpeg');

    // create card element for captured image and result
    let cardDiv = document.createElement('div');
    cardDiv.classList.add('card');

    // create image container and result container
    let imageContainer = document.createElement('div');
    imageContainer.classList.add('image-container');
    imageContainer.appendChild(imgElement);

    // create result container
    let resultContainer = document.createElement('div');
    resultContainer.classList.add('result-container');
    resultContainer.appendChild(resultParagraph);

    // append image and result container to card
    cardDiv.appendChild(imageContainer);
    cardDiv.appendChild(resultContainer);

    // append card to captured image container
    let capturedImageContainer = document.getElementById('capturedImage');
    capturedImageContainer.appendChild(cardDiv);
  } catch (error) {
    console.error("Error processing image:", error);
  }
}

captureButton.addEventListener('click', captureAndClassify);