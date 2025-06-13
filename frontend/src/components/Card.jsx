import { useState, useEffect } from "react";

export default function Card({ images, card, onClick, showName }) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        // Reset loading state when card changes
        setImageLoaded(false);
        setIsFlipped(false);
        
        // Check if image is available
        if (images[card.hex]) {
            // Small delay to show flip animation
            setTimeout(() => {
                setImageLoaded(true);
                setIsFlipped(true);
            }, 100);
        }
    }, [images, card.hex]);

    const handleClick = () => {
        if (imageLoaded) {
            onClick(card.hex);
        }
    };

    return (
        <button className={`card ${isFlipped ? 'flipped' : ''}`} onClick={handleClick}>
            <div className="card-inner">
                {/* Back of card (shown when loading) */}
                <div className="card-back">
                    <div className="card-back-content">
                        <span className="card-back-icon">🎴</span>
                        <div className="loading-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>
                
                {/* Front of card (shown when loaded) */}
                <div className="card-front">
                    {showName && imageLoaded && <p>{card.hex}</p>}
                    {images[card.hex] && (
                        <img 
                            className="emoji" 
                            src={images[card.hex]} 
                            alt={card.name} 
                            onLoad={() => {
                                setImageLoaded(true);
                                setIsFlipped(true);
                            }}
                        />
                    )}
                </div>
            </div>
        </button>
    );
}