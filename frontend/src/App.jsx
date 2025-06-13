import { useState, useEffect } from "react";
import "./App.css";
import GameManager from "./components/GameManager";
import LandingPage from "./components/LandingPage";

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState(4);
  const [allEmojisMetaData, setAllEmojisMetaData] = useState([]);
  const [currentScore, setCurrentScore] = useState(0);
  const [gameReset, setGameReset] = useState(false);

  const handleStartGame = (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    setCurrentScore(0); // Reset score when starting new game
    setGameReset(true); // Set reset flag to clear any game over states
    setGameStarted(true);
    // Clear reset flag after component mounts
    setTimeout(() => setGameReset(false), 200);
  };

  const handleBackToMenu = () => {
    setGameStarted(false);
    setCurrentScore(0); // Reset score when going back to menu
    setGameReset(false); // Clear reset flag
  };

  const handleScoreUpdate = (newScore) => {
    setCurrentScore(newScore);
    
    // Update best score if this is better
    const currentBest = parseInt(localStorage.getItem("emojiRecallBestScore") || "0");
    if (newScore > currentBest) {
      localStorage.setItem("emojiRecallBestScore", newScore.toString());
    }
  };

  const handleGameOver = () => {
    // Just reset current score - don't set gameReset flag
    // This allows the game over message to persist until user clicks a card
    setCurrentScore(0);
  };

  useEffect(() => {
      const fetchAllEmojis = async () => {
          try {
              const response = await fetch(`/api/emojis`);
              const data = await response.json();
              setAllEmojisMetaData(data);                
          } catch (error) {
              console.log(error);   
          }
      }

      fetchAllEmojis();
      // console.log('all meta data fetched!');
      
  }, []) // runs once on mount to pull all of the data for emojis

  return (
    <>
      {gameStarted ? (
        <GameManager
          difficulty={difficulty}
          allEmojisMetaData={allEmojisMetaData}
          currentScore={currentScore}
          onScoreUpdate={handleScoreUpdate}
          onGameOver={handleGameOver}
          onBackToMenu={handleBackToMenu}
          gameReset={gameReset}
        />
      ) : (
        <LandingPage onStartGame={handleStartGame} />
      )}
    </>
  );
}

export default App;