export default function Layout({children}: { children: React.ReactNode }) {
    return (
        <div className="flex w-full min-h-screen h-full flex-col items-center justify-center">
            {children}
        </div>
    )
}