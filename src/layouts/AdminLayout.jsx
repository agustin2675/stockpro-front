import { useState } from "react";
import Topbar from "../components/Topbar.jsx";
import Sidebar, { SidebarDrawer } from "../components/Sidebar.jsx";

export default function AdminLayout({ children }) {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="admin-shell">
      <Topbar onOpenMenu={() => setOpenDrawer(true)} />
      <div className="lg:grid" style={{ gridTemplateColumns: collapsed ? "60px 1fr" : "260px 1fr" }}>
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
          onNavigate={() => {}}
        />
        <main className="p-4 sm:p-6">{children}</main>
      </div>

      {/* Drawer mobile */}
      <SidebarDrawer open={openDrawer} onClose={() => setOpenDrawer(false)} />
    </div>
  );
}
