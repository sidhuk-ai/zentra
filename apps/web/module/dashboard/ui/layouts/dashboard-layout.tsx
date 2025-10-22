import { AuthGuard } from "@/module/auth/ui/components/auth-guard";
import { OrganizationGaurd } from "@/module/auth/ui/components/organization-gaurd";
import { SidebarProvider } from "@workspace/ui/components/sidebar"
import { cookies } from "next/headers";
import { DashsboardSidebar } from "@/module/dashboard/ui/components/dashboard-sidebar";
import { Provider } from "jotai";

export async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const defaultValue = cookieStore.get("sidebar_state")?.value === "true";
    return (
        <AuthGuard>
            <OrganizationGaurd>
                <Provider>
                    <SidebarProvider defaultOpen={defaultValue}>
                        <DashsboardSidebar />
                        <main className="flex flex-1 flex-col overflow-auto">
                            {children}
                        </main>
                    </SidebarProvider>
                </Provider>
            </OrganizationGaurd>
        </AuthGuard>
    );
}