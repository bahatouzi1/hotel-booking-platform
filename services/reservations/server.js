const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const Reservation = require('./models/Reservation');
const { Kafka } = require('kafkajs');
const connectDB = require('./db');

// Connexion MongoDB locale
connectDB();

// Chargement du fichier protobuf
const packageDefinition = protoLoader.loadSync('../../protos/reservations.proto');
const proto = grpc.loadPackageDefinition(packageDefinition).reservations;

// Configuration Kafka
const kafka = new Kafka({
  clientId: 'reservations-service',
  brokers: ['localhost:9092']
});
const producer = kafka.producer();
(async () => { await producer.connect(); })();

// Implémentation du service gRPC
const reservationService = {
  createReservation: async (call, callback) => {
    try {
      const reservation = new Reservation({
        hotel_id: call.request.hotel_id,
        user_id: call.request.user_id,
        room_type: call.request.room_type,
        start_date: call.request.start_date,
        end_date: call.request.end_date,
        status: call.request.status || 'pending',
      });
      await reservation.save();
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
      const reservationsList = reservations.map(r => ({
        id: r._id.toString(),
        hotel_id: r.hotel_id,
        user_id: r.user_id,
        room_type: r.room_type,
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