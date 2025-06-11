import { useState, useEffect } from "react";
import CardContainer from "./CardContainer";

export default function GameManager() {
    const [allEmojisMetaData, setAllEmojisMetaData] = useState([]);
    const [round, setRound] = useState(0);
    const [currentRoundCards, setCurrentRoundCards] = useState([]);
    const [preloadedImages, setPreloadedImages] = useState({})
    const [usedIDs, setUsedIDs] = useState(new Set());
    const [isInitialRoundCreated, setIsInitialRoundCreated] = useState(false);
    const [score, setScore] = useState(0);
    const [clickedCardHexes, setClickedCardHexes] = useState(new Set());
    const [showName, setShowName] = useState(false);

    // Fisher - Yates shuffle algo - helper functions to shuffle an array
    const shuffle = ([...arr]) => {
        let m = arr.length;
        while (m) {
            const i = Math.floor(Math.random() * m--);
            [arr[m], arr[i]] = [arr[i], arr[m]];
        }
        return arr;
    };
    const sampleSize = ([...arr], n = 1) => shuffle(arr).slice(0, n); // use this to shuffle array and get top n elements
    
    const refreshCards = (batchSize = 15) => {
        // get available emojis only by filtering agains the usedIDs set
        const availableEmojis = allEmojisMetaData.filter((emoji) => !usedIDs.has(emoji.hexcode))
        if (availableEmojis.length > 0 && availableEmojis.length < batchSize) {
            console.warn("Not enough unique emojis left for a new round!");
            return [];
        }

        // then use the shuffle and sample functions to get the new batch from available emojis
        const newBatch = sampleSize(availableEmojis, batchSize);
        // only holds the necessary info --> hexcode and the name of the emoji
        const newCards = newBatch.map(emoji => ({ 'hex': emoji.hexcode, 'name': emoji.annotation}));

        // update the usedIDs state with new updated set
        setUsedIDs(prevIDs => {
            const newUsedIDs = new Set(prevIDs);
            newBatch.forEach(emoji => newUsedIDs.add(emoji.hexcode));
            return newUsedIDs;
        })

        // update state that holds the current batch of cards
        setCurrentRoundCards(newCards);
        // update the round number
        setRound(prevRound => prevRound + 1);
        console.log('cards refreshed');
    };

    const handleCardClick = (clickedHex) => {
        if (clickedCardHexes.has(clickedHex)) {
            // game over, reset the game
            setScore(0);
            setClickedCardHexes(new Set());
            setRound(1);
            return;
        } else {
            setScore(prevScore => prevScore + 1);
            setClickedCardHexes(prevClicked => new Set(prevClicked).add(clickedHex));
            if ((score + 1) === currentRoundCards.length) {
                // if we get all the emojis and a perfect score
                // then we refresh the cards and start with a new set
                setClickedCardHexes(new Set());
                refreshCards();
            } else {
                // If the round is not over, just shuffle the current cards
                setCurrentRoundCards(prevCards => shuffle([...prevCards]));
                console.log('cards shuffled');
                
            }
        }
    };

    const handleShowName = () => {
        setShowName(!showName);
    }
    
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
    }, []) // runs once on mount to pull all of the data for emojis

    useEffect(() => {
        // Add a guard: only run if metadata is loaded AND the initial round hasn't been created yet.
        if (allEmojisMetaData.length > 0 && !isInitialRoundCreated) {
            refreshCards();
            setIsInitialRoundCreated(true); // Set the flag so this doesn't run again
        }
    }, [allEmojisMetaData, isInitialRoundCreated]);

    // fetch png blob whenever new round starts, i.e currentRoundCards changes
    useEffect(() => {
        if (currentRoundCards.length === 0 || round === 0) {
            return; // if no cards then return
        }

        const preloadRoundImages = async () => {
            // Create an array of promises, one for each card's image fetch
            const imagePromises = currentRoundCards.map(async (card) => {
                try {
                    const encodedHex = encodeURIComponent(card.hex);
                    
                    // Construct the URL to my proxy
                    const imageUrl = `/api/emojis/${encodedHex}/noto/png/128`; // change pixel size if needed

                    const response = await fetch(imageUrl);
                    if (!response.ok) {
                        throw new Error(`Failed to fetch PNG for ${card.name}`);
                    }
                    const blob = await response.blob();
                    const blobUrl = URL.createObjectURL(blob);
                    
                    // Return the hexcode and its corresponding Blob URL
                    return { hex: card.hex, blobUrl: blobUrl };
                } catch (error) {
                    console.error(error);
                    // Return null on failure so we can handle it
                    return { hex: card.hex, blobUrl: null };
                }
            });

            // Wait for all the image fetch promises to resolve
            const loadedImages = await Promise.all(imagePromises);

            // IMPORTANT: Clean up Blob URLs from the *previous* round to prevent memory leaks
            Object.values(preloadedImages).forEach(url => {
                if (url) URL.revokeObjectURL(url);
            });

            // Create a new map/object for the newly loaded images
            const newImageMap = {};
            loadedImages.forEach(img => {
                if (img.blobUrl) {
                    newImageMap[img.hex] = img.blobUrl;
                }
            });

            // Update the state with the new map of preloaded images
            setPreloadedImages(newImageMap);
        };

        preloadRoundImages();

        // clean up old images
        return () => {
            Object.values(preloadedImages).forEach(url => {
                if (url) URL.revokeObjectURL(url);
            });
        };
        
    }, [round])

    // console.log('emojis used so far:', usedIDs.size);
    
    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
            <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center'}}>
                <div className="grid-size">
                    <input type="number" name="rows" id="rows" defaultValue={3} max={10} min={1}/>
                    <p>X</p>
                    <input type="number" name="columns" id="columns" value={5} readOnly disabled/>
                </div>
                <button>Score: {score}</button>
                <div className="toggle-emoji-name">
                    <input type="checkbox" name="toggle-name" id="toggle-name" checked={showName} onChange={handleShowName}/>
                    <label htmlFor="toggle-name">Toggle Emoji Name</label>
                </div>
            </div>
            <CardContainer 
                cards={currentRoundCards} 
                images={preloadedImages}
                onCardClick={handleCardClick}
                showName={showName}
            />
        </div>
    )
}