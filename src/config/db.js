const mongoose = require("mongoose");

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI;
  const localFallbackUri = "mongodb://127.0.0.1:27017/warehouse_workforce";

  if (primaryUri) {
    try {
      console.log("🔄 Connecting to MongoDB (Primary URI)...");
      await mongoose.connect(primaryUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log("✅ MongoDB Connected Successfully");
      return;
    } catch (primaryErr) {
      console.warn(`⚠️  Primary MongoDB connection failed: ${primaryErr.message}`);
    }
  }

  // Attempt local fallback if primary failed
  try {
    console.log("🔄 Attempting Local MongoDB fallback (127.0.0.1:27017)...");
    await mongoose.connect(localFallbackUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log("✅ Connected to Local MongoDB fallback successfully");
    return;
  } catch (localErr) {
    console.error("\n============================================================");
    console.error("❌ DATABASE CONNECTION ERROR");
    console.error("Could not connect to configured MONGO_URI or local MongoDB.");
    console.error("👉 Please update Warehouse_workforce_backend/.env with your valid connection string:");
    console.error("   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>");
    console.error("============================================================\n");
    throw localErr;
  }
};

module.exports = connectDB;