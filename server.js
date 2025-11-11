const express = require('express');
const app = express();
const port = 3000;
const reservasRoutes = require('./routes/reservasRoutes');

app.use(express.json());
app.use('/reservas', reservasRoutes);

app.get('/', (req, res) => {
  res.send('API de reservas funcionando');
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
