import Card from './Card.jsx';

export default function CardContainer({ cards, images, onCardClick, showName }) {
    return (
        <div className="overall-card-container">
            <section className="cards-wrapper">
                {cards.map((card, index) => (
                    <Card key={index} card={card} images={images} onClick={onCardClick} showName={showName}/>
                ))}
            </section>
        </div>
    );
}