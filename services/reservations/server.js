const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const Reservation = require('./models/Reservation');
const { Kafka } = require('kafkajs');

// Connexion MongoDB locale
mongoose.connect('mongodb://localhost:27017/reservationsDB');

// Chargement du fichier protobuf
const packageDefinition = protoLoader.loadSync('../../protos/reservations.proto');
const proto = grpc.loadPackageDefinition(packageDefinition).reservations;

// Configuration Kafka
const kafka = new Kafka({
  clientId: 'reservations-service',
  brokers: ['localhost:9092']
});
const producer = kafka.producer();

// Implémentation du service gRPC
const reservationService = {
  createReservation: async (call, callback) => {
    try {
      const reservation = new Reservation(call.request);
      await reservation.save();
      // Envoi d'un message Kafka après la création de la réservation
      await producer.connect();
      await producer.send({
        topic: 'reservations',
        messages: [
          { value: JSON.stringify(reservation) }
        ]
      });
      callback(null, { reservation });
    } catch (err) {
      callback(err);
    }
  },
  GetReservations: async (call, callback) => {
    try {
      const reservations = await Reservation.find();
      // Adapter chaque réservation au format attendu par le proto
      const reservationsList = reservations.map(r => ({
        id: r._id.toString(),
        hotel_id: r.hotel_id,
        user_id: r.user_id,
        start_date: r.start_date,
        end_date: r.end_date,
        status: r.status
      }));
      callback(null, { reservations: reservationsList });
    } catch (err) {
      callback(err);
    }
  }
};

// Création et démarrage du serveur gRPC
const server = new grpc.Server();
server.addService(proto.ReservationService.service, reservationService);
server.bindAsync('0.0.0.0:50052', grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error('Erreur lors du bind du serveur gRPC:', err);
    return;
  }
  console.log('Reservations Service running on port', port);
});