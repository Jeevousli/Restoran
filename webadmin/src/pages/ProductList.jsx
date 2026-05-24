import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getProducts, deleteProduct } from "../services/api";

const fmtCurrency = (n) => "Rp " + new Intl.NumberFormat("id-ID").format(n ?? 0);

// ── Toast Hook ─────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = (msg, type = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  };
  return { toasts, show };
}

function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"} {t.msg}
        </div>
      ))}
    </div>
  );
}

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [deleteId, setDeleteId] = useState(null);
  const { toasts, show } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch {
      show("Gagal memuat produk", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.category_id?.category_name?.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        filterStatus === "all" ? true :
        filterStatus === "active"   ? p.is_active !== false :
        /* inactive */ p.is_active === false;
      return matchSearch && matchStatus;
    });
  }, [products, search, filterStatus]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteProduct(deleteId);
      show("Produk berhasil dihapus");
      setDeleteId(null);
      fetchData();
    } catch {
      show("Gagal menghapus produk", "error");
    }
  };

  return (
    <div className="page-wrapper">
      <ToastContainer toasts={toasts} />

      <div className="page-header">
        <div>
          <h1 className="page-title">Produk</h1>
          <p className="page-subtitle">{products.length} produk terdaftar</p>
        </div>
        <Link to="/products/add" className="btn btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Tambah Produk
        </Link>
      </div>

      <div className="card">
        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-box">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              className="search-input"
              placeholder="Cari produk atau kategori..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
          <button className="btn btn-secondary btn-sm" onClick={fetchData} disabled={loading}>
            Refresh
          </button>
        </div>

        {/* Table */}
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-spinner"><div className="spinner" /><p>Memuat produk...</p></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <span style={{ fontSize: 40 }}>📭</span>
              <p>Tidak ada produk ditemukan</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>Kategori</th>
                  <th>Harga</th>
                  <th>Deskripsi</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
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
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>ID: {p._id.slice(-6)}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {p.category_id?.category_name ? (
                        <span className="badge badge-info">{p.category_id.category_name}</span>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontSize: 12 }}>—</span>
                      )}
                    </td>
                    <td style={{ fontWeight: 700, color: "var(--primary)" }}>
                      {fmtCurrency(p.price)}
                    </td>
                    <td style={{ maxWidth: 180, color: "var(--text-secondary)", fontSize: 12 }}>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.description || "—"}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${p.is_active === false ? "badge-danger" : "badge-success"}`}>
                        {p.is_active === false ? "Nonaktif" : "Aktif"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Link to={`/products/edit/${p._id}`} className="btn btn-secondary btn-sm">
                          ✏️ Edit
                        </Link>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeleteId(p._id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination info */}
        {!loading && (
          <div className="pagination">
            <span className="page-info">
              Menampilkan {filtered.length} dari {products.length} produk
            </span>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">⚠️ Hapus Produk?</div>
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
              Tindakan ini tidak dapat dibatalkan. Produk akan dihapus permanen dari database.
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Batal</button>
              <button className="btn btn-danger" onClick={handleDelete}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
