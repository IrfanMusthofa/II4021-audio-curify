"use client";

import type React from "react";
import axios from "axios";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Upload,
    FileAudio,
    File as FileIcon,
    Key,
    ArrowLeft,
    Check,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useCallback } from "react";
import { Variants } from "framer-motion";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2,
        },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 30,
        },
    },
};

interface FileUploadProps {
    title: string;
    description: string;
    accept: string;
    icon: React.ElementType;
    file: File | null;
    onFileSelect: (file: File | null) => void;
    gradient: string;
}

function FileUpload({
    title,
    description,
    accept,
    icon: Icon,
    file,
    onFileSelect,
    gradient,
}: FileUploadProps) {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);
            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) {
                onFileSelect(files[0]);
            }
        },
        [onFileSelect]
    );

    const handleFileSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (files && files.length > 0) {
                onFileSelect(files[0]);
            }
        },
        [onFileSelect]
    );

    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            <Card className="relative bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-500 overflow-hidden">
                <div
                    className={`absolute inset-0 bg-gradient-to-br ${gradient} transition-all duration-500`}
                />

                <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-3 text-white">
                        <motion.div
                            className="p-2 rounded-lg bg-white/10 backdrop-blur-sm"
                            whileHover={{ rotate: 16 }}
                            transition={{ duration: 0 }}
                        >
                            <Icon className="h-5 w-5" />
                        </motion.div>
                        {title}
                    </CardTitle>
                </CardHeader>

                <CardContent className="relative space-y-4">
                    <div
                        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer group ${
                            isDragOver
                                ? "border-emerald-400/50 bg-emerald-500/10"
                                : file
                                ? "border-green-400/50 bg-green-500/10"
                                : "border-gray-600/50 hover:border-gray-500/50 hover:bg-gray-800/30"
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() =>
                            document.getElementById(`file-${title}`)?.click()
                        }
                    >
                        <input
                            id={`file-${title}`}
                            type="file"
                            accept={accept}
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        <motion.div
                            animate={{
                                scale: isDragOver ? 1.1 : 1,
                                rotate: isDragOver ? 5 : 0,
                            }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="space-y-4"
                        >
                            {file ? (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="flex items-center justify-center"
                                >
                                    <Check className="h-12 w-12 text-green-400" />
                                </motion.div>
                            ) : (
                                <Upload
                                    className={`h-12 w-12 mx-auto transition-colors ${
                                        isDragOver
                                            ? "text-emerald-400"
                                            : "text-gray-400 group-hover:text-gray-300"
                                    }`}
                                />
                            )}

                            <div>
                                <p
                                    className={`font-medium truncate transition-colors ${
                                        file ? "text-green-400" : "text-white"
                                    }`}
                                >
                                    {file
                                        ? file.name
                                        : `Drop your ${title.toLowerCase()} here`}
                                </p>
                                <p className="text-sm text-gray-400 mt-1">
                                    {file
                                        ? `${(file.size / 1024 / 1024).toFixed(
                                              2
                                          )} MB`
                                        : description}
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {file && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                        >
                            <span className="text-sm text-gray-300 truncate">
                                {file.name}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onFileSelect(null);
                                }}
                                className="text-gray-400 hover:text-white h-8 w-8 p-0"
                            >
                                ×
                            </Button>
                        </motion.div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default function EmbedPage() {
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [dataFile, setDataFile] = useState<File | null>(null);
    const [encryptionKey, setEncryptionKey] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const handleEmbed = async () => {
        if (!audioFile || !dataFile || !encryptionKey) {
            return;
        }

        setIsProcessing(true);

        try {
            // Step 1: Kirim ke /embed/audio
            const formData = new FormData();
            formData.append("file", dataFile);
            formData.append("audio", audioFile);
            formData.append("key", encryptionKey);

            const audioRes = await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/embed/audio`,
                formData,
                {
                    responseType: "blob",
                }
            );

            const embeddedAudio = new File(
                [audioRes.data],
                `embedded_${audioFile.name}`,
                {
                    type: "audio/wav",
                }
            );

            // Step 2: Kirim ke /embed/qr
            const qrForm = new FormData();
            qrForm.append("audio", embeddedAudio);

            const qrRes = await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/embed/qr`,
                qrForm,
                {
                    responseType: "blob",
                }
            );
            const baseName = audioFile.name.replace(/\.wav$/i, "");
            const qrImage = new File([qrRes.data], `qr_${baseName}.png`, {
                type: "image/png",
            });

            // Step 3: Unduh otomatis
            const download = (blob: Blob, filename: string) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            };

            download(embeddedAudio, embeddedAudio.name);
            download(qrImage, qrImage.name);
        } catch (err) {
            console.error("Embedding failed:", err);
        } finally {
            setIsProcessing(false);
        }
    };

    const canEmbed = audioFile && dataFile && encryptionKey.length > 0;

    return (
        <main className="relative min-h-screen bg-black text-white overflow-hidden">
            {/* Gradient background */}

            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-black to-slate-950" />
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-blue-500/10" />
            <div className="absolute inset-0 bg-gradient-to-bl from-purple-500/5 via-transparent to-pink-500/10" />
            <motion.div
                animate={{
                    background: [
                        "radial-gradient(ellipse at 20% 50%, rgba(16, 185, 129, 0.25) 0%, transparent 100%)",
                        "radial-gradient(ellipse at 80% 20%, rgba(59, 130, 246, 0.25) 0%, transparent 100%)",
                        "radial-gradient(ellipse at 40% 80%, rgba(168, 85, 247, 0.25) 0%, transparent 100%)",
                    ],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    repeatType: "reverse",
                }}
                className="absolute inset-0"
            />

            <div className="relative z-10 min-h-screen p-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex items-center gap-4 mb-8"
                    >
                        <Link href="/">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-400 hover:text-white hover:bg-white/10"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                        className="space-y-8"
                    >
                        {/* Page Title */}
                        <motion.div
                            variants={itemVariants}
                            className="text-center space-y-4"
                        >
                            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Embed Files
                            </h1>
                            <p className="text-xl text-white max-w-2xl mx-auto">
                                Securely hide any file inside a WAV audio file
                                with AES encryption
                            </p>
                            <motion.div
                                className="h-1 w-16 mx-auto bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: 196 }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                            />
                        </motion.div>

                        {/* File Upload Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FileUpload
                                title="WAV Audio File"
                                description="Select the audio file to embed data into"
                                accept=".wav,audio/wav"
                                icon={FileAudio}
                                file={audioFile}
                                onFileSelect={setAudioFile}
                                gradient="from-emerald-500/20 to-teal-500/20"
                            />

                            <FileUpload
                                title="Data File"
                                description="Select any file to hide inside the audio"
                                accept="*/*"
                                icon={FileIcon}
                                file={dataFile}
                                onFileSelect={setDataFile}
                                gradient="from-blue-500/20 to-cyan-500/20"
                            />
                        </div>

                        {/* Encryption Key */}
                        <motion.div variants={itemVariants}>
                            <Card className="relative bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-500 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 transition-all duration-500" />

                                <CardHeader className="relative">
                                    <CardTitle className="flex items-center gap-3 text-white">
                                        <motion.div
                                            className="p-2 rounded-lg bg-white/10 backdrop-blur-sm"
                                            whileHover={{ rotate: 16 }}
                                            transition={{ duration: 0 }}
                                        >
                                            <Key className="h-5 w-5" />
                                        </motion.div>
                                        Encryption Key
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="relative space-y-4">
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="encryption-key"
                                            className="text-gray-300"
                                        >
                                            Enter a secure password for
                                            encryption
                                        </Label>
                                        <Input
                                            id="encryption-key"
                                            type="password"
                                            placeholder="Enter encryption key..."
                                            value={encryptionKey}
                                            onChange={(e) =>
                                                setEncryptionKey(e.target.value)
                                            }
                                            className="bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-500 focus:border-purple-400/50 focus:ring-purple-400/20"
                                        />
                                    </div>
                                    <p className="text-sm text-gray-400">
                                        This key will be required to extract the
                                        embedded file. Don't worry, we will hash
                                        it first using SHA-256. Keep it safe!
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Embed Button */}
                        <motion.div
                            variants={itemVariants}
                            className="flex justify-center flex-col items-center pt-4"
                        >
                            <motion.div
                                whileHover={{ scale: canEmbed ? 1.05 : 1 }}
                                whileTap={{ scale: canEmbed ? 0.95 : 1 }}
                            >
                                <Button
                                    onClick={handleEmbed}
                                    disabled={!canEmbed || isProcessing}
                                    className={`px-8 py-3 text-lg font-semibold transition-all duration-300 ${
                                        canEmbed
                                            ? "bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white shadow-lg hover:shadow-emerald-500/25"
                                            : "bg-gray-700 text-gray-400 cursor-not-allowed"
                                    }`}
                                >
                                    {isProcessing ? (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{
                                                duration: 1,
                                                repeat: Number.POSITIVE_INFINITY,
                                                ease: "linear",
                                            }}
                                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"
                                        />
                                    ) : null}
                                    {isProcessing
                                        ? "Processing..."
                                        : "Embed File"}
                                </Button>
                            </motion.div>
                            <div className="mt-4 text-white justify-center text-sm">
                                <h1 className="font-semibold justify-center items-center">
                                    If it's too long, just wait a bit (up to 1
                                    minute) for the embedding to finish.
                                    <br />
                                    If the loading has stopped, refresh and try
                                    again. Sorry for the inconvenience due to
                                    the free weak server :'(
                                </h1>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
