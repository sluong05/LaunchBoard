import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  Boxes,
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

const sectionTones = {
  School: "plum",
  Work: "slate",
  Tennis: "green",
  Climbing: "terra",
  "Personal Projects": "blue",
  Finances: "amber",
  Social: "rose",
  Google: "red",
  Research: "indigo",
  Build: "mint",
  Daily: "coral",
  Learning: "cyan",
  Health: "teal",
  Travel: "sky",
  Shopping: "orange",
  Entertainment: "violet",
  Utilities: "ink",
  Unsorted: "ink"
};

const seedLinks = [
  {
    id: crypto.randomUUID(),
    title: "UW Canvas",
    url: "https://canvas.uw.edu/",
    category: "School",
    tags: ["classes", "assignments"],
    notes: "Course home base for assignments, modules, grades, and professor updates.",
    favorite: true
  },
  {
    id: crypto.randomUUID(),
    title: "UW Libraries",
    url: "https://www.lib.washington.edu/",
    category: "Research",
    tags: ["articles", "books"],
    notes: "Use this when you need databases, citations, research guides, or book reservations.",
    favorite: false
  },
  {
    id: crypto.randomUUID(),
    title: "Gmail",
    url: "https://mail.google.com/",
    category: "Daily",
    tags: ["email"],
    notes: "Main inbox for school messages and account notifications.",
    favorite: true
  },
  {
    id: crypto.randomUUID(),
    title: "GitHub",
    url: "https://github.com/",
    category: "Build",
    tags: ["code", "repos"],
    notes: "Code repositories, project issues, pull requests, and deployment notes.",
    favorite: false
  },
  {
    id: crypto.randomUUID(),
    title: "Google Calendar",
    url: "https://calendar.google.com/",
    category: "Google",
    tags: ["calendar", "schedule"],
    notes: "Check classes, plans, deadlines, and anything coming up next.",
    favorite: true
  },
  {
    id: crypto.randomUUID(),
    title: "Google Drive",
    url: "https://drive.google.com/",
    category: "Google",
    tags: ["files", "docs"],
    notes: "Find shared files, docs, spreadsheets, and class or project folders.",
    favorite: true
  },
  {
    id: crypto.randomUUID(),
    title: "Google Docs",
    url: "https://docs.google.com/",
    category: "Google",
    tags: ["writing", "documents"],
    notes: "Draft papers, notes, project docs, and shared writing.",
    favorite: false
  },
  {
    id: crypto.randomUUID(),
    title: "Google Sheets",
    url: "https://sheets.google.com/",
    category: "Google",
    tags: ["spreadsheets", "tracking"],
    notes: "Track budgets, schedules, lists, data, and plans.",
    favorite: false
  },
  {
    id: crypto.randomUUID(),
    title: "MyUW",
    url: "https://my.uw.edu/",
    category: "School",
    tags: ["portal", "uw"],
    notes: "UW portal for registration, tuition, accounts, and student resources.",
    favorite: true
  },
  {
    id: crypto.randomUUID(),
    title: "UW Email",
    url: "https://mail.google.com/a/uw.edu",
    category: "School",
    tags: ["email", "uw"],
    notes: "School email for course messages, admin notices, and UW updates.",
    favorite: false
  },
  {
    id: crypto.randomUUID(),
    title: "Handshake",
    url: "https://joinhandshake.com/",
    category: "Work",
    tags: ["jobs", "career"],
    notes: "Search internships, campus jobs, recruiting events, and career leads.",
    favorite: false
  },
  {
    id: crypto.randomUUID(),
    title: "LinkedIn",
    url: "https://www.linkedin.com/",
    category: "Work",
    tags: ["network", "career"],
    notes: "Professional profile, networking, job search, and company research.",
    favorite: false
  },
  {
    id: crypto.randomUUID(),
    title: "Indeed",
    url: "https://www.indeed.com/",
    category: "Work",
    tags: ["jobs", "applications"],
    notes: "Quick job search and saved application tracking.",
    favorite: false
  },
  {
    id: crypto.randomUUID(),
    title: "Vercel",
    url: "https://vercel.com/dashboard",
    category: "Personal Projects",
    tags: ["deploy", "hosting"],
    notes: "Deploy and manage personal web projects.",
    favorite: false
  },
  {
    id: crypto.randomUUID(),
    title: "GitHub Issues",
    url: "https://github.com/issues",
    category: "Personal Projects",
    tags: ["tasks", "code"],
    notes: "Central place to review open issues across repositories.",
    favorite: false
  },
  {
    id: crypto.randomUUID(),
    title: "Stack Overflow",
    url: "https://stackoverflow.com/",
    category: "Build",
    tags: ["debug", "answers"],
    notes: "Look up coding errors, implementation patterns, and API examples.",
    favorite: false
  },
  {
    id: crypto.randomUUID(),
    title: "MDN Web Docs",
    url: "https://developer.mozilla.org/",
    category: "Build",
    tags: ["web", "reference"],
    notes: "Reference for HTML, CSS, JavaScript, browser APIs, and web behavior.",
    favorite: false
  },
  {
    id: crypto.randomUUID(),
    title: "ChatGPT",
    url: "https://chatgpt.com/",
    category: "Learning",
    tags: ["ai", "study"],
    notes: "Ask questions, brainstorm, explain code, and work through concepts.",
    favorite: false
  },
  {
    id: crypto.randomUUID(),
    title: "Khan Academy",
    url: "https://www.khanacademy.org/",
    category: "Learning",
    tags: ["practice", "lessons"],
    notes: "Review fundamentals, practice topics, and fill knowledge gaps.",
    favorite: false
  },
  {
    id: crypto.randomUUID(),
    title: "Coursera",
    url: "https://www.coursera.org/",
    category: "Learning",
    tags: ["courses", "certificates"],
    notes: "Browse structured courses and skill-building programs.",
    favorite: false
  },
  {
    id: crypto.randomUUID(),
    title: "Yahoo Finance",
    url: "https://finance.yahoo.com/",
    category: "Finances",
    tags: ["markets", "stocks"],
    notes: "Check market headlines, tickers, watchlists, and financial news.",
    favorite: false
  },
  {
    id: crypto.randomUUID(),
    title: "Credit Karma",
    url: "https://www.creditkarma.com/",
    category: "Finances",
    tags: ["credit", "money"],
    notes: "Monitor credit score, accounts, and financial recommendations.",
    favorite: false
  },
  {
    id: crypto.randomUUID(),
    title: "Venmo",
    url: "https://venmo.com/",
    category: "Finances",
    tags: ["payments", "friends"],
    notes: "Send and request payments.",
    favorite: false
  },
  {
    id: crypto.randomUUID(),
    title: "Instagram",
    url: "https://www.instagram.com/",
    category: "Social",
    tags: ["friends", "photos"],
    notes: "Social updates, messages, and saved posts.",
    favorite: false
  },
  {
    id: crypto.randomUUID(),
    title: "Discord",
    url: "https://discord.com/channels/@me",
    category: "Social",
    tags: ["chat", "communities"],
    notes: "Messages, servers, clubs, communities, and group chats.",
    favorite: false
  },
  {
    id: crypto.randomUUID(),
    title: "Reddit",
    url: "https://www.reddit.com/",
    category: "Social",
    tags: ["forums", "communities"],
    notes: "Browse communities, advice threads, and niche updates.",
    favorite: false
  },
  {
    id: crypto.randomUUID(),
    title: "YouTube",
    url: "https://www.youtube.com/",
    category: "Entertainment",
    tags: ["videos", "music"],
    notes: "Videos, tutorials, music, and saved channels.",
    favorite: false
  },
  {
    id: crypto.randomUUID(),
    title: "Netflix",
    url: "https://www.netflix.com/",
    category: "Entertainment",
    tags: ["shows", "movies"],
    notes: "Streaming queue and watch list.",
    favorite: false
  },
  {
    id: crypto.randomUUID(),
    title: "Spotify",
    url: "https://open.spotify.com/",
    category: "Entertainment",
    tags: ["music", "podcasts"],
    notes: "Music, playlists, podcasts, and focus sessions.",
    favorite: false
  },
  {
    id: crypto.randomUUID(),
    title: "Amazon",
    url: "https://www.amazon.com/",
    category: "Shopping",
    tags: ["orders", "shopping"],
    notes: "Orders, essentials, wish lists, and quick buys.",
    favorite: false
  },
  {
    id: crypto.randomUUID(),
    title: "Google Maps",
    url: "https://maps.google.com/",
    category: "Travel",
    tags: ["maps", "directions"],
    notes: "Directions, traffic, places, and route planning.",
    favorite: false
  },
  {
    id: crypto.randomUUID(),
    title: "Google Flights",
    url: "https://www.google.com/travel/flights",
    category: "Travel",
    tags: ["flights", "trips"],
    notes: "Compare flights and track trip pricing.",
    favorite: false
  },
  {
    id: crypto.randomUUID(),
    title: "Airbnb",
    url: "https://www.airbnb.com/",
    category: "Travel",
    tags: ["stays", "trips"],
    notes: "Plan stays for trips, weekends, and travel ideas.",
    favorite: false
  },
  {
    id: crypto.randomUUID(),
    title: "United States Tennis Association",
    url: "https://www.usta.com/",
    category: "Tennis",
    tags: ["tennis", "leagues"],
    notes: "Tennis events, leagues, ratings, and local tennis resources.",
    favorite: false
  },
  {
    id: crypto.randomUUID(),
    title: "Tennis Warehouse",
    url: "https://www.tennis-warehouse.com/",
    category: "Tennis",
    tags: ["gear", "racquets"],
    notes: "Research racquets, strings, shoes, and tennis gear.",
    favorite: false
  },
  {
    id: crypto.randomUUID(),
    title: "Mountain Project",
    url: "https://www.mountainproject.com/",
    category: "Climbing",
    tags: ["routes", "outdoors"],
    notes: "Find climbing routes, grades, areas, and route beta.",
    favorite: false
  },
  {
    id: crypto.randomUUID(),
    title: "REI",
    url: "https://www.rei.com/",
    category: "Climbing",
    tags: ["gear", "outdoors"],
    notes: "Outdoor gear, climbing equipment, and trip supplies.",
    favorite: false
  },
  {
    id: crypto.randomUUID(),
    title: "Weather",
    url: "https://weather.com/",
    category: "Utilities",
    tags: ["forecast", "daily"],
    notes: "Check weather before commute, tennis, climbing, or travel.",
    favorite: false
  },
  {
    id: crypto.randomUUID(),
    title: "Google Translate",
    url: "https://translate.google.com/",
    category: "Utilities",
    tags: ["language", "translate"],
    notes: "Translate text, sites, and quick language questions.",
    favorite: false
  },
  {
    id: crypto.randomUUID(),
    title: "MyChart",
    url: "https://www.mychart.org/",
    category: "Health",
    tags: ["medical", "records"],
    notes: "Health messages, appointments, test results, and medical records.",
    favorite: false
  }
];

