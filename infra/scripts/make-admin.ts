/**
 * Script to make a user an admin
 * Usage: npx tsx make-admin.ts <email>
 */
import mongoose from "mongoose";
import { UserModel } from "../../apps/api/src/models/User.js";
import { env } from "../../apps/api/src/config/env.js";

async function makeAdmin(email: string) {
  await mongoose.connect(env.MONGODB_URI);
  console.log("Connected to MongoDB");

  const user = await UserModel.findOneAndUpdate(
    { email: email.toLowerCase() },
    { role: "admin" },
    { new: true }
  );

  if (!user) {
    console.log(`User with email "${email}" not found`);
    process.exit(1);
  }

  console.log(`✓ User ${email} is now admin`);
  console.log(`Role: ${user.role}`);

  await mongoose.disconnect();
  process.exit(0);
}

const email = process.argv[2];
if (!email) {
  console.log("Usage: npx tsx make-admin.ts <email>");
  process.exit(1);
}

makeAdmin(email);
