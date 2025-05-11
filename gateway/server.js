const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const bodyParser = require('body-parser');
const cors = require('cors');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const typeDefs = require('./src/graphql/schema');
const resolvers = require('./src/graphql/resolvers');

// Chargement des proto
const hotelProtoPath = path.join(__dirname, '..', 'protos', 'hotels.proto');
const reservationProtoPath = path.join(__dirname, '..', 'protos', 'reservations.proto');

const hotelPackageDef = protoLoader.loadSync(hotelProtoPath);
const reservationPackageDef = protoLoader.loadSync(reservationProtoPath);

const hotelProto = grpc.loadPackageDefinition(hotelPackageDef).hotels;
const reservationProto = grpc.loadPackageDefinition(reservationPackageDef).reservations;

// Création des clients gRPC
const hotelClient = new hotelProto.HotelService('localhost:50051', grpc.credentials.createInsecure());
const reservationClient = new reservationProto.ReservationService('localhost:50052', grpc.credentials.createInsecure());

async function startServer() {
  const app = express();
  const apolloServer = new ApolloServer({ typeDefs, resolvers });

  await apolloServer.start();

  app.use(cors());
  app.use(bodyParser.json());
  app.use('/graphql', expressMiddleware(apolloServer));

  // REST Endpoints
  app.get('/hotels', (req, res) => {
    hotelClient.searchHotels({ location: req.query.location || "" }, (err, response) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(response.hotels);
    });
  });

  app.post('/hotels', (req, res) => {
    hotelClient.createHotel(req.body, (err, response) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(response.hotel);
    });
  });

  app.get('/reservations', (req, res) => {
    reservationClient.GetReservations(req.query, (err, response) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(response.reservations);
    });
  });

  app.post('/reservations', (req, res) => {
    reservationClient.createReservation(req.body, (err, response) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(response.reservation);
    });
  });

  

  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`API Gateway démarré sur le port ${PORT}`);
    console.log(`GraphQL disponible sur http://localhost:${PORT}/graphql`);
  });
}

startServer();