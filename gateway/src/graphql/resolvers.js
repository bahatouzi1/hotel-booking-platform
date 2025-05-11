const { hotelsClient, reservationsClient } = require('../grpc/client');

const resolvers = {
  Query: {
    hotels: (_, { location }) => {
      return new Promise((resolve, reject) => {
        hotelsClient.searchHotels({ location }, (err, response) => {
          if (err) reject(err);
          else resolve(response.hotels);
        });
      });
    },
    hotel: (_, { id }) => {
      return new Promise((resolve, reject) => {
        hotelsClient.getHotel({ hotel_id: id }, (err, response) => {
          if (err) reject(err);
          else resolve(response.hotel);
        });
      });
    }
  },
  Mutation: {
    createReservation: (_, { hotelId, userId, startDate, endDate }) => {
      return new Promise((resolve, reject) => {
        reservationsClient.createReservation(
          { hotel_id: hotelId, user_id: userId, start_date: startDate, end_date: endDate },
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