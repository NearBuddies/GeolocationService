const express = require('express');
const pgp = require('pg-promise')(); // Utilisation de pg-promise pour la connexion à PostgreSQL
const app = express();
const port = 3000;

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

// Route pour insérer des données spatiales
app.post('/inserer-donnees-spatiales', async (req, res) => {
  try {
    const { nom, geometrie } = req.body; // Supposons que vous envoyez le nom et la géométrie dans le corps de la requête JSON

    // Requête SQL pour insérer des données spatiales dans la table PostGIS
    const insertQuery = `
      INSERT INTO nom_de_votre_table (nom, geometrie)
      VALUES ($1, ST_GeomFromGeoJSON($2))
    `;

    await db.none(insertQuery, [nom, geometrie]);

    res.status(200).json({ message: 'Données insérées avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'insertion des données spatiales :', error);
    res.status(500).json({ error: 'Erreur lors de l\'insertion des données spatiales' });
  }
});

// Démarrer le serveur Express.js
app.listen(port, () => {
  console.log(`Serveur Express en cours d'exécution sur le port ${port}`);
});
