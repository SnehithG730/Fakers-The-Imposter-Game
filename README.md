# 🌌 THE FIVE ELEMENTS — IMPOSTER
> **A Production-Grade Real-Time Multiplayer Deduction Web Game**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Render-emerald?style=for-the-badge&logo=render)](https://fakers-the-imposter-game.onrender.com/)
[![Built With](https://img.shields.io/badge/Stack-React%20%7C%20TypeScript%20%7C%20Socket.IO%20%7C%20Supabase-purple?style=for-the-badge)](https://fakers-the-imposter-game.onrender.com/)
[![License](https://img.shields.io/badge/License-MIT-amber?style=for-the-badge)](#license)

🎮 **Play Live Now**: [https://fakers-the-imposter-game.onrender.com/](https://fakers-the-imposter-game.onrender.com/)

---

## 🏛️ Game Concept & Lore

In the ancient cosmological council, five elemental realms convene to guard universal balance:

* **PRUDHVI (Earth)** — *Steadfast, resilient, and unyielding as ancient stone.* (Emerald Green `🌍`)
* **VAYU (Air)** — *Swift, invisible, and carrying whispers across the realm.* (Sky Cyan `💨`)
* **JAL (Water)** — *Fluid, deep, reflecting light and masking secrets.* (Ocean Blue `🌊`)
* **AAKASH (Cosmos)** — *Boundless, eternal, holding the stars in orbital dance.* (Celestial Violet `🌌`)
* **AGNI (Fire)** — *Radiant, fierce, consuming shadows with incandescent heat.* (Amber Flame `🔥`)

### How Each Round Works:
1. **The Public Theme**: Known to all five elemental teams and the Supreme Arbiter.
2. **The Secret Keyword**: Distributed securely from the authoritative server to **exactly four teams**.
3. **The Imposter**: Exactly **one team** is designated as the **Imposter** and receives **no keyword**.
4. **The Discussion & Deduction**: Teams subtly discuss the secret topic without giving away the exact keyword. The imposter must blend in, decipher the keyword from context, and deflect suspicion.
5. **The Buzzer & Accusations**: Teams buzz in to cast council accusations and identify the deceiver.
6. **The Reveal**: The Supreme Arbiter reveals the truth, calculates scores, and rewards deception or keen deduction.

---

## ⚡ Key Features

* **🛡️ Zero-Secret-Leakage Security Boundary**:
  - The secret keyword is **never** sent over the wire to the imposter client.
  - Server-side role projection isolates data in memory, preventing inspection via DOM, `data-*` attributes, WebSocket frames, or browser localStorage.
  - **Visual Camouflage**: The Imposter's interface uses the identical color scheme and layout as normal teams to prevent screen peeking.
* **👁️ Privacy Visor**:
  - Built-in **Shield Card** toggle on the secret word card so players can shield their screen when playing in-person at LAN/party gatherings.
* **⏱️ Server-Authoritative Synchronized Timer**:
  - Millisecond-precision server epoch calculation (`Math.max(0, endsAt - now)`).
  - Survives page reloads without clock drift or client-side manipulation.
  - Quick adjustments ($\pm 15\text{s}$) and Pause/Resume controls for the Arbiter.
* **🔔 Real-Time High-Precision Buzzer Queue**:
  - Synchronous buzzer states (`BUZZER LOCKED`, `BUZZER OPEN`, `BUZZED`).
  - Supports both **All Teams Can Buzz** (ranked millisecond queue) and **First Buzzer Only** (instant lockout).
  - Tactile <kbd>Spacebar</kbd> / <kbd>Enter</kbd> keyboard shortcuts with Web Audio API synthetic audio feedback.
* **⚖️ Council Accusation & Voting**:
  - Interactive voting modal to accuse suspected elemental realms.
  - Real-time vote tracking for the Arbiter.
* **👑 Supreme Arbiter Command Center**:
  - Full game lifecycle control (`START ROUND`, `OPEN BUZZER`, `LOCK ROUND`, `REVEAL ANSWER`, `NEXT ROUND`, `RESET GAME`).
  - **Confirmation Modals** to prevent accidental early reveals or resets.
  - **Curated Library**: 57+ built-in presets across 15+ categories (Mythology, Cyberpunk, Science, Cinema, History, Pop Culture) with instant search and 1-click **Shuffle Preset**.
* **🏆 Scoring & Leaderboard Engine**:
  - Correct Imposter Detection: **+20 pts**
  - Fastest Correct Buzzer Bonus: **+10 pts**
  - Imposter Deception / Escape Bonus: **+30 pts** (awarded if $\le 1$ team guessed correctly)
* **💾 Supabase Database Integration**:
  - Persists completed round outcomes, imposter history, and scores to Supabase PostgreSQL.
* **♿ Full Accessibility & Responsiveness**:
  - High-contrast typography, WCAG focus-visible indicators, semantic ARIA labels, and `@media (prefers-reduced-motion)` support.

---

## 🔐 Default Credentials (1-Click Login Ready)

| Role / Realm | Account Identifier | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Supreme Arbiter (Admin)** | `admin` | `admin123` | Complete game & timer controls, reveals, presets |
| **PRUDHVI (Earth)** | `prudhvi` | `prudhvi123` | Team Dashboard & Buzzer |
| **VAYU (Air)** | `vayu` | `vayu123` | Team Dashboard & Buzzer |
| **JAL (Water)** | `jal` | `jal123` | Team Dashboard & Buzzer |
| **AAKASH (Cosmos)** | `aakash` | `aakash123` | Team Dashboard & Buzzer |
| **AGNI (Fire)** | `agni` | `agni123` | Team Dashboard & Buzzer |

---

## 🛠️ Technology Stack

```
Frontend:
  ├── React 18 (SPA)
  ├── TypeScript 5.7
  ├── Tailwind CSS 3.4
  ├── Lucide Icons & Canvas Confetti
  ├── Web Audio API Synthesizer
  └── Vite 5.4

Backend & Real-Time Engine:
  ├── Node.js (ES Modules)
  ├── Express 4.21
  ├── Socket.IO 4.8 (WebSocket Rooms & Events)
  ├── JWT (JSON Web Tokens) & Bcryptjs
  └── Supabase SDK (@supabase/supabase-js)

Testing & Tooling:
  ├── Vitest (Unit & Security Test Suite)
  └── Custom Automated E2E Concurrency & Security Batteries
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

### 3. Environment Variables
Create a `.env` file in the root directory:
```env
PORT=3000
JWT_SECRET=super_secret_elemental_jwt_key_2026_five_elements_imposter
SUPABASE_URL=https://zbfl7g6kepj3vvehvmns.supabase.co
SUPABASE_KEY=sb_publishable_ZBfL7g6kEPj3vvEHvmns9g_Cuzw7N-V
```

### 4. Run Development Server
```bash
# Start both client and server in development mode
npm run dev
```

### 5. Build for Production
```bash
npm run build
npm start
```

### 6. Run Test Suites
```bash
# Run Vitest test suite
npm test

# Run multi-client end-to-end security audit
node test/full_system_audit.cjs
```

---

## 🌐 Cloud Deployment

### Deploy to Render (Recommended)
This repository includes a [`render.yaml`](./render.yaml) specification:
1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your GitHub repository `SnehithG730/Fakers-The-Imposter-Game`.
3. **Build Command**: `npm install && npm run build`
4. **Start Command**: `npm start`
5. Set environment variables (`PORT=3000`, `JWT_SECRET`, `SUPABASE_KEY`).

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for details.

---

<p align="center">
  <b>THE FIVE ELEMENTS — IMPOSTER</b> • Built for real-time multiplayer party deduction.
</p>
