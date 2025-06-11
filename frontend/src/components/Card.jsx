export default function Card( { images, card, onClick, showName } ) {
    const handleClick = () => {
        // Call the function passed down from GameManager,
        // providing this card's unique hexcode as the argument.
        onClick(card.hex);
    };
    return (
        <button className="card" onClick={handleClick}>
            {showName && (<p>{card.name}</p>)}
            <img className="emoji" src={images[card.hex]} alt={card.name} />
        </button>
    )
}