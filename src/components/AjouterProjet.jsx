import React, { useState } from 'react';
import { compresserImage } from '../utils/imageUtils';

const CHAMPS_VIDES = {
  libelle: '',
  image: '',
  description: '',
  technologies: '',
  lien: '',
};

function AjouterProjet({ onAjouter, onAnnuler }) {
  const [champs, setChamps] = useState(CHAMPS_VIDES);
  const [imagePreview, setImagePreview] = useState('');
  const [erreurs, setErreurs] = useState({});
  const [envoi, setEnvoi] = useState(false);

  const valider = () => {
    const e = {};
    if (!champs.libelle.trim()) e.libelle = 'Le libellé est obligatoire';
    if (champs.libelle.trim().length > 80) e.libelle = 'Maximum 80 caractères';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setChamps((prev) => ({ ...prev, [name]: value }));
    if (erreurs[name]) setErreurs((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setChamps((prev) => ({ ...prev, image: '' }));
      setImagePreview('');
      return;
    }
    try {
      const base64 = await compresserImage(file);
      setChamps((prev) => ({ ...prev, image: base64 }));
      setImagePreview(base64);
    } catch {
      setErreurs((prev) => ({ ...prev, image: "Impossible de lire l'image" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = valider();
    if (Object.keys(e2).length > 0) { setErreurs(e2); return; }

    setEnvoi(true);
    try {
      await onAjouter({
        libelle: champs.libelle.trim(),
        image: champs.image || '',
        description: champs.description.trim(),
        technologies: champs.technologies
          ? champs.technologies.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
        lien: champs.lien.trim(),
      });
      setChamps(CHAMPS_VIDES);
      setImagePreview('');
    } finally {
      setEnvoi(false);
    }
  };

  const handleAnnuler = () => {
    setChamps(CHAMPS_VIDES);
    setImagePreview('');
    setErreurs({});
    onAnnuler();
  };

  return (
    <div className="ajouter-wrapper">
      <div className="ajouter-form-card editer-card">
        <div className="ajouter-form-header">
          <h2 className="ajouter-titre">Ajouter un projet</h2>
          <button className="btn-fermer" onClick={handleAnnuler} title="Fermer">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="ajouter-form" noValidate>
          {/* Libellé */}
          <div className="champ-groupe">
            <label className="champ-label" htmlFor="libelle">
              Libellé <span className="champ-requis">*</span>
            </label>
            <input
              id="libelle"
              name="libelle"
              type="text"
              className={`champ-input${erreurs.libelle ? ' champ-erreur' : ''}`}
              placeholder="Nom du projet"
              value={champs.libelle}
              onChange={handleChange}
              maxLength={80}
              autoFocus
            />
            {erreurs.libelle && <span className="erreur-msg">{erreurs.libelle}</span>}
          </div>

          {/* Image fichier */}
          <div className="champ-groupe">
            <label className="champ-label" htmlFor="image">Image du projet</label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              className="champ-input champ-file"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <img src={imagePreview} alt="Aperçu de l'image" className="image-apercu" />
            )}
          </div>

          {/* Description */}
          <div className="champ-groupe">
            <label className="champ-label" htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              className="champ-input champ-textarea"
              placeholder="Décrivez votre projet…"
              value={champs.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          {/* Technologies */}
          <div className="champ-groupe">
            <label className="champ-label" htmlFor="technologies">
              Technologies <span className="champ-hint">(séparées par des virgules)</span>
            </label>
            <input
              id="technologies"
              name="technologies"
              type="text"
              className="champ-input"
              placeholder="React, Node.js, MongoDB"
              value={champs.technologies}
              onChange={handleChange}
            />
          </div>

          {/* Lien */}
          <div className="champ-groupe">
            <label className="champ-label" htmlFor="lien">Lien du projet</label>
            <input
              id="lien"
              name="lien"
              type="url"
              className="champ-input"
              placeholder="https://github.com/..."
              value={champs.lien}
              onChange={handleChange}
            />
          </div>

          {/* Boutons */}
          <div className="form-actions">
            <button type="button" className="btn btn-annuler" onClick={handleAnnuler}>
              Annuler
            </button>
            <button type="submit" className="btn btn-valider" disabled={envoi}>
              {envoi ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AjouterProjet;
