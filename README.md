# Deeparted 🌊

A local-first shipping operations platform.
*(Named because the ocean is deep, and I'm emo enough to want to depart from this world—mostly a joke, dudes, depending on how much this sprint is dragging).*

## 🛠️ Tech Stack

* **Frontend:** React 19 + Vite
* **Styling:** Tailwind CSS
* **Code Quality:** TypeScript (for app entry points and shared data contracts), ESLint

> 💡 **Note:** The remaining feature screens are still JavaScript/JSX. We are migrating to TypeScript incrementally so UI work doesn't grind to a total halt.

---

## 🗺️ Planned Architecture & Local-First Deployment

Alright dudes, this thing is being built to be totally resilient. The ultimate goal is a containerized, local-first setup that connects back to a larger cloud network.

* **Offline-Ready LAN:** Each port runs its own local server instances. If the internet goes down entirely, operations don't stop—the local setup handles everything seamlessly.
* **Multi-Island Cloud Sync:** When the connection is live, local data syncs up to a central cloud architecture so dudes across different islands can actually cooperate and see real-time updates.
* **Docker Containerization:** Docker will eventually package and spin up the web and API services locally for easy deployment.
* **The Database Exception:** The database will run directly on the host hardware—**not** inside a Docker container.
* **Data Flow & Security:** The frontend never talks directly to the database, dudes. A server-side API handles the authentication, authorization, validation, and the cross-port syncing logic.

---

Sorry for the slow updates. Although I use AI I use it as an assist cause it's hard to maintain if it's completely written by AI. Aight. See ya dudes.
Just email me if you want additional features.
