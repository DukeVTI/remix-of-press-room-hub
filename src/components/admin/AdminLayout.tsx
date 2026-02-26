import { ReactNode, useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

interface AdminLayoutProps {
    children: ReactNode;
    title: string;
    breadcrumbs?: { label: string; href?: string }[];
}

export function AdminLayout({ children, title, breadcrumbs = [] }: AdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen bg-slate-950 flex">
            {/* Sidebar */}
            <AdminSidebar open={sidebarOpen} onToggle={() => setSidebarOpen((o) => !o)} />

            {/* Main content */}
            <div
                className="flex-1 flex flex-col min-h-screen transition-all duration-300"
                style={{ marginLeft: sidebarOpen ? "260px" : "72px" }}
            >
                <AdminHeader
                    title={title}
                    breadcrumbs={breadcrumbs}
                    onMenuToggle={() => setSidebarOpen((o) => !o)}
                />
                <main className="flex-1 p-6 overflow-auto">
                    <div className="max-w-[1600px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
