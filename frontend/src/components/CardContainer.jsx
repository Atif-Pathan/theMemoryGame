import Card from './Card.jsx';
import '../styles/cardContainer.css'
export default function CardContainer({ cards, images, onCardClick, showName }) {

    return (
        <div className="overall-card-container">
            {/* <h1 style={{ margin: '0' }}>Hello Container</h1> */}
            <section className="cards-wrapper">
                {cards.map((card, index) => (
                    <Card key={index} card={card} images={images} onClick={onCardClick} showName={showName}/>
                ))}
            </section>
        </div>
        
    )

}