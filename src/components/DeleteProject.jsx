import React from 'react';

function DeleteProject({ projet, onAnnuler, onConfirmer }) {
    return (
        <div className="delete-project">
            <h2>Supprimer le projet</h2>
            <p>Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.</p>
            <div className="delete-actions">
                <button className="btn btn-danger" onClick={onConfirmer}>
                    Supprimer
                </button>
                <button className="btn btn-secondary" onClick={onAnnuler}>
                    Annuler
                </button>
            </div>
        </div>
    );
}