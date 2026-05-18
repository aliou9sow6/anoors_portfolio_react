import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Projet({ projet, onSupprimer, onAfficherDetail }) {
  const [imgError, setImgError] = useState(false);

  const placeholder = `https://placehold.co/600x400/1a1a2e/6c63ff?text=${encodeURIComponent(projet.libelle)}`;

  return (
    <article className="projet-carte">
      {/* Image */}
      <div className="projet-image-wrapper">
        <img
          src={imgError ? placeholder : (projet.image || placeholder)}
          alt={projet.libelle}
          className="projet-image"
          onError={() => setImgError(true)}
        />
        <div className="projet-image-overlay" />
      </div>

      {/* Corps */}
      <div className="projet-corps">
        {/* Libellé — ancre cliquable */}
        <Link to={`/projets/${projet._id || projet.id}`} className="projet-libelle">
          {projet.libelle}
        </Link>

        {/* Description courte */}
        {projet.description && (
          <p className="projet-description">
            {projet.description.length > 90
              ? projet.description.substring(0, 90) + '…'
              : projet.description}
          </p>
        )}

        {/* Technologies */}
        {projet.technologies && projet.technologies.length > 0 && (
          <div className="projet-techs">
            {projet.technologies.slice(0, 3).map((tech) => (
              <span key={tech} className="tech-badge">{tech}</span>
            ))}
            {projet.technologies.length > 3 && (
              <span className="tech-badge tech-badge-more">+{projet.technologies.length - 3}</span>
            )}
          </div>
        )}

        {/* Date */}
        {projet.dateCreation && (
          <span className="projet-date">
            {new Date(projet.dateCreation).toLocaleDateString('fr-FR', {
              year: 'numeric', month: 'long', day: 'numeric'
            })}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="projet-actions">
        <button
          className="btn btn-detail"
          onClick={() => onAfficherDetail(projet)}
        >
          Voir le détail
        </button>
        <button
          className="btn btn-supprimer"
          onClick={() => onSupprimer(projet._id || projet.id)}
          title="Supprimer ce projet"
        >
          Supprimer
        </button>
      </div>
    </article>
  );
}

export default Projet;