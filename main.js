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
  
  if (picture) {
    const imageData = dataURItoBlob(picture);
    console.log('Image data:', imageData);
    classifyImage(imageData);
  } else {
    console.error("No input image provided.");
  }
}

// convert data URI to blob
function dataURItoBlob(dataURI) {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}

// classify image
function classifyImage(imageData) {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(imageData);
  
    video.onloadedmetadata = () => {
        classifier.classify(video, (err, results) => {
            if (err) {
                console.error(err);
                return;
            }
            resultElement.innerHTML = "";
            for (result of results) {
                if (result.confidence >= 0.1) {
                    resultElement.innerHTML += `<h2>${result.label}</h2>`;
                }
            }
        });
    };
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