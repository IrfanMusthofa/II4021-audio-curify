// app/extract/page.tsx
"use client";

import axios from "axios";
import Link from "next/link";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, FileAudio, Key, Upload, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring" as const,
            stiffness: 120,
            damping: 20,
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
            <Card className="relative bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 hover:border-gray-600/50 overflow-hidden">
                <div
                    className={`absolute inset-0 bg-gradient-to-br ${gradient} transition-all duration-500`}
                />
                <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-3 text-white">
                        <motion.div
                            className="p-2 rounded-lg bg-white/10 backdrop-blur-sm"
                            whileHover={{ rotate: 16 }}
                        >
                            <Icon className="h-5 w-5" />
                        </motion.div>
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-4">
                    <div
                        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer group ${
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
                            className="space-y-4"
                        >
                            {file ? (
                                <Check className="h-12 w-12 text-green-400 mx-auto" />
                            ) : (
                                <Upload className="h-12 w-12 mx-auto text-gray-400" />
                            )}
                            <div>
                                <p
                                    className={`font-medium truncate ${
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

export default function ExtractPage() {
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [key, setKey] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const handleExtract = async () => {
        if (!audioFile || !key) return;

        setIsProcessing(true);
        const formData = new FormData();
        formData.append("key", key);
        formData.append("audio", audioFile);

        try {
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/extract`,
                formData,
                {
                    responseType: "blob",
                }
            );

            const contentDisposition = res.headers["content-disposition"];
            const match = contentDisposition?.match(/filename="?(.+?)"?$/);
            const filename = match ? match[1] : "extracted_file";

            const blob = new Blob([res.data]);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            alert("Extraction failed: Invalid key or corrupted file.");
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const canExtract = audioFile && key.length > 0;

    return (
        <main className="relative min-h-screen bg-black text-white overflow-hidden">
            {/* Background gradient layers */}
            <div className="absolute inset-0 -z-20 bg-gradient-to-br from-slate-950 via-black to-slate-950" />
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
                    {/* Back Button */}
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
                            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                                Extract File
                            </h1>
                            <p className="text-xl text-white max-w-2xl mx-auto">
                                Upload a steganographed WAV file and enter the
                                encryption key to extract the hidden data.
                            </p>
                            <motion.div
                                className="h-1 w-16 mx-auto bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: 196 }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                            />
                        </motion.div>

                        {/* Upload & Key Input */}
                        <FileUpload
                            title="Embedded WAV File"
                            description="Select the embedded audio file (.wav)"
                            accept=".wav,audio/wav"
                            icon={FileAudio}
                            file={audioFile}
                            onFileSelect={setAudioFile}
                            gradient="from-purple-500/20 to-pink-500/20"
                        />

                        <motion.div variants={itemVariants}>
                            <Card className="relative bg-gray-900/50 border border-gray-700/50 backdrop-blur-xl overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20" />
                                <CardHeader className="relative">
                                    <CardTitle className="flex items-center gap-3 text-white">
                                        <motion.div
                                            className="p-2 rounded-lg bg-white/10 backdrop-blur-sm"
                                            whileHover={{ rotate: 16 }}
                                        >
                                            <Key className="h-5 w-5" />
                                        </motion.div>
                                        Encryption Key
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="relative space-y-4">
                                    <Label
                                        htmlFor="key"
                                        className="text-gray-300"
                                    >
                                        Enter the password used to encrypt the
                                        file
                                    </Label>
                                    <Input
                                        id="key"
                                        type="password"
                                        value={key}
                                        onChange={(e) => setKey(e.target.value)}
                                        className="bg-gray-800/50 text-white mt-2"
                                        placeholder="Enter encryption key..."
                                    />
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Extract Button */}
                        <motion.div
                            variants={itemVariants}
                            className="flex justify-center flex-col items-center pt-4"
                        >
                            <motion.div
                                whileHover={{ scale: canExtract ? 1.05 : 1 }}
                                whileTap={{ scale: canExtract ? 0.95 : 1 }}
                            >
                                <Button
                                    onClick={handleExtract}
                                    disabled={!canExtract || isProcessing}
                                    className={`px-8 py-3 text-lg font-semibold transition-all duration-300 ${
                                        canExtract
                                            ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                                            : "bg-gray-700 text-gray-400 cursor-not-allowed"
                                    }`}
                                >
                                    {isProcessing
                                        ? "Extracting..."
                                        : "Extract File"}
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
