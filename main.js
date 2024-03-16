const webcamElement = document.getElementById('webcam');
const canvasElement = document.getElementById('canvas');
const snapSoundElement = document.getElementById('snapSound');
const captureButton = document.querySelector('.captureButton');
const resultElement = document.querySelector('.result');
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

      // create container for classification results
      const resultContainer = document.createElement('div');
      resultContainer.classList.add('result-container');

      // display results
      const results = await classifier.classify(canvas);
      console.log('Classification Results:', results);
      results
        .filter(result => result.confidence >= 0.1)
        .forEach(result => {
          const resultParagraph = document.createElement('p');
          resultParagraph.textContent = result.label;
          resultContainer.appendChild(resultParagraph);
        });

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

// display results
function displayResults(results) {
  resultElement.innerHTML = results
    .filter(result => result.confidence >= 0.1)
    .map(result => `<p>${result.label}</p>`)
    .join('');
}

captureButton.addEventListener('click', captureAndClassify);