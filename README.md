# Hotel Booking Platform

Plateforme de réservation d'hôtels basée sur une architecture microservices moderne, exploitant REST, GraphQL, gRPC et Kafka.

## Sommaire
- [Présentation](#présentation)
- [Architecture](#architecture)
- [Technologies](#technologies)
- [Schémas de données](#schémas-de-données)
- [Interactions entre microservices](#interactions-entre-microservices)
- [Installation et démarrage](#installation-et-démarrage)
- [Utilisation](#utilisation)
- [Contribuer](#contribuer)

---

## Présentation

Ce projet est une plateforme de réservation d'hôtels, conçue pour illustrer l'intégration de plusieurs styles de communication entre microservices : REST, GraphQL, gRPC et Kafka (event-driven).

---

## Architecture

- **gateway** : API Gateway (REST & GraphQL)
- **services/hotels** : Service de gestion des hôtels (gRPC, MongoDB, Kafka)
- **services/reservations** : Service de gestion des réservations (gRPC, MongoDB, Kafka)
- **services/payments** : Service de paiement (REST, simulation)
- **services/notifications** : Service de notifications (Kafka)
- **kafka/** : Producteurs et consommateurs Kafka
- **protos/** : Fichiers de définition gRPC

## Ports utilisés

- Gateway : 3000 (HTTP)
- Hotels Service : 50051 (gRPC)
- Reservations Service : 50052 (gRPC)
- Payments Service : 50053 (HTTP)

## Lancement des services

Chaque service peut être lancé individuellement :

```bash
cd services/hotels && npm install && node server.js
cd services/reservations && npm install && node server.js
cd services/payments && npm install && node server.js
cd services/notifications && npm install && node server.js
cd gateway && npm install && node server.js
```

## Variables d'environnement

- `HOTEL_GRPC_PORT` : Port du service gRPC Hotels (défaut : 50051)
- `RESERVATION_GRPC_PORT` : Port du service gRPC Reservations (défaut : 50052)

## Dépendances

- Node.js 18+
- MongoDB (local, ports par défaut)
- Kafka (local, port 9092)

## Docker

Chaque service possède un `Dockerfile` pour faciliter le déploiement.

## Remarques

- Les schémas de données sont harmonisés entre les services, les modèles et les fichiers proto/GraphQL.
- Kafka est utilisé pour la communication asynchrone entre services.

---

## Technologies
- **Node.js** (Express, Apollo Server, kafkajs, @grpc/grpc-js, mongoose)
- **MongoDB**
- **Kafka & Zookeeper**
- **Docker** (docker-compose)

---

## Schémas de données

### Hotel
```js
{
  name: String,
  address: String,
  city: String,
  location: String,
  rooms: [ ... ]
}
```

### Reservation
```js
{
  hotel_id: ObjectId,
  user_id: ObjectId,
  start_date: Date,
  end_date: Date,
  status: String
}
```

### Payment
```js
{
  reservation_id: ObjectId,
  amount: Number,
  status: String,
  payment_date: Date
}
```

---

## Interactions entre microservices

- **Création d'un hôtel** :
  - Le client passe par le gateway (REST/GraphQL/gRPC)
  - Le service hotels enregistre l'hôtel et publie un événement Kafka (`hotels`)
  - Le service notifications reçoit l'événement

- **Création d'une réservation** :
  - Le client passe par le gateway
  - Le service reservations enregistre la réservation et publie un événement Kafka (`reservations`)
  - Le service notifications reçoit l'événement

- **Paiement** :
  - Le client passe par le gateway ou directement par le service payments (REST)

---

## Installation et démarrage

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/VOTRE-UTILISATEUR/NOM-DU-DEPOT.git
   cd hotel-booking-platform
   ```
2. **Installer les dépendances**
   ```bash
   npm install
   # puis dans chaque service/gateway :
   cd services/hotels && npm install
   cd ../reservations && npm install
   cd ../payments && npm install
   cd ../../notifications && npm install
   cd ../../gateway && npm install
   ```
3. **Démarrer Kafka et Zookeeper**
   ```bash
   # Dans le dossier Kafka
   .\bin\windows\zookeeper-server-start.bat .\config\zookeeper.properties
   .\bin\windows\kafka-server-start.bat .\config\server.properties
   ```
4. **Démarrer les microservices**
   ```bash
   # Dans chaque dossier de service
   node server.js
   # Ou utiliser docker-compose :
   docker-compose up --build
   ```

---

## Utilisation
- Accéder à l'API GraphQL : http://localhost:4000/graphql
- Accéder aux endpoints REST (exemple) : http://localhost:4000/hotels
- Les notifications s'affichent dans la console du service notifications

---

## Contribuer
- Forkez le projet
- Créez une branche (`git checkout -b feature/ma-nouvelle-fonctionnalite`)
- Commitez vos modifications
- Poussez la branche et ouvrez une Pull Request

---

## Licence
MIT 