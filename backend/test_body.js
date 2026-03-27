import express from 'express';
const app = express();
app.use(express.json());
app.post('/test', (req, res) => {
  res.json({ body: req.body, type: typeof req.body });
});
app.listen(3002, () => {
  console.log('Test server on 3002');
  fetch('http://localhost:3002/test', {
    method: 'POST',
    body: JSON.stringify({ nombre: 'test', email: 'test@test', contrasena: '123' }),
    headers: { 'Content-Type': 'application/json' }
  }).then(res => res.json()).then(data => {
    console.log('Result:', data);
    process.exit(0);
  });
});
