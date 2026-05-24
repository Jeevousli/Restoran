import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../services/api";
import { getCategories } from "../services/api";

const fmt = (n) => new Intl.NumberFormat("id-ID").format(n ?? 0);

export default function Dashboard() {
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([getProducts(), getCategories()]);
      setProducts(p.data);
      setCategories(c.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const activeProducts   = products.filter((p) => p.is_active !== false).length;
  const inactiveProducts = products.filter((p) => p.is_active === false).length;

  const statCards = [
    {
      label: "Total Produk",
      value: products.length,
      icon: "🛍️",
      color: "#f97316",
      bg: "#fff7ed",
      sub: `${activeProducts} aktif`,
    },
    {
      label: "Total Kategori",
      value: categories.length,
      icon: "🗂️",
      color: "#3b82f6",
      bg: "#dbeafe",
      sub: "kategori menu",
    },
    {
      label: "Produk Aktif",
      value: activeProducts,
      icon: "✅",
      color: "#10b981",
      bg: "#d1fae5",
      sub: "tersedia untuk order",
    },
    {
      label: "Produk Nonaktif",
      value: inactiveProducts,
      icon: "⛔",
      color: "#ef4444",
      bg: "#fee2e2",
      sub: "disembunyikan",
    },
  ];

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Selamat datang di panel admin Noesantara 🍽️</p>
        </div>
        <button onClick={fetchData} className="btn btn-secondary btn-sm" disabled={loading}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="stats-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat-card" style={{ opacity: .5 }}>
              <div className="stat-card-icon" style={{ background: "#f1f5f9" }}>⏳</div>
              <div><div className="stat-card-label">Memuat...</div><div className="stat-card-value">—</div></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="stats-grid">
          {statCards.map((s) => (
            <div key={s.label} className="stat-card">
              <div className="stat-card-icon" style={{ background: s.bg, fontSize: 22 }}>{s.icon}</div>
              <div>
                <div className="stat-card-label">{s.label}</div>
                <div className="stat-card-value" style={{ color: s.color }}>{s.value}</div>
                <div className="stat-card-sub">{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Quick Links */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Aksi Cepat</div>
              <div className="card-subtitle">Pintasan ke halaman utama</div>
            </div>
          </div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { to: "/products",     label: "Daftar Produk",   icon: "🛍️", desc: "Lihat semua produk" },
              { to: "/products/add", label: "Tambah Produk",   icon: "➕", desc: "Tambahkan menu baru" },
              { to: "/categories",   label: "Kelola Kategori", icon: "🗂️", desc: "Atur kategori menu" },
            ].map(({ to, label, icon, desc }) => (
              <Link
                key={to} to={to}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 14px", borderRadius: 10,
                  background: "var(--bg)", textDecoration: "none",
                  transition: "background .15s",
                  border: "1px solid var(--border-light)",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#f0f4ff"}
                onMouseLeave={(e) => e.currentTarget.style.background = "var(--bg)"}
              >
                <span style={{ fontSize: 20 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{label}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{desc}</div>
                </div>
                <svg style={{ marginLeft: "auto", color: "var(--text-muted)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Products */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Produk Terbaru</div>
              <div className="card-subtitle">{products.length} total produk</div>
            </div>
            <Link to="/products" className="btn btn-secondary btn-sm">Lihat Semua</Link>
          </div>
          <div className="table-wrapper">
            {loading ? (
              <div className="loading-spinner"><div className="spinner" /><p>Memuat...</p></div>
            ) : products.length === 0 ? (
              <div className="empty-state"><span style={{ fontSize: 32 }}>📭</span><p>Belum ada produk</p></div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Produk</th>
                    <th>Harga</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.slice(0, 5).map((p) => (
                    <tr key={p._id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name} className="product-thumb" />
                          ) : (
                            <div className="thumb-placeholder">🍽️</div>
                          )}
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                              {p.category_id?.category_name || "—"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>Rp {fmt(p.price)}</td>
                      <td>
                        <span className={`badge ${p.is_active === false ? "badge-danger" : "badge-success"}`}>
                          {p.is_active === false ? "Nonaktif" : "Aktif"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
