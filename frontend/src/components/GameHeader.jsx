import { useState, useEffect } from "react";
import "../styles/gameHeader.css";

export default function GameHeader({ 
  currentScore, 
  difficulty, 
  round,
  showName, 
  onToggleName, 
  gameOver 
}) {
  const [bestScore, setBestScore] = useState(0);

  useEffect(() => {
    const savedScore = localStorage.getItem("emojiRecallBestScore");
    if (savedScore) {
      setBestScore(parseInt(savedScore));
    }
  }, [currentScore]); // Update when score changes to reflect new best scores

  return (
    <div className="game-header">
      <div className="score-section">
        <div className="current-score">
          Score: <span className="score-value">{currentScore}</span>
          {gameOver && <span className="game-over-text"> - Game Over! Click any emoji to restart</span>}
        </div>
        <div className="best-score">
          Best: <strong>{bestScore}</strong>
        </div>
      </div>
      
      <div className="grid-info">
        <div className="round-info">Round <span className="round-value">{round}</span></div>
        <span className="grid-size">{difficulty} × 4 Grid</span>
        <span className="card-count">{difficulty * 4} Cards</span>
      </div>
      
      <div className="toggle-section">
        <label className="toggle-container">
          <input 
            type="checkbox" 
            checked={showName} 
            onChange={onToggleName}
            className="toggle-input"
          />
          <span className="toggle-text">Show Names</span>
        </label>
      </div>
    </div>
  );
}