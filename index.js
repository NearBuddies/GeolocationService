const express = require('express');
const pgp = require('pg-promise')();
const app = express();
const port = 3000;
const cors = require('cors');

const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'spatial2',
  user: 'postgres',
  password: '123',
};

const db = pgp(dbConfig);

app.use(express.json());
app.use(cors());

// Create (Insert) operation
app.post('/postcitizen', async (req, res) => {
  try {
    const { user_id, latitude, longitude, latitudeDelta, longitudeDelta } = req.body;

    // Create a point using ST_MakePoint
    const insertQuery = `
      INSERT INTO LocationAtTime (user_id, location)
      VALUES ($1, ST_MakePoint($2, $3))
    `;
    await db.none(insertQuery, [user_id, latitude, longitude]);

    res.status(200).json({ message: 'Données insérées avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'insertion de la personne', error);
    res.status(500).json({ error: 'Erreur lors de l\'insertion de la personne' });
  }
});

// Read operation
app.get('/getcitizen/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    // Select spatial data for a specific user
    const selectQuery = `
      SELECT user_id, ST_X(location) as longitude, ST_Y(location) as latitude
      FROM LocationAtTime
      WHERE user_id = $1
    `;
    const data = await db.one(selectQuery, [user_id]);

    res.status(200).json(data);
    console.log(data);
  } catch (error) {
    console.error('Erreur lors de la récupération des données', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des données' });
  }
});

// Update operation
app.put('/updatecitizen/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const { latitude, longitude, latitudeDelta, longitudeDelta } = req.body;

    // Update the location using ST_MakePoint
    const updateQuery = `
      UPDATE LocationAtTime
      SET location = ST_MakePoint($2, $3)
      WHERE user_id = $1
    `;
    await db.none(updateQuery, [user_id, latitude, longitude]);

    res.status(200).json({ message: 'Données mises à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la personne', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la personne' });
  }
});

// Delete operation
app.delete('/deletecitizenlocation/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    // Delete spatial data for a specific user
    const deleteQuery = `
      DELETE FROM LocationAtTime
      WHERE user_id = $1
    `;
    await db.none(deleteQuery, [user_id]);

    res.status(200).json({ message: 'Données supprimées avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression des données', error);
    res.status(500).json({ error: 'Erreur lors de la suppression des données' });
  }
});

app.listen(port, () => {
  console.log(`Serveur Express en cours d'exécution sur le port ${port}`);
});
