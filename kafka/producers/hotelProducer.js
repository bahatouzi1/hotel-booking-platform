const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'hotel-producer',
  brokers: [process.env.KAFKA_BROKERS]
});

const producer = kafka.producer();

const publishHotelEvent = async (event) => {
  await producer.connect();
  await producer.send({
    topic: 'hotel-events',
    messages: [{ value: JSON.stringify(event) }]
  });
  await producer.disconnect();
};

module.exports = { publishHotelEvent };