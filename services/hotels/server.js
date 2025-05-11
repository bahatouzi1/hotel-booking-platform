const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const { Kafka } = require('kafkajs');
const connectDB = require('./db');
const { ObjectId } = require('mongodb');

// Connexion MongoDB
mongoose.connect('mongodb://localhost:27017/hotels');

// Modèle Mongoose
const Hotel = require('./models/Hotel');

// Configuration Kafka
const kafka = new Kafka({
  clientId: 'hotels-service',
  brokers: ['localhost:9092']
});
const producer = kafka.producer();

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
    const { name, address, city } = call.request;
    try {
      const hotelDoc = new Hotel({ name, address, city });
      const savedHotel = await hotelDoc.save();
      // Envoi d'un message Kafka après la création de l'hôtel
      await producer.connect();
      await producer.send({
        topic: 'hotels',
        messages: [
          { value: JSON.stringify({ id: savedHotel._id.toString(), name, address, city }) }
        ]
      });
      // Adapter la réponse pour matcher le proto
      const hotel = {
        id: savedHotel._id.toString(),
        name: savedHotel.name,
        address: savedHotel.address,
        city: savedHotel.city,
        rooms: [], // à adapter si vous gérez les chambres
        location: savedHotel.location || "",
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