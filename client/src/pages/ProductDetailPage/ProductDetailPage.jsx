import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { resolveImageUrl } from "../../utils/images";
import { pageMeta, productImageAlt } from "../../utils/seo";
import styles from "./ProductDetailPage.module.css";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | notfound | error
  const [activeIdx, setActiveIdx] = useState(0);
  const touchStartX = useRef(null);
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [submitStatus, setSubmitStatus] = useState("idle"); // idle | sending | success | error
  const [submitError, setSubmitError] = useState("");
  const [requestOpen, setRequestOpen] = useState(false);
  const [ratings, setRatings] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [ratingForm, setRatingForm] = useState({
    userName: "",
    rating: 5,
    comment: "",
  });
  const [ratingStatus, setRatingStatus] = useState("idle"); // idle | sending | error
  const [ratingError, setRatingError] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);

  const aed = new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setStatus("loading");
        const [{ data }, ratingsRes] = await Promise.all([
          axios.get(`/api/products/${id}`),
          axios.get(`/api/products/${id}/ratings`).catch(() => ({ data: null })),
        ]);
        if (cancelled) return;
        setProduct(data);
        setActiveIdx(0);
        setRequestOpen(false);
        setReviewOpen(false);
        if (ratingsRes?.data) {
          setRatings(ratingsRes.data.ratings || []);
          setAvgRating(ratingsRes.data.averageRating || 0);
        } else {
          setRatings([]);
          setAvgRating(data.averageRating || 0);
        }
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        const code = err?.response?.status;
        setStatus(code === 404 ? "notfound" : "error");
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (status === "loading") {
    return (
      <div className="container">
        <div className={styles.notFound}>
          <h1 className={styles.title}>Loading…</h1>
          <p className={styles.muted}>Fetching product details.</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="container">
        <div className={styles.notFound}>
          <h1 className={styles.title}>Something went wrong</h1>
          <p className={styles.muted}>
            Couldn’t load this product. Make sure the backend is running.
          </p>
          <Link to="/products" className="btn btnPrimary">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  if (status === "notfound" || !product) {
    return (
      <div className="container">
        <div className={styles.notFound}>
          <h1 className={styles.title}>Product not found</h1>
          <p className={styles.muted}>
            The product you’re looking for doesn’t exist.
          </p>
          <Link to="/products" className="btn btnPrimary">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");

    if (!form.name.trim() || !form.phone.trim()) {
      setSubmitStatus("error");
      setSubmitError("Something went wrong. Please try again.");
      setRequestOpen(true);
      return;
    }

    try {
      setSubmitStatus("sending");
      await axios.post("/api/inquiries", {
        name: form.name.trim(),
        phone: form.phone.trim(),
        message: form.message.trim(),
        productId: product._id,
      });
      setSubmitStatus("success");
      setRequestOpen(true);
      setForm({ name: "", phone: "", message: "" });
    } catch {
      setSubmitStatus("error");
      setSubmitError("Something went wrong. Please try again.");
      setRequestOpen(true);
    }
  }

  const whatsappNumber = "971503892838";
  const whatsappMessage = `Hello, I am interested in the product: ${product.name}. Could you please share more details?`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  function renderStars(value) {
    const v = Math.max(0, Math.min(5, value));
    const full = Math.round(v);
    return "★★★★★".slice(0, full) + "☆☆☆☆☆".slice(0, 5 - full);
  }

  async function submitRating(e) {
    e.preventDefault();
    setRatingError("");
    const userName = ratingForm.userName.trim();
    const rating = Number(ratingForm.rating);

    if (!userName || !Number.isFinite(rating)) {
      setRatingError("Name and rating are required.");
      setReviewOpen(true);
      return;
    }

    try {
      setRatingStatus("sending");
      const { data } = await axios.post(`/api/products/${id}/rate`, {
        userName,
        rating,
        comment: ratingForm.comment.trim(),
      });
      setAvgRating(data.averageRating || 0);
      setRatings((prev) => [...prev, data.rating]);
      setRatingForm({ userName: "", rating: 5, comment: "" });
      setRatingStatus("idle");
      setReviewOpen(true);
    } catch {
      setRatingStatus("error");
      setRatingError("Something went wrong. Please try again.");
      setReviewOpen(true);
    }
  }

  const images = Array.isArray(product.images) && product.images.length
    ? product.images
    : product.image
      ? [product.image]
      : [];

  const main = product.mainImage || product.image || images[0] || "";
  const normalizedImages = main ? [main, ...images.filter((u) => u !== main)] : images;
  const currentImage = normalizedImages[activeIdx] || main || images[0] || "";

  function prev() {
    if (!normalizedImages.length) return;
    setActiveIdx((i) => (i - 1 + normalizedImages.length) % normalizedImages.length);
  }

  function next() {
    if (!normalizedImages.length) return;
    setActiveIdx((i) => (i + 1) % normalizedImages.length);
  }

  function onTouchStart(e) {
    if (normalizedImages.length <= 1) return;
    touchStartX.current = e.touches?.[0]?.clientX ?? null;
  }

  function onTouchEnd(e) {
    if (normalizedImages.length <= 1) return;
    const startX = touchStartX.current;
    if (startX == null) return;
    const endX = e.changedTouches?.[0]?.clientX ?? null;
    if (endX == null) return;
    const diff = endX - startX;
    if (Math.abs(diff) < 30) return;
    if (diff > 0) prev();
    else next();
    touchStartX.current = null;
  }

  return (
    <div className="container">
      <Helmet>
        <title>
          {
            pageMeta("product", {
              productName: product.name,
              categoryName: product.category?.name || "",
            }).title
          }
        </title>
        <meta
          name="description"
          content={
            pageMeta("product", {
              productName: product.name,
              categoryName: product.category?.name || "",
            }).description
          }
        />
      </Helmet>

      <div className={styles.breadcrumbs}>
        <Link to="/products" className={styles.breadcrumbLink}>
          Products
        </Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span className={styles.breadcrumbCurrent}>{product.name}</span>
      </div>

      <section className={styles.layout}>
        <div className={styles.media}>
          <div className={styles.gallery}>
            <div
              className={styles.mainImageWrap}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <img
                className={styles.image}
                src={
                  resolveImageUrl(currentImage || main) ||
                  "https://placehold.co/1200x900?text=InteriorHub"
                }
                alt={productImageAlt(product, { variant: "main", index: activeIdx })}
              />

              {normalizedImages.length > 1 && (
                <div className={styles.galleryControls}>
                  <button type="button" className={styles.galleryBtn} onClick={prev}>
                    Prev
                  </button>
                  <button type="button" className={styles.galleryBtn} onClick={next}>
                    Next
                  </button>
                </div>
              )}
            </div>

            {normalizedImages.length > 1 && (
              <div className={styles.thumbs} aria-label="Product images">
                {normalizedImages.map((url, idx) => (
                  <button
                    key={`${url}-${idx}`}
                    type="button"
                    className={
                      idx === activeIdx
                        ? `${styles.thumbBtn} ${styles.thumbActive}`
                        : styles.thumbBtn
                    }
                    onClick={() => setActiveIdx(idx)}
                  >
                    <img
                      className={styles.thumbImg}
                      src={resolveImageUrl(url)}
                      alt={productImageAlt(product, { variant: "thumb", index: idx })}
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.info}>
          <h1 className={styles.title}>{product.name}</h1>
          <p className={styles.meta}>
            <span className={styles.badge}>
              {product.category?.name || "Uncategorized"}
            </span>
            <span className={styles.price}>{aed.format(product.price)}</span>
          </p>

          <div className={styles.ratingRow}>
            <div className={styles.stars} aria-label={`Rating ${avgRating.toFixed(1)} out of 5`}>
              {renderStars(avgRating)}
            </div>
            <div className={styles.ratingText}>
              {avgRating ? avgRating.toFixed(1) : "0.0"} ({ratings.length} reviews)
            </div>
          </div>

          <p className={styles.description}>
            {product.description || "No description provided yet."}
          </p>

          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Details</h2>
            <dl className={styles.dl}>
              <div className={styles.row}>
                <dt>Category</dt>
                <dd>{product.category?.name || "—"}</dd>
              </div>
              <div className={styles.row}>
                <dt>Price</dt>
                <dd>{aed.format(product.price)}</dd>
              </div>
            </dl>
          </div>

          <div className={`${styles.panel} ${styles.panelPremium}`}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Request Quote</h2>
              <a
                className={styles.whatsappBtn}
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
              >
                Chat on WhatsApp
              </a>
            </div>

            <button
              type="button"
              className={styles.disclosureBtn}
              onClick={() => setRequestOpen(true)}
            >
              Send Request
            </button>

            {submitStatus === "success" && (
              <p className={styles.successMsg}>
                Your request has been submitted. Our team will contact you shortly.
              </p>
            )}
            {submitStatus === "error" && submitError && (
              <p className={styles.errorMsg}>{submitError}</p>
            )}

            <div
              className={
                requestOpen
                  ? `${styles.collapse} ${styles.collapseOpen}`
                  : styles.collapse
              }
            >
              <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="inq-name">
                  Name
                </label>
                <input
                  id="inq-name"
                  className={styles.input}
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Your name"
                  required
                  disabled={submitStatus === "sending"}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="inq-phone">
                  Phone
                </label>
                <input
                  id="inq-phone"
                  className={styles.input}
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+971503892838"
                  required
                  disabled={submitStatus === "sending"}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="inq-message">
                  Message
                </label>
                <textarea
                  id="inq-message"
                  className={styles.textarea}
                  value={form.message}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, message: e.target.value }))
                  }
                  placeholder="Optional message (e.g. quantity, dimensions, delivery city)"
                  rows={4}
                  disabled={submitStatus === "sending"}
                />
              </div>

              <div className={styles.actions}>
                <button
                  type="submit"
                  className="btn btnPrimary"
                  disabled={submitStatus === "sending"}
                >
                  {submitStatus === "sending" ? "Sending request..." : "Request Quote"}
                </button>
                <Link to="/products" className="btn btnGhost">
                  Back
                </Link>
              </div>
              </form>
            </div>
          </div>

          <div className={`${styles.panel} ${styles.panelReview}`}>
            <h2 className={styles.panelTitle}>Reviews</h2>

            <button
              type="button"
              className={styles.disclosureBtn}
              onClick={() => setReviewOpen((v) => !v)}
            >
              Send Review
            </button>

            <div
              className={
                reviewOpen ? `${styles.collapse} ${styles.collapseOpen}` : styles.collapse
              }
            >
              <form className={styles.reviewForm} onSubmit={submitRating}>
                {ratingError && <p className={styles.errorMsg}>{ratingError}</p>}
                <div className={styles.reviewGrid}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="rev-name">
                      Name
                    </label>
                    <input
                      id="rev-name"
                      className={styles.input}
                      value={ratingForm.userName}
                      onChange={(e) =>
                        setRatingForm((f) => ({ ...f, userName: e.target.value }))
                      }
                      placeholder="Your name"
                      disabled={ratingStatus === "sending"}
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="rev-rating">
                      Rating
                    </label>
                    <select
                      id="rev-rating"
                      className={styles.input}
                      value={ratingForm.rating}
                      onChange={(e) =>
                        setRatingForm((f) => ({ ...f, rating: Number(e.target.value) }))
                      }
                      disabled={ratingStatus === "sending"}
                    >
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="rev-comment">
                    Comment
                  </label>
                  <textarea
                    id="rev-comment"
                    className={styles.textarea}
                    rows={3}
                    value={ratingForm.comment}
                    onChange={(e) =>
                      setRatingForm((f) => ({ ...f, comment: e.target.value }))
                    }
                    placeholder="Share your thoughts (optional)"
                    disabled={ratingStatus === "sending"}
                  />
                </div>

                <button
                  className="btn btnGhost"
                  type="submit"
                  disabled={ratingStatus === "sending"}
                >
                  {ratingStatus === "sending" ? "Submitting…" : "Submit Review"}
                </button>
              </form>
            </div>

            <div className={styles.divider} />

            {ratings.length === 0 ? (
              <p className={styles.muted}>No reviews yet.</p>
            ) : (
              <div className={styles.reviews}>
                {ratings
                  .slice()
                  .reverse()
                  .slice(0, 6)
                  .map((r, idx) => (
                    <div key={`${r.createdAt || ""}-${idx}`} className={styles.reviewCard}>
                      <div className={styles.reviewTop}>
                        <div className={styles.reviewName}>{r.userName}</div>
                        <div className={styles.reviewStars}>{renderStars(r.rating)}</div>
                      </div>
                      {r.comment ? (
                        <div className={styles.reviewComment}>{r.comment}</div>
                      ) : (
                        <div className={styles.reviewCommentMuted}>—</div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

