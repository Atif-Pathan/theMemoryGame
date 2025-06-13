import { useState, useEffect } from "react";
import CardContainer from "./CardContainer";
import GameHeader from "./GameHeader";
import "../styles/gameManager.css";

export default function GameManager({ 
    difficulty, 
    allEmojisMetaData, 
    currentScore, 
    onScoreUpdate, 
    onGameOver, 
    onBackToMenu, 
    gameReset 
}) {
    const [round, setRound] = useState(1);
    const [currentRoundCards, setCurrentRoundCards] = useState([]);
    const [preloadedImages, setPreloadedImages] = useState({})
    const [usedIDs, setUsedIDs] = useState(new Set());
    const [isInitialRoundCreated, setIsInitialRoundCreated] = useState(false);
    const [clickedCardHexes, setClickedCardHexes] = useState(new Set());
    const [showName, setShowName] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [imagesFetchTrigger, setImagesFetchTrigger] = useState(0);

    // Fisher - Yates shuffle algo - helper functions to shuffle an array
    const shuffle = ([...arr]) => {
        let m = arr.length;
        while (m) {
            const i = Math.floor(Math.random() * m--);
            [arr[m], arr[i]] = [arr[i], arr[m]];
        }
        return arr;
    };
    const sampleSize = ([...arr], n = 1) => shuffle(arr).slice(0, n);
    
    // Separate function for initial round creation - does NOT increment round
    const createInitialRound = (batchSize = difficulty * 4) => {
        // console.log('Creating initial round - round should stay at 1');
        const availableEmojis = allEmojisMetaData.filter((emoji) => !usedIDs.has(emoji.hexcode))
        if (availableEmojis.length > 0 && availableEmojis.length < batchSize) {
            console.warn("Not enough unique emojis left for initial round!");
            return [];
        }

        const newBatch = sampleSize(availableEmojis, batchSize);
        const newCards = newBatch.map(emoji => ({ 'hex': emoji.hexcode, 'name': emoji.annotation}));

        setUsedIDs(prevIDs => {
            const newUsedIDs = new Set(prevIDs);
            newBatch.forEach(emoji => newUsedIDs.add(emoji.hexcode));
            return newUsedIDs;
        })

        setCurrentRoundCards(newCards);
        // Do NOT increment round for initial setup
        setImagesFetchTrigger(prev => prev + 1);
        // console.log('Initial round created - round is:', 1);
    };
    
    // Function for advancing to next round - DOES increment round
    const advanceToNextRound = (batchSize = difficulty * 4) => {
        // console.log('Advancing to next round from round:', round);
        const availableEmojis = allEmojisMetaData.filter((emoji) => !usedIDs.has(emoji.hexcode))
        if (availableEmojis.length > 0 && availableEmojis.length < batchSize) {
            console.warn("Not enough unique emojis left for next round!");
            return [];
        }

        const newBatch = sampleSize(availableEmojis, batchSize);
        const newCards = newBatch.map(emoji => ({ 'hex': emoji.hexcode, 'name': emoji.annotation}));

        setUsedIDs(prevIDs => {
            const newUsedIDs = new Set(prevIDs);
            newBatch.forEach(emoji => newUsedIDs.add(emoji.hexcode));
            return newUsedIDs;
        })

        setCurrentRoundCards(newCards);
        setRound(prevRound => prevRound + 1); // Increment round for next round
        setImagesFetchTrigger(prev => prev + 1);
        // console.log('Advanced to round:', round + 1);
    };

    const handleCardClick = (clickedHex) => {
        if (clickedCardHexes.has(clickedHex)) {
            // Game over - reset to round 1 and clear clicked cards
            setClickedCardHexes(new Set());
            setRound(1);
            setGameOver(true);
            onGameOver();
            return;
        } else {
            // Clear game over state on successful click
            if (gameOver) {
                setGameOver(false);
                setClickedCardHexes(new Set());
                setImagesFetchTrigger(prev => prev + 1);
            }
            
            const newScore = currentScore + 1;
            onScoreUpdate(newScore);
            const newClickedCards = new Set(clickedCardHexes).add(clickedHex);
            setClickedCardHexes(newClickedCards);
            
            // Check if we've clicked all cards in the current round
            if (newClickedCards.size === currentRoundCards.length) {
                // Perfect round completed - advance to next round
                // console.log(`Round ${round} completed! Clicked ${newClickedCards.size} out of ${currentRoundCards.length} cards`);
                setClickedCardHexes(new Set());
                advanceToNextRound(difficulty * 4);
            } else {
                // If the round is not over, just shuffle the current cards
                setCurrentRoundCards(prevCards => shuffle([...prevCards]));
                // console.log('cards shuffled');
            }
        }
    };

    const handleShowName = () => {
        setShowName(!showName);
    }

    useEffect(() => {
        if (gameReset && currentScore === 0) {
            setGameOver(false);
        }
    }, [gameReset, currentScore]);

    // Create initial round only once when metadata loads
    useEffect(() => {
        if (allEmojisMetaData.length > 0 && !isInitialRoundCreated) {
            // console.log('useEffect triggered - creating initial round');
            createInitialRound();
            setIsInitialRoundCreated(true);
        }
    }, [allEmojisMetaData.length, isInitialRoundCreated]); // Changed dependency to length to avoid object reference issues

    // fetch png blob whenever we need new images
    useEffect(() => {
        if (currentRoundCards.length === 0) {
            return;
        }

        const preloadRoundImages = async () => {
            // console.log('Starting to fetch images for round:', round);
            
            const imagePromises = currentRoundCards.map(async (card) => {
                try {
                    const encodedHex = encodeURIComponent(card.hex);
                    const imageUrl = `/api/emojis/${encodedHex}/noto/png/128`;

                    const response = await fetch(imageUrl);
                    if (!response.ok) {
                        throw new Error(`Failed to fetch PNG for ${card.name}`);
                    }
                    const blob = await response.blob();
                    const blobUrl = URL.createObjectURL(blob);
                    
                    return { hex: card.hex, blobUrl: blobUrl };
                } catch (error) {
                    console.error(error);
                    return { hex: card.hex, blobUrl: null };
                }
            });

            const loadedImages = await Promise.all(imagePromises);

            Object.values(preloadedImages).forEach(url => {
                if (url) URL.revokeObjectURL(url);
            });

            const newImageMap = {};
            loadedImages.forEach(img => {
                if (img.blobUrl) {
                    newImageMap[img.hex] = img.blobUrl;
                }
            });

            setPreloadedImages(newImageMap);
            // console.log('Images loaded for round:', round, 'Image count:', Object.keys(newImageMap).length);
        };

        preloadRoundImages();

        return () => {
            Object.values(preloadedImages).forEach(url => {
                if (url) URL.revokeObjectURL(url);
            });
        };
        
    }, [imagesFetchTrigger, currentRoundCards.length]);

    // console.log('Current round:', round, 'emojis clicked:', clickedCardHexes.size);
    
    return (
        <div className="game-container">
            <button onClick={onBackToMenu} className="back-button">← Back to Menu</button>
            
            <GameHeader 
                currentScore={currentScore}
                difficulty={difficulty}
                round={round}
                showName={showName}
                onToggleName={handleShowName}
                gameOver={gameOver}
            />
            
            <CardContainer 
                cards={currentRoundCards} 
                images={preloadedImages}
                onCardClick={handleCardClick}
                showName={showName}
            />
        </div>
    )
}