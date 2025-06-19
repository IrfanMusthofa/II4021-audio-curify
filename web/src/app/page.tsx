"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Shield, FileAudio, QrCode } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
            delayChildren: 0.3,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15,
        },
    },
};

const cardData = [
    {
        path: "embed",
        icon: FileAudio,
        title: "Embed",
        description:
            "Hide any file into an audio with AES encryption and generate a QR.",
        gradient: "from-emerald-500/20 to-teal-500/20",
        hoverGradient:
            "group-hover:from-emerald-500/30 group-hover:to-teal-500/30",
    },
    {
        path: "verify",
        icon: QrCode,
        title: "Verify",
        description: "Compare the audio against QR code to ensure integrity.",
        gradient: "from-blue-500/20 to-cyan-500/20",
        hoverGradient:
            "group-hover:from-blue-500/30 group-hover:to-cyan-500/30",
    },
    {
        path: "extract",
        icon: Shield,
        title: "Extract",
        description: "Decrypt and recover the embedded file from audio.",
        gradient: "from-purple-500/20 to-pink-500/20",
        hoverGradient:
            "group-hover:from-purple-500/30 group-hover:to-pink-500/30",
    },
];

export default function Home() {
    return (
        <main className="relative min-h-screen bg-linear-to-br from-emerald-400/10 via-blue-400/10 to-purple-400/10 text-white overflow-hidden">
            {/* Animated background layers */}
            <div className="absolute inset-0 -z-20">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-black to-slate-900" />
                <motion.div
                    animate={{
                        background: [
                            "radial-gradient(ellipse at 20% 50%, rgba(120, 119, 198, 0.1) 0%, transparent 50%)",
                            "radial-gradient(ellipse at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%)",
                            "radial-gradient(ellipse at 40% 80%, rgba(119, 198, 255, 0.1) 0%, transparent 50%)",
                        ],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "reverse",
                    }}
                    className="absolute inset-0"
                />
            </div>

            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center gap-12 p-8">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="flex flex-col items-center gap-8 max-w-4xl mx-auto"
                >
                    {/* Header section */}
                    <motion.div
                        variants={itemVariants}
                        className="text-center space-y-6"
                    >
                        <motion.h1
                            className="text-6xl md:text-7xl p-4 font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            AudioCurify
                        </motion.h1>

                        <motion.div
                            className="h-1 w-48 mx-auto bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: 196 }}
                            transition={{ delay: 1, duration: 0.8 }}
                        />
                    </motion.div>

                    <motion.p
                        variants={itemVariants}
                        className="text-xl md:text-2xl max-w-2xl text-center text-white leading-relaxed"
                    >
                        A modern audio steganography tool with encryption and QR
                        verification. Securely embed any file into WAV audio.
                    </motion.p>

                    {/* Cards grid */}
                    <motion.div
                        variants={containerVariants}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mt-8"
                    >
                        {cardData.map((card, index) => (
                            <motion.div
                                key={card.path}
                                variants={itemVariants}
                                whileHover={{
                                    y: -10,
                                    transition: {
                                        type: "spring",
                                        stiffness: 300,
                                    },
                                }}
                                className="group"
                            >
                                <Card className="relative bg-gray-900/50 hover:bg-white/10 backdrop-blur-xl border-2 border-white-700/50 hover:border-gray-600/50 transition-all duration-500 overflow-hidden h-full">
                                    {/* Card gradient overlay */}
                                    <div
                                        className={`absolute inset-0 bg-gradient-to-br ${card.gradient} ${card.hoverGradient} transition-all duration-500`}
                                    />

                                    <Link
                                        href={`/${card.path}`}
                                        className="block h-full"
                                    >
                                        <CardContent className="relative p-8 flex flex-col items-start gap-6 h-full">
                                            {/* Icon */}
                                            <motion.div
                                                className="p-3 rounded-xl bg-white/10 backdrop-blur-sm group-hover:bg-white/20 transition-all"
                                                whileHover={{ rotate: 16 }}
                                                transition={{ duration: 0 }}
                                            >
                                                <card.icon className="h-8 w-8 text-white" />
                                            </motion.div>

                                            {/* Content */}
                                            <div className="space-y-3 flex-1">
                                                <h2 className="text-2xl font-bold text-white group-hover:text-gray-100 transition-colors">
                                                    {card.title}
                                                </h2>
                                                <p className="text-gray-400 text-base leading-relaxed group-hover:text-gray-300 transition-colors">
                                                    {card.description}
                                                </p>
                                            </div>

                                            {/* Button */}
                                            <motion.div
                                                whileHover={{ x: 5 }}
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 300,
                                                }}
                                                className="w-full"
                                            >
                                                <Button
                                                    variant="secondary"
                                                    className="w-full bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/30 text-white backdrop-blur-sm transition-all duration-300 group-hover:shadow-lg group-hover:shadow-white/10"
                                                >
                                                    Get Started
                                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            </motion.div>
                                        </CardContent>
                                    </Link>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Bottom accent */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.5, duration: 0.8 }}
                        className="flex items-center gap-2 text-gray-500 text-sm mt-8"
                    >
                        <div className="w-4 h-4 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-lg text-white">
                            Secure • Private • Open Source
                        </span>
                        <div className="w-4 h-4 bg-blue-400 rounded-full animate-pulse" />
                    </motion.div>
                </motion.div>
            </div>
        </main>
    );
}
