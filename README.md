<div align="center">

# 🏰 CoC Price Checker

**A data-driven valuation tool for Clash of Clans bundles, gem packs, and trader items.**

*Stop guessing whether that 199 kr offer is a deal — let the math tell you.*

[Features](#-features) • [How it works](#-how-it-works) • [Quick start](#-quick-start) • [Usage](#-usage) • [Roadmap](#%EF%B8%8F-roadmap)

<br>

[![License: MIT](https://img.shields.io/badge/License-MIT-3fb950?style=for-the-badge&labelColor=1a2129)](LICENSE)
[![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-f7df1e?style=for-the-badge&logo=javascript&logoColor=black&labelColor=1a2129)](https://developer.mozilla.org/docs/Web/JavaScript)
[![No Deps](https://img.shields.io/badge/Dependencies-Zero-3fb950?style=for-the-badge&labelColor=1a2129)](#-tech-stack)

</div>

---

## 🎯 The problem

Supercell sells gems, magic items, and resources through countless bundles — but **never lists a price per item**. Is `Build me up` (3 builder potions + 20 wall rings for 65 kr) a steal or a rip-off? Is the trader's 1000-gem rune worth more than a 500-gem book?

You can stare at the offers and guess. Or you can solve it.

## ✨ Features

| | |
|---|---|
| 🛒 **Universal bundle tracking** | Shop offers, gem packs, in-game trader entries — all in one place |
| 📊 **Estimated SEK value per item** | Computed live via ridge-regularized least squares across all bundles |
| 🎯 **Deal score** | See instantly which offers are bargains (`>1.0x`) and which are traps (`<1.0x`) |
| 🕒 **Bundle history** | Mark active/inactive, track what you bought, see when items last appeared |
| 🔎 **Search & filter** | Find every bundle that ever contained Book of Heroes |
| 💾 **Local-first data** | Everything in `localStorage`. Export to JSON whenever you want |
| 🔌 **Zero dependencies** | No npm. No build. No backend. Just open `index.html` |

## 📊 How it works

The core insight: each bundle is one equation in a system.

A bundle that contains `qty_a` of item A and `qty_b` of item B for `P` kronor gives us:

```
qty_a · price(A) + qty_b · price(B) = P
```

For example, **Build me up** (65 kr):

```
3 · price(Builder Potion) + 20 · price(Wall Ring) = 65
```

That's one equation, two unknowns — not solvable alone. But add another bundle that contains a Builder Potion and the system starts to constrain itself. Trader entries link gems to items (`1 · price(Book of Heroes) − 500 · price(Gem) = 0`), and official gem packs anchor gems to SEK (`500 · price(Gem) = 65`). With ~30 bundles seeded by default, the system becomes **overdetermined** — more equations than unknowns — and we solve it the way every regression problem gets solved:

$$\hat{x} = \arg\min_{x \geq 0} \, \lVert A x - b \rVert^2 + \lambda \lVert x \rVert^2$$

This is **ridge-regularized least squares**. The `λ` term keeps things stable when an item appears in only one or two bundles. Negative results (which can sneak in from noise) get clipped to zero. The result is a single SEK value for every item — and every new bundle you add either confirms or challenges those estimates.

The whole solver lives in [`src/regression.js`](src/regression.js) — about 80 lines of plain JavaScript. No `numpy`, no `mathjs`.

## 🚀 Quick start

### Clone

```bash
git clone https://github.com/WilleGyr/CoCPriceChecker.git
cd CoCPriceChecker
```

### Open

```bash
# Windows
start index.html

# macOS
open index.html

# Linux
xdg-open index.html
```

Or, for proper image loading and dev tooling, run a local server:

```bash
python -m http.server 8000
# then visit http://localhost:8000
```

That's it. No `npm install`. No build step. No backend.

## 🎮 Usage

### Adding a bundle

1. Click **+ Ny bundle**
2. Pick the type:
   - **Shop** — bought with SEK, contents are what you receive
   - **Gem-pack** — bought with SEK, contents are gems
   - **Trader** — bought with gems (add `Gem` with a **negative** qty as the cost)
3. Fill in price, date, contents
4. Toggle `Active in shop` if it's currently available, `Purchased by me` if you've bought it
5. Save

### Reading the valuation

Open the **Valuation** tab and click **Recompute valuation**:

- **Value per item** — estimated SEK value, sorted highest-first. The *Bundles* column shows how many equations the model used for that item — more = higher confidence.
- **Deal score per bundle** — every active bundle ranked by `value / price`:
  - `> 1.0x` → 🟢 good deal (you get more value than you pay)
  - `< 1.0x` → 🔴 overpriced

### Backup & restore

Open the **Data** tab → **Export JSON**. All bundles export to one file you can import later or sync between devices.

## 🛠️ Tech stack

| | |
|---|---|
| **Frontend** | Vanilla JavaScript, HTML, CSS — no React, no Vue, no build tools |
| **Persistence** | `localStorage` + JSON import/export |
| **Math** | Custom Gaussian-elimination solver with partial pivoting + Tikhonov regularization (~80 LoC) |
| **Styling** | Hand-rolled dark mode CSS, no Tailwind, no preprocessor |

## 📁 Project structure

```
.
├── index.html           # App shell — tabs, modals, layout
├── style.css            # Dark-mode UI styling
├── src/
│   ├── data.js          # Item catalog + seed bundles (shop / gem-pack / trader)
│   ├── regression.js    # Ridge least-squares solver
│   └── app.js           # UI rendering, state, persistence
├── images/              # Magic item icons + resource icons
├── .claude/
│   └── launch.json      # Local dev server config
├── LICENSE
└── README.md
```

## 🗺️ Roadmap

- [ ] Hero potion / Research potion / Clock tower potion item images
- [ ] Per-bundle "exclude from valuation" toggle (e.g. when a bundle is a clear outlier)
- [ ] Date range — track when bundles appeared/disappeared from the shop
- [ ] Confidence intervals on estimated values
- [ ] Highlight which bundles drive the largest valuation changes when added
- [ ] Multi-currency support (EUR, USD)
- [ ] GitHub Pages deployment with shareable bundle library
- [ ] Mobile-first responsive polish

## 🤝 Contributing

PRs welcome! Particularly helpful:

- 🖼️ **Missing item images** — Hero potion, Research potion, Clock tower potion
- 🎁 **Bundle data** — new shop offers as they appear
- 🌍 **Translations** — UI is currently English-only

For larger changes, please open an issue first to discuss the approach.

## 📜 License

[MIT](LICENSE) — do whatever you want, just don't blame me if you waste your gems on a 0.5x deal.

## 🙏 Credits

- Built by [@WilleGyr](https://github.com/WilleGyr) with [Claude Code](https://claude.com/claude-code)
- All Clash of Clans item icons © Supercell — used here for personal/educational purposes only
- This project is **not affiliated with, endorsed by, or sponsored by Supercell**

---

<div align="center">
<sub>Made with too much regression and not enough sleep.</sub>
</div>
