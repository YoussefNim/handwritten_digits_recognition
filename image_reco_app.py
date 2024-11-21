from flask import Flask, jsonify, request
from flask_cors import CORS
from keras.models import load_model
import numpy as np
from PIL import Image

mymodel = load_model(r"C:\Users\Dell\Documents\DATA_ANALYSIS\PYTHON\PythonFiles\FLASK\flask_image_reco_app\mnist_recog_model.keras")

# another prblm to solve : images drawn on canvas are of 300x300 size, while model works best with 28x28
# Changing size won't distort how numbers look since it's just a smaller square.
# I don't think i need to implement padding... Padding is useful when image is too small.
def image_preprocessing(image_path:str):
    grayscale_image = Image.open(image_path).convert('L')
    image_resized = grayscale_image.resize((28,28))
    image_array = np.array(image_resized).reshape((1,28,28,1))
    # these are black on white. So invert the image to match the MNIST format (white on black background)
    image_array = 255 - image_array
    return image_array


myFlaskApp = Flask('img_reco_app')

CORS(myFlaskApp)

# if i want it to just show something on localhost like this, do not use any METHOD as argument
@myFlaskApp.route("/")
def start():
    return 'Hello World !'

@myFlaskApp.route("/get_prediction", methods=['POST'])
def predict_number():
    if request.method == 'POST':
        try:
            # note : request.form is used to extract form data as key-value pairs,
            # but for uploaded files, you need to use request.files.
            image_path = request.files['file']
            # flask can handle blobs because they're also sent in format "files:path"
            array_to_predict = image_preprocessing(image_path)
            predicted_probas = mymodel.predict(array_to_predict)
            predicted_label = int(np.argmax(predicted_probas))  
            response = jsonify({"prediction":predicted_label, "status":200})
            return response
        except Exception as e:
            return jsonify({f"error" : "error {e}"}) 

if __name__=="__main__":
    myFlaskApp.run(port = 5000, debug=True)


