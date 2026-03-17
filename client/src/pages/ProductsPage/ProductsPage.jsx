import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ProductCard from "../../components/ProductCard/ProductCard";
import { pageMeta } from "../../utils/seo";
import styles from "./ProductsPage.module.css";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [searchInput, setSearchInput] = useState("");
  const [pageInfo, setPageInfo] = useState({ page: 1, pages: 1, total: 0 });
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") || "all";
  const searchQuery = searchParams.get("search") || "";

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setStatus("loading");
        const [productsRes, categoriesRes] = await Promise.all([
          axios.get("/api/products", {
            params: {
              page: 1,
              limit: 9,
              search: searchQuery || undefined,
              category: selectedCategory !== "all" ? selectedCategory : undefined,
            },
          }),
          axios.get("/api/categories"),
        ]);
        if (cancelled) return;
        const payload = productsRes.data;
        if (payload?.items) {
          setProducts(payload.items);
          setPageInfo({ page: payload.page, pages: payload.pages, total: payload.total });
        } else {
          // Fallback (shouldn't happen since we're passing page/limit)
          setProducts(payload);
          setPageInfo({ page: 1, pages: 1, total: Array.isArray(payload) ? payload.length : 0 });
        }
        setCategories(categoriesRes.data);
        setSearchInput(searchQuery);
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
  }, [searchQuery, selectedCategory]);

  const aed = useMemo(
    () =>
      new Intl.NumberFormat("en-AE", {
        style: "currency",
        currency: "AED",
        maximumFractionDigits: 0,
      }),
    []
  );

  async function loadMore() {
    try {
      const nextPage = pageInfo.page + 1;
      const { data } = await axios.get("/api/products", {
        params: {
          page: nextPage,
          limit: 9,
          search: searchQuery || undefined,
          category: selectedCategory !== "all" ? selectedCategory : undefined,
        },
      });
      if (!data?.items) return;
      setProducts((prev) => [...prev, ...data.items]);
      setPageInfo({ page: data.page, pages: data.pages, total: data.total });
    } catch {
      // keep silent; page stays as-is
    }
  }

  function applySearch(e) {
    e.preventDefault();
    const params = {};
    if (selectedCategory !== "all") params.category = selectedCategory;
    if (searchInput.trim()) params.search = searchInput.trim();
    setSearchParams(params);
  }

  return (
    <div className="container">
      <Helmet>
        <title>{pageMeta("products").title}</title>
        <meta name="description" content={pageMeta("products").description} />
      </Helmet>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Products</h1>
          <p className={styles.subtitle}>
            Browse curated furniture, lighting, chandeliers, curtains, wallpapers, office
            furniture, and home decor—ideal for residential and commercial interiors across the
            UAE.
          </p>
        </div>
      </div>

      {status === "loading" && <p className={styles.subtitle}>Loading products…</p>}
      {status === "error" && (
        <p className={styles.subtitle}>
          Couldn’t load products. Make sure the backend is running.
        </p>
      )}

      <form className={styles.searchRow} onSubmit={applySearch}>
        <input
          className={styles.searchInput}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search products..."
        />
        <button className="btn btnGhost" type="submit">
          Search
        </button>
      </form>

      <div className={styles.filters} aria-label="Category filters">
        <button
          className={
            selectedCategory === "all"
              ? `${styles.filterBtn} ${styles.active}`
              : styles.filterBtn
          }
          onClick={() => {
            const params = {};
            if (searchQuery) params.search = searchQuery;
            setSearchParams(params);
          }}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c._id}
            className={
              selectedCategory === c._id
                ? `${styles.filterBtn} ${styles.active}`
                : styles.filterBtn
            }
            onClick={() => {
              const params = { category: c._id };
              if (searchQuery) params.search = searchQuery;
              setSearchParams(params);
            }}
          >
            {c.name}
          </button>
        ))}
      </div>

      <section className={styles.grid} aria-label="Product grid">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} priceText={aed.format(p.price)} />
        ))}
      </section>

      {status === "ready" && pageInfo.page < pageInfo.pages && (
        <div className={styles.loadMoreRow}>
          <button className="btn btnGhost" onClick={loadMore} type="button">
            Load more
          </button>
          <div className={styles.loadMoreText}>
            Showing {products.length} of {pageInfo.total}
          </div>
        </div>
      )}
    </div>
  );
}

