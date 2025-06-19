"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { ArrowDownCircle, UploadCloud } from "lucide-react";

export default function EmbedPage() {
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [targetFile, setTargetFile] = useState<File | null>(null);
    const [key, setKey] = useState("");
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleEmbed = async () => {
        if (!audioFile || !targetFile || !key) {
            setError("All fields are required.");
            return;
        }

        const formData = new FormData();
        formData.append("audio", audioFile);
        formData.append("file", targetFile);
        formData.append("key", key);

        try {
            setLoading(true);
            setError(null);
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/embed`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
            setResult(res.data);
        } catch (err: any) {
            setError(err?.response?.data?.error || "Embedding failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-zinc-900 text-white p-8 flex flex-col items-center justify-center gap-12">
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl font-bold"
            >
                Embed a File into Audio
            </motion.h1>

            <div className="w-full max-w-xl space-y-6">
                <div>
                    <Label className="text-lg">WAV Audio File</Label>
                    <Input
                        type="file"
                        accept="audio/wav"
                        onChange={(e) =>
                            setAudioFile(e.target.files?.[0] || null)
                        }
                    />
                </div>

                <div>
                    <Label className="text-lg">File to Hide</Label>
                    <Input
                        type="file"
                        onChange={(e) =>
                            setTargetFile(e.target.files?.[0] || null)
                        }
                    />
                </div>

                <div>
                    <Label className="text-lg">AES Key</Label>
                    <Input
                        type="text"
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                    />
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <Button
                    onClick={handleEmbed}
                    disabled={loading}
                    className="w-full mt-4"
                >
                    {loading ? (
                        "Embedding..."
                    ) : (
                        <>
                            <UploadCloud className="w-4 h-4 mr-2" /> Embed
                        </>
                    )}
                </Button>

                {result && (
                    <div className="mt-6 space-y-4 p-4 rounded-lg bg-zinc-800 border border-zinc-700">
                        <p className="text-green-400 font-semibold">
                            ✅ Success!
                        </p>
                        <p>Used Bytes: {result.used_bytes}</p>
                        <p>Max Capacity: {result.max_bytes}</p>
                        <p>Remaining: {result.remaining}</p>
                        <div className="flex flex-col gap-2 mt-4">
                            <a
                                href={`${process.env.NEXT_PUBLIC_API_URL}/${result.audio_file}`}
                                target="_blank"
                                className="text-blue-400 hover:underline"
                                download
                            >
                                <ArrowDownCircle className="inline w-4 h-4 mr-1" />{" "}
                                Download Encoded Audio
                            </a>
                            <a
                                href={`${process.env.NEXT_PUBLIC_API_URL}/${result.qr_code}`}
                                target="_blank"
                                className="text-blue-400 hover:underline"
                                download
                            >
                                <ArrowDownCircle className="inline w-4 h-4 mr-1" />{" "}
                                Download QR Code
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
