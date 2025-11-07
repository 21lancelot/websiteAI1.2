import { ROSTER } from "./roster.js";

const ready = (callback) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
};

const parseWeight = (weightLabel) => {
  const numeric = parseFloat(weightLabel.replace(/[^\d.]/g, ""));
  return Number.isFinite(numeric) ? numeric : null;
};

const flattenFighters = (divisions) =>
  divisions.flatMap((division) =>
    division.fighters.map((fighter) => ({ fighter, division }))
  );

ready(() => {
  initNav();
  initFeaturedStrip();
  initQuickBrowse();
  initDivisionsPage();
});

function initNav() {
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("#primary-navigation");
  const navLinks = nav?.querySelectorAll("a[data-nav]") ?? [];

  const pageKey = document.body.dataset.page || "home";
  const highlightKey =
    pageKey === "fighter" ? "divisions" : pageKey === "home" ? "home" : pageKey;

  navLinks.forEach((link) => {
    if (link.dataset.nav === highlightKey) {
      link.setAttribute("data-active", "true");
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("data-active");
      link.removeAttribute("aria-current");
    }
  });

  if (!navToggle || !nav) return;

  const setOpen = (isOpen) => {
    navToggle.setAttribute("data-open", String(isOpen));
    navToggle.setAttribute("aria-expanded", String(isOpen));
    nav.setAttribute("data-open", String(isOpen));
    document.body.dataset.scrollLocked = isOpen ? "true" : "false";
  };

  setOpen(false);

  navToggle.addEventListener("click", () => {
    const currentlyOpen = nav.getAttribute("data-open") === "true";
    setOpen(!currentlyOpen);
    if (!currentlyOpen) {
      nav.querySelector("a")?.focus();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setOpen(false);
      navToggle.focus();
    }
  });

  nav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLElement && event.target.tagName === "A") {
      setOpen(false);
    }
  });

  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      setOpen(false);
    }
  });
}

function initFeaturedStrip() {
  if (document.body.dataset.page !== "home") return;

  const featuredCard = document.querySelector("[data-featured-card]");
  if (!featuredCard) return;

  const nameNode = featuredCard.querySelector("[data-featured-name]");
  const summaryNode = featuredCard.querySelector("[data-featured-summary]");
  const recordNode = featuredCard.querySelector("[data-featured-record]");
  const stanceNode = featuredCard.querySelector("[data-featured-stance]");
  const divisionNode = featuredCard.querySelector("[data-featured-division]");
  const rankNode = featuredCard.querySelector("[data-featured-rank]");
  const linkNode = featuredCard.querySelector("[data-featured-link]");
  const imageNode = featuredCard.querySelector("[data-featured-image]");
  const refreshButton = featuredCard.querySelector(
    "[data-featured-refresh]"
  );

  if (
    !nameNode ||
    !summaryNode ||
    !recordNode ||
    !stanceNode ||
    !divisionNode ||
    !rankNode ||
    !linkNode ||
    !(imageNode instanceof HTMLImageElement) ||
    !(refreshButton instanceof HTMLButtonElement)
  ) {
    return;
  }

  const fighters = flattenFighters(ROSTER.divisions);
  let lastSlug = null;

  const pickFeatured = () => {
    if (!fighters.length) return null;
    const pool =
      fighters.length > 1
        ? fighters.filter(({ fighter }) => fighter.slug !== lastSlug)
        : fighters;
    const selection = pool[Math.floor(Math.random() * pool.length)];
    lastSlug = selection.fighter.slug;
    return selection;
  };

  const renderFighter = () => {
    const selection = pickFeatured();
    if (!selection) return;
    const { fighter, division } = selection;

    nameNode.textContent = fighter.name;
    summaryNode.textContent = fighter.summary;
    recordNode.textContent = `Record • ${fighter.record}`;
    stanceNode.textContent = `Stance • ${fighter.stance}`;
    divisionNode.textContent = `${division.name}`;
    rankNode.textContent = `#${fighter.rank} Contender`;
    linkNode.setAttribute("href", `fighters/${fighter.slug}.html`);
    linkNode.setAttribute("aria-label", `View profile for ${fighter.name}`);

    imageNode.src = fighter.img;
    imageNode.alt = `${fighter.name} portrait`;
    imageNode.loading = "lazy";
  };

  renderFighter();
  refreshButton.addEventListener("click", () => {
    refreshButton.disabled = true;
    renderFighter();
    window.setTimeout(() => {
      refreshButton.disabled = false;
      refreshButton.focus();
    }, 150);
  });
}

