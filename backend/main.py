from fastapi import FastAPI, UploadFile, Form, File
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from crypto import encrypt, decrypt
from stego import embed_in_audio_bytesio, extract_from_audio_bytesio, get_max_capacity_from_bytesio
from qr_utils import generate_qr_from_hash_image, verify_audio_hash_bytes
from io import BytesIO

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://https://audio-curify-web.up.railway.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

# ===== *** Endpoint to embed file into audio *** =====
@app.post("/embed/audio")
async def embed_audio(
    file: UploadFile = File(...),
    key: str = Form(...),
    audio: UploadFile = File(...)
):
    original_name = file.filename
    content = await file.read()
    audio_data = await audio.read()

    payload = f"{original_name}||".encode() + content
    encrypted = encrypt(payload, key)

    audio_stream = BytesIO(audio_data)
    output_stream = BytesIO()

    max_bytes = get_max_capacity_from_bytesio(audio_stream)
    audio_stream.seek(0)

    try:
        embed_in_audio_bytesio(audio_stream, encrypted, output_stream)
    except ValueError as e:
        return JSONResponse(content={"error": str(e)}, status_code=400)

    output_stream.seek(0)
    return StreamingResponse(
        output_stream,
        media_type="audio/wav",
        headers={"Content-Disposition": f"attachment; filename=embedded_{audio.filename}"}
    )

# ===== *** Endpoint to generate QR from audio *** =====
@app.post("/embed/qr")
async def embed_qr(audio: UploadFile = File(...)):
    audio_data = await audio.read()
    qr_bytesio = generate_qr_from_hash_image(audio_data)

    return StreamingResponse(
        qr_bytesio,
        media_type="image/png",
        headers={"Content-Disposition": f"attachment; filename=qr_{audio.filename}.png"}
    )

# ===== *** Verify audio against QR *** =====
@app.post("/verify")
async def verify(audio: UploadFile = File(...), qr: UploadFile = File(...)):
    audio_data = await audio.read()
    qr_data = await qr.read()
    is_valid = verify_audio_hash_bytes(audio_data, qr_data)
    return {"valid": is_valid}

# ===== *** Extract file from audio *** =====
@app.post("/extract")
async def extract(key: str = Form(...), audio: UploadFile = File(...)):
    audio_data = await audio.read()
    audio_stream = BytesIO(audio_data)

    try:
        encrypted_data = extract_from_audio_bytesio(audio_stream)
        decrypted = decrypt(encrypted_data, key)
    except ValueError as e:
        return JSONResponse(content={"error": str(e)}, status_code=400)

    name, content = decrypted.split(b'||', 1)
    return StreamingResponse(
        BytesIO(content),
        media_type="application/octet-stream",
        headers={"Content-Disposition": f"attachment; filename={name.decode()}"}
    )

# ===== *** Capacity Check *** =====
@app.post("/capacity")
async def capacity(audio: UploadFile = File(...)):
    audio_data = await audio.read()
    stream = BytesIO(audio_data)
    max_bytes = get_max_capacity_from_bytesio(stream)
    return {"max_bytes": max_bytes}
