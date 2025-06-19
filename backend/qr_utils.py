import hashlib
import qrcode
import qrcode.image.pil
from PIL import Image
import cv2
import numpy as np

def hash_audio_file(file_path: str) -> str:
    with open(file_path, "rb") as f:
        file_data = f.read()
    return hashlib.sha256(file_data).hexdigest()

def generate_qr_from_hash(audio_path: str, output_path: str):
    hash_val = hash_audio_file(audio_path)

    factory = qrcode.image.pil.PilImage
    qr = qrcode.make(hash_val, image_factory=factory)
    qr.save(output_path) 

def verify_audio_hash(audio_path: str, qr_path: str) -> bool:
    audio_hash = hash_audio_file(audio_path)
    qr = Image.open(qr_path).convert("RGB")

    qr_img = np.array(qr)
    detector = cv2.QRCodeDetector()
    val, _, _ = detector.detectAndDecode(qr_img)

    return audio_hash == val
