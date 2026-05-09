import mongoose from "mongoose";
import { env } from "../../apps/api/src/config/env.js";
import { Sponsor } from "../../apps/api/src/models/Sponsor.js";

const replacements = [
  {
    matchNames: ["AfroTech Hub", "African Leadership Academy"],
    update: {
      name: "African Leadership Academy",
      description:
        "Institution panafricaine qui forme de jeunes leaders africains avec des programmes d'éducation, d'entrepreneuriat et d'impact social.",
      website: "https://www.africanleadershipacademy.org",
      ctaText: "Découvrir l'académie",
      priority: 100
    }
  },
  {
    matchNames: ["StartUp Africa Network", "VC4A Startup Network"],
    update: {
      name: "VC4A Startup Network",
      description:
        "Réseau pour fondateurs, mentors et investisseurs actifs dans l'écosystème startup africain, avec opportunités, programmes et communautés.",
      website: "https://vc4a.com",
      ctaText: "Rejoindre le réseau",
      priority: 95
    }
  },
  {
    matchNames: ["Culture247 Magazine", "MEST Africa"],
    update: {
      name: "MEST Africa",
      description:
        "Programme panafricain de formation, incubation et investissement pour entrepreneurs tech, avec une communauté active sur plusieurs marchés africains.",
      website: "https://www.meltwater.org",
      ctaText: "Voir le programme",
      priority: 90
    }
  },
  {
    matchNames: ["AfriBusiness Forum", "Tony Elumelu Foundation"],
    update: {
      name: "Tony Elumelu Foundation",
      description:
        "Fondation dédiée à l'entrepreneuriat africain, avec programmes de formation, mentorat et financement pour entrepreneurs du continent.",
      website: "https://www.tonyelumelufoundation.org",
      ctaText: "Découvrir les programmes",
      priority: 85
    }
  },
  {
    matchNames: ["TechCité Dakar", "Orange Digital Centers"],
    update: {
      name: "Orange Digital Centers",
      description:
        "Réseau de centres numériques pour la formation, l'accompagnement de startups et l'inclusion digitale dans plusieurs pays.",
      website: "https://www.orange.com/en/orange-digital-centers",
      ctaText: "Explorer les centres",
      priority: 80
    }
  },
  {
    matchNames: ["AfroDigital Academy", "Startupbootcamp AfriTech"],
    update: {
      name: "Startupbootcamp AfriTech",
      description:
        "Accélérateur orienté startups africaines innovantes, avec accompagnement, mentorat et accès à un réseau international d'investisseurs.",
      website: "https://www.startupbootcamp.org/accelerator/afritech",
      ctaText: "Voir l'accélérateur",
      priority: 75
    }
  },
  {
    matchNames: ["GreenAfrica Initiative", "Seedstars"],
    update: {
      name: "Seedstars",
      description:
        "Plateforme mondiale d'investissement et de programmes d'accélération pour entrepreneurs dans les marchés émergents, dont l'Afrique.",
      website: "https://www.seedstars.com",
      ctaText: "Découvrir Seedstars",
      priority: 70
    }
  },
  {
    matchNames: ["AfroFashion Week", "AfricArena"],
    update: {
      name: "AfricArena",
      description:
        "Sommet et réseau tech africain connectant startups, investisseurs et grandes entreprises autour de l'innovation sur le continent.",
      website: "https://www.africarena.com",
      ctaText: "Voir les événements",
      priority: 65
    }
  }
];

async function main() {
  await mongoose.connect(env.MONGODB_URI);

  let modified = 0;
  for (const replacement of replacements) {
    const result = await Sponsor.updateMany(
      { name: { $in: replacement.matchNames } },
      { $set: replacement.update }
    );
    modified += result.modifiedCount;
    console.log(`${replacement.update.name}: ${result.modifiedCount} sponsor(s) mis à jour`);
  }

  console.log(`Total mis à jour: ${modified}`);
  await mongoose.disconnect();
}

main().catch(async error => {
  console.error(error);
  try {
    await mongoose.disconnect();
  } catch {
    // Ignore disconnect errors during failure handling.
  }
  process.exit(1);
});
