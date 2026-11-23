
import mongoose from "mongoose";

export async function connectDatabase(uri) {
  if (!uri) {
    throw new Error("MongoDB connection URI is missing.");
  }

  try {
    const connection = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });

    console.log(
      `MongoDB connected: ${connection.connection.host}`
    );

    console.log(
      `Database name: ${connection.connection.name}`
    );

    return connection;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
}

export async function disconnectDatabase() {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log("MongoDB disconnected successfully.");
    }
  } catch (error) {
    console.error("MongoDB disconnection failed:", error.message);
    throw error;
  }
}

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB connection lost.");
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected.");
});

mongoose.connection.on("error", (error) => {
  console.error("MongoDB error:", error.message);
});
