const express = require('express');
const pgp = require('pg-promise')();
const app = express();
const port = 3000;
const cors = require('cors');

const dbConfig = {
  host: 'localhost',
  port: 5432, // Le port doit être défini correctement
  database: 'spatial2',
  user: 'postgres',
  password: '123',
};

const db = pgp(dbConfig);

app.use(express.json());
app.use(cors());

app.post('/postcitizen', async (req, res) => {
  try {
    const { LocationAtATime } = req.body;

    const insertQuery = `
      INSERT INTO nom_de_la_table (user_id, latitude, longitude, date, time)
      VALUES ($1, $2, $3, $4, $5)
    `;
    await db.none(insertQuery, [
      LocationAtATime.user_id,
      LocationAtATime.latitude,
      LocationAtATime.longitude,
      LocationAtATime.date,
      LocationAtATime.time
    ]);

    res.status(200).json({ message: 'Données insérées avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'insertion de la personne', error);
    res.status(500).json({ error: 'Erreur lors de l\'insertion de la personne' });
  }
});
app.put(`/updatecitizen/${datas}`, async (req, res) => {
  try {
    res.status(200).json({ 
      message:'Données mises à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la personne', error);
    res.status(500).json({ error: 'Erreur lors de l\'insertion de la personne' });
  }
});

app.put('/updatecitizen/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const { LocationAtATime } = req.body;

    const updateQuery = `
      UPDATE nom_de_la_table
      SET latitude = $2, longitude = $3, date = $4, time = $5
      WHERE user_id = $1
    `;
    await db.none(updateQuery, [
      user_id,
      LocationAtATime.latitude,
      LocationAtATime.longitude,
      LocationAtATime.date,
      LocationAtATime.time
    ]);

    res.status(200).json({ message: 'Données mises à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la personne', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la personne' });
  }
});

app.listen(port, () => {
  console.log(`Serveur Express en cours d'exécution sur le port ${port}`);
});
