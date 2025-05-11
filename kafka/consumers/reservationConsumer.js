const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'reservation-consumer',
  brokers: ['localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'reservation-consumer-group' });

const startReservationConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'reservation-events', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const event = JSON.parse(message.value.toString());
      console.log('Événement de réservation reçu:', event);
      // Traiter l'événement de réservation
    },
  });
};

startReservationConsumer().catch(console.error);