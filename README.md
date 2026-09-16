# 🌌 THE FIVE ELEMENTS — IMPOSTER
> **A Production-Grade Real-Time Multiplayer Deduction Web Game with 3D Elemental Environments**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Render-emerald?style=for-the-badge&logo=render)](https://fakers-the-imposter-game.onrender.com/)
[![Built With](https://img.shields.io/badge/Stack-React%2018%20%7C%20Three.js%20%7C%20Socket.IO%20%7C%20Supabase-purple?style=for-the-badge)](https://fakers-the-imposter-game.onrender.com/)
[![Tests](https://img.shields.io/badge/Tests-18%20Passed%20%7C%2042%20Audit%20Passed-blue?style=for-the-badge)](https://fakers-the-imposter-game.onrender.com/)
[![License](https://img.shields.io/badge/License-MIT-amber?style=for-the-badge)](#-license)

🎮 **Play Live Now**: [https://fakers-the-imposter-game.onrender.com/](https://fakers-the-imposter-game.onrender.com/)

---

## 🏛️ Game Concept & Lore

In the ancient cosmological council, five elemental realms convene to maintain universal equilibrium:

* **🌍 PRUDHVI (Earth & Stone)** — *Steadfast, resilient, and unyielding as ancient bedrock.*
* **💨 VAYU (Air & Wind)** — *Swift, invisible, and carrying whispers across the skies.*
* **🌊 JAL (Water & Ocean)** — *Fluid, deep, reflecting light and masking secrets in the abyss.*
* **🌌 AAKASH (Space & Cosmos)** — *Boundless, eternal, holding the stars in orbital dance.*
* **🔥 AGNI (Fire & Energy)** — *Radiant, fierce, consuming shadows with incandescent heat.*

### 🎭 How Each Round Works:
1. **The Public Theme**: Broadcasted simultaneously to all five elemental teams and the Supreme Arbiter.
2. **The Secret Keyword**: Authoritatively dispatched to **exactly four normal teams**.
3. **The Imposter**: Exactly **one team** is secretly designated as the **Imposter** and receives **no keyword**.
4. **The Discussion & Deduction**: Teams subtly discuss the topic without giving away the exact keyword. The Imposter must blend into the conversation, decipher the word from context clues, and deflect suspicion.
5. **The Buzzer & Accusations**: Teams buzz in using the tactile buzzer orb to cast council accusations against the suspected imposter realm.
6. **The Truth Reveal**: The Supreme Arbiter triggers the synchronized reveal, unmasking the imposter, awarding bonuses for evasion and keen detection, and updating leaderboard standings.

---

## 🌌 3D Elemental Environments ("One Game System, Five Elemental Worlds")

Every team realm features a dedicated, high-performance **Three.js WebGL canvas** that immerses players directly inside their elemental world while preserving identical game controls and glassmorphic UI clarity:

| Realm | 3D Hero Artifact | Particle & Atmospheric System | Palette |
| :--- | :--- | :--- | :--- |
| **🌍 PRUDHVI** | Ancient monolithic dodecahedron geode with perturbed mineral facets & crystal lattice | 280+ rising sediment spore particles, warm directional sunbeams & moss-emerald ambient glow | Emerald `#10b981`, Amber `#d97706`, Slate |
| **💨 VAYU** | Sculptural parametric wind vortex (*Torus Knot*) with dynamic triple wind rings | 420+ streamline particles tracing helical vortex orbits with high-altitude atmospheric mist | Cyan `#06b6d4`, Electric Teal `#38bdf8` |
| **🌊 JAL** | Pulsating oceanic fluid sphere with dynamic harmonic wave vertex displacement & caustics | 320+ rising micro-bubbles wobbling with fluid sine-waves & underwater god rays | Ocean Blue `#3b82f6`, Azure `#60a5fa` |
| **🌌 AAKASH** | Celestial planetoid core with dual tilted holographic planetary particle rings & 3 orbiting satellites | 550+ multi-depth parallax starfield particles & stellar nebula glow | Astral Violet `#a855f7`, Magenta `#e879f9` |
| **🔥 AGNI** | Incandescent volcanic magma core with animated fissure displacement & orbiting obsidian shards | 380+ rising ember spark particles with turbulent velocity acceleration & solar corona flare | Crimson `#f43f5e`, Molten Gold `#f97316` |

---

## 🔐 Authentication Credentials (3-Field Gateway)

To enter the council, each player authenticates via the **Universal Elemental Gateway**:
1. **User Name / Player Name**: Your personal nickname or handle (e.g. `Alex`, `Commander Snehith`, `Arbiter`)
2. **Team Name / Realm Identifier**: The target elemental realm or admin console
3. **Secret Access Key / Password**: The realm's security password

| Role / Elemental Realm | Team Name / Realm Identifier | Secret Access Key (Password) | Dashboard & Permissions |
| :--- | :--- | :--- | :--- |
| **Supreme Arbiter (Admin)** | `admin` | `Adm!N7308` | Full game orchestration, timer controls, reveals, presets |
| **PRUDHVI (Earth)** | `prudhvi` | `PruD#v!236;` | Earth 3D Realm Dashboard, Secret Card & Buzzer |
| **VAYU (Air)** | `vayu` | `V@yU378` | Air 3D Realm Dashboard, Secret Card & Buzzer |
| **JAL (Water)** | `jal` | `J@L135` | Water 3D Realm Dashboard, Secret Card & Buzzer |
| **AAKASH (Cosmos)** | `aakash` | `A@Ka$H124` | Cosmos 3D Realm Dashboard, Secret Card & Buzzer |
| **AGNI (Fire)** | `agni` | `@Gn!246` | Fire 3D Realm Dashboard, Secret Card & Buzzer |

---

## ⚡ Core Technical Features

* **🛡️ Zero-Secret-Leakage Security Boundary**:
  - The secret keyword is **never** sent over the wire to the imposter client.
  - Role-isolated server projections prevent inspection through DOM inspection, `data-*` attributes, WebSocket payloads, or browser storage.
  - **Visual Camouflage**: The Imposter's dashboard preserves standard layout structure to prevent shoulder-surfing/screen-peeking.
* **👁️ Privacy Visor**:
  - Built-in **Shield Card** toggle on the secret word card allows in-person players to veil their screen at live party events.
* **⏱️ Server-Authoritative Synchronized Clock**:
  - Millisecond-precision server epoch calculation (`Math.max(0, endsAt - now)`).
  - Resilient to network jitter and page reloads; includes pause/resume and $\pm 15\text{s}$ quick adjustments for the Arbiter.
* **🔔 Monotonic Real-Time Buzzer Queue**:
  - Sub-millisecond ranked buzzer queue with duplicate rejection and instant lockout modes (**All Teams Can Buzz** vs **First Buzzer Only**).
  - Keyboard shortcuts (<kbd>Spacebar</kbd> / <kbd>Enter</kbd>) with synthetic Web Audio feedback.
* **👑 Supreme Arbiter Command Center**:
  - Full game lifecycle control (`START ROUND`, `OPEN BUZZER`, `LOCK ROUND`, `REVEAL ANSWER`, `NEXT ROUND`, `RESET GAME`).
  - Confirmation modals to safeguard against accidental reveals or match resets.
  - **Curated Library (57+ Presets across 15+ Categories)**: Instant search and 1-click preset shuffling.
* **🏆 Dynamic Scoring Engine**:
  - Correct Imposter Detection: **+20 pts**
  - Fastest Correct Buzzer Bonus: **+10 pts**
  - Imposter Deception / Escape Bonus: **+30 pts** (awarded if $\le 1$ team guessed correctly)
* **💾 Supabase Database Persistence**:
  - Automatically records completed round logs, imposter history, and cumulative match standings.
* **♿ Performance & Accessibility**:
  - GPU-accelerated Three.js rendering with pointer parallax lerping, responsive canvas resizing, WebGL fallback detection, and `@media (prefers-reduced-motion)` compliance.

---

## 🛠️ Technology Stack

```
Frontend:
  ├── React 18 (SPA) & Vite 5.4
  ├── TypeScript 5.7
  ├── Three.js (WebGL 3D Elemental Environments)
  ├── Tailwind CSS 3.4 (Glassmorphism & Responsive Layout)
  ├── Lucide Icons & Canvas Confetti
  └── Web Audio API Synthesizer

Backend & Real-Time Engine:
  ├── Node.js 20+ (ES Modules)
  ├── Express 4.21
  ├── Socket.IO 4.8 (WebSocket Rooms & Events)
  ├── JWT (JSON Web Tokens) & Bcryptjs
  └── Supabase SDK (@supabase/supabase-js)

Testing & Verification:
  ├── Vitest (Unit & Engine Test Suite)
  └── Custom Automated E2E Concurrency & Security Batteries (42-Point Audit)
```

---

## 🚀 Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/SnehithG730/Fakers-The-Imposter-Game.git
cd Fakers-The-Imposter-Game
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the project root:
```env
PORT=3000
JWT_SECRET=super_secret_elemental_jwt_key_2026_five_elements_imposter
SUPABASE_URL=https://zbfl7g6kepj3vvehvmns.supabase.co
SUPABASE_KEY=sb_publishable_ZBfL7g6kEPj3vvEHvmns9g_Cuzw7N-V
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
npm start
```

### 6. Run Test & Audit Batteries
```bash
# Run Vitest unit & game engine suite (18/18)
npm test

# Run full 42-point multi-client security & synchronization audit
node test/full_system_audit.cjs

# Run Arbiter controls verification
node test/verify_admin_controls.cjs

# Run Multi-Team interface verification
node test/verify_teams.cjs
```

---

## 🌐 Cloud Deployment (Render)

This repository includes a [`render.yaml`](./render.yaml) specification:
1. Create a **Web Service** on [Render](https://render.com).
2. Connect the GitHub repository `SnehithG730/Fakers-The-Imposter-Game`.
3. **Build Command**: `npm install && npm run build`
4. **Start Command**: `npm start`
5. Supply environment variables (`PORT=3000`, `JWT_SECRET`, `SUPABASE_KEY`).

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for details.

---

<p align="center">
  <b>THE FIVE ELEMENTS — IMPOSTER</b> • Real-time multiplayer deduction for LAN, parties, and competitive gaming.
</p>
