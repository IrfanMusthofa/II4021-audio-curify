import hashlib
import qrcode
import qrcode.image.pil
from PIL import Image
import cv2
import numpy as np
from io import BytesIO

# ===== *** Generate SHA-256 hash from raw audio bytes *** =====
def hash_audio_bytes(audio_bytes: bytes) -> str:
    return hashlib.sha256(audio_bytes).hexdigest()

# ===== *** Generate QR code image (as BytesIO) from raw audio bytes *** =====
def generate_qr_from_hash_image(audio_bytes: bytes) -> BytesIO:
    hash_val = hash_audio_bytes(audio_bytes)

    factory = qrcode.image.pil.PilImage
    qr = qrcode.make(hash_val, image_factory=factory)

    output_stream = BytesIO()
    qr.save(output_stream, format="PNG")
    output_stream.seek(0)
    return output_stream

# ===== *** Verify audio hash against QR image bytes *** =====
def verify_audio_hash_bytes(audio_bytes: bytes, qr_bytes: bytes) -> bool:
    audio_hash = hash_audio_bytes(audio_bytes)

    qr_img = Image.open(BytesIO(qr_bytes)).convert("RGB")
    qr_array = np.array(qr_img)

    detector = cv2.QRCodeDetector()
    val, _, _ = detector.detectAndDecode(qr_array)

    return audio_hash == val
