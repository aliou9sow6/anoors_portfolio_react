require('dotenv').config();
const app = require('./server');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Serveur backend sur http://localhost:${PORT}`);
  console.log(`📝 API disponible sur http://localhost:${PORT}/api/projets`);
});