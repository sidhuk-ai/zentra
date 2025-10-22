import Image from "next/image"

export const EmptyConversationView = () => {
    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="flex items-center justify-center gap-2">
                <Image alt="Logo" src={"/logo-light.svg"} width={50} height={50} />
                <p className="text-3xl">Zentra</p>
            </div>
        </div>
    )
}