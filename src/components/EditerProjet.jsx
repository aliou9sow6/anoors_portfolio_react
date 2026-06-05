import React, { useState } from 'react';
import { compresserImage } from '../utils/imageUtils';

function EditerProjet({ projet, onValider, onAnnuler }) {
  const [champs, setChamps] = useState({
    libelle: projet.libelle || '',
    image: projet.image || '',
    description: projet.description || '',
    technologies: projet.technologies?.join(', ') || '',
    lien: projet.lien || '',
  });
  const [imagePreview, setImagePreview] = useState(projet.image || '');
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
    if (erreurs[name]) {
      setErreurs((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
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
    const validation = valider();
    if (Object.keys(validation).length > 0) {
      setErreurs(validation);
      return;
    }

    setEnvoi(true);
    try {
      await onValider({
        libelle: champs.libelle.trim(),
        image: champs.image,
        description: champs.description.trim(),
        technologies: champs.technologies
          ? champs.technologies.split(',').map((tech) => tech.trim()).filter(Boolean)
          : [],
        lien: champs.lien.trim(),
      });
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="ajouter-wrapper">
      <div className="ajouter-form-card editer-card">
        <div className="ajouter-form-header">
          <h2 className="ajouter-titre">Modifier le projet</h2>
          <button className="btn-fermer" onClick={onAnnuler} title="Fermer">✕</button>
        </div>

        <form className="ajouter-form" onSubmit={handleSubmit} noValidate>
          <div className="champ-groupe">
            <label className="champ-label" htmlFor="libelle">
              Libellé <span className="champ-requis">*</span>
            </label>
            <input
              id="libelle"
              name="libelle"
              type="text"
              value={champs.libelle}
              onChange={handleChange}
              className={`champ-input${erreurs.libelle ? ' champ-erreur' : ''}`}
              maxLength={80}
              autoFocus
            />
            {erreurs.libelle && <span className="erreur-msg">{erreurs.libelle}</span>}
          </div>

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
            {erreurs.image && <span className="erreur-msg">{erreurs.image}</span>}
          </div>

          <div className="champ-groupe">
            <label className="champ-label" htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={champs.description}
              onChange={handleChange}
              className="champ-input champ-textarea"
              rows={4}
            />
          </div>

          <div className="champ-groupe">
            <label className="champ-label" htmlFor="technologies">
              Technologies <span className="champ-hint">(séparées par des virgules)</span>
            </label>
            <input
              id="technologies"
              name="technologies"
              type="text"
              value={champs.technologies}
              onChange={handleChange}
              className="champ-input"
            />
          </div>

          <div className="champ-groupe">
            <label className="champ-label" htmlFor="lien">Lien du projet</label>
            <input
              id="lien"
              name="lien"
              type="url"
              value={champs.lien}
              onChange={handleChange}
              className="champ-input"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-annuler" onClick={onAnnuler}>
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

export default EditerProjet;
