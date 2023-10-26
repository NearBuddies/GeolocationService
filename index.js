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

app.post('/postcitizenlocation', async (req, res) => {
  try {
    const { user_id, latitude, longitude, latitudeDelta, longitudeDelta } = req.body;

    const insertQuery = `
      INSERT INTO LocationAtTime (user_id, location, latitudeDelta, longitudeDelta)
      VALUES ($1, ST_MakePoint($2, $3), $4, $5)
      RETURNING locationidentifier;
    `;
    const result = await db.one(insertQuery, [user_id, latitude, longitude, latitudeDelta, longitudeDelta]);

    res.status(200).json({ message: 'Données insérées avec succès', locationidentifier: result.locationidentifier });
  } catch (error) {
    console.error('Erreur lors de l\'insertion de la personne', error);
    res.status(500).json({ error: 'Erreur lors de l\'insertion de la personne' });
  }
});

app.get('/getcitizenlocation/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    const selectQuery = `
      SELECT user_id, location, latitudeDelta, longitudeDelta
      FROM LocationAtTime
      WHERE user_id = $1
    `;
    const data = await db.one(selectQuery, [user_id]);

    res.status(200).json(data);
  } catch (error) {
    console.error('Erreur lors de la récupération des données', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des données' });
  }
});

app.put('/updatecitizenlocation/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const { latitude, longitude, latitudeDelta, longitudeDelta } = req.body;

    const updateQuery = `
      UPDATE LocationAtTime
      SET location = ST_MakePoint($2, $3), latitudeDelta = $4, longitudeDelta = $5
      WHERE user_id = $1
    `;
    await db.none(updateQuery, [user_id, latitude, longitude, latitudeDelta, longitudeDelta]);

    res.status(200).json({ message: 'Données mises à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la personne', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la personne' });
  }
});

app.delete('/deletecitizenlocation/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

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
