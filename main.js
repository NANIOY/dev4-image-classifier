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
    classifier = await ml5.imageClassifier('MobileNet');
    console.log('Model Loaded!');
    document.querySelector(".header__model--status").innerHTML = "Model loaded. You can now capture a picture.";
    captureButton.removeAttribute('disabled');
  } catch (error) {
    console.error("Failed to load model:", error);
  }
}

// start webcam
webcam.start()
  .then(result => {
    console.log("Webcam started:", result);
    setup();
  })
  .catch(err => console.error("Webcam start error:", err));

// capture photo and classify
async function captureAndClassify() {
  const video = webcamElement;

  if (!video.srcObject) {
    console.error("No video stream available.");
    return;
  }

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  context.scale(-1, 1); // flip horizontally
  context.drawImage(video, 0, 0, canvas.width * -1, canvas.height);

  try {
    canvas.toBlob(async function (blob) {
      if (!blob) {
        console.error("Failed to capture image as blob.");
        return;
      }

      console.log('Captured picture:', blob);

      const imageURL = URL.createObjectURL(blob);
      const imgElement = document.createElement('img');
      imgElement.src = imageURL;

      const cardDiv = document.createElement('div');
      cardDiv.classList.add('card');

      const imageContainer = document.createElement('div');
      imageContainer.classList.add('image-container');
      imageContainer.appendChild(imgElement);

      const resultContainer = document.createElement('div');
      resultContainer.classList.add('result-container');

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