import { useEffect, useMemo, useState } from "react";
import { api } from "../../utils/api";
import { resolveImageUrl } from "../../utils/images";
import { formatProductPriceDisplay } from "../../utils/prices";
import styles from "./AdminProductsPage.module.css";

const emptyForm = {
  name: "",
  description: "",
  category: "",
};

const emptyPriceOption = { label: "", price: "" };

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [formOpen, setFormOpen] = useState(false);
  const [mode, setMode] = useState("create"); // create | edit
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [priceOptions, setPriceOptions] = useState([{ ...emptyPriceOption }]);
  const [existingImages, setExistingImages] = useState([]);
  const [existingVideo, setExistingVideo] = useState("");
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [removeVideo, setRemoveVideo] = useState(false);
  const [mainChoice, setMainChoice] = useState({ type: "new", index: 0 }); // {type:'existing'|'new', index:number}
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const aed = useMemo(
    () =>
      new Intl.NumberFormat("en-AE", {
        style: "currency",
        currency: "AED",
        maximumFractionDigits: 0,
      }),
    []
  );

  async function load() {
    try {
      setStatus("loading");
      const [productsRes, categoriesRes] = await Promise.all([
        api.get("/api/products"),
        api.get("/api/categories"),
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setError("");
    setSuccess("");
    setMode("create");
    setEditingId(null);
    setForm(emptyForm);
    setPriceOptions([{ ...emptyPriceOption }]);
    setExistingImages([]);
    setExistingVideo("");
    setNewFiles([]);
    setNewPreviews([]);
    setVideoFile(null);
    setVideoPreview("");
    setRemoveVideo(false);
    setMainChoice({ type: "new", index: 0 });
    setFormOpen(true);
  }

  function openEdit(p) {
    setError("");
    setSuccess("");
    setMode("edit");
    setEditingId(p._id);
    setForm({
      name: p.name || "",
      description: p.description || "",
      category: p.category?._id || "",
    });
    setPriceOptions(
      Array.isArray(p.priceOptions) && p.priceOptions.length
        ? p.priceOptions.map((o) => ({
            label: o.label || "",
            price: o.price ?? "",
          }))
        : [{ label: "Standard", price: p.price ?? "" }]
    );
    const imgs = Array.isArray(p.images) && p.images.length ? p.images : p.image ? [p.image] : [];
    setExistingImages(imgs);
    setExistingVideo(p.video || "");
    setNewFiles([]);
    setNewPreviews([]);
    setVideoFile(null);
    setVideoPreview("");
    setRemoveVideo(false);
    const main = p.mainImage || p.image || imgs[0] || "";
    const existingIndex = main ? imgs.indexOf(main) : -1;
    if (existingIndex >= 0) setMainChoice({ type: "existing", index: existingIndex });
    else setMainChoice({ type: "new", index: 0 });
    setFormOpen(true);
  }

  function closeForm() {
    if (saving) return;
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setPriceOptions([{ ...emptyPriceOption }]);
    setMode("create");
    setError("");
    setSuccess("");
    setExistingImages([]);
    setExistingVideo("");
    setNewFiles([]);
    setNewPreviews([]);
    setVideoFile(null);
    setVideoPreview("");
    setRemoveVideo(false);
    setMainChoice({ type: "new", index: 0 });
  }

  useEffect(() => {
    if (!newFiles.length) {
      setNewPreviews([]);
      return;
    }
    const urls = newFiles.map((f) => URL.createObjectURL(f));
    setNewPreviews(urls);
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [newFiles]);

  useEffect(() => {
    if (!videoFile) {
      setVideoPreview("");
      return;
    }
    const url = URL.createObjectURL(videoFile);
    setVideoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [videoFile]);

  function onSelectFiles(fileList) {
    const files = Array.from(fileList || []).slice(0, 5);
    setNewFiles(files);
    if (files.length && mainChoice.type !== "existing") {
      setMainChoice({ type: "new", index: 0 });
    }
  }

  function onSelectVideo(fileList) {
    const file = fileList && fileList[0] ? fileList[0] : null;
    setVideoFile(file);
    setRemoveVideo(false);
  }

  function removeExisting(index) {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
    if (mainChoice.type === "existing") {
      if (mainChoice.index === index) setMainChoice({ type: "new", index: 0 });
      else if (mainChoice.index > index)
        setMainChoice((c) => ({ ...c, index: c.index - 1 }));
    }
  }

  function removeNew(index) {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    if (mainChoice.type === "new") {
      if (mainChoice.index === index) setMainChoice({ type: "new", index: 0 });
      else if (mainChoice.index > index)
        setMainChoice((c) => ({ ...c, index: c.index - 1 }));
    }
  }

  function updatePriceOption(index, field, value) {
    setPriceOptions((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  function addPriceOption() {
    setPriceOptions((prev) => [...prev, { ...emptyPriceOption }]);
  }

  function removePriceOption(index) {
    setPriceOptions((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim() || !form.category) {
      setError("Name and category are required.");
      return;
    }

    const validPriceOptions = priceOptions
      .map((row) => ({
        label: row.label.trim(),
        price: Number(row.price),
      }))
      .filter(
        (row) => row.label && Number.isFinite(row.price) && row.price >= 0
      );

    if (validPriceOptions.length === 0) {
      setError("Add at least one price with a label and amount.");
      return;
    }

    const totalImages = existingImages.length + newFiles.length;
    if (totalImages === 0 && !videoFile && !existingVideo) {
      setError("Please upload at least 1 image or video.");
      return;
    }
    if (totalImages > 5) {
      setError("Maximum 5 images allowed.");
      return;
    }

    const fd = new FormData();
    fd.append("name", form.name.trim());
    fd.append("price", String(Math.min(...validPriceOptions.map((o) => o.price))));
    fd.append("priceOptions", JSON.stringify(validPriceOptions));
    fd.append("description", form.description.trim());
    fd.append("category", form.category);
    fd.append("existingImages", JSON.stringify(existingImages));
    fd.append("existingVideo", existingVideo || "");
    fd.append("removeVideo", String(removeVideo));
    newFiles.forEach((f) => fd.append("images", f));
    if (videoFile) fd.append("videos", videoFile);

    if (mainChoice.type === "existing") {
      fd.append("mainImage", existingImages[mainChoice.index] || "");
    } else {
      fd.append("mainNewIndex", String(mainChoice.index || 0));
    }

    try {
      setSaving(true);
      if (mode === "edit" && editingId) {
        await api.put(`/api/products/${editingId}`, fd);
      } else {
        await api.post("/api/products", fd);
      }
      await load();
      setSuccess(mode === "edit" ? "Product updated successfully." : "Product created successfully.");
      setForm(emptyForm);
      setPriceOptions([{ ...emptyPriceOption }]);
      setExistingImages([]);
      setExistingVideo("");
      setNewFiles([]);
      setNewPreviews([]);
      setVideoFile(null);
      setVideoPreview("");
      setRemoveVideo(false);
      setMainChoice({ type: "new", index: 0 });
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const ok = window.confirm("Delete this product?");
    if (!ok) return;

    try {
      await api.delete(`/api/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch {
      window.alert("Something went wrong. Please try again.");
    }
  }

  async function toggleFeatured(p) {
    try {
      const fd = new FormData();
      fd.append("isFeatured", String(!p.isFeatured));
      fd.append("price", String(p.price ?? 0));
      fd.append(
        "priceOptions",
        JSON.stringify(
          Array.isArray(p.priceOptions) && p.priceOptions.length
            ? p.priceOptions
            : [{ label: "Standard", price: p.price ?? 0 }]
        )
      );
      fd.append("existingImages", JSON.stringify(p.images && p.images.length ? p.images : p.image ? [p.image] : []));
      fd.append("existingVideo", p.video || "");
      fd.append("mainImage", p.mainImage || p.image || "");
      await api.put(`/api/products/${p._id}`, fd);
      setProducts((prev) =>
        prev.map((x) => (x._id === p._id ? { ...x, isFeatured: !p.isFeatured } : x))
      );
    } catch (err) {
      window.alert(err?.response?.data?.message || "Something went wrong. Please try again.");
    }
  }

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Manage Products</h1>
          <p className={styles.subTitle}>Create, update, and remove products.</p>
        </div>
        <button className="btn btnPrimary" onClick={openCreate}>
          Add Product
        </button>
      </div>

      {status === "loading" && <p className={styles.muted}>Loading products…</p>}
      {status === "error" && (
        <p className={styles.muted}>Couldn’t load products. Please try again.</p>
      )}

      <div className={styles.mobileList} aria-label="Products (mobile)">
        {status === "ready" && products.length === 0 && (
          <div className={styles.mobileEmpty}>No products yet. Tap “Add Product” to create one.</div>
        )}

        {products.map((p) => (
          <div key={p._id} className={styles.mobileCard}>
            <div className={styles.mobileTop}>
              <div className={styles.mobileTitleWrap}>
                <div className={styles.mobileTitle}>{p.name}</div>
                <div className={styles.mobileSub}>
                  {p.category?.name || "—"} • {formatProductPriceDisplay(p, aed)}
                </div>
              </div>
              <div className={styles.mobileThumb}>
                <img
                  className={styles.mobileThumbImg}
                  src={
                    resolveImageUrl(p.mainImage || p.image) ||
                    "https://placehold.co/600x450?text=InteriorHub"
                  }
                  alt={`${p.name} thumbnail`}
                  loading="lazy"
                />
              </div>
            </div>

            <div className={styles.mobileRow}>
              <div className={styles.mobileLabel}>Featured</div>
              <button
                className={styles.mobilePill}
                onClick={() => toggleFeatured(p)}
                type="button"
              >
                {p.isFeatured ? "Featured" : "Not featured"}
              </button>
            </div>

            <div className={styles.mobileActions}>
              <button className={styles.mobileBtn} onClick={() => openEdit(p)} type="button">
                Edit
              </button>
              <button
                className={`${styles.mobileBtn} ${styles.mobileDanger}`}
                onClick={() => handleDelete(p._id)}
                type="button"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Featured</th>
              <th className={styles.actionsCol}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td className={styles.nameCell}>
                  <div className={styles.name}>{p.name}</div>
                  <div className={styles.smallMuted}>{p._id}</div>
                </td>
                <td>{p.category?.name || "—"}</td>
                <td className={styles.priceCell}>{formatProductPriceDisplay(p, aed)}</td>
                <td className={styles.featuredCell}>
                  <button
                    className={styles.pillBtn}
                    onClick={() => toggleFeatured(p)}
                    type="button"
                  >
                    {p.isFeatured ? "Featured" : "Not featured"}
                  </button>
                </td>
                <td className={styles.rowActions}>
                  <button className={styles.linkBtn} onClick={() => openEdit(p)}>
                    Edit
                  </button>
                  <button
                    className={`${styles.linkBtn} ${styles.danger}`}
                    onClick={() => handleDelete(p._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {status === "ready" && products.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.empty}>
                  No products yet. Click “Add Product” to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {formOpen && (
        <div className={styles.modalBackdrop} role="presentation" onClick={closeForm}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <div className={styles.modalTitle}>
                  {mode === "edit" ? "Edit Product" : "Add Product"}
                </div>
                <div className={styles.modalSub}>
                  Upload up to 5 images. Select one as the main image.
                </div>
              </div>
              <button className={styles.closeBtn} onClick={closeForm} disabled={saving}>
                ✕
              </button>
            </div>

            {error && <div className={styles.errorBox}>{error}</div>}
            {success && <div className={styles.successBox}>{success}</div>}

            <div className={styles.modalBody}>
              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.grid}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="p-name">
                    Name
                  </label>
                  <input
                    id="p-name"
                    className={styles.input}
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Nordic Oak Lounge Chair"
                    required
                    disabled={saving}
                  />
                </div>

                <div className={`${styles.field} ${styles.priceOptionsField}`}>
                  <div className={styles.priceOptionsHeader}>
                    <label className={styles.label}>Price Options (AED)</label>
                    <button
                      type="button"
                      className={styles.smallBtn}
                      onClick={addPriceOption}
                      disabled={saving}
                    >
                      + Add Price
                    </button>
                  </div>
                  <p className={styles.priceOptionsHint}>
                    Add labels like Small, Medium, Large — or anything you prefer.
                  </p>
                  <div className={styles.priceOptionsList}>
                    {priceOptions.map((row, idx) => (
                      <div key={idx} className={styles.priceOptionRow}>
                        <input
                          className={styles.input}
                          value={row.label}
                          onChange={(e) => updatePriceOption(idx, "label", e.target.value)}
                          placeholder="e.g. Small"
                          disabled={saving}
                          aria-label={`Price label ${idx + 1}`}
                        />
                        <input
                          className={styles.input}
                          type="number"
                          min="0"
                          step="1"
                          value={row.price}
                          onChange={(e) => updatePriceOption(idx, "price", e.target.value)}
                          placeholder="Amount"
                          disabled={saving}
                          aria-label={`Price amount ${idx + 1}`}
                        />
                        <button
                          type="button"
                          className={`${styles.smallBtn} ${styles.dangerBtn}`}
                          onClick={() => removePriceOption(idx)}
                          disabled={saving || priceOptions.length <= 1}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="p-category">
                    Category
                  </label>
                  <select
                    id="p-category"
                    className={styles.input}
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category: e.target.value }))
                    }
                    disabled={saving}
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="p-image">
                    Product Images (max 5)
                  </label>
                  <input
                    id="p-image"
                    className={styles.input}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => onSelectFiles(e.target.files)}
                    disabled={saving}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="p-video">
                    Product Video (optional)
                  </label>
                  <input
                    id="p-video"
                    className={styles.input}
                    type="file"
                    accept="video/*"
                    onChange={(e) => onSelectVideo(e.target.files)}
                    disabled={saving}
                  />
                </div>
              </div>

              <div className={styles.previewWrap}>
                <div className={styles.previewHeader}>
                  <div className={styles.previewTitle}>Images</div>
                  <div className={styles.previewText}>
                    Select one image as the main image (shown first on the website).
                  </div>
                </div>

                <div className={styles.thumbGrid}>
                  {existingImages.map((url, idx) => (
                    <div
                      key={`${url}-${idx}`}
                      className={
                        mainChoice.type === "existing" && mainChoice.index === idx
                          ? `${styles.thumb} ${styles.thumbSelected}`
                          : styles.thumb
                      }
                    >
                      <button
                        type="button"
                        className={styles.thumbClick}
                        onClick={() => setMainChoice({ type: "existing", index: idx })}
                        disabled={saving}
                        aria-label="Set as main image"
                      >
                        <img className={styles.thumbImg} src={resolveImageUrl(url)} alt={`${form.name || "Product"} image`} />
                        {mainChoice.type === "existing" && mainChoice.index === idx && (
                          <span className={styles.mainBadge}>Main</span>
                        )}
                      </button>
                      <div className={styles.thumbActions}>
                        <button
                          type="button"
                          className={styles.smallBtn}
                          onClick={() => setMainChoice({ type: "existing", index: idx })}
                          disabled={saving}
                        >
                          {mainChoice.type === "existing" && mainChoice.index === idx
                            ? "Main Image"
                            : "Set Main"}
                        </button>
                        <button
                          type="button"
                          className={`${styles.smallBtn} ${styles.dangerBtn}`}
                          onClick={() => removeExisting(idx)}
                          disabled={saving}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}

                  {newPreviews.map((src, idx) => (
                    <div
                      key={`${src}-${idx}`}
                      className={
                        mainChoice.type === "new" && mainChoice.index === idx
                          ? `${styles.thumb} ${styles.thumbSelected}`
                          : styles.thumb
                      }
                    >
                      <button
                        type="button"
                        className={styles.thumbClick}
                        onClick={() => setMainChoice({ type: "new", index: idx })}
                        disabled={saving}
                        aria-label="Set as main image"
                      >
                        <img className={styles.thumbImg} src={src} alt={`${form.name || "Product"} new upload preview`} />
                        {mainChoice.type === "new" && mainChoice.index === idx && (
                          <span className={styles.mainBadge}>Main</span>
                        )}
                      </button>
                      <div className={styles.thumbActions}>
                        <button
                          type="button"
                          className={styles.smallBtn}
                          onClick={() => setMainChoice({ type: "new", index: idx })}
                          disabled={saving}
                        >
                          {mainChoice.type === "new" && mainChoice.index === idx
                            ? "Main Image"
                            : "Set Main"}
                        </button>
                        <button
                          type="button"
                          className={`${styles.smallBtn} ${styles.dangerBtn}`}
                          onClick={() => removeNew(idx)}
                          disabled={saving}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}

                  {existingImages.length === 0 && newPreviews.length === 0 && (
                    <div className={styles.previewPlaceholder}>No images selected</div>
                  )}
                </div>
              </div>

              <div className={styles.previewWrap}>
                <div className={styles.previewHeader}>
                  <div className={styles.previewTitle}>Video</div>
                  <div className={styles.previewText}>
                    Upload a video or keep an existing one. The video URL is stored in the database.
                  </div>
                </div>

                {(existingVideo || videoPreview) && (
                  <div className={styles.videoPreviewCard}>
                    {videoPreview ? (
                      <video className={styles.videoPreview} controls src={videoPreview} />
                    ) : (
                      <video className={styles.videoPreview} controls src={resolveImageUrl(existingVideo)} />
                    )}
                    <div className={styles.videoActions}>
                      <button
                        type="button"
                        className={styles.smallBtn}
                        onClick={() => {
                          setVideoFile(null);
                          setVideoPreview("");
                          setRemoveVideo(true);
                        }}
                        disabled={saving}
                      >
                        Remove Video
                      </button>
                    </div>
                  </div>
                )}

                {!existingVideo && !videoPreview && (
                  <div className={styles.previewPlaceholder}>No video selected</div>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="p-desc">
                  Description
                </label>
                <textarea
                  id="p-desc"
                  className={styles.textarea}
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="A short, premium description..."
                  disabled={saving}
                />
              </div>

                <div className={styles.modalActions}>
                  <button className="btn btnPrimary" type="submit" disabled={saving}>
                    {saving
                      ? "Uploading…"
                      : mode === "edit"
                        ? "Update Product"
                        : "Create Product"}
                  </button>
                  <button className="btn btnGhost" type="button" onClick={closeForm} disabled={saving}>
                    Close
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

