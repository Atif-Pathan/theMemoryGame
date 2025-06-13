import { useState, useEffect } from "react";
import "../styles/landingPage.css";

export default function LandingPage({ onStartGame }) {
  const [difficulty, setDifficulty] = useState(4);
  const [bestScore, setBestScore] = useState(0);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const savedScore = localStorage.getItem("emojiRecallBestScore");
    if (savedScore) {
      setBestScore(parseInt(savedScore));
    }

    const savedTheme = localStorage.getItem("emojiRecallTheme");
    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
    } else {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light"
    );
    localStorage.setItem("emojiRecallTheme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const handleStartGame = () => {
    onStartGame(difficulty);
  };

  const getDifficultyData = (rows) => {
    const configs = {
      3: { color: "#22c55e", icon: "🌱" },
      4: { color: "#3b82f6", icon: "⚡" },
      5: { color: "#8b5cf6", icon: "⭐" },
      6: { color: "#f59e0b", icon: "🔥" },
      7: { color: "#ef4444", icon: "💎" },
      8: { color: "#ec4899", icon: "👑" },
      9: { color: "#6366f1", icon: "♟" },
      10: { color: "#8b5cf6", icon: "🥇" }
    };
    return configs[rows] || configs[4];
  };

  const difficultyData = getDifficultyData(difficulty);

  return (
    <div className="landing-container">
      <div className="landing-content">
        <button
          className="theme-toggle"
          onClick={() => setDarkMode(!darkMode)}
          aria-label="Toggle theme"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>

        {/* Epic Title Section */}
        <div className="hero-section">
          <div className="title-container">
            <h1 className="game-title">
              <span className="title-emoji">🧠</span>
              <span className="title-text">EMOJI</span>
              <span className="title-text recall">RECALL</span>
            </h1>
            <div className="title-glow"></div>
          </div>
          {bestScore > 0 && (
            <p className="best-score-2">Personal Best: {bestScore}</p>
          )}
        </div>

        {/* Enhanced How to Play Section */}
        <div className="rules-section">
          <div className="rules-header">
            <h2 className="rules-title">How to Play</h2>
          </div>
          
          <div className="rules-grid">
            <div className="rule-item">
              <div className="rule-number">01</div>
              <div className="rule-desc">Click emojis you haven't clicked before</div>
            </div>
            
            <div className="rule-item">
              <div className="rule-number">02</div>
              <div className="rule-desc">Cards shuffle after every click</div>
            </div>
            
            <div className="rule-item">
              <div className="rule-number">03</div>
              <div className="rule-desc">Game <strong><u>OVER</u></strong> 💀 if you click same emoji twice</div>
            </div>
            
            <div className="rule-item">
              <div className="rule-number">04</div>
              <div className="rule-desc">Perfect round unlocks new emojis</div>
            </div>
          </div>
        </div>

        {/* Simplified Difficulty Slider */}
        <div className="difficulty-section">
          <div className="difficulty-info">
            <span className="card-count">{difficulty * 4} Cards</span>
            <span className="grid-size">{difficulty} × 4 Grid</span>
          </div>

          <div className="difficulty-slider-container">
            <input
              type="range"
              id="difficulty"
              min="3"
              max="10"
              value={difficulty}
              onChange={(e) => setDifficulty(parseInt(e.target.value))}
              className="difficulty-slider"
              style={{ 
                background: `linear-gradient(to right, ${difficultyData.color} 0%, ${difficultyData.color} ${((difficulty - 3) / 7) * 100}%, var(--bg-elevated) ${((difficulty - 3) / 7) * 100}%, var(--bg-elevated) 100%)`
              }}
            />
            <div className="slider-markers">
              {[3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <div 
                  key={num} 
                  className={`marker ${difficulty === num ? 'active' : ''}`}
                  onClick={() => setDifficulty(num)}
                >
                  {getDifficultyData(num).icon}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="start-section">
          <button className="start-button" onClick={handleStartGame}>
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
}