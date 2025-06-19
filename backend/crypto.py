from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
import base64
import hashlib

BLOCK_SIZE = 16  # AES block size

def get_key(key_str: str) -> bytes:
    """Hash the input key string to get a fixed-size AES key (256-bit)."""
    return hashlib.sha256(key_str.encode()).digest()

def encrypt_message(data: bytes, key_str: str) -> bytes:
    key = get_key(key_str)
    cipher = AES.new(key, AES.MODE_CBC)
    ct_bytes = cipher.encrypt(pad(data, BLOCK_SIZE))
    return base64.b64encode(bytes(cipher.iv) + ct_bytes)

def decrypt_message(encrypted_data: bytes, key_str: str) -> bytes:
    key = get_key(key_str)
    data = base64.b64decode(encrypted_data)
    iv = data[:BLOCK_SIZE]
    ct = data[BLOCK_SIZE:]
    cipher = AES.new(key, AES.MODE_CBC, iv)
    pt = unpad(cipher.decrypt(ct), BLOCK_SIZE)
    return pt
