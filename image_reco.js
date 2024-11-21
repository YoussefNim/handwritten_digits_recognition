const drawButton = document.getElementById("drawButton");
const fileButton = document.getElementById("fileButton");
const drawingSection = document.getElementById("drawingSection");
const fileUploadSection = document.getElementById("fileUploadSection");

const fileInput = document.getElementById('ChosenFile');
const imageDiv = document.getElementById('displayImage');
const predictionDiv = document.getElementById("predictionResult");


const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");
const clearButton = document.getElementById("clearCanvas");
const submitButton = document.getElementById("submitCanvas");

// Function to switch to the drawing section
function showDrawing() {
    drawButton.classList.add("active");
    fileButton.classList.remove("active");

    drawingSection.classList.remove("hidden");
    fileUploadSection.classList.add("hidden");

    // Clear file input display if switching back to drawing
    ChosenFile.value = "";
    imageDiv.innerHTML = "";
    predictionDiv.textContent = "";
}


// Function to switch to the file upload section
function showFileUpload() {
    fileButton.classList.add("active");
    drawButton.classList.remove("active");

    fileUploadSection.classList.remove("hidden");
    drawingSection.classList.add("hidden");
    // clear prediction
    predictionDiv.textContent = "";
}

// Event listeners for toggle buttons
drawButton.addEventListener("click", showDrawing);
fileButton.addEventListener("click", showFileUpload);

// Set up canvas for drawing
// previous problem I had : canvas files had transparent background, not like normal images, model didn't predict well
let drawing = false;
let lastX = 0;
let lastY = 0;

// Fill the canvas with a white background before drawing !!!!!!!!!!!!!!!!
ctx.fillStyle = "white";  // Set background color
ctx.fillRect(0, 0, canvas.width, canvas.height);  // Fill canvas with white color

// Set up canvas for drawing
canvas.addEventListener("mousedown", (event) => {
    drawing = true;
    const rect = canvas.getBoundingClientRect();
    lastX = event.clientX - rect.left;
    lastY = event.clientY - rect.top;
});

canvas.addEventListener("mouseup", () => (drawing = false));

canvas.addEventListener("mousemove", (event) => {
    if (!drawing) return;
    const rect = canvas.getBoundingClientRect();
    const currentX = event.clientX - rect.left;
    const currentY = event.clientY - rect.top;

    // Draw a line from the last position to the current position
    ctx.strokeStyle = "black";
    ctx.lineWidth = 5;
    ctx.lineCap = "round"; // Makes the line ends rounded
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();

    // Update the last position
    lastX = currentX;
    lastY = currentY;
});


// Clear the canvas
clearButton.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    predictionDiv.textContent = "Prediction: ";
});





submitButton.addEventListener("click", makePrediction);

//---------------------------end of drawing-----------------------------------


// this below is wrong, you can't add 2 callbacks to an eventlistener in same line, do it separately
//fileInput.addEventListener('change', (getSelectedFile, displayImage));
fileInput.addEventListener('change', makePrediction);
fileInput.addEventListener('change', displayImage);




async function makePrediction(event){
    // console.log("this is selectedFile = event.target.files[0]",selectedFile)
    // console.log("this is selectedFile = event.target.result",event.target.result)
    let blob
    const formData = new FormData();

    if (fileInput.files.length> 0){
    const selectedFile = event.target.files[0];
    formData.append('file', selectedFile)
    } 
    else {
    // blob is a temporary file that is created in RAM, never saved
    // we give it a name to simulate for Flask that it was created and saved on machine
    blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    // Preview the blob (optional, for debugging)
    // const previewImage = document.createElement("img");
    // previewImage.src = URL.createObjectURL(blob); // Create a temporary URL for the image Blob
    // imageDiv.innerHTML = ""; // Clear previous image
    // imageDiv.appendChild(previewImage); // Display the new image
    formData.append("file", blob, "drawing.png")
    }

// for ([key, value] of formData.entries()) {
    //     console.log([key, value]);}

    // send formdata to the flask app for rpediction
    const response = await fetch ('http://localhost:5000/get_prediction', 
        {method:"POST",
        body:formData
        });
    if (response.ok){
        result = await response.json();
        const prediction = result.prediction;
        predictionDiv.textContent = prediction
    } else{
       console.error('failed to fetch prediction') ;
    };
};

function displayImage(event){
    const selectedFile = event.target.files[0]
    const reader = new FileReader();
    reader.onload = function(event){
        const imageToDisplay= event.target.result;
        imageDiv.innerHTML = `<img src="${imageToDisplay}" alt="File Image">`    
    }
    reader.readAsDataURL(selectedFile)
};