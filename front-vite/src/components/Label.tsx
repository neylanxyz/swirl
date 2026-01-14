import { EncryptedText } from "./EncryptedText"

export const Label = ({ text }: { text: string }) => {

    return (
        <span className="flex items-center gap-2 text-black">
            <span className="loader-btn" />
            <span className="fade-text">
                <EncryptedText
                    text={text}
                    className="text-black!"
                />
            </span>
        </span>
    )
}