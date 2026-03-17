import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { resolveImageUrl } from "../../utils/images";
import { productImageAlt } from "../../utils/seo";
import styles from "./ProductCard.module.css";

export default function ProductCard({ product, priceText }) {
  const avg = Number(product.averageRating || 0);
  const full = Math.max(0, Math.min(5, Math.round(avg)));

  const images = useMemo(() => {
    const arr =
      Array.isArray(product.images) && product.images.length
        ? product.images
        : product.mainImage || product.image
          ? [product.mainImage || product.image]
          : [];
    const main = product.mainImage || product.image || arr[0] || "";
    return main ? [main, ...arr.filter((u) => u !== main)] : arr;
  }, [product.images, product.mainImage, product.image]);

  const [idx, setIdx] = useState(0);
  const startX = useRef(null);

  const hasMany = images.length > 1;
  const src = resolveImageUrl(images[idx] || images[0] || product.mainImage || product.image);

  function prev(e) {
    e.preventDefault();
    e.stopPropagation();
    setIdx((i) => (i - 1 + images.length) % images.length);
  }
  function next(e) {
    e.preventDefault();
    e.stopPropagation();
    setIdx((i) => (i + 1) % images.length);
  }

  function onTouchStart(e) {
    if (!hasMany) return;
    startX.current = e.touches?.[0]?.clientX ?? null;
  }
  function onTouchEnd(e) {
    if (!hasMany || startX.current == null) return;
    const end = e.changedTouches?.[0]?.clientX ?? null;
    if (end == null) return;
    const diff = end - startX.current;
    if (Math.abs(diff) < 30) return;
    if (diff > 0) setIdx((i) => (i - 1 + images.length) % images.length);
    else setIdx((i) => (i + 1) % images.length);
    startX.current = null;
  }

  return (
    <article className={styles.card}>
      <Link to={`/product/${product._id}`} className={styles.link}>
        <div
          className={styles.imageWrap}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <img
            className={styles.image}
            src={src || "https://placehold.co/1200x900?text=InteriorHub"}
            alt={productImageAlt(product, { variant: "card", index: idx })}
            loading="lazy"
          />

          {hasMany && (
            <>
              <div className={styles.dots} aria-hidden="true">
                {images.slice(0, 5).map((_, i) => (
                  <span
                    key={i}
                    className={i === idx ? `${styles.dot} ${styles.dotActive}` : styles.dot}
                  />
                ))}
              </div>

              <button className={`${styles.navBtn} ${styles.left}`} onClick={prev} type="button">
                ‹
              </button>
              <button className={`${styles.navBtn} ${styles.right}`} onClick={next} type="button">
                ›
              </button>
            </>
          )}
        </div>

        <div className={styles.body}>
          <div className={styles.top}>
            <h2 className={styles.name}>{product.name}</h2>
            <p className={styles.price}>{priceText}</p>
          </div>
          <div className={styles.ratingRow} aria-label={`Rating ${avg.toFixed(1)} out of 5`}>
            <span className={styles.stars}>
              {"★★★★★".slice(0, full)}
              {"☆☆☆☆☆".slice(0, 5 - full)}
            </span>
            <span className={styles.ratingText}>{avg ? avg.toFixed(1) : "0.0"}</span>
          </div>
          <div className={styles.meta}>{product.category?.name || "—"}</div>
          <div className={styles.cta}>View Details</div>
        </div>
      </Link>
    </article>
  );
}

