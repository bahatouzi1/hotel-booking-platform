const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const { Kafka } = require('kafkajs');
const connectDB = require('./db');
const { ObjectId } = require('mongodb');

// Connexion MongoDB
connectDB();

// Modèle Mongoose
const Hotel = require('./models/Hotel');

// Configuration Kafka
const kafka = new Kafka({
  clientId: 'hotels-service',
  brokers: ['localhost:9092']
});
const producer = kafka.producer();
(async () => { await producer.connect(); })();

// Chargement du protobuf
const packageDefinition = protoLoader.loadSync('../../protos/hotels.proto');
const hotelsProto = grpc.loadPackageDefinition(packageDefinition).hotels;

// Implémentation du service
const hotelService = {
  getHotel: async (call, callback) => {
    try {
      const hotel = await Hotel.findById(call.request.hotel_id);
      callback(null, { hotel });
    } catch (err) {
      callback(err);
    }
  },

  searchHotels: async (call, callback) => {
    try {
      let query = {};
      if (call.request.location) {
        query.location = call.request.location;
      }
      const hotels = await Hotel.find(query);
      callback(null, { hotels });
    } catch (err) {
      callback(err);
    }
  },

  createHotel: async (call, callback) => {
    const { name, location, rooms } = call.request;
    try {
      const hotelDoc = new Hotel({ name, location, rooms });
      const savedHotel = await hotelDoc.save();
      await producer.send({
        topic: 'hotels',
        messages: [
          { value: JSON.stringify({ id: savedHotel._id.toString(), name, location, rooms }) }
        ]
      });
      const hotel = {
        id: savedHotel._id.toString(),
        name: savedHotel.name,
        location: savedHotel.location,
        rooms: savedHotel.rooms || [],
      };
      callback(null, { hotel });
    } catch (err) {
      callback(err);
    }
  },
};

// Création du serveur gRPC
const server = new grpc.Server();
server.addService(hotelsProto.HotelService.service, hotelService);
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error('Erreur lors du bind du serveur gRPC:', err);
    return;
  }
  console.log('Service Hotels en écoute sur le port', port);
});