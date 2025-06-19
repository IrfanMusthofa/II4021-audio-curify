from fastapi import FastAPI, UploadFile, Form, File, Body
from fastapi.responses import StreamingResponse
from crypto import encrypt, decrypt
from stego import embed_in_audio, extract_from_audio, get_max_capacity
from qr_utils import generate_qr_from_hash, verify_audio_hash
import shutil, os

app = FastAPI()

# ===== *** Embedding Enpoint *** =====
@app.post("/embed")
async def embed(
    file: UploadFile = File(...),
    key: str = Form(...),
    audio: UploadFile = File(...)
):
    original_name = file.filename
    content = await file.read()
    payload = f"{original_name}||".encode() + content

    encrypted = encrypt(payload, key)

    temp_audio = f"temp_{audio.filename}"
    with open(temp_audio, "wb") as f:
        shutil.copyfileobj(audio.file, f)

    max_bytes = get_max_capacity(temp_audio)

    try:
        output_audio = f"output/encoded_{audio.filename}"
        embed_in_audio(temp_audio, encrypted, output_audio)
    except ValueError as e:
        os.remove(temp_audio)
        return {"error": str(e)}

    qr_path = f"output/qr_{audio.filename}.png"
    generate_qr_from_hash(output_audio, qr_path)

    os.remove(temp_audio)

    return {
        "audio_file": output_audio,
        "qr_code": qr_path,
        "used_bytes": len(encrypted),
        "max_bytes": max_bytes,
        "remaining": max_bytes - len(encrypted)
    }


# ===== *** Verifying Enpoint *** =====
@app.post("/verify")
async def verify(
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

# ===== *** Extracting Enpoint *** =====
@app.post("/extract")
async def extract(
    key: str = Form(...),
    audio: UploadFile = File(...)
):
    temp_audio = f"decrypt_{audio.filename}"
    with open(temp_audio, "wb") as f:
        shutil.copyfileobj(audio.file, f)

    try:
        encrypted_data = extract_from_audio(temp_audio)
        decrypted = decrypt(encrypted_data, key)
    except ValueError as e:
        os.remove(temp_audio)
        return {"error": str(e)}

    os.remove(temp_audio)

    # Split: "filename.ext||<file content>"
    name, content = decrypted.split(b'||', 1)

    return StreamingResponse(
        iter([content]),
        media_type="application/octet-stream",
        headers={"Content-Disposition": f"attachment; filename={name.decode()}"}
    )

# ===== *** Capacity Max Checker Enpoint *** =====
@app.post("/capacity")
async def capacity(audio: UploadFile = File(...)):
    temp_audio = f"temp_{audio.filename}"
    with open(temp_audio, "wb") as f:
        shutil.copyfileobj(audio.file, f)

    max_bytes = get_max_capacity(temp_audio)
    os.remove(temp_audio)

    return {"max_bytes": max_bytes}

# ===== *** Cleanup Enpoint *** =====
@app.post("/cleanup")
async def cleanup(files: list[str] = Body(...)):
    deleted = []
    not_found = []

    for f in files:
        if os.path.exists(f):
            os.remove(f)
            deleted.append(f)
        else:
            not_found.append(f)

    return {
        "deleted": deleted,
        "not_found": not_found,
        "message": "Cleanup complete."
    }
