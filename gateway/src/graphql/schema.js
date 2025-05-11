const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Hotel {
    id: ID!
    name: String!
    location: String!
    rooms: [Room!]!
  }

  type Room {
    id: ID
    type: String!
    price: Float!
    available: Boolean!
  }

  type Reservation {
    id: ID!
    hotel_id: ID!
    user_id: ID!
    room_type: String
    start_date: String!
    end_date: String!
    status: String!
  }

  type Query {
    hotels(location: String): [Hotel!]!
    hotel(id: ID!): Hotel
  }

  type Mutation {
    createReservation(hotel_id: ID!, user_id: ID!, room_type: String, start_date: String!, end_date: String!): Reservation!
  }
`;

module.exports = typeDefs;