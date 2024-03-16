const webcamElement = document.getElementById('webcam');
const canvasElement = document.getElementById('canvas');
const snapSoundElement = document.getElementById('snapSound');
const captureButton = document.querySelector('.captureButton');
const webcam = new Webcam(webcamElement, 'user', canvasElement, snapSoundElement);
let classifier;

// setup
async function setup() {
  try {
    // load the model
    classifier = await ml5.imageClassifier('MobileNet');

    // enable capture button
    captureButton.classList.remove('disabled');
    captureButton.textContent = "Capture Photo";
  } catch (error) {
    console.error("Failed to load model:", error);
  }
}

captureButton.classList.add('disabled');
captureButton.textContent = "Model loading...";

// start webcam
webcam.start()
  .then(result => {
    console.log("Webcam started:", result);
    setup();
  })
  .catch(err => console.error("Webcam start error:", err));

// capture photo and classify
async function captureAndClassify() {
  // check if video stream is available
  const video = webcamElement;
  if (!video.srcObject) {
    console.error("No video stream available.");
    return;
  }

  // capture picture
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.scale(-1, 1); // flip horizontally
  context.drawImage(video, 0, 0, canvas.width * -1, canvas.height);

  try {
    // convert to blob
    canvas.toBlob(async function (blob) {
      if (!blob) {
        console.error("Failed to capture image as blob.");
        return;
      }

      // create image element
      const imageURL = URL.createObjectURL(blob);
      const imgElement = document.createElement('img');
      imgElement.src = imageURL;

      // create card
      const cardDiv = document.createElement('div');
      cardDiv.classList.add('card');

      // create image container and add image
      const imageContainer = document.createElement('div');
      imageContainer.classList.add('image-container');
      imageContainer.appendChild(imgElement);

      // create container for classification result
      const resultContainer = document.createElement('div');
      resultContainer.classList.add('result-container');

      // display only the highest confidence result
      const results = await classifier.classify(canvas);
      const highestConfidenceResult = results.reduce((prev, current) => {
        return (prev.confidence > current.confidence) ? prev : current;
      });
      const resultParagraph = document.createElement('p');
      resultParagraph.textContent = highestConfidenceResult.label;
      resultContainer.appendChild(resultParagraph);

      cardDiv.appendChild(imageContainer);
      cardDiv.appendChild(resultContainer);

      // append card to captured image container
      const capturedImageContainer = document.getElementById('capturedImage');
      capturedImageContainer.appendChild(cardDiv);
    }, 'image/jpeg');
  } catch (error) {
    console.error("Error processing image:", error);
  }
}

captureButton.addEventListener('click', captureAndClassify);