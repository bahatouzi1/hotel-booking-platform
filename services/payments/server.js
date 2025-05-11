const express = require('express');
// const { Kafka } = require('kafkajs');

const app = express();
app.use(express.json());

// const kafka = new Kafka({
//   clientId: 'payments-service',
//   brokers: ['localhost:9092']
// });
// const producer = kafka.producer();
// (async () => { await producer.connect(); })();

app.post('/pay', async (req, res) => {
  // Simuler un paiement
  const { reservationId, amount } = req.body;
  // Ici, tu pourrais intégrer un vrai gateway de paiement
  const paymentEvent = { reservationId, amount, status: 'success', date: new Date() };
  // await producer.connect();
  // await producer.send({
  //   topic: 'payment-events',
  //   messages: [{ value: JSON.stringify(paymentEvent) }]
  // });
  res.json({ success: true, paymentEvent });
});

app.listen(50053, () => {
  console.log('Payments Service running on port 50053');
}); 