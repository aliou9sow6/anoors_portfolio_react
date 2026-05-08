require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Projet = require('./models/Projet');

async function seedDatabase() {
  try {
    // Connexion MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connecté à MongoDB');

    // Lire le fichier db.json
    const dbPath = path.join(__dirname, '../db.json');
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    
    // Vérifier s'il y a déjà des données
    const count = await Projet.countDocuments();
    if (count > 0) {
      console.log(`⚠️  ${count} projets existent déjà. Voulez-vous les remplacer ?`);
      console.log('   Usage: npm run seed -- --force');
      
      if (!process.argv.includes('--force')) {
        await mongoose.connection.close();
        return;
      }
      
      await Projet.deleteMany({});
      console.log('🗑️  Données existantes supprimées');
    }

    // Importer les projets
    const projets = data.projets.map(p => ({
      libelle: p.libelle,
      image: p.image,
      description: p.description,
      technologies: p.technologies || [],
      dateCreation: p.dateCreation ? new Date(p.dateCreation) : new Date(),
      lien: p.lien,
    }));

    const result = await Projet.insertMany(projets);
    console.log(`✓ ${result.length} projets importés avec succès`);

    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

seedDatabase();
