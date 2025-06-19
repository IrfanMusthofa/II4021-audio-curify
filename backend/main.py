from fastapi import FastAPI, UploadFile, Form, File
from fastapi.responses import StreamingResponse
from crypto import encrypt_message, decrypt_message
from stego import embed_in_audio, extract_from_audio
from qr_utils import generate_qr_from_hash, verify_audio_hash
import shutil, os

app = FastAPI()

@app.post("/embed-file")
async def embed_file(
    file: UploadFile = File(...),
    key: str = Form(...),
    audio: UploadFile = File(...)
):
    if file.size and file.size > 1_000_000:
        return {"error": "Ukuran file melebihi 1MB"}

    # Read and prepare payload
    original_name = file.filename
    content = await file.read()
    payload = f"{original_name}||".encode() + content

    # Encrypt and embed
    encrypted = encrypt_message(payload, key)

    # Save temp audio
    temp_audio = f"temp_{audio.filename}"
    with open(temp_audio, "wb") as f:
        shutil.copyfileobj(audio.file, f)

    output_audio = f"output/encoded_{audio.filename}"
    embed_in_audio(temp_audio, encrypted, output_audio)

    # Generate QR
    qr_path = f"output/qr_{audio.filename}.png"
    generate_qr_from_hash(output_audio, qr_path)

    os.remove(temp_audio)

    return {
        "audio_file": output_audio,
        "qr_code": qr_path
    }


@app.post("/verify")
async def verify_file(
    audio: UploadFile = File(...),
    qr: UploadFile = File(...)
):
    temp_audio = f"verify_{audio.filename}"
    temp_qr = f"verify_{qr.filename}"
    with open(temp_audio, "wb") as f1, open(temp_qr, "wb") as f2:
        shutil.copyfileobj(audio.file, f1)
        shutil.copyfileobj(qr.file, f2)

    is_valid = verify_audio_hash(temp_audio, temp_qr)

    os.remove(temp_audio)
    os.remove(temp_qr)

    return {"valid": is_valid}


@app.post("/extract-file")
async def extract_file(
    key: str = Form(...),
    audio: UploadFile = File(...)
):
    temp_audio = f"decrypt_{audio.filename}"
    with open(temp_audio, "wb") as f:
        shutil.copyfileobj(audio.file, f)

    encrypted_data = extract_from_audio(temp_audio)
    decrypted = decrypt_message(encrypted_data, key)

    os.remove(temp_audio)

    # Split: "filename.ext||<file content>"
    name, content = decrypted.split(b'||', 1)

    return StreamingResponse(
        iter([content]),
        media_type="application/octet-stream",
        headers={"Content-Disposition": f"attachment; filename={name.decode()}"}
    )
