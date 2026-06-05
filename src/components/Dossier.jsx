import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProjets, addProjet, deleteProjet, updateProjet } from '../services/api';
import Projet from './Projet';
import AjouterProjet from './AjouterProjet';
import DetaillerProjet from './DetaillerProjet';
import EditerProjet from './EditerProjet';
import DeleteProject from './DeleteProject';

function Dossier() {
  const [projets, setProjets] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [notification, setNotification] = useState(null);
  const [vue, setVue] = useState('liste');
  const [projetSelectionne, setProjetSelectionne] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  // Chargement initial des projets
  useEffect(() => {
    chargerProjets();
  }, []);

  useEffect(() => {
    if (!id) {
      setProjetSelectionne(null);
      setVue('liste');
      return;
    }

    if (projets.length === 0) return;

    const projet = projets.find((p) => String(p._id || p.id) === String(id));
    if (projet) {
      setProjetSelectionne(projet);
      setVue('detail');
    } else {
      setProjetSelectionne(null);
      setVue('liste');
    }
  }, [id, projets]);

  const chargerProjets = async () => {
    try {
      setChargement(true);
      setErreur(null);
      const data = await getProjets();
      setProjets(data);
    } catch (err) {
      console.error(err);
      setErreur('Impossible de charger les projets. Vérifiez que json-server est lancé (npm run server).');
    } finally {
      setChargement(false);
    }
  };

  const afficherNotification = (message, type = 'succes') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const afficherDetail = (projet) => {
    navigate(`/projets/${projet._id || projet.id}`);
  };

  const afficherAjouter = () => {
    setVue('ajouter');
  };

  const afficherEdition = (projet) => {
    setProjetSelectionne(projet);
    setVue('editer');
  };

  const retourListe = () => {
    navigate('/projets');
  };

  // Ajouter un projet
  const handleAjouter = async (nouveauProjet) => {
    try {
      const projetCree = await addProjet({
        ...nouveauProjet,
        dateCreation: new Date().toISOString().split('T')[0],
      });
      setProjets((prev) => [...prev, projetCree]);
      afficherNotification(`✓ Projet "${projetCree.libelle}" ajouté avec succès`);
      setVue('liste');
    } catch (err) {
      console.error(err);
      afficherNotification("✗ Erreur lors de l'ajout du projet", 'erreur');
    }
  };

  // Demande de suppression (ouvre la confirmation)
  const demanderSuppression = (projet) => {
    setProjetSelectionne(projet);
    setVue('supprimer');
  };

  // Supprimer un projet (exécuté après confirmation)
  const supprimerProjet = async (idProjet) => {
    try {
      await deleteProjet(idProjet);
      setProjets((prev) => prev.filter((p) => (p._id || p.id) !== idProjet));
      afficherNotification(`✓ Projet supprimé`);
      if (String(projetSelectionne?._id || projetSelectionne?.id) === String(idProjet)) {
        retourListe();
      }
    } catch (err) {
      console.error(err);
      afficherNotification('✗ Erreur lors de la suppression', 'erreur');
    }
  };

  // Modifier un projet
  const handleModifier = async (idProjet, donneesModifiees) => {
    try {
      const projetMaj = await updateProjet(idProjet, donneesModifiees);
      setProjets((prev) => prev.map((p) => ((p._id || p.id) === idProjet ? projetMaj : p)));
      afficherNotification(`✓ Projet "${projetMaj.libelle}" modifié avec succès`);
      retourListe();
    } catch (err) {
      console.error(err);
      afficherNotification('✗ Erreur lors de la modification', 'erreur');
    }
  };

  // Filtrage par recherche
  const projetsFiltres = projets.filter((p) =>
    p.libelle.toLowerCase().includes(recherche.toLowerCase()) ||
    p.description?.toLowerCase().includes(recherche.toLowerCase())
  );

  // Affichage formulaire ajout
  if (vue === 'ajouter') {
    return (
      <AjouterProjet
        onAjouter={handleAjouter}
        onAnnuler={() => setVue('liste')}
      />
    );
  }

  // Affichage détail
      if (vue === 'detail' && projetSelectionne) {
    return (
      <DetaillerProjet
        projet={projetSelectionne}
        onAnnuler={retourListe}
        onEditer={() => afficherEdition(projetSelectionne)}
            onSupprimer={demanderSuppression}
      />
    );
  }

  // Affichage édition
  if (vue === 'editer' && projetSelectionne) {
    return (
      <EditerProjet
        projet={projetSelectionne}
        onValider={(donnees) => handleModifier(projetSelectionne._id || projetSelectionne.id, donnees)}
        onAnnuler={retourListe}
      />
    );
  }

  // Vue liste principale
  return (
    <div className="dossier">
      {/* Notification */}
      {notification && (
        <div className={`notification notification-${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* En-tête dossier */}
      <div className="dossier-header">
        <div className="dossier-title-group">
          <h1 className="dossier-title">Mes Projets</h1>
          <span className="dossier-count">{projets.length} projet{projets.length === 1 ? '' : 's'}</span>
        </div>

        <div className="dossier-header-actions">
          {/* Barre de recherche */}
          <div className="recherche-wrapper">
            <span className="recherche-icon">⌕</span>
            <input
              type="text"
              className="recherche-input"
              placeholder="Rechercher un projet..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
            />
            {recherche && (
              <button className="recherche-clear" onClick={() => setRecherche('')}>✕</button>
            )}
          </div>

          {/* Bouton nouveau projet */}
          <button className="btn btn-ajouter-toggle" onClick={afficherAjouter}>
            <span className="btn-plus">+</span> Nouveau projet
          </button>
        </div>
      </div>

      {/* Erreur */}
      {erreur && (
        <div className="erreur-banner">
          <span>{erreur}</span>
          <button onClick={chargerProjets} className="btn-retry">Réessayer</button>
        </div>
      )}

      {/* Chargement */}
      {chargement && (
        <div className="chargement">
          <div className="spinner" />
          <p>Chargement des projets…</p>
        </div>
      )}

      {/* Liste vide */}
      {!chargement && projetsFiltres.length === 0 && (
        <div className="liste-vide">
          {recherche
            ? `Aucun projet ne correspond à "${recherche}"`
            : 'Aucun projet pour l\'instant. Ajoutez votre premier projet !'}
        </div>
      )}

      {/* Grille de projets */}
      {!chargement && projetsFiltres.length > 0 && (
        <div className="projets-grille">
          {projetsFiltres.map((projet) => (
            <Projet
              key={projet._id || projet.id}
              projet={projet}
              onSupprimer={demanderSuppression}
              onAfficherDetail={afficherDetail}
            />
          ))}
        </div>
      )}
      {/* Confirmation suppression */}
      {vue === 'supprimer' && projetSelectionne && (
        <DeleteProject
          projet={projetSelectionne}
          onConfirmer={(p) => {
            supprimerProjet(p._id || p.id);
            setVue('liste');
          }}
          onAnnuler={() => setVue('liste')}
        />
      )}
    </div>
  );
}

export default Dossier;