const express = require('express');
const router = express.Router();
const Projet = require('../models/Projet');

// GET - Récupérer tous les projets
router.get('/', async (req, res) => {
  try {
    const projets = await Projet.find().sort({ dateCreation: -1 });
    res.json(projets);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des projets' });
  }
});

// GET - Récupérer un projet par ID
router.get('/:id', async (req, res) => {
  try {
    const projet = await Projet.findById(req.params.id);
    if (!projet) {
      return res.status(404).json({ error: 'Projet non trouvé' });
    }
    res.json(projet);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du projet' });
  }
});

// POST - Créer un nouveau projet
router.post('/', async (req, res) => {
  try {
    const { libelle, image, description, technologies, lien, dateCreation } = req.body;

    // Validation basique
    if (!libelle || !description) {
      return res.status(400).json({ 
        error: 'Le libellé et la description sont obligatoires' 
      });
    }

    const projet = new Projet({
      libelle,
      image,
      description,
      technologies: technologies || [],
      lien,
      dateCreation: dateCreation || new Date(),
    });

    const projetSauvegarde = await projet.save();
    res.status(201).json(projetSauvegarde);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT - Modifier un projet
router.put('/:id', async (req, res) => {
  try {
    const { libelle, image, description, technologies, lien, dateCreation } = req.body;

    const projet = await Projet.findByIdAndUpdate(
      req.params.id,
      {
        libelle,
        image,
        description,
        technologies,
        lien,
        dateCreation,
      },
      { new: true, runValidators: true }
    );

    if (!projet) {
      return res.status(404).json({ error: 'Projet non trouvé' });
    }

    res.json(projet);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE - Supprimer un projet
router.delete('/:id', async (req, res) => {
  try {
    const projet = await Projet.findByIdAndDelete(req.params.id);
    
    if (!projet) {
      return res.status(404).json({ error: 'Projet non trouvé' });
    }

    res.json({ message: 'Projet supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression du projet' });
  }
});

module.exports = router;
