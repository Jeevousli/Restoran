import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  getCategories,
  getProductById,
  createProduct,
  updateProduct,
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

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  image_url: "",
  is_active: true,
  category_id: "",
};

export default function ProductForm() {
  const { id }        = useParams();
  const navigate      = useNavigate();
  const isEdit        = Boolean(id);
  const { toasts, show } = useToast();

  const [form, setForm]           = useState(EMPTY_FORM);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [priceDisplay, setPriceDisplay] = useState("");

  // Load categories
  useEffect(() => {
    getCategories()
      .then((r) => setCategories(r.data))
      .catch(() => show("Gagal memuat kategori", "error"));
  }, []);

  // Load product if editing
  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    getProductById(id)
      .then((r) => {
        const p = r.data;
        const cat = typeof p.category_id === "object" ? p.category_id?._id : p.category_id;
        setForm({
          name:        p.name        || "",
          description: p.description || "",
          price:       p.price       || "",
          image_url:   p.image_url   || "",
          is_active:   p.is_active !== false,
          category_id: cat || "",
        });
        setPriceDisplay(p.price ? new Intl.NumberFormat("id-ID").format(p.price) : "");
      })
      .catch(() => show("Gagal memuat data produk", "error"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handlePriceChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    const num = raw ? parseInt(raw, 10) : "";
    handleChange("price", num);
    setPriceDisplay(num ? new Intl.NumberFormat("id-ID").format(num) : "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return show("Nama produk wajib diisi", "error");
    if (!form.price)        return show("Harga wajib diisi", "error");

    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        category_id: form.category_id || undefined,
      };
      if (isEdit) {
        await updateProduct(id, payload);
        show("Produk berhasil diperbarui");
      } else {
        await createProduct(payload);
        show("Produk berhasil ditambahkan");
      }
      setTimeout(() => navigate("/products"), 1000);
    } catch (err) {
      show(err.response?.data?.message || "Terjadi kesalahan", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="loading-spinner"><div className="spinner" /><p>Memuat data...</p></div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <ToastContainer toasts={toasts} />

      <div className="page-header">
        <div>
          <h1 className="page-title">{isEdit ? "Edit Produk" : "Tambah Produk"}</h1>
          <p className="page-subtitle">{isEdit ? "Perbarui informasi produk" : "Isi detail produk baru"}</p>
        </div>
        <Link to="/products" className="btn btn-secondary">
          ← Kembali
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>

          {/* Left: Main Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Basic Info Card */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Informasi Produk</div>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Nama Produk <span style={{ color: "var(--danger)" }}>*</span></label>
                  <input
                    className="form-control"
                    placeholder="Contoh: Nasi Goreng Spesial"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Deskripsi</label>
                  <textarea
                    className="form-control"
                    placeholder="Deskripsi singkat produk..."
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Harga <span style={{ color: "var(--danger)" }}>*</span></label>
                    <div style={{ position: "relative" }}>
                      <span style={{
                        position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                        color: "var(--text-muted)", fontSize: 13, fontWeight: 600,
                      }}>Rp</span>
                      <input
                        className="form-control"
                        style={{ paddingLeft: 36 }}
                        placeholder="0"
                        value={priceDisplay}
                        onChange={handlePriceChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Kategori</label>
                    <select
                      className="form-control"
                      value={form.category_id}
                      onChange={(e) => handleChange("category_id", e.target.value)}
                    >
                      <option value="">— Pilih Kategori —</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>{c.category_name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Card */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Gambar Produk</div>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">URL Gambar</label>
                  <input
                    className="form-control"
                    placeholder="https://example.com/image.jpg"
                    value={form.image_url}
                    onChange={(e) => handleChange("image_url", e.target.value)}
                  />
                  <span className="form-hint">Masukkan URL gambar produk</span>
                </div>
                {form.image_url && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8 }}>Preview:</div>
                    <div className="img-preview-wrap">
                      <img
                        src={form.image_url}
                        alt="preview"
                        className="img-preview"
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                      <button
                        type="button"
                        className="img-remove-btn"
                        onClick={() => handleChange("image_url", "")}
                      >×</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Settings */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="card">
              <div className="card-header">
                <div className="card-title">Status & Pengaturan</div>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Status Produk</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                    {[
                      { val: true,  label: "Aktif",    desc: "Produk tersedia untuk dipesan",   badge: "badge-success" },
                      { val: false, label: "Nonaktif", desc: "Produk disembunyikan dari pelanggan", badge: "badge-danger" },
                    ].map(({ val, label, desc, badge }) => (
                      <label
                        key={String(val)}
                        style={{
                          display: "flex", alignItems: "center", gap: 12,
                          padding: "12px 14px", borderRadius: 8, cursor: "pointer",
                          border: `2px solid ${form.is_active === val ? "var(--primary)" : "var(--border)"}`,
                          background: form.is_active === val ? "var(--primary-light)" : "var(--surface)",
                          transition: "all .15s",
                        }}
                      >
                        <input
                          type="radio"
                          name="is_active"
                          checked={form.is_active === val}
                          onChange={() => handleChange("is_active", val)}
                          style={{ accentColor: "var(--primary)" }}
                        />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>
                            <span className={`badge ${badge}`} style={{ marginRight: 6 }}>{label}</span>
                          </div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Card */}
            <div className="card">
              <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button type="submit" className="btn btn-primary btn-lg" disabled={saving} style={{ width: "100%", justifyContent: "center" }}>
                  {saving ? (
                    <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2, marginRight: 8 }} />{isEdit ? "Menyimpan..." : "Menambahkan..."}</>
                  ) : (
                    isEdit ? "💾 Simpan Perubahan" : "➕ Tambah Produk"
                  )}
                </button>
                <Link to="/products" className="btn btn-secondary" style={{ width: "100%", justifyContent: "center", textAlign: "center" }}>
                  Batal
                </Link>
              </div>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}
