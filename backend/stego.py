import wave
import numpy as np
import base64
from io import BytesIO

# ===== *** Embed data into audio stream (BytesIO) *** =====
def embed_in_audio_bytesio(audio_stream: BytesIO, data: bytes, output_stream: BytesIO):
    message = base64.b64encode(data).decode() + "###"  # end marker
    bin_message = ''.join(format(ord(char), '08b') for char in message)

    with wave.open(audio_stream, 'rb') as audio:
        params = audio.getparams()
        frames = np.frombuffer(audio.readframes(audio.getnframes()), dtype=np.int16).copy()

    if len(bin_message) > len(frames):
        raise ValueError("Audio file is too short to hold the message.")

    for i in range(len(bin_message)):
        frames[i] = (frames[i] & ~1) | int(bin_message[i])

    with wave.open(output_stream, 'wb') as stego_audio:
        stego_audio.setparams(params)
        stego_audio.writeframes(frames.tobytes())

# ===== *** Extract data from audio stream (BytesIO) *** =====
def extract_from_audio_bytesio(audio_stream: BytesIO) -> bytes:
    with wave.open(audio_stream, 'rb') as audio:
        frames = np.frombuffer(audio.readframes(audio.getnframes()), dtype=np.int16).copy()

    bits = [str(frame & 1) for frame in frames]
    chars = []

    for i in range(0, len(bits), 8):
        byte = bits[i:i+8]
        char = chr(int(''.join(byte), 2))
        chars.append(char)
        if ''.join(chars[-3:]) == "###":
            break

    message = ''.join(chars[:-3])
    return base64.b64decode(message)

# ===== *** Get max embedding capacity from audio stream (BytesIO) *** =====
def get_max_capacity_from_bytesio(audio_stream: BytesIO) -> int:
    with wave.open(audio_stream, 'rb') as audio:
        frames = audio.readframes(audio.getnframes())
    samples = len(frames) // 2  # 2 bytes per 16-bit sample
    return samples // 8         # 8 bits per byte of payload
