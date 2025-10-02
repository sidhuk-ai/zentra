"use client";
import Vapi from "@vapi-ai/web";
import { useEffect, useState } from "react";

interface TranscriptMessage {
    role: "user" | "assistant",
    text: string
}

export const useVapi = () => {
    const [vapi, setVapi] = useState<Vapi | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);

    useEffect(() => {
        // Sirf testing ke liye API key publicly daali hai baad mei BYOK
        const vapiInstance = new Vapi("daf0c17d-54f9-4bc9-aeb6-a4ed3a42e623");
        setVapi(vapiInstance);

        vapiInstance.on("call-start",() => {
            setIsConnected(true);
            setIsConnecting(false);
            setTranscript([]);
        });

        vapiInstance.on("call-end", () => {
            setIsConnected(false);
            setIsSpeaking(false);
            setIsConnecting(false);
        });

        vapiInstance.on("speech-start", () => {
            setIsSpeaking(true);
        });
        vapiInstance.on("speech-end", () => {
            setIsSpeaking(false);
        });

        vapiInstance.on("error", (error) => {
            console.error("VAPI_ERROR: ", error)
            setIsConnected(false);
        });

        vapiInstance.on("message", (message) => {
            if(message.type === "transcript" && message.transcriptType === "final") {
                setTranscript((prev) => [
                    ...prev,
                    {
                        role: message.role === "user"? "user": "assistant",
                        text: message.transcript
                    }
                ]);
            }
        });

        return () => {
            vapiInstance?.stop();
        }
    }, []);

    const startCall = () => {
        setIsConnecting(true);
        if(vapi) {
            vapi.start("4a26fd9d-fec4-44a2-94db-ba8b73fd7ecc");
        }
    };

    const endCall = () => {
        if(vapi) {
            vapi.stop();
        }
    };

    return {
        isSpeaking,
        isConnected,
        isConnecting,
        transcript,
        startCall,
        endCall
    }
    
}