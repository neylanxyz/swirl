"use client"

import { useEffect, useState } from "react"

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%"

function encryptText(text: string, frame: number) {
    return text
        .split("")
        .map((char, i) => {
            if (i < frame) return char
            return CHARS[Math.floor(Math.random() * CHARS.length)]
        })
        .join("")
}

export function EncryptedText({ text }: { text: string }) {
    const [display, setDisplay] = useState(text)

    useEffect(() => {
        let frame = 0
        const interval = setInterval(() => {
            frame++
            setDisplay(encryptText(text, frame))

            if (frame > text.length) {
                clearInterval(interval)
                setTimeout(() => (frame = 0), 8000)
            }
        }, 60)

        return () => clearInterval(interval)
    }, [text])

    return (
        <span className="font-bold text-[#00FFB3] tracking-wide">
            {display}
        </span>
    )
}
