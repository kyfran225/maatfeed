import { Schema, model, Document } from "mongoose";

export interface ISponsor extends Document {
  name: string;
  logo?: string;
  description: string;
  website?: string;
  ctaText?: string;
  isActive: boolean;
  priority: number; // Pour l'ordre d'affichage (plus élevé = plus prioritaire)
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: Schema.Types.ObjectId; // Référence à l'utilisateur admin qui l'a créé
  stats: {
    impressions: number;
    clicks: number;
    lastShown?: Date;
  };
}

const sponsorSchema = new Schema<ISponsor>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  logo: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  website: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        if (!v) return true;
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Le site web doit être une URL valide commençant par http:// ou https://'
    }
  },
  ctaText: {
    type: String,
    trim: true,
    maxlength: 50,
    default: "En savoir plus"
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stats: {
    impressions: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    lastShown: {
      type: Date
    }
  }
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
sponsorSchema.index({ isActive: 1, priority: -1, startDate: -1 });
sponsorSchema.index({ endDate: 1 }); // Index pour filtrer les expirés (pas de TTL - on garde l'historique)

// Middleware pour valider les dates
sponsorSchema.pre('save', function(next) {
  if (this.endDate && this.endDate <= this.startDate) {
    next(new Error('La date de fin doit être postérieure à la date de début'));
  }
  next();
});

export const Sponsor = model<ISponsor>('Sponsor', sponsorSchema);