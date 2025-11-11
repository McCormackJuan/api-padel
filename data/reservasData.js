const fs = require('fs');
const DATA_FILE = './reservas.json';

function leerReservas() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
}

function guardarReservas(reservas) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(reservas, null, 2));
}

module.exports = { leerReservas, guardarReservas };
