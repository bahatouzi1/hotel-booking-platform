const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'notifications-service',
  brokers: ['localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'notifications-group' });

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'reservations', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const event = JSON.parse(message.value.toString());
      console.log('Notification reçue:', event);
      // Ici, tu pourrais envoyer un email ou SMS
    },
  });
};

run().catch(console.error);

console.log('Service Notifications prêt (Kafka ACTIVÉ).'); 