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
        <div style={{ minHeight: "100vh", backgroundColor: "#f7f8fa", display: "flex" }}>
            {/* Sidebar */}
            <AdminSidebar open={sidebarOpen} onToggle={() => setSidebarOpen((o) => !o)} />

            {/* Main content */}
            <div
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "100vh",
                    transition: "margin-left 0.3s ease",
                    marginLeft: sidebarOpen ? "240px" : "68px",
                }}
            >
                <AdminHeader
                    title={title}
                    breadcrumbs={breadcrumbs}
                    onMenuToggle={() => setSidebarOpen((o) => !o)}
                />
                <main style={{ flex: 1, padding: "24px", overflow: "auto" }}>
                    <div style={{ maxWidth: "1600px", margin: "0 auto" }}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
