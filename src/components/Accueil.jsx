import React from 'react';
import { Link } from 'react-router-dom';


function Accueil() {
  return (
    <div className="accueil">
      <section className="hero">
        <h1 className="hero-titre">Bienvenue sur mon Portfolio</h1>
        <p className="hero-sous-titre">
          Découvrez mes projets, compétences et expériences en développement web et mobile. Je suis passionné par la création d'applications modernes et innovantes qui offrent une expérience utilisateur exceptionnelle.
        </p>
        <div className="hero-actions">
          <Link to="/contact" className="btn btn-secondaire">
            Me contacter
          </Link>
        </div>
      </section>

      <section className="presentation">
        <h2>À propos de moi</h2>
        <p>
          Passionné par le développement, je crée des applications web et mobiles modernes
          en utilisant les dernières technologies. Mon objectif est de combiner design élégant
          et fonctionnalités robustes pour offrir des expériences utilisateur exceptionnelles.
        </p>
        <div className="competences">
          <div className="competence">
            <h3>Frontend</h3>
            <p>React, Vue.js, HTML5, CSS3, JavaScript</p>
          </div>
          <div className="competence">
            <h3>Backend</h3>
            <p>Node.js, Python, APIs REST, bases de données</p>
          </div>
          <div className="competence">
            <h3>Mobile</h3>
            <p>React Native, Flutter</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Accueil;