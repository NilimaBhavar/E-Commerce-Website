// Load .env file variables (DATABASE_URL, MONGODB_URI, etc.)
require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 8080;

// Connect to MongoDB, then start the server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Tara Shop API Server running on port ${PORT}`);
  });
});
