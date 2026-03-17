import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { resolveImageUrl } from "../../utils/images";
import { pageMeta, productImageAlt } from "../../utils/seo";
import styles from "./HomePage.module.css";

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [selectedCategory, setSelectedCategory] = useState("all"); // 'all' | categoryId
  const [filtered, setFiltered] = useState([]);
  const [filterStatus, setFilterStatus] = useState("idle"); // idle | loading | ready | error

  const categoriesSectionRef = useRef(null);
  const anchorTopRef = useRef(null);

  const aed = useMemo(
    () =>
      new Intl.NumberFormat("en-AE", {
        style: "currency",
        currency: "AED",
        maximumFractionDigits: 0,
      }),
    []
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setStatus("loading");
        const [featuredRes, categoriesRes] = await Promise.all([
          axios.get("/api/products/featured"),
          axios.get("/api/categories"),
        ]);
        if (cancelled) return;
        setFeatured(featuredRes.data);
        setCategories(categoriesRes.data);
        setStatus("ready");
      } catch {
        if (cancelled) return;
        setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const whatsappNumber = "971503892838";
  const whatsappMessage = "Hello, I am interested in InteriorHub services.";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  useEffect(() => {
    let cancelled = false;

    async function loadFiltered() {
      if (selectedCategory === "all") {
        setFiltered([]);
        setFilterStatus("idle");
        return;
      }

      try {
        setFilterStatus("loading");
        const { data } = await axios.get("/api/products", {
          params: { category: selectedCategory, page: 1, limit: 6 },
        });
        if (cancelled) return;
        const items = data?.items ? data.items : Array.isArray(data) ? data : [];
        setFiltered(items);
        setFilterStatus("ready");
      } catch {
        if (cancelled) return;
        setFilterStatus("error");
      }
    }

    loadFiltered();
    return () => {
      cancelled = true;
    };
  }, [selectedCategory]);

  // Prevent perceived "jump" when inserting the filtered section above categories.
  // We keep the Categories section anchored in the viewport by compensating scroll delta.
  useLayoutEffect(() => {
    const prevTop = anchorTopRef.current;
    if (prevTop == null) return;
    const el = categoriesSectionRef.current;
    if (!el) {
      anchorTopRef.current = null;
      return;
    }
    const nextTop = el.getBoundingClientRect().top;
    const delta = nextTop - prevTop;
    if (delta) window.scrollBy(0, delta);
    anchorTopRef.current = null;
  }, [selectedCategory, filterStatus, filtered.length]);

  const selectedCategoryName =
    selectedCategory === "all"
      ? ""
      : categories.find((c) => c._id === selectedCategory)?.name || "Category";

  return (
    <div className={styles.page}>
      <Helmet>
        <title>{pageMeta("home").title}</title>
        <meta name="description" content={pageMeta("home").description} />
      </Helmet>

      <div className="container">
        <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.kicker}>UAE interior • Premium selection</p>
          <h1 className={styles.title}>Modern Interior Design for Your Space</h1>
          <p className={styles.subtitle}>
            Explore curated furniture, lighting, and decor. Request a quote or chat on
            WhatsApp—simple, professional, and tailored for UAE clients.
          </p>
          <p className={styles.seoText}>
            Discover sofas, chairs, tables, beds, lighting and chandeliers, curtains, wallpapers,
            office furniture, and home decor—crafted for modern interior design and luxury
            interiors UAE. InteriorHub supports residential and commercial interiors with custom
            furniture UAE options and reliable UAE-wide supply.
          </p>
          <div className={styles.actions}>
            <Link to="/products" className="btn btnPrimary">
              Explore Products
            </Link>
          </div>
        </div>

        <div className={styles.heroPanel} aria-hidden="true" />
      </section>

      <section id="featured" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Featured Products</h2>
          <Link to="/products" className={styles.sectionLink}>
            View all
          </Link>
        </div>

        {status === "loading" && <p className={styles.muted}>Loading featured…</p>}
        {status === "error" && (
          <p className={styles.muted}>Couldn’t load featured products.</p>
        )}

        <div className={styles.grid}>
          {featured.slice(0, 6).map((p) => (
            <Link key={p._id} to={`/product/${p._id}`} className={styles.card}>
              <div className={styles.imageWrap}>
                <img
                  className={styles.image}
                  src={
                    resolveImageUrl(p.mainImage || p.image) ||
                    "https://placehold.co/1200x900?text=InteriorHub"
                  }
                  alt={productImageAlt(p, { variant: "card", index: 0 })}
                  loading="lazy"
                />
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardTop}>
                  <div className={styles.name}>{p.name}</div>
                  <div className={styles.price}>{aed.format(p.price)}</div>
                </div>
                <div className={styles.meta}>
                  {p.category?.name ? p.category.name : "—"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {selectedCategory !== "all" && (
        <section className={`${styles.section} ${styles.filteredSection}`}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{selectedCategoryName}</h2>
            <Link to={`/products?category=${selectedCategory}`} className={styles.sectionLink}>
              View more
            </Link>
          </div>

          {filterStatus === "loading" && (
            <p className={styles.muted}>Loading products…</p>
          )}
          {filterStatus === "error" && (
            <p className={styles.muted}>Couldn’t load products for this category.</p>
          )}

          <div className={styles.grid}>
            {filtered.map((p) => (
              <Link key={p._id} to={`/product/${p._id}`} className={styles.card}>
                <div className={styles.imageWrap}>
                  <img
                    className={styles.image}
                    src={
                      resolveImageUrl(p.mainImage || p.image) ||
                      "https://placehold.co/1200x900?text=InteriorHub"
                    }
                    alt={productImageAlt(p, { variant: "card", index: 1 })}
                    loading="lazy"
                  />
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardTop}>
                    <div className={styles.name}>{p.name}</div>
                    <div className={styles.price}>{aed.format(p.price)}</div>
                  </div>
                  <div className={styles.meta}>{p.category?.name ? p.category.name : "—"}</div>
                </div>
              </Link>
            ))}

            {filterStatus === "ready" && filtered.length === 0 && (
              <p className={styles.muted}>No products found in this category yet.</p>
            )}
          </div>
        </section>
      )}

      <section ref={categoriesSectionRef} className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Categories</h2>
          <button
            type="button"
            className={styles.sectionBtn}
            onClick={() => {
              const el = categoriesSectionRef.current;
              if (el) anchorTopRef.current = el.getBoundingClientRect().top;
              setSelectedCategory("all");
            }}
          >
            Reset
          </button>
        </div>
        <div className={styles.pills} aria-label="Category filter">
          <button
            type="button"
            className={
              selectedCategory === "all"
                ? `${styles.pill} ${styles.pillActive}`
                : styles.pill
            }
            onClick={() => {
              const el = categoriesSectionRef.current;
              if (el) anchorTopRef.current = el.getBoundingClientRect().top;
              setSelectedCategory("all");
            }}
          >
            All
          </button>
          {categories.slice(0, 8).map((c) => (
            <button
              key={c._id}
              type="button"
              className={
                selectedCategory === c._id
                  ? `${styles.pill} ${styles.pillActive}`
                  : styles.pill
              }
              onClick={() => {
                const el = categoriesSectionRef.current;
                if (el) anchorTopRef.current = el.getBoundingClientRect().top;
                setSelectedCategory(c._id);
              }}
            >
              {c.name}
            </button>
          ))}
          {categories.length === 0 && status === "ready" && (
            <p className={styles.muted}>No categories yet.</p>
          )}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Hire a Designer</h2>
        </div>
        <div className={styles.serviceCard}>
          <div>
            <div className={styles.serviceTitle}>Design Consultation (UAE)</div>
            <div className={styles.serviceText}>
              Get a refined moodboard, product recommendations, and space planning guidance—
              tailored to your style and budget.
            </div>
          </div>
          <div className={styles.serviceActions}>
            <Link to="/products" className="btn btnGhost">
              Explore products first
            </Link>
            <a className="btn btnPrimary" href={whatsappUrl} target="_blank" rel="noreferrer">
              Contact on WhatsApp
            </a>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
}

