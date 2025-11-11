const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/reservas.json');

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

exports.crearReserva = (req, res) => {
  const { nombre, cancha, horario, fecha } = req.body;

  if (!nombre || !cancha || !horario || !fecha) {
    return res.status(400).json({ mensaje: "Datos incompletos" });
  }

  const reservas = leerReservas();

  const reservaExistente = reservas.find(
    r => r.cancha == cancha && r.fecha === fecha && r.horario === horario
  );

  if (reservaExistente) {
    return res.status(409).json({
      mensaje: `La cancha ${cancha} ya está reservada el ${fecha} a las ${horario}`,
    });
  }

  const nuevaReserva = {
    id: reservas.length ? Math.max(...reservas.map(r => r.id)) + 1 : 1,
    nombre,
    cancha,
    horario,
    fecha
  };

  reservas.push(nuevaReserva);
  guardarReservas(reservas);

  res.status(201).json(nuevaReserva);
};


exports.obtenerReservas = (req, res) => {
  const reservas = leerReservas();
  res.json(reservas);
};

exports.verificarDisponibilidad = (req, res) => {
  const { cancha, fecha, horario } = req.query;

  if (!cancha || !fecha || !horario) {
    return res.status(400).json({ mensaje: "Debe indicar cancha, fecha y horario" });
  }

  const reservas = leerReservas();
  const existe = reservas.some(r => r.cancha == cancha && r.fecha === fecha && r.horario === horario);

  if (existe) {
    res.json({ mensaje: `Cancha ${cancha} ocupada en fecha ${fecha} a las ${horario}` });
  } else {
    res.json({ mensaje: `Cancha ${cancha} disponible en fecha ${fecha} a las ${horario}` });
  }
};

exports.eliminarReserva = (req, res) => {
  const reservas = leerReservas();
  const id = parseInt(req.params.id);
  const index = reservas.findIndex(r => r.id === id);

  if (index === -1) {
    return res.status(404).json({ mensaje: "Reserva no encontrada" });
  }

  reservas.splice(index, 1);
  guardarReservas(reservas);
  res.json({ mensaje: "Reserva eliminada" });
};

exports.actualizarReserva = (req, res) => {
  const { nombre, cancha, horario, fecha } = req.body;
  const id = parseInt(req.params.id);

  const reservas = leerReservas();
  const reserva = reservas.find(r => r.id === id);

  if (!reserva) {
    return res.status(404).json({ mensaje: "Reserva no encontrada" });
  }

  if (cancha || horario || fecha) {
    const conflicto = reservas.find(
      r =>
        r.id !== id && 
        (cancha ? r.cancha == cancha : r.cancha == reserva.cancha) &&
        (fecha ? r.fecha === fecha : r.fecha === reserva.fecha) &&
        (horario ? r.horario === horario : r.horario === reserva.horario)
    );

    if (conflicto) {
      return res.status(409).json({
        mensaje: `La cancha ${cancha || reserva.cancha} ya está reservada el ${fecha || reserva.fecha} a las ${horario || reserva.horario}`,
      });
    }
  }

  if (nombre) reserva.nombre = nombre;
  if (cancha) reserva.cancha = cancha;
  if (horario) reserva.horario = horario;
  if (fecha) reserva.fecha = fecha;

  guardarReservas(reservas);

  res.json({ mensaje: "Reserva actualizada correctamente", reserva });
};

