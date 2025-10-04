import { AuthGuard } from "@/module/auth/ui/components/auth-guard";
import { DashboardLayout } from "@/module/dashboard/ui/layouts/dashboard-layout";

export default function Layout({ children }:{ children: React.ReactNode }) {
    return (
        <DashboardLayout>
            {children}
        </DashboardLayout>
    )
}