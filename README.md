# EmojiRecall: Memory Challenge Game 🧠

🚀 **[Play EmojiRecall](https://the-memory-game-five.vercel.app/)** 
---

## 💡 **Overview**
This project, developed as part of The Odin Project's React curriculum, is a dynamic memory game that challenges players to click on each emoji card exactly once. Built with React and powered by real-time emoji data from external APIs, the game tests memory skills while progressively increasing difficulty through multiple rounds. The focus was on mastering React hooks, state management, API integration, and implementing engaging game mechanics.

## 🛠️ Core Concepts & Implementation

This project was a deep dive into the practical application of core React principles.

#### 1. **`useEffect` for Side Effects & Performance**
The `useEffect` hook was central to handling all interactions with the outside world (the API) and optimizing performance.
-   **Coordinated Effects:** I used multiple `useEffect` hooks for different game phases: one for the initial one-time metadata fetch (`[]`), and another that listens to a state trigger (`[imagesFetchTrigger]`) to fetch images only when a new round begins.
-   **Image Preloading:** To ensure a smooth user experience, emoji PNGs are fetched and cached as blob URLs *before* the round starts. This prevents loading indicators from appearing on individual cards.
-   **Memory Management:** The image-fetching effect returns a crucial cleanup function that calls `URL.revokeObjectURL()` on the previous round's images, preventing client-side memory leaks.

#### 2. **Strategic State Management (`useState`)**
The entire game loop is driven by a carefully managed state architecture.
-   **Efficient Duplicate Detection:** A JavaScript `Set` is used for `clickedCardHexes` to achieve O(1) time complexity when checking if an emoji has already been selected. This is significantly more performant than an array's `.includes()` method.
-   **Interconnected State:** I managed interconnected state variables (`round`, `score`, `clickedCardHexes`) without mutations to control the game loop, from shuffling cards with the **Fisher-Yates algorithm** to handling game resets and round progression logic.

#### 3. **Serverless API Proxy**
To solve real-world API challenges, the application uses a serverless backend.
-   **Challenge:** Direct client-side requests to the external emoji API were blocked by CORS.
-   **Solution:** I built a custom API proxy using **Vercel Serverless Functions**. All frontend requests to `/api/*` are routed to these functions, which then securely fetch data from the external API.
-   **Implementation:** I created separate endpoints to handle different response types: one for fetching JSON metadata (`/api/emojis`) and another for fetching binary image data (`/api/emojis/[hex]/...`).

#### 4. **Component-Driven UI & User Experience**
The application follows a clear component-based architecture and is packed with user-centric features.
-   **Architecture:** `GameManager` acts as the "container" component holding all state and logic, while components like `CardContainer` and `Card` are purely "presentational."
-   **Difficulty Scaling:** An interactive slider on the landing page allows users to select the grid size, from 3×4 up to 10×4.
-   **Data Persistence:** The user's best score and preferred theme (dark/light) are saved to `localStorage`, persisting across browser sessions.
-   **Responsive Design:** The layout is fully responsive, providing an optimal experience on desktop, tablet, and mobile devices.

## 🎯 What I Learned

-   **The Power of the Right Tool:** Choosing the correct data structure (a `Set` over an `Array` for tracking clicks) has a major impact on performance and code simplicity.
-   **Solving Real-World Problems:** I learned to solve practical issues like CORS and memory management with specific architectural choices (serverless functions and `useEffect` cleanup functions).
-   **Separation of Concerns:** The project reinforced the importance of separating logic (container components, API functions) from presentation (UI components), leading to more maintainable code.
-   **Declarative Effects:** I gained a deeper understanding of how to write declarative `useEffect` hooks that respond to state changes rather than imperatively calling functions.

## 🛠️ **Technologies**
- **React** + **Vite** (Component architecture & development)
- **Vercel Serverless Functions** (API proxy & deployment)  
- **emoji.family API** (Real-time emoji data)
- **CSS3** (Animations, responsive design, theming)
- **localStorage** (Score & preference persistence)

## 🔮 **Future Improvements**
- **Timer-based challenges** for speed gameplay modes
- **Universal Leaderboard** for more competition between users  
- **Statistics dashboard** for detailed progress analytics

---