const path = require('path');
const protoLoader = require('@grpc/proto-loader');
const grpc = require('@grpc/grpc-js');

// Chemins corrigés vers les fichiers .proto
const hotelsProtoPath = path.join(__dirname, '..', '..', '..', 'protos', 'hotels.proto');
const reservationsProtoPath = path.join(__dirname, '..', '..', '..', 'protos', 'reservations.proto');

// Charger les définitions gRPC
const hotelsProto = protoLoader.loadSync(hotelsProtoPath);
const reservationsProto = protoLoader.loadSync(reservationsProtoPath);

// Charger les paquets
const hotelsPackage = grpc.loadPackageDefinition(hotelsProto).hotels;
const reservationsPackage = grpc.loadPackageDefinition(reservationsProto).reservations;

// Initialisation des clients
module.exports = {
  hotelsClient: new hotelsPackage.HotelService(
    'localhost:50051',
    grpc.credentials.createInsecure()
  ),
  reservationsClient: new reservationsPackage.ReservationService(
    'localhost:50052',
    grpc.credentials.createInsecure()
  )
};
