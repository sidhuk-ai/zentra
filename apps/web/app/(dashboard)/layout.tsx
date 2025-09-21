import { AuthGuard } from "@/module/auth/ui/components/auth-guard";

export default function Layout({ children }:{ children: React.ReactNode }) {
    return (
        <AuthGuard>
            {children}
        </AuthGuard>
    )
}