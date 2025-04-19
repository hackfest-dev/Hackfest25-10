import os
import json
import sys
import cv2
import numpy as np
import tensorflow as tf
from PIL import Image
from ultralytics import YOLO

# Suppress TensorFlow warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

# Detect device
physical_devices = tf.config.list_physical_devices('GPU')
device_name = "/GPU:0" if physical_devices else "/CPU:0"

# Load FaceNet model
model_path = os.path.join(os.path.dirname(__file__), "20180402-114759.pb")

with tf.io.gfile.GFile(model_path, "rb") as f:
    graph_def = tf.compat.v1.GraphDef()
    graph_def.ParseFromString(f.read())

with tf.Graph().as_default() as graph:
    tf.import_graph_def(graph_def, name="")
    input_tensor = graph.get_tensor_by_name('input:0')
    output_tensor = graph.get_tensor_by_name('embeddings:0')
    phase_train = graph.get_tensor_by_name('phase_train:0')

    with tf.device(device_name):
        sess = tf.compat.v1.Session(graph=graph)

# YOLO11 face detector
yolo_model = YOLO('yolo11m.pt')

def detect_and_crop_face(image_path):
    results = yolo_model(image_path, verbose=False)
    image = cv2.imread(image_path)

    if len(results[0].boxes) == 0:
        raise Exception(f"No face detected in {image_path}")

    box = results[0].boxes[0]
    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy().astype(int)
    face_crop = image[y1:y2, x1:x2]
    face_crop = cv2.resize(face_crop, (160, 160))
    return face_crop

def save_face_image(image, filename):
    cv2.imwrite(filename, image)

def generate_embedding(image_path):
    image = Image.open(image_path).convert('RGB').resize((160, 160))
    image = np.array(image).astype('float32') / 255.0
    image = np.expand_dims(image, axis=0)
    embedding = sess.run(output_tensor, feed_dict={
        input_tensor: image,
        phase_train: False
    })[0]
    return embedding / np.linalg.norm(embedding)

def compare_faces(selfie_path, aadhaar_path, threshold=0.8):
    emb1 = generate_embedding(selfie_path)
    emb2 = generate_embedding(aadhaar_path)
    dist = np.linalg.norm(emb1 - emb2)
    return dist < threshold

def run_kyc_check(selfie_img_path, aadhaar_img_path):
    selfie_face = detect_and_crop_face(selfie_img_path)
    aadhaar_face = detect_and_crop_face(aadhaar_img_path)

    selfie_cropped = "public/temp/selfie_cropped.jpg"
    aadhaar_cropped = "public/temp/aadhaar_cropped.jpg"

    save_face_image(selfie_face, selfie_cropped)
    save_face_image(aadhaar_face, aadhaar_cropped)

    is_match = compare_faces(selfie_cropped, aadhaar_cropped)

    result = {"status": "MATCH" if is_match else "NO_MATCH"}

    # Output result as JSON to stdout
    print(json.dumps(result))

if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(1)

    selfie_path = sys.argv[1]
    aadhaar_path = sys.argv[2]

    try:
        run_kyc_check(selfie_path, aadhaar_path)
    except Exception as e:
        sys.exit(1)
