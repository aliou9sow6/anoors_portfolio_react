import React from 'react';
import PropTypes from 'prop-types';

function DeleteProject({ projet, onConfirmer, onAnnuler }) {
    return (
        <div className="delete-project">
            <h2>Supprimer le projet</h2>
            <p>
                Êtes-vous sûr de vouloir supprimer le projet "{projet?.libelle}" ? Cette action est
                irréversible.
            </p>
            <div className="delete-actions">
                <button className="btn btn-danger" onClick={() => onConfirmer(projet)}>
                    Supprimer
                </button>
                <button className="btn btn-secondary" onClick={onAnnuler}>
                    Annuler
                </button>
            </div>
        </div>
    );
}

DeleteProject.propTypes = {
    projet: PropTypes.shape({
        _id: PropTypes.string,
        id: PropTypes.string,
        libelle: PropTypes.string,
    }).isRequired,
    onConfirmer: PropTypes.func.isRequired,
    onAnnuler: PropTypes.func.isRequired,
};

export default DeleteProject;