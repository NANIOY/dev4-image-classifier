const webcamElement = document.getElementById('webcam');
const canvasElement = document.getElementById('canvas');
const snapSoundElement = document.getElementById('snapSound');
const captureButton = document.querySelector('.captureButton');
const resultElement = document.querySelector('.result');
const webcam = new Webcam(webcamElement, 'user', canvasElement, snapSoundElement);
let classifier;


// capture photo
function capturePhoto() {
  const picture = webcam.snap();
  classifyImage(picture);
}

// classify image
function classifyImage(imageData) {
  classifier.classify(imageData, (err, results) => {
    if (err) {
      console.error(err);
      return;
    }
    // Display the classification results
    resultElement.innerHTML = "";
    for (result of results) {
      if (result.confidence >= 0.1) {
        resultElement.innerHTML += `<h2>${result.label}</h2>`;
      }
    }
  });
}

// setup
function setup() {
  classifier = ml5.imageClassifier('MobileNet', modelLoaded);
}

// model load
function modelLoaded() {
  console.log('Model Loaded!');
  document.querySelector(".header__model--status").innerHTML = "Model loaded. You can now capture a picture.";
  captureButton.removeAttribute('disabled');
}

captureButton.addEventListener('click', capturePhoto);

// start webcam
webcam.start()
  .then(result => {
    console.log("Webcam started:", result);
    setup();
  })
  .catch(err => console.error("Webcam start error:", err));