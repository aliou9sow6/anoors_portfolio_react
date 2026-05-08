const mongoose = require('mongoose');

const projetSchema = new mongoose.Schema(
  {
    libelle: {
      type: String,
      required: [true, 'Le libellé du projet est requis'],
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      required: [true, 'La description est requise'],
    },
    technologies: {
      type: [String],
      default: [],
    },
    dateCreation: {
      type: Date,
      default: Date.now,
    },
    lien: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Projet', projetSchema);
