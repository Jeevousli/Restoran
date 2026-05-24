import { useState, useEffect } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/api";

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
          {t.type === "success" ? "✅" : "❌"} {t.msg}
        </div>
      ))}
    </div>
  );
}

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [newName, setNewName]       = useState("");
  const [adding, setAdding]         = useState(false);
  const [editId, setEditId]         = useState(null);
  const [editName, setEditName]     = useState("");
  const [deleteId, setDeleteId]     = useState(null);
  const { toasts, show } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch {
      show("Gagal memuat kategori", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── Add ────────────────────────────────────────────────
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return show("Nama kategori wajib diisi", "error");
    setAdding(true);
    try {
      await createCategory({ category_name: newName.trim() });
      show("Kategori berhasil ditambahkan");
      setNewName("");
      fetchData();
    } catch (err) {
      show(err.response?.data?.message || "Gagal menambah kategori", "error");
    } finally {
      setAdding(false);
    }
  };

  // ── Edit ───────────────────────────────────────────────
  const startEdit = (cat) => {
    setEditId(cat._id);
    setEditName(cat.category_name);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return show("Nama tidak boleh kosong", "error");
    try {
      await updateCategory(editId, { category_name: editName.trim() });
      show("Kategori berhasil diperbarui");
      setEditId(null);
      setEditName("");
      fetchData();
    } catch {
      show("Gagal memperbarui kategori", "error");
    }
  };

  // ── Delete ─────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCategory(deleteId);
      show("Kategori berhasil dihapus");
      setDeleteId(null);
      fetchData();
    } catch {
      show("Gagal menghapus kategori", "error");
    }
  };

  return (
    <div className="page-wrapper">
      <ToastContainer toasts={toasts} />

      <div className="page-header">
        <div>
          <h1 className="page-title">Kategori</h1>
          <p className="page-subtitle">{categories.length} kategori terdaftar</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 }}>

        {/* Add Form */}
        <div className="card" style={{ alignSelf: "start" }}>
          <div className="card-header">
            <div className="card-title">➕ Tambah Kategori</div>
          </div>
          <div className="card-body">
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label className="form-label">Nama Kategori</label>
                <input
                  className="form-control"
                  placeholder="Contoh: Minuman, Aneka Nasi..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Escape" && setNewName("")}
                  autoFocus
                />
                <span className="form-hint">Tekan Enter untuk menyimpan</span>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={adding}>
                {adding ? "Menyimpan..." : "Simpan Kategori"}
              </button>
            </form>
          </div>
        </div>

        {/* Category List */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">🗂️ Daftar Kategori</div>
            <button className="btn btn-secondary btn-sm" onClick={fetchData} disabled={loading}>
              Refresh
            </button>
          </div>
          <div className="table-wrapper">
            {loading ? (
              <div className="loading-spinner"><div className="spinner" /><p>Memuat...</p></div>
            ) : categories.length === 0 ? (
              <div className="empty-state">
                <span style={{ fontSize: 40 }}>🗂️</span>
                <p>Belum ada kategori. Tambahkan di form kiri.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nama Kategori</th>
                    <th>ID</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat, idx) => (
                    <tr key={cat._id}>
                      <td style={{ color: "var(--text-muted)", fontWeight: 600, width: 40 }}>{idx + 1}</td>
                      <td>
                        {editId === cat._id ? (
                          <form onSubmit={handleEdit} style={{ display: "flex", gap: 8 }}>
                            <input
                              className="form-control"
                              style={{ padding: "6px 10px", fontSize: 13 }}
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={(e) => e.key === "Escape" && setEditId(null)}
                              autoFocus
                            />
                            <button type="submit" className="btn btn-success btn-sm">✓</button>
                            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditId(null)}>✕</button>
                          </form>
                        ) : (
                          <div style={{ fontWeight: 600, fontSize: 14 }}>
                            {cat.category_name}
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" }}>
                        {cat._id.slice(-8)}
                      </td>
                      <td>
                        {editId !== cat._id && (
                          <div style={{ display: "flex", gap: 6 }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => startEdit(cat)}>
                              ✏️ Edit
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(cat._id)}>
                              🗑️
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {!loading && categories.length > 0 && (
            <div className="pagination">
              <span className="page-info">{categories.length} kategori</span>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">⚠️ Hapus Kategori?</div>
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
              Kategori ini akan dihapus permanen. Produk yang menggunakan kategori ini mungkin terpengaruh.
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
