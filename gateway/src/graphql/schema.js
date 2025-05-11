const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Hotel {
    id: ID!
    name: String!
    location: String!
    rooms: [Room!]!
  }

  type Room {
    id: ID!
    type: String!
    price: Float!
    available: Boolean!
  }

  type Reservation {
    id: ID!
    hotel: Hotel!
    userId: ID!
    startDate: String!
    endDate: String!
    status: String!
  }

  type Query {
    hotels(location: String): [Hotel!]!
    hotel(id: ID!): Hotel
  }

  type Mutation {
    createReservation(hotelId: ID!, userId: ID!, startDate: String!, endDate: String!): Reservation!
  }
`;

module.exports = typeDefs;