// URL du backend Express (ne pas oublier le préfixe /api si vous l'utilisez dans vos routes)
const API_URL = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/projets`
  : 'http://localhost:5001/api/projets';

// Récupérer tous les projets
export async function getProjets() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Erreur lors du chargement des projets');
  return res.json();
}

// Récupérer un projet par id
export async function getProjet(id:) {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error('Projet introuvable');
  return res.json();
}

// Ajouter un projet
export async function addProjet(projet) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projet),
  });  
  if (!res.ok) throw new Error("Erreur lors de l'ajout du projet");
  return res.json();
}

// Modifier un projet
export async function updateProjet(id, projet) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projet),
  });
  if (!res.ok) throw new Error('Erreur lors de la modification du projet');
  return res.json();
}

// Supprimer un projet
export async function deleteProjet(id) {
  if (!id) {
    throw new Error('ID du projet requis pour la suppression');
  }
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erreur lors de la suppression du projet');
  return true;
}