function initQuickBrowse() {
  if (document.body.dataset.page !== "home") return;

  const track = document.querySelector("[data-quick-track]");
  const dialog = document.querySelector("[data-browse-dialog]");
  const dialogTitle = dialog?.querySelector("[data-dialog-title]");
  const dialogList = dialog?.querySelector("[data-dialog-list]");
  const dialogClose = dialog?.querySelector("[data-dialog-close]");

  if (
    !track ||
    !(dialog instanceof HTMLDialogElement) ||
    !dialogTitle ||
    !dialogList ||
    !(dialogClose instanceof HTMLButtonElement)
  ) {
    return;
  }

  let lastTrigger = null;

  const createButton = (division) => {
    const listItem = document.createElement("li");
    listItem.className = "quick-browse__item";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "quick-browse__trigger";
    button.dataset.division = division.id;
    button.innerHTML = `
      <span>${division.label}</span>
      <span>${division.name}</span>
      <span>Top two • ${division.weight}</span>
    `;

    button.addEventListener("click", () => openDialog(division, button));

    listItem.appendChild(button);
    return listItem;
  };

  const openDialog = (division, trigger) => {
    lastTrigger = trigger;
    document.body.dataset.scrollLocked = "true";

    dialogTitle.textContent = division.name;
    dialogList.innerHTML = "";

    division.fighters.forEach((fighter) => {
      const item = document.createElement("article");
      item.className = "dialog__fighter";
      item.innerHTML = `
        <img src="${fighter.img}" alt="${fighter.name} portrait" loading="lazy" decoding="async">
        <div class="dialog__fighter-info">
          <strong>${fighter.name}</strong>
          <span class="text-muted">Rank #${fighter.rank} • ${fighter.record}</span>
          <div class="inline-list">
            ${
              fighter.socials?.ig
                ? `<a href="${fighter.socials.ig}" target="_blank" rel="noopener" aria-label="${fighter.name} on Instagram">IG</a>`
                : ""
            }
            ${
              fighter.socials?.tw
                ? `<a href="${fighter.socials.tw}" target="_blank" rel="noopener" aria-label="${fighter.name} on Twitter">TW</a>`
                : ""
            }
          </div>
        </div>
        <a class="button button--secondary" href="fighters/${fighter.slug}.html">
          View profile
        </a>
      `;
      dialogList.appendChild(item);
    });

    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "true");
    }

    const firstAction =
      dialog.querySelector(".dialog__fighter a.button") ?? dialogClose;
    firstAction.focus();
  };

  const closeDialog = () => {
    document.body.dataset.scrollLocked = "false";
    if (dialog.open) dialog.close();
    else dialog.removeAttribute("open");
    if (lastTrigger instanceof HTMLElement) {
      lastTrigger.focus();
    }
  };

  dialogClose.addEventListener("click", closeDialog);
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeDialog();
  });
  dialog.addEventListener("close", () => {
    document.body.dataset.scrollLocked = "false";
  });

  ROSTER.divisions.forEach((division) => {
    track.appendChild(createButton(division));
  });
}

