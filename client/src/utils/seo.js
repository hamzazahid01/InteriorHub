const CATEGORY_KEYWORDS = [
  { match: /sofa|sectional/i, keyword: "sofas" },
  { match: /chair|armchair|stool/i, keyword: "chairs" },
  { match: /table|dining|coffee/i, keyword: "tables" },
  { match: /bed|bedroom/i, keyword: "beds" },
  { match: /light|lighting|chandelier/i, keyword: "lighting and chandeliers" },
  { match: /curtain|drape/i, keyword: "curtains" },
  { match: /wallpaper|wall/i, keyword: "wallpapers" },
  { match: /office|workspace/i, keyword: "office furniture" },
  { match: /decor|accessory|mirror|vase/i, keyword: "home decor" },
];

export function keywordGroupFromCategoryName(name) {
  const n = String(name || "").trim();
  if (!n) return "modern interior design";
  const hit = CATEGORY_KEYWORDS.find((k) => k.match.test(n));
  return hit?.keyword || "modern interior design";
}

export function pageMeta(routeKey, opts = {}) {
  const baseTitle = "InteriorHub";
  const baseDesc =
    "Premium furniture, lighting, decor and interior solutions across the UAE. Explore products, request a quote, or chat on WhatsApp.";

  if (routeKey === "home") {
    return {
      title: "InteriorHub – Furniture, Lighting, Decor & Interior Solutions in UAE",
      description:
        "Explore modern interior design products in the UAE—sofas, chairs, tables, beds, lighting and chandeliers, curtains, wallpapers, office furniture and home decor. Ideal for residential and commercial interiors, with custom furniture options in UAE.",
    };
  }

  if (routeKey === "products") {
    return {
      title: "Products | InteriorHub – Furniture, Decor & Lighting UAE",
      description:
        "Browse InteriorHub products across the UAE: furniture and decor for homes and offices—sofas, chairs, tables, beds, lighting and chandeliers, curtains and wallpapers. Filter by category and request a quote.",
    };
  }

  if (routeKey === "contact") {
    return {
      title: "Contact Us | InteriorHub – Interior Solutions UAE",
      description:
        "Contact InteriorHub for premium interior solutions in the UAE. UAE-wide supply, direct factory support in Sharjah, and reliable communication for residential and commercial projects.",
    };
  }

  if (routeKey === "product") {
    const name = String(opts.productName || "Product");
    const category = String(opts.categoryName || "");
    const group = keywordGroupFromCategoryName(category);
    return {
      title: `${name} | InteriorHub – ${group} UAE`,
      description:
        `View details for ${name}. Premium ${group} for modern interior design in the UAE. Request a quote or contact us on WhatsApp for custom solutions and delivery.`,
    };
  }

  return { title: baseTitle, description: baseDesc };
}

function locationHint(seed = "") {
  const pick = (seed || "").toLowerCase();
  if (pick.includes("dubai")) return "Dubai";
  if (pick.includes("sharjah")) return "Sharjah";
  if (pick.includes("abu")) return "Abu Dhabi";
  // rotate common UAE locations without overcommitting
  return "UAE";
}

export function productImageAlt(product, { variant = "main", index = 0 } = {}) {
  const name = String(product?.name || "Interior product").trim();
  const categoryName = product?.category?.name || "";
  const group = keywordGroupFromCategoryName(categoryName);
  const loc = locationHint(`${name} ${categoryName}`);

  const patterns = {
    main: [
      `${name} – ${group} ${loc}`,
      `${group} for modern interior design in ${loc} – ${name}`,
      `${name} | luxury interiors ${loc}`,
    ],
    thumb: [
      `${name} image ${index + 1} – ${group} ${loc}`,
      `${group} detail view – ${name} (${loc})`,
      `${name} – custom furniture UAE (image ${index + 1})`,
    ],
    card: [
      `${name} – ${group} ${loc}`,
      `${name} | home decor and furniture ${loc}`,
      `${group} piece – ${name} (${loc})`,
    ],
  };

  const list = patterns[variant] || patterns.main;
  return list[index % list.length];
}

