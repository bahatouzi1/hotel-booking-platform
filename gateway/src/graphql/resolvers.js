const { hotelsClient, reservationsClient } = require('../grpc/client');

const resolvers = {
  Query: {
    //Permet de rechercher des hôtels selon une localisation.
    hotels: (_, { location }) => {
      return new Promise((resolve, reject) => {
        hotelsClient.searchHotels({ location }, (err, response) => {
          if (err) reject(err);
          else resolve(response.hotels);
        });
      });
    },
    //Permet de récupérer un hôtel par son identifiant.
    hotel: (_, { id }) => {
      return new Promise((resolve, reject) => {
        hotelsClient.getHotel({ hotel_id: id }, (err, response) => {
          if (err) reject(err);
          else resolve(response.hotel);
        });
      });
    }
  },
  //Permet de créer une réservation pour un hôtel.
  Mutation: {
    createReservation: (_, { hotelId, userId, startDate, endDate }) => {
      return new Promise((resolve, reject) => {
        reservationsClient.createReservation(
          { hotelId, userId, startDate, endDate },
          (err, response) => {
            if (err) reject(err);
            else resolve(response.reservation);
          }
        );
      });
    }
  }
};

module.exports = resolvers;