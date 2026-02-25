// src/models/AnonymousIdentity.js - Anonymous names for community posts
const mongoose = require("mongoose");

const ANIMALS = [
  "Panda", "Tiger", "Eagle", "Dolphin", "Wolf", "Fox", "Bear", "Lion",
  "Owl", "Hawk", "Shark", "Phoenix", "Dragon", "Falcon", "Panther"
];

const anonymousIdentitySchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
      unique: true,
      index: true
    },
    
    animal: { type: String, required: true },
    number: { type: Number, required: true },
    
    // Full identity string like "Anonymous Panda #4521"
    displayName: { type: String, required: true }
  },
  { timestamps: true }
);

// Generate identity for a user
anonymousIdentitySchema.statics.generateIdentity = async function (userId) {
  // Check if already exists
  let identity = await this.findOne({ userId });
  if (identity) return identity;

  // Generate new identity
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const number = Math.floor(1000 + Math.random() * 9000); // 4-digit number
  const displayName = `Anonymous ${animal} #${number}`;

  identity = await this.create({
    userId,
    animal,
    number,
    displayName
  });

  return identity;
};

// Get identity for a user
anonymousIdentitySchema.statics.getIdentity = async function (userId) {
  let identity = await this.findOne({ userId });
  if (!identity) {
    identity = await this.generateIdentity(userId);
  }
  return identity;
};

const AnonymousIdentity = mongoose.model("AnonymousIdentity", anonymousIdentitySchema);

module.exports = AnonymousIdentity;
