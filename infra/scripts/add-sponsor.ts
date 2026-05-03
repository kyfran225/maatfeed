/**
 * Script pour ajouter un sponsor individuel
 * Usage interactif : npx tsx add-sponsor.ts
 * Usage rapide : npx tsx add-sponsor.ts "Nom" "Description" "https://site.com"
 */
import mongoose from 'mongoose';
import { Sponsor } from '../../apps/api/src/models/Sponsor.js';
import { UserModel } from '../../apps/api/src/models/User.js';
import { env } from '../../apps/api/src/config/env.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function findAdmin() {
  const admin = await UserModel.findOne({ role: 'admin' });
  if (!admin) {
    console.error('❌ Aucun admin trouvé. Créez-en un d\'abord avec make-admin.ts');
    process.exit(1);
  }
  return admin;
}

async function addSponsorInteractive() {
  console.log('🎯 Ajout d\'un nouveau sponsor\n');
  
  const name = await ask('Nom du sponsor: ');
  const description = await ask('Description: ');
  const website = await ask('Site web (https://...): ');
  const ctaText = await ask('Texte du bouton [En savoir plus]: ') || 'En savoir plus';
  const priority = parseInt(await ask('Priorité [50]: ') || '50');
  const logo = await ask('URL du logo [laisser vide]: ') || undefined;
  
  await mongoose.connect(env.MONGODB_URI);
  const admin = await findAdmin();
  
  const sponsor = new Sponsor({
    name,
    description,
    website,
    ctaText,
    priority,
    logo,
    isActive: true,
    startDate: new Date(),
    createdBy: admin._id,
    stats: { impressions: 0, clicks: 0 }
  });
  
  await sponsor.save();
  console.log(`\n✅ Sponsor "${name}" créé avec succès !`);
  console.log(`ID: ${sponsor._id}`);
  
  await mongoose.disconnect();
  rl.close();
}

async function addSponsorQuick(name: string, description: string, website: string) {
  await mongoose.connect(env.MONGODB_URI);
  const admin = await findAdmin();
  
  const sponsor = new Sponsor({
    name,
    description,
    website,
    ctaText: 'En savoir plus',
    priority: 50,
    isActive: true,
    startDate: new Date(),
    createdBy: admin._id,
    stats: { impressions: 0, clicks: 0 }
  });
  
  await sponsor.save();
  console.log(`✅ Sponsor "${name}" ajouté (ID: ${sponsor._id})`);
  
  await mongoose.disconnect();
}

// Main
const args = process.argv.slice(2);

if (args.length >= 3) {
  // Mode rapide
  addSponsorQuick(args[0], args[1], args[2]).catch(console.error);
} else {
  // Mode interactif
  addSponsorInteractive().catch(console.error);
}
