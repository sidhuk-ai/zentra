import { AuthLayout } from "@/module/auth/ui/layouts/auth-layout";

export default function Layout({children}: { children: React.ReactNode }) {
    return (
        <AuthLayout>
            {children}
        </AuthLayout>
    )
}