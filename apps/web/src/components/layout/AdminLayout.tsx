import { Link, NavLink, Outlet } from "react-router-dom";

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-ink text-sand">
      {/* Admin Top Bar */}
      <header className="sticky top-0 z-10 border-b border-white/10 bg-ink/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/admin" className="font-display text-xl text-gold">
            MAAT Admin
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                isActive ? "text-gold" : "text-sand/60 hover:text-sand"
              }
            >
              Ops IA
            </NavLink>
            <NavLink
              to="/admin/ingestion"
              className={({ isActive }) =>
                isActive ? "text-gold" : "text-sand/60 hover:text-sand"
              }
            >
              Ingestion
            </NavLink>
            <NavLink
              to="/admin/sponsors"
              className={({ isActive }) =>
                isActive ? "text-gold" : "text-sand/60 hover:text-sand"
              }
            >
              Sponsors
            </NavLink>
            <Link to="/" className="text-sand/60 hover:text-sand">
              Retour au site →
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-6 pb-24">
        <Outlet />
      </main>
    </div>
  );
}
