const express = require('express');
const pgp = require('pg-promise')(); // Utilisation de pg-promise pour la connexion à PostgreSQL
const app = express();
const port = 3000;
const cors = require('cors');
// Configuration de la connexion à la base de données PostgreSQL
const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'spatial2',
  user: 'postgres',
  password: '123',
};

const db = pgp(dbConfig);

// Middleware pour gérer les données JSON
app.use(express.json());
//Gerer CORS
app.use(cors());
// Route pour insérer des données spatiales
app.post('/postcitizen', async (req, res) => {
  try {
    
    res.status(200).json({ 
      message:'Données insérées avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de l\'insertion de la personne', error);
    res.status(500).json({ error: 'Erreur lors de l\'insertion de la personne' });
  }
});


// Démarrer le serveur Express.js
app.listen(port, () => {
  console.log(`Serveur Express en cours d'exécution sur le port ${port}`);
});
