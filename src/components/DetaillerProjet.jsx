import React, { useState } from 'react';
import PropTypes from 'prop-types';

function DetaillerProjet({ projet, onAnnuler, onEditer, onSupprimer }) {
  const [imgError, setImgError] = useState(false);
  const placeholder = `https://placehold.co/1200x600/1a1a2e/6c63ff?text=${encodeURIComponent(projet.libelle)}`;

  return (
    <div className="detail-wrapper">
      {/* Bouton retour */}
      <button className="btn-retour" onClick={onAnnuler}>
        ← Retour à la liste
      </button>

      <article className="detail-carte">
        {/* Image grande */}
        <div className="detail-image-wrapper">
          <img
            src={imgError ? placeholder : (projet.image || placeholder)}
            alt={projet.libelle}
            className="detail-image"
            onError={() => setImgError(true)}
          />
          <div className="detail-image-overlay" />
          <h1 className="detail-libelle-overlay">{projet.libelle}</h1>
        </div>

        {/* Contenu */}
        <div className="detail-contenu">
          <div className="detail-meta">
            {projet.dateCreation && (
              <span className="detail-date">
                📅 {new Date(projet.dateCreation).toLocaleDateString('fr-FR', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })}
              </span>
            )}
            {projet.lien && (
              <a
                href={projet.lien}
                target="_blank"
                rel="noopener noreferrer"
                className="detail-lien"
              >
                🔗 Voir le projet
              </a>
            )}
          </div>

          {/* Description */}
          {projet.description && (
            <div className="detail-section">
              <h2 className="detail-section-titre">Description</h2>
              <p className="detail-description">{projet.description}</p>
            </div>
          )}

          {/* Technologies */}
          {projet.technologies && projet.technologies.length > 0 && (
            <div className="detail-section">
              <h2 className="detail-section-titre">Technologies utilisées</h2>
              <div className="detail-techs">
                {projet.technologies.map((tech) => (
                  <span key={tech} className="tech-badge tech-badge-lg">{tech}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="detail-actions">
          <button className="btn btn-annuler" onClick={onAnnuler}>
            Annuler
          </button>
          <button
            className="btn btn-supprimer"
            onClick={() => onSupprimer(projet)}
          >
            Supprimer
          </button>
          <button className="btn btn-editer" onClick={onEditer}>
            ✎ Éditer
          </button>
        </div>
      </article>
    </div>
  );
}

DetaillerProjet.propTypes = {
  projet: PropTypes.shape({
    _id: PropTypes.string,
    id: PropTypes.string,
    libelle: PropTypes.string.isRequired,
    image: PropTypes.string,
    description: PropTypes.string,
    dateCreation: PropTypes.string,
    lien: PropTypes.string,
    technologies: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  onAnnuler: PropTypes.func.isRequired,
  onEditer: PropTypes.func.isRequired,
  onSupprimer: PropTypes.func.isRequired,
};

export default DetaillerProjet;
