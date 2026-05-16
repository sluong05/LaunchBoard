import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  Boxes,
  Check,
  Download,
  Edit3,
  ExternalLink,
  FileUp,
  FolderOpen,
  Grid2X2,
  Link2,
  Moon,
  PanelTop,
  Pin,
  Plus,
  Search,
  Star,
  StarOff,
  StickyNote,
  Sun,
  Tags,
  Trash2,
  X
} from "lucide-react";
import "./styles.css";

const STORAGE_KEY = "launchboard.links.v1";
const THEME_KEY = "launchboard.theme.v1";
const SECTION_OTHER = "__other__";
const defaultSections = [
  "School",
  "Work",
  "Tennis",
  "Climbing",
  "Personal Projects",
  "Finances",
  "Social",
  "Google",
  "Research",
  "Build",
  "Daily",
  "Learning",
  "Health",
  "Travel",
  "Shopping",
  "Entertainment",
  "Utilities"
];

const seedLinks = [
  {
    id: crypto.randomUUID(),
    title: "UW Canvas",
    url: "https://canvas.uw.edu/",
    category: "School",
    color: "plum",
    tags: ["classes", "assignments"],
    notes: "Course home base for assignments, modules, grades, and professor updates.",
    favorite: true
  },
  {
    id: crypto.randomUUID(),
    title: "UW Libraries",
    url: "https://www.lib.washington.edu/",
    category: "Research",
    color: "blue",
    tags: ["articles", "books"],
    notes: "Use this when you need databases, citations, research guides, or book reservations.",
    favorite: false
  },
  {
    id: crypto.randomUUID(),
    title: "Gmail",
    url: "https://mail.google.com/",
    category: "Daily",
    color: "red",
    tags: ["email"],
    notes: "Main inbox for school messages and account notifications.",
    favorite: true
  },
  {
    id: crypto.randomUUID(),
    title: "GitHub",
    url: "https://github.com/",
    category: "Build",
    color: "green",
    tags: ["code", "repos"],
    notes: "Code repositories, project issues, pull requests, and deployment notes.",
    favorite: false
  }
];

const swatches = ["plum", "blue", "green", "amber", "red", "ink"];

const colorLabels = {
  plum: "Plum",
  blue: "Blue",
  green: "Green",
  amber: "Amber",
  red: "Red",
  ink: "Ink"
};

const emptyDraft = {
  title: "",
  url: "",
  category: "",
  color: "plum",
  tags: "",
  notes: "",
  favorite: false
};

function readLinks() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : seedLinks;
  } catch {
    return seedLinks;
  }
}

function normalizeUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function extractHost(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function tagsFromDraft(tags) {
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function categoryStats(links) {
  const stats = new Map();
  links.forEach((link) => {
    const key = link.category || "Unsorted";
    stats.set(key, (stats.get(key) || 0) + 1);
  });
  return [...stats.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

function App() {
  const [links, setLinks] = useState(readLinks);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState(null);
  const [customSectionOpen, setCustomSectionOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || "dark");
  const importRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  }, [links]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const categories = useMemo(() => categoryStats(links), [links]);
  const sectionOptions = useMemo(() => {
    const savedSections = categories.map(([category]) => category);
    return [...new Set([...defaultSections, ...savedSections])].filter((section) => section !== "Unsorted");
  }, [categories]);

  const filteredLinks = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return links
      .filter((link) => activeCategory === "All" || (link.category || "Unsorted") === activeCategory)
      .filter((link) => {
        if (!needle) return true;
        return [link.title, link.url, link.category, link.notes, ...(link.tags || [])]
          .join(" ")
          .toLowerCase()
          .includes(needle);
      })
      .sort((a, b) => Number(b.favorite) - Number(a.favorite) || a.title.localeCompare(b.title));
  }, [activeCategory, links, query]);

  const favoriteLinks = links.filter((link) => link.favorite);

  function resetForm() {
    setDraft(emptyDraft);
    setEditingId(null);
    setCustomSectionOpen(false);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const title = draft.title.trim();
    const url = normalizeUrl(draft.url);
    if (!title || !url) return;

    const payload = {
      title,
      url,
      category: draft.category.trim() || "Unsorted",
      color: draft.color,
      tags: tagsFromDraft(draft.tags),
      notes: draft.notes.trim(),
      favorite: draft.favorite
    };

    if (editingId) {
      setLinks((current) => current.map((link) => (link.id === editingId ? { ...link, ...payload } : link)));
    } else {
      setLinks((current) => [{ id: crypto.randomUUID(), ...payload }, ...current]);
    }
    resetForm();
  }

  function startEdit(link) {
    setEditingId(link.id);
    setDraft({
      title: link.title,
      url: link.url,
      category: link.category,
      color: link.color,
      tags: (link.tags || []).join(", "),
      notes: link.notes || "",
      favorite: link.favorite
    });
    setCustomSectionOpen(!sectionOptions.includes(link.category || ""));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateSection(value) {
    if (value === SECTION_OTHER) {
      setCustomSectionOpen(true);
      setDraft({ ...draft, category: "" });
      return;
    }
    setCustomSectionOpen(false);
    setDraft({ ...draft, category: value });
  }

  function removeLink(id) {
    setLinks((current) => current.filter((link) => link.id !== id));
    if (editingId === id) resetForm();
  }

  function toggleFavorite(id) {
    setLinks((current) =>
      current.map((link) => (link.id === id ? { ...link, favorite: !link.favorite } : link))
    );
  }

  function openCategory() {
    filteredLinks.forEach((link) => window.open(link.url, "_blank", "noopener,noreferrer"));
  }

  function exportLinks() {
    const blob = new Blob([JSON.stringify(links, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "launchboard-links.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function importLinks(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const incoming = JSON.parse(reader.result);
        if (!Array.isArray(incoming)) return;
        setLinks(
          incoming
            .filter((item) => item.title && item.url)
            .map((item) => ({
              id: item.id || crypto.randomUUID(),
              title: String(item.title),
              url: normalizeUrl(String(item.url)),
              category: item.category ? String(item.category) : "Unsorted",
              color: swatches.includes(item.color) ? item.color : "plum",
              tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
              notes: item.notes ? String(item.notes) : "",
              favorite: Boolean(item.favorite)
            }))
        );
      } catch {
        return;
      } finally {
        event.target.value = "";
      }
    };
    reader.readAsText(file);
  }

  return (
    <main className="app-shell">
      <section className="command-deck">
        <div className="hero-panel">
          <div className="brand-lockup">
            <div className="brand-mark" aria-hidden="true">
              <PanelTop size={22} />
            </div>
            <div>
              <p className="eyebrow">Personal command surface</p>
              <h1>Launchboard</h1>
            </div>
          </div>
          <p className="hero-copy">
            Keep every tab-worthy link organized by context, searchable by habit, and ready to launch.
          </p>
          <div className="hero-stats" aria-label="Launchboard stats">
            <span>
              <strong>{links.length}</strong> links
            </span>
            <span>
              <strong>{categories.length}</strong> sections
            </span>
            <span>
              <strong>{favoriteLinks.length}</strong> pinned
            </span>
          </div>
        </div>

        <form className="link-form" onSubmit={handleSubmit}>
          <div className="form-header">
            <div>
              <p className="eyebrow">Capture</p>
              <h2>{editingId ? "Edit link" : "Add quick link"}</h2>
            </div>
            {editingId && (
              <button className="icon-button" type="button" onClick={resetForm} aria-label="Cancel edit">
                <X size={18} />
              </button>
            )}
          </div>

          <label>
            <span>Title</span>
            <input
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              placeholder="MyUW"
              required
            />
          </label>

          <label>
            <span>Link</span>
            <input
              value={draft.url}
              onChange={(event) => setDraft({ ...draft, url: event.target.value })}
              placeholder="my.uw.edu"
              required
            />
          </label>

          <div className="form-grid">
            <label>
              <span>Section</span>
              <select
                value={customSectionOpen ? SECTION_OTHER : draft.category}
                onChange={(event) => updateSection(event.target.value)}
              >
                <option value="">Choose section</option>
                {sectionOptions.map((section) => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
                <option value={SECTION_OTHER}>Other...</option>
              </select>
            </label>
            <label>
              <span>Tags</span>
              <input
                value={draft.tags}
                onChange={(event) => setDraft({ ...draft, tags: event.target.value })}
                placeholder="portal, daily"
              />
            </label>
          </div>

          {customSectionOpen && (
            <label>
              <span>Custom section</span>
              <input
                value={draft.category}
                onChange={(event) => setDraft({ ...draft, category: event.target.value })}
                placeholder="Recipes, Career, Reading..."
              />
            </label>
          )}

          <label>
            <span>Notes</span>
            <textarea
              value={draft.notes}
              onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
              placeholder="Why this link matters, where it takes you, or what to do there"
              rows={3}
            />
          </label>

          <fieldset className="swatch-group">
            <legend>Color</legend>
            {swatches.map((color) => (
              <button
                className={`swatch swatch-${color}`}
                type="button"
                key={color}
                onClick={() => setDraft({ ...draft, color })}
                aria-label={`${colorLabels[color]} color`}
                aria-pressed={draft.color === color}
              >
                {draft.color === color && <Check size={14} />}
              </button>
            ))}
          </fieldset>

          <label className="favorite-toggle">
            <input
              type="checkbox"
              checked={draft.favorite}
              onChange={(event) => setDraft({ ...draft, favorite: event.target.checked })}
            />
            <span>
              <Star size={16} /> Pin to favorites
            </span>
          </label>

          <button className="primary-button" type="submit">
            {editingId ? <Edit3 size={18} /> : <Plus size={18} />}
            {editingId ? "Save changes" : "Add link"}
          </button>
        </form>
      </section>

      <section className="toolbar" aria-label="Link controls">
        <div className="search-box">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search links, tags, or sections"
          />
        </div>
        <button className="secondary-button" type="button" onClick={openCategory} disabled={!filteredLinks.length}>
          <FolderOpen size={18} />
          Open shown
        </button>
        <button className="secondary-button" type="button" onClick={exportLinks}>
          <Download size={18} />
          Export
        </button>
        <button className="secondary-button" type="button" onClick={() => importRef.current?.click()}>
          <FileUp size={18} />
          Import
        </button>
        <button
          className="icon-button"
          type="button"
          onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <input ref={importRef} className="hidden-input" type="file" accept="application/json" onChange={importLinks} />
      </section>

      <section className="content-grid">
        <aside className="section-rail" aria-label="Sections">
          <button
            className={`section-tab ${activeCategory === "All" ? "is-active" : ""}`}
            type="button"
            onClick={() => setActiveCategory("All")}
          >
            <Grid2X2 size={17} />
            <span>All links</span>
            <b>{links.length}</b>
          </button>
          {categories.map(([category, count]) => (
            <button
              className={`section-tab ${activeCategory === category ? "is-active" : ""}`}
              type="button"
              key={category}
              onClick={() => setActiveCategory(category)}
            >
              <Boxes size={17} />
              <span>{category}</span>
              <b>{count}</b>
            </button>
          ))}
        </aside>

        <section className="links-zone" aria-label="Quick links">
          {favoriteLinks.length > 0 && (
            <div className="favorites-strip" aria-label="Pinned links">
              <div className="strip-label">
                <Pin size={16} />
                Pinned
              </div>
              {favoriteLinks.slice(0, 6).map((link) => (
                <a className={`mini-link tone-${link.color}`} key={link.id} href={link.url} target="_blank" rel="noreferrer">
                  {link.title}
                  <ArrowUpRight size={14} />
                </a>
              ))}
            </div>
          )}

          <div className="link-board">
            {filteredLinks.map((link) => (
              <article className={`link-card tone-${link.color}`} key={link.id}>
                <div className="card-topline">
                  <a
                    className="favicon-badge"
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open ${link.title}`}
                    title={`Open ${link.title}`}
                  >
                    <img
                      src={`https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(link.url)}`}
                      alt=""
                    />
                  </a>
                  <div className="card-actions">
                    <button
                      className="icon-button small"
                      type="button"
                      onClick={() => toggleFavorite(link.id)}
                      aria-label={link.favorite ? "Remove favorite" : "Add favorite"}
                    >
                      {link.favorite ? <Star size={16} /> : <StarOff size={16} />}
                    </button>
                    <button className="icon-button small" type="button" onClick={() => startEdit(link)} aria-label="Edit link">
                      <Edit3 size={16} />
                    </button>
                    <button className="icon-button small" type="button" onClick={() => removeLink(link.id)} aria-label="Delete link">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="card-category">{link.category || "Unsorted"}</p>
                  <h3>{link.title}</h3>
                  <a className="host-link" href={link.url} target="_blank" rel="noreferrer">
                    <Link2 size={15} />
                    {extractHost(link.url)}
                    <ExternalLink size={14} />
                  </a>
                  {link.notes && (
                    <p className="link-notes">
                      <StickyNote size={15} />
                      {link.notes}
                    </p>
                  )}
                </div>
                {!!link.tags?.length && (
                  <div className="tag-row" aria-label="Tags">
                    <Tags size={14} />
                    {link.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>

          {!filteredLinks.length && (
            <div className="empty-state">
              <Search size={26} />
              <h3>No links match</h3>
              <p>Try a different search or add a new link to this section.</p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
