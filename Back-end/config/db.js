const mongoose = require("mongoose");

mongoose.set("bufferTimeoutMS", 5000);

async function connectDB() {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        throw new Error("MONGODB_URI is not set. Add it to Back-end/.env.");
    }

    try {
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
        console.log("Connected to MongoDB");
    } catch (error) {
        let message = String(error.message || "Unknown MongoDB connection error")
            .replaceAll(mongoUri, "[redacted MongoDB URI]");
        for (const secret of [process.env.MONGODB_USERNAME, process.env.MONGODB_PASSWORD]) {
            if (secret) {
                message = message
                    .replaceAll(secret, "[redacted]")
                    .replaceAll(encodeURIComponent(secret), "[redacted]");
            }
        }

        const servers = error.reason?.servers;
        console.error("Failed to connect to MongoDB", {
            name: error.name,
            code: error.code,
            codeName: error.codeName,
            topology: error.reason?.type,
            serverTypes: servers ? [...servers.values()].map(server => server.type) : undefined,
            message
        });
        throw new Error("MongoDB connection failed; see the redacted diagnostics above.");
    }
}

module.exports = connectDB;