const emptyDraft = {
  title: "",
  url: "",
  category: "",
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

function sectionTone(category) {
  const section = category || "Unsorted";
  if (sectionTones[section]) return sectionTones[section];
  const tones = ["plum", "blue", "green", "amber", "red", "indigo", "teal", "orange", "slate"];
  let total = 0;
  for (const character of section) total += character.charCodeAt(0);
  return tones[total % tones.length];
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
  const searchRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  }, [links]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

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
      <section className="workspace-grid">
        <aside className="left-dashboard" aria-label="Launchboard controls">
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

        <nav className="section-rail" aria-label="Sections">
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
        </nav>
        </aside>

        <section className="right-dashboard" aria-label="Quick links">

      <section className="toolbar" aria-label="Link controls">
        <div className="search-box">
          <Search size={18} />
          <input
            ref={searchRef}
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

        <section className="links-zone" aria-label="Quick links">
          {favoriteLinks.length > 0 && (
            <div className="favorites-strip" aria-label="Pinned links">
              <div className="strip-label">
                <Pin size={16} />
                Pinned
              </div>
              {favoriteLinks.slice(0, 6).map((link) => (
                <a
                  className={`mini-link tone-${sectionTone(link.category)}`}
                  key={link.id}
                  href={link.url}
                >
                  {link.title}
                  <ArrowUpRight size={14} />
                </a>
              ))}
            </div>
          )}

          <div className="link-board">
            {filteredLinks.map((link) => (
              <article className={`link-card tone-${sectionTone(link.category)}`} key={link.id}>
                <div className="card-topline">
                  <a
                    className="favicon-badge"
                    href={link.url}
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
                  <a className="host-link" href={link.url}>
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
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
