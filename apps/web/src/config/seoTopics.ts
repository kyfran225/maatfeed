export interface SeoTopic {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  keywords: string[];
  intro: string;
  sections: {
    heading: string;
    body: string;
  }[];
  relatedQueries: string[];
}

export const seoTopics: SeoTopic[] = [
  {
    slug: "spiritualite-africaine",
    title: "Spiritualite africaine",
    shortTitle: "Spiritualite",
    description:
      "Explore la spiritualite africaine avec MAATFEED: traditions, Kemet, ancetres, rites, symboles et debats pour apprendre avec nuance.",
    keywords: [
      "spiritualite africaine",
      "spiritualite africaine traditionnelle",
      "rites africains",
      "ancetres africains",
      "kemet spiritualite"
    ],
    intro:
      "La spiritualite africaine ne se reduit ni a un folklore ni a une curiosite mystique. Elle rassemble des visions du monde, des pratiques, des symboles et des formes de transmission qui relient l'humain a la communaute, aux ancetres, a la nature, au sacre et a l'equilibre social.",
    sections: [
      {
        heading: "Comprendre avant de juger",
        body:
          "MAATFEED met en avant des contenus qui aident a replacer les pratiques spirituelles africaines dans leur contexte historique, culturel et philosophique. L'objectif est de distinguer les savoirs documentes, les interpretations modernes, les usages populaires et les stereotypes."
      },
      {
        heading: "Kemet, ancetres et traditions vivantes",
        body:
          "Les recherches autour de Kemet, de la Maât, des cultes ancestraux, des rites de protection ou des traditions de guerison permettent d'aborder la spiritualite africaine comme un champ vivant. Les contenus sont faits pour ouvrir la discussion, pas pour imposer une croyance unique."
      },
      {
        heading: "Apprendre par le debat",
        body:
          "Chaque contenu peut devenir un point de depart pour confronter les sources, poser des questions et construire une comprehension plus solide. MAATFEED relie videos, audio et conversations communautaires autour d'une meme intention: apprendre avec rigueur."
      }
    ],
    relatedQueries: [
      "spiritualite africaine traditionnelle",
      "Kemet et spiritualite",
      "rites africains",
      "ancetres africains"
    ]
  },
  {
    slug: "savoirs-africains",
    title: "Savoirs africains",
    shortTitle: "Savoirs",
    description:
      "MAATFEED rassemble des contenus sur les savoirs africains: histoire, philosophie, sciences, traditions, transmission et debats.",
    keywords: [
      "savoirs africains",
      "savoir africain",
      "connaissances africaines",
      "traditions africaines",
      "transmission africaine"
    ],
    intro:
      "Les savoirs africains couvrent l'histoire, la philosophie, les sciences, la spiritualite, les langues, les arts, les techniques, la medecine traditionnelle et les formes de gouvernance. Ils ne forment pas un bloc uniforme: ils sont pluriels, situes, discutes et transmis de generation en generation.",
    sections: [
      {
        heading: "Une bibliotheque vivante",
        body:
          "MAATFEED organise la decouverte de contenus autour des connaissances produites sur le continent africain et dans les diasporas. L'app aide a passer d'un simple flux de videos a un parcours de comprehension."
      },
      {
        heading: "Histoire, sciences et transmission",
        body:
          "Les contenus traitent des civilisations anciennes, des royaumes africains, des pensees philosophiques, des savoirs medicinaux, des pratiques educatives et des debats contemporains. Le but est de rendre ces sujets accessibles sans les appauvrir."
      },
      {
        heading: "Un espace pour comparer les sources",
        body:
          "Un savoir devient plus fort lorsqu'il est questionne. MAATFEED encourage les commentaires, les debats et les retours critiques pour separer les faits, les hypotheses, les opinions et les recits populaires."
      }
    ],
    relatedQueries: [
      "savoirs traditionnels africains",
      "connaissances africaines",
      "histoire des savoirs africains",
      "transmission africaine"
    ]
  },
  {
    slug: "philosophie-africaine",
    title: "Philosophie africaine",
    shortTitle: "Philosophie",
    description:
      "Decouvre la philosophie africaine sur MAATFEED: Ubuntu, Maât, pensees africaines, ethique, communaute et debats contemporains.",
    keywords: [
      "philosophie africaine",
      "pensee africaine",
      "Ubuntu",
      "Maât",
      "sagesse africaine"
    ],
    intro:
      "La philosophie africaine interroge l'etre humain, la communaute, la justice, la parole, l'equilibre, la responsabilite et la transmission. Elle se retrouve dans des textes, des proverbes, des pratiques sociales, des cosmologies et des debats universitaires.",
    sections: [
      {
        heading: "Des concepts pour penser le present",
        body:
          "Ubuntu, Maât, solidarite, harmonie, verite, memoire et responsabilite ne sont pas seulement des notions anciennes. Ce sont des outils pour relire les enjeux actuels: identite, justice sociale, education, politique et rapport au vivant."
      },
      {
        heading: "Entre tradition orale et recherche",
        body:
          "MAATFEED met en relation des contenus de vulgarisation, des explications historiques et des discussions critiques. Cette approche aide a ne pas separer artificiellement les savoirs oraux, les pratiques culturelles et les travaux intellectuels."
      },
      {
        heading: "Debattre sans simplifier",
        body:
          "La philosophie africaine gagne a etre discutee avec precision. L'app favorise les questions, les nuances et les confrontations d'idees plutot que les slogans."
      }
    ],
    relatedQueries: [
      "pensee africaine",
      "Ubuntu philosophie africaine",
      "Maât philosophie",
      "sagesse africaine"
    ]
  },
  {
    slug: "histoire-africaine",
    title: "Histoire africaine",
    shortTitle: "Histoire",
    description:
      "Explore l'histoire africaine avec MAATFEED: Kemet, royaumes, empires, diaspora, memoire et lectures critiques du passe.",
    keywords: [
      "histoire africaine",
      "royaumes africains",
      "empires africains",
      "histoire de l'Afrique",
      "diaspora africaine"
    ],
    intro:
      "L'histoire africaine est souvent abordee a travers quelques fragments. MAATFEED aide a reconnecter les periodes, les territoires, les civilisations, les figures, les ruptures et les continuites pour mieux comprendre le present.",
    sections: [
      {
        heading: "Des royaumes aux diasporas",
        body:
          "Les contenus couvrent les royaumes africains, les empires, Kemet, les routes commerciales, les resistances, les migrations et les diasporas. Chaque sujet peut etre explore par video, audio ou discussion."
      },
      {
        heading: "Sortir des recits trop courts",
        body:
          "Un bon apprentissage historique demande des sources, des dates, des contextes et des points de vue compares. MAATFEED donne un cadre pour aller au-dela des extraits viraux et construire une memoire plus solide."
      },
      {
        heading: "Relier memoire et debat",
        body:
          "L'histoire n'est pas seulement une accumulation de faits: elle influence l'identite, l'education et les choix collectifs. Les debats permettent d'examiner ce que ces recits changent dans notre maniere de voir le monde."
      }
    ],
    relatedQueries: [
      "histoire de l'Afrique",
      "empires africains",
      "royaumes africains oublies",
      "diaspora africaine"
    ]
  },
  {
    slug: "kemet",
    title: "Kemet",
    shortTitle: "Kemet",
    description:
      "Kemet sur MAATFEED: Egypte ancienne, Maât, spiritualite, symboles, histoire et heritage africain discutes avec nuance.",
    keywords: [
      "Kemet",
      "Egypte ancienne africaine",
      "Maât",
      "spiritualite kemet",
      "civilisation egyptienne"
    ],
    intro:
      "Kemet designe l'Egypte ancienne dans de nombreuses discussions afrocentrees et historiques. Le sujet touche a l'histoire, a la spiritualite, aux symboles, a la Maât, a la memoire africaine et aux debats sur l'heritage culturel.",
    sections: [
      {
        heading: "Un sujet historique et symbolique",
        body:
          "MAATFEED propose de decouvrir Kemet sans reduire le sujet a une image decorative. Les contenus abordent les concepts, les textes, les figures, les pratiques et les interpretations modernes."
      },
      {
        heading: "Maât, ordre et responsabilite",
        body:
          "La Maât permet d'interroger la verite, l'equilibre, la justice et l'harmonie. Ces themes relient spiritualite, morale, politique et vie collective."
      },
      {
        heading: "Comparer les lectures",
        body:
          "Kemet est un sujet discute. MAATFEED encourage la comparaison des sources, la distinction entre histoire, spiritualite, interpretation personnelle et affirmation non verifiee."
      }
    ],
    relatedQueries: [
      "Kemet spiritualite",
      "Maât Egypte ancienne",
      "heritage de Kemet",
      "Egypte ancienne africaine"
    ]
  }
];

export function getSeoTopic(slug: string | undefined) {
  return seoTopics.find((topic) => topic.slug === slug);
}