function initDivisionsPage() {
  if (document.body.dataset.page !== "divisions") return;

  const grid = document.querySelector("[data-division-grid]");
  const genderButtons = document.querySelectorAll("[data-filter-gender]");
  const weightSelect = document.querySelector("[data-filter-weight]");
  const searchInput = document.querySelector("[data-filter-search]");
  const resultCountNode = document.querySelector("[data-result-count]");

  if (!grid || !weightSelect || !searchInput) return;

  let genderFilter = "all";
  let weightFilter = "all";
  let searchTerm = "";

  const allDivisions = [...ROSTER.divisions].sort((a, b) => {
    const weightA = parseWeight(a.weight) ?? 0;
    const weightB = parseWeight(b.weight) ?? 0;
    return weightA - weightB;
  });

  const updateGenderButtons = () => {
    genderButtons.forEach((button) => {
      const isActive = button.dataset.filterGender === genderFilter;
      button.setAttribute("aria-pressed", String(isActive));
      button.classList.toggle("button--secondary", isActive);
      button.classList.toggle("button--ghost", !isActive);
    });
  };

  const matchesGender = (division) => {
    if (genderFilter === "all") return true;
    if (genderFilter === "mens") {
      return division.label.toLowerCase().includes("men");
    }
    if (genderFilter === "womens") {
      return division.label.toLowerCase().includes("women");
    }
    return true;
  };

  const matchesWeight = (division) => {
    const numeric = parseWeight(division.weight);
    if (numeric === null) return true;

    switch (weightFilter) {
      case "light":
        return numeric <= 135;
      case "welter":
        return numeric > 135 && numeric <= 170;
      case "middle":
        return numeric > 170 && numeric <= 205;
      case "heavy":
        return numeric > 205;
      default:
        return true;
    }
  };

  const matchesSearch = (division) => {
    if (!searchTerm) return true;
    const target = `${division.name} ${division.fighters
      .map((fighter) => fighter.name)
      .join(" ")}`.toLowerCase();
    return target.includes(searchTerm);
  };

  const buildCard = (division) => {
    const card = document.createElement("article");
    card.className = "division-card";
    card.setAttribute("data-division", division.id);

    const banner = document.createElement("img");
    banner.className = "division-card__banner";
    banner.src = `assets/img/divisions/${division.id}.webp`;
    banner.alt = "";
    banner.loading = "lazy";

    const header = document.createElement("div");
    header.className = "division-card__header";
    header.innerHTML = `
      <span class="tag">${division.label}</span>
      <h3>${division.name}</h3>
      <p class="text-muted">Weight limit • ${division.weight}</p>
    `;

    const fightersList = document.createElement("div");
    fightersList.className = "division-card__fighters";

    division.fighters.forEach((fighter) => {
      const link = document.createElement("a");
      link.className = "mini-fighter";
      link.href = `fighters/${fighter.slug}.html`;
      link.setAttribute("data-slug", fighter.slug);
      link.innerHTML = `
        <img src="${fighter.img}" alt="${fighter.name} portrait" loading="lazy" decoding="async">
        <div class="mini-fighter__meta">
          <span class="mini-fighter__rank">Rank #${fighter.rank}</span>
          <span class="mini-fighter__name">${fighter.name}</span>
          <span class="text-muted">Record ${fighter.record}</span>
        </div>
        <span aria-hidden="true">→</span>
      `;
      fightersList.appendChild(link);
    });

    card.append(banner, header, fightersList);
    return card;
  };

  const render = () => {
    const filtered = allDivisions.filter(
      (division) =>
        matchesGender(division) &&
        matchesWeight(division) &&
        matchesSearch(division)
    );

    grid.innerHTML = "";

    if (!filtered.length) {
      const empty = document.createElement("p");
      empty.className = "text-muted";
      empty.textContent =
        "No divisions match your filters yet. Try a different combination.";
      grid.appendChild(empty);
    } else {
      filtered.forEach((division) => {
        grid.appendChild(buildCard(division));
      });
    }

    if (resultCountNode) {
      resultCountNode.textContent = `${filtered.length} division${
        filtered.length === 1 ? "" : "s"
      }`;
    }
  };

  genderButtons.forEach((button) => {
    button.addEventListener("click", () => {
      genderFilter = button.dataset.filterGender ?? "all";
      updateGenderButtons();
      render();
    });
  });

  weightSelect.addEventListener("change", () => {
    weightFilter = weightSelect.value;
    render();
  });

  searchInput.addEventListener("input", () => {
    searchTerm = searchInput.value.trim().toLowerCase();
    render();
  });

  updateGenderButtons();
  render();
}
