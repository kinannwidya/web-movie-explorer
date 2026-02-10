// // scripts/migrate-remove-top-picks.js
// const mongoose = require("mongoose");
// require("dotenv").config({ path: "./.env.local" }); // 👈 BACA FILE .env.local

// async function migrate() {
//   try {
//     console.log("🔌 Connecting to MongoDB...");
//     const uri = process.env.MONGODB_URI;
//     if (!uri) throw new Error("MONGODB_URI is missing");

//     await mongoose.connect(uri);
//     console.log("✅ Connected!");

//     const db = mongoose.connection.db;
//     if (!db) throw new Error("Database not initialized");

//     const result = await db
//       .collection("contents")
//       .updateMany({}, { $unset: { isTopPick: "", topPickRank: "" } });

//     console.log(`🧽 Removed fields from ${result.modifiedCount} documents`);
//   } catch (err) {
//     console.error("❌ Migration failed:", err);
//   } finally {
//     await mongoose.disconnect();
//     console.log("🔒 Disconnected. Migration complete!");
//   }
// }

// migrate();
