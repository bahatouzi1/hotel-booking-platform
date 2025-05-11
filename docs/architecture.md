# Documentation technique – Hotel Booking Platform

## 1. Présentation

Ce document décrit l'architecture, les composants, les schémas de données et les interactions entre les microservices de la plateforme de réservation d'hôtels.

---

## 2. Architecture générale

```
[Client]
   |         REST/GraphQL
   v
[gateway]  <--- gRPC --->  [hotels]
   |                      [reservations]
   |                           |
   |---- Kafka (events) -------|
   |                           v
   |                      [notifications]
   |
   |---- REST --------------> [payments]
```

- **gateway** : Point d'entrée unique (REST, GraphQL, gRPC)
- **hotels** : Gestion des hôtels (CRUD, recherche)
- **reservations** : Gestion des réservations
- **payments** : Gestion des paiements (REST)
- **notifications** : Réception des événements Kafka
- **kafka** : Producteurs/consommateurs d'événements
- **protos** : Schémas gRPC

---

## 3. Description des composants

### 3.1. gateway/
- Point d'entrée unique pour les clients (API REST, GraphQL, gRPC)
- Initialise Apollo Server (GraphQL)
- Crée les clients gRPC pour communiquer avec les microservices

### 3.2. services/hotels/
- Service gRPC pour la gestion des hôtels
- Publie un événement Kafka lors de la création d'un hôtel
- Utilise MongoDB pour stocker les hôtels

### 3.3. services/reservations/
- Service gRPC pour la gestion des réservations
- Publie un événement Kafka lors de la création d'une réservation
- Utilise MongoDB pour stocker les réservations

### 3.4. services/payments/
- Service REST pour la gestion des paiements
- Utilise MongoDB pour stocker les paiements

### 3.5. services/notifications/
- Service Kafka Consumer
- Écoute les topics Kafka (ex : `hotels`, `reservations`) et affiche les notifications reçues

### 3.6. kafka/
- Producteurs et consommateurs Kafka pour les événements

### 3.7. protos/
- Fichiers `.proto` pour la définition des interfaces gRPC

---

## 4. Schémas de données

### 4.1. Hotel
```js
{
  name: String,
  address: String,
  city: String,
  location: String,
  rooms: [ ... ]
}
```

### 4.2. Reservation
```js
{
  hotel_id: ObjectId,
  user_id: ObjectId,
  start_date: Date,
  end_date: Date,
  status: String
}
```

### 4.3. Payment
```js
{
  reservation_id: ObjectId,
  amount: Number,
  status: String,
  payment_date: Date
}
```

---

## 5. Interactions entre microservices

### 5.1. Création d'un hôtel
1. Le client envoie une requête (REST, GraphQL ou gRPC) au gateway.
2. Le gateway transmet la demande au service hotels via gRPC.
3. Le service hotels enregistre l'hôtel en base MongoDB.
4. Il publie un événement Kafka sur le topic `hotels`.
5. Le service notifications (abonné au topic `hotels`) reçoit l'événement et affiche la notification.

### 5.2. Création d'une réservation
1. Le client envoie une requête (REST, GraphQL ou gRPC) au gateway.
2. Le gateway transmet la demande au service reservations via gRPC.
3. Le service reservations enregistre la réservation en base MongoDB.
4. Il publie un événement Kafka sur le topic `reservations`.
5. Le service notifications (abonné au topic `reservations`) reçoit l'événement et affiche la notification.

### 5.3. Paiement
1. Le client envoie une requête REST au gateway ou directement au service payments.
2. Le service payments traite le paiement et met à jour la base MongoDB.

---

## 6. Schémas gRPC (extraits)

### hotels.proto
```proto
service HotelService {
  rpc GetHotel(GetHotelRequest) returns (GetHotelResponse);
  rpc SearchHotels(SearchHotelsRequest) returns (SearchHotelsResponse);
  rpc CreateHotel(CreateHotelRequest) returns (CreateHotelResponse);
}
```

### reservations.proto
```proto
service ReservationService {
  rpc CreateReservation(CreateReservationRequest) returns (CreateReservationResponse);
  rpc GetReservations(GetReservationsRequest) returns (GetReservationsResponse);
}
```

---

## 7. Kafka : Topics utilisés
- **hotels** : événement lors de la création d'un hôtel
- **reservations** : événement lors de la création d'une réservation

---

## 8. Extensibilité
- Ajouter de nouveaux microservices (ex : gestion des utilisateurs) est facile grâce à l'architecture modulaire
- Kafka permet d'ajouter des consommateurs pour de nouveaux besoins (emails, SMS, analytics…)

---

## 9. Auteur
Projet réalisé par [VOTRE NOM] dans le cadre d'un exemple d'architecture microservices Node.js 