import { logger } from "../config/logger.js";

// Email service configuration
const RESEND_API_URL = "https://api.resend.com/emails";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const FROM_EMAIL_RAW = process.env.FROM_EMAIL?.trim() || "noreply@maatfeed.com";
const FROM_EMAIL = FROM_EMAIL_RAW.includes("<") ? FROM_EMAIL_RAW : `MAAT FEED <${FROM_EMAIL_RAW}>`;
const APP_BASE_URL = process.env.APP_BASE_URL || "http://localhost:5173";

// Attachment interface
interface EmailAttachment {
  content?: string;
  path?: string;
  filename: string;
  contentId?: string;
  contentType?: string;
}

// Template result type
interface TemplateResult {
  subject: string;
  html: string;
  text: string;
  attachments?: EmailAttachment[];
}

// Welcome email template
function getWelcomeEmail(displayName: string, loginUrl: string): TemplateResult {
  return {
    subject: "🎉 Bienvenue sur MAAT FEED !",
    html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>body{font-family:Georgia,serif;background:#1a1a2e;color:#e8e8e8;margin:0;padding:0}.container{max-width:600px;margin:0 auto;padding:40px 20px}.header{text-align:center;margin-bottom:30px}.logo{font-size:28px;font-weight:bold;color:#d4af37;letter-spacing:2px}.content{background:rgba(255,255,255,0.05);padding:30px;border-radius:12px;border:1px solid rgba(212,175,55,0.3)}h1{color:#d4af37;font-size:24px;margin-bottom:20px}p{line-height:1.6;margin-bottom:16px}.cta-button{display:inline-block;background:linear-gradient(135deg,#d4af37,#b8941f);color:#1a1a2e;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;margin:20px 0}.footer{text-align:center;margin-top:30px;font-size:12px;color:#888}.ankh{font-size:40px;text-align:center;margin-bottom:20px}</style>
</head><body>
<div class="container"><div class="header"><div class="ankh">☥</div><div class="logo">MAAT FEED</div></div>
<div class="content"><h1>Bienvenue, ${displayName} !</h1><p>Vous faites maintenant partie de la communauté MAAT FEED, dédiée à la découverte et au partage de la sagesse de la civilisation Kemet et de la philosophie africaine.</p><p>Commencez votre voyage en explorant notre contenu exclusif :</p>
<center><a href="${loginUrl}" class="cta-button">Explorer le contenu</a></center>
<p>Que découvrirez-vous aujourd'hui ?</p><p style="color:#d4af37">✨ La vérité (Maat) vous guidera.</p></div>
<div class="footer"><p>© 2024 MAAT FEED. Tous droits réservés.</p></div></div>
</body></html>`,
    text: `Bienvenue sur MAAT FEED, ${displayName} !\n\nVous faites maintenant partie de notre communauté dédiée à la sagesse Kemet et à la philosophie africaine.\n\nCommencez votre voyage : ${loginUrl}\n\nLa vérité (Maat) vous guidera.\n\n© 2024 MAAT FEED`
  };
}

// Verification email template
function getVerificationEmail(displayName: string, verificationUrl: string, expiresIn: string): TemplateResult {
  const logoUrl = `${APP_BASE_URL}/favicon_io/logo-kemet-site.webp`;
  return {
    subject: "✅ Vérifiez votre adresse email - MAAT FEED",
    html: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vérifiez votre email - MAAT FEED</title>
</head>
<body style="margin:0;padding:0;font-family:Georgia,serif;background-color:#201713;color:#e8e8e8;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <img src="${logoUrl}" alt="MAAT FEED Logo" width="80" height="80" style="display:block;margin:0 auto 12px;border-radius:12px;border:2px solid #d4af37;">
              <div style="font-size:28px;font-weight:bold;color:#d4af37;letter-spacing:3px;text-transform:uppercase;">MAAT FEED</div>
              <div style="font-size:12px;color:#888;margin-top:4px;">La sagesse de la civilisation Kemet</div>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="background-color:rgba(255,255,255,0.05);padding:30px;border-radius:12px;border:1px solid rgba(212,175,55,0.3);">
              <h1 style="color:#d4af37;font-size:24px;margin:0 0 20px 0;text-align:center;">Confirmez votre adresse email</h1>
              <p style="margin:0 0 16px 0;line-height:1.6;">Bonjour <strong style="color:#d4af37;">${displayName}</strong>,</p>
              <p style="margin:0 0 24px 0;line-height:1.6;">Merci de rejoindre MAAT FEED ! Pour finaliser votre inscription et sécuriser votre compte, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :</p>
              <!-- Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding:20px 0;">
                    <a href="${verificationUrl}" style="display:inline-block;background:linear-gradient(135deg,#d4af37,#b8941f);color:#201713;text-decoration:none;padding:16px 40px;border-radius:8px;font-weight:bold;font-size:16px;border:none;">VÉRIFIER MON EMAIL</a>
                  </td>
                </tr>
              </table>
              <!-- Expiry Notice -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background-color:rgba(212,175,55,0.1);padding:12px 16px;border-radius:6px;border-left:3px solid #d4af37;">
                    <p style="margin:0;font-size:14px;color:#d4af37;">⏰ Ce lien expire dans <strong>${expiresIn}</strong></p>
                  </td>
                </tr>
              </table>
              <!-- Fallback Link -->
              <p style="margin:24px 0 8px 0;font-size:14px;color:#888;">Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
              <p style="margin:0;padding:10px;background-color:rgba(255,255,255,0.05);border-radius:4px;font-family:monospace;font-size:12px;word-break:break-all;color:#d4af37;">${verificationUrl}</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:30px;">
              <p style="margin:0;font-size:12px;color:#888;">© 2024 MAAT FEED - Tous droits réservés</p>
              <p style="margin:8px 0 0 0;font-size:11px;color:#666;">Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    text: `MAAT FEED - Vérification d'email\n\nBonjour ${displayName},\n\nMerci de rejoindre MAAT FEED !\n\nConfirmez votre email : ${verificationUrl}\n\nCe lien expire dans ${expiresIn}.\n\n© 2024 MAAT FEED`
  };
}

// Password reset email template
function getPasswordResetEmail(displayName: string, resetUrl: string, expiresIn: string, ipAddress?: string): TemplateResult {
  const ipText = ipAddress ? `<br><br>Demande effectuée depuis l'IP: ${ipAddress}` : "";
  const ipPlain = ipAddress ? `\nIP: ${ipAddress}` : "";
  return {
    subject: "🔐 Réinitialisation de votre mot de passe - MAAT FEED",
    html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Réinitialisation</title>
<style>body{font-family:Georgia,serif;background:#1a1a2e;color:#e8e8e8}.container{max-width:600px;margin:0 auto;padding:40px 20px}.logo{font-size:28px;font-weight:bold;color:#d4af37;text-align:center;margin-bottom:30px}.content{background:rgba(255,255,255,0.05);padding:30px;border-radius:12px}h1{color:#d4af37}.cta-button{display:inline-block;background:linear-gradient(135deg,#d4af37,#b8941f);color:#1a1a2e;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold}.expiry{background:rgba(212,175,55,0.1);padding:12px;border-radius:6px;border-left:3px solid #d4af37;margin:20px 0}.security{background:rgba(255,100,100,0.1);padding:12px;border-radius:6px;border-left:3px solid #ff6464}.footer{text-align:center;margin-top:30px;font-size:12px;color:#888}</style>
</head><body>
<div class="container"><div class="logo">MAAT FEED</div><div class="content">
<h1>Réinitialisation de mot de passe</h1><p>Bonjour ${displayName},</p><p>Nous avons reçu une demande de réinitialisation pour votre compte.</p>
<center><a href="${resetUrl}" class="cta-button">Réinitialiser mon mot de passe</a></center>
<div class="expiry">⏰ Ce lien expire dans ${expiresIn}</div>
<div class="security">🛡️ Si vous n'avez pas fait cette demande, ignorez cet email. Votre mot de passe restera inchangé.${ipText}</div>
</div><div class="footer"><p>© 2024 MAAT FEED</p></div></div>
</body></html>`,
    text: `Réinitialisation de mot de passe - MAAT FEED\n\nBonjour ${displayName},\n\nRéinitialisez votre mot de passe : ${resetUrl}\n\n⏰ Expire dans ${expiresIn}\n\n🛡️ Si vous n'avez pas fait cette demande, ignorez cet email.${ipPlain}\n\n© 2024 MAAT FEED`
  };
}

// Password changed email template
function getPasswordChangedEmail(displayName: string, changedAt: string, loginUrl: string, ipAddress?: string): TemplateResult {
  const ipHtml = ipAddress ? `<p>Opération effectuée depuis l'IP: ${ipAddress}</p>` : "";
  const ipPlain = ipAddress ? `\nIP: ${ipAddress}` : "";
  return {
    subject: "🔐 Votre mot de passe a été modifié - MAAT FEED",
    html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Confirmation</title>
<style>body{font-family:Georgia,serif;background:#1a1a2e;color:#e8e8e8}.container{max-width:600px;margin:0 auto;padding:40px 20px}.logo{font-size:28px;font-weight:bold;color:#d4af37;text-align:center}.content{background:rgba(255,255,255,0.05);padding:30px;border-radius:12px;margin-top:20px}h1{color:#d4af37}.success{background:rgba(100,200,100,0.2);color:#64c864;padding:10px 20px;border-radius:20px;display:inline-block}.footer{text-align:center;margin-top:30px;font-size:12px;color:#888}</style>
</head><body>
<div class="container"><div class="logo">MAAT FEED</div><div class="content">
<h1>Modification confirmée</h1><div class="success">✓ Mot de passe changé avec succès</div>
<p>Bonjour ${displayName},</p><p>Votre mot de passe a été modifié le ${changedAt}.</p>${ipHtml}
<p>Si ce n'était pas vous, contactez immédiatement notre support.</p>
</div><div class="footer"><p>© 2024 MAAT FEED</p></div></div>
</body></html>`,
    text: `Mot de passe modifié - MAAT FEED\n\nBonjour ${displayName},\n\nVotre mot de passe a été modifié le ${changedAt}.${ipPlain}\n\nSi ce n'était pas vous, contactez-nous.\n\n© 2024 MAAT FEED`
  };
}

// Security alert email template
function getSecurityAlertEmail(displayName: string, alertType: string, details: string, actionUrl: string, ipAddress?: string): TemplateResult {
  const ipHtml = ipAddress ? `<p><strong>IP détectée :</strong> ${ipAddress}</p>` : "";
  const ipPlain = ipAddress ? `\nIP détectée: ${ipAddress}` : "";
  return {
    subject: `🛡️ Alerte de sécurité - ${alertType}`,
    html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Alerte</title>
<style>body{font-family:Georgia,serif;background:#1a1a2e;color:#e8e8e8}.container{max-width:600px;margin:0 auto;padding:40px 20px}.logo{font-size:28px;font-weight:bold;color:#d4af37;text-align:center}.alert{background:rgba(255,100,100,0.2);color:#ff6464;padding:20px;text-align:center;border-radius:8px;margin:20px 0}.content{background:rgba(255,255,255,0.05);padding:30px;border-radius:12px}h1{color:#ff6464}.cta-button{display:inline-block;background:#ff6464;color:white;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold}.footer{text-align:center;margin-top:30px;font-size:12px;color:#888}</style>
</head><body>
<div class="container"><div class="logo">MAAT FEED</div><div class="alert">🛡️ ALERTE DE SÉCURITÉ</div><div class="content">
<h1>${alertType}</h1><p>Bonjour ${displayName},</p><p>${details}</p>${ipHtml}
<center><a href="${actionUrl}" class="cta-button">Vérifier mon compte</a></center>
</div><div class="footer"><p>© 2024 MAAT FEED</p></div></div>
</body></html>`,
    text: `🛡️ ALERTE DE SÉCURITÉ - ${alertType}\n\nBonjour ${displayName},\n\n${details}${ipPlain}\n\nAction requise: ${actionUrl}\n\n© 2024 MAAT FEED`
  };
}

// Trust level upgraded email template
function getTrustLevelEmail(displayName: string, newLevel: string, benefits: string[], exploreUrl: string): TemplateResult {
  const benefitsHtml = benefits.map((b) => `<li>✨ ${b}</li>`).join("");
  const benefitsPlain = benefits.map((b) => `✨ ${b}`).join("\n");
  return {
    subject: `🏆 Félicitations ! Vous êtes maintenant "${newLevel}"`,
    html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Félicitations</title>
<style>body{font-family:Georgia,serif;background:#1a1a2e;color:#e8e8e8}.container{max-width:600px;margin:0 auto;padding:40px 20px}.logo{font-size:28px;font-weight:bold;color:#d4af37;text-align:center}.celebration{text-align:center;font-size:60px;margin:20px 0}.content{background:rgba(212,175,55,0.1);padding:30px;border-radius:12px;border:1px solid #d4af37}h1{color:#d4af37;text-align:center}.level{background:linear-gradient(135deg,#d4af37,#f0d878);color:#1a1a2e;padding:10px 30px;border-radius:30px;display:inline-block;font-weight:bold;font-size:20px}.benefits{background:rgba(255,255,255,0.05);padding:20px;border-radius:8px;margin:20px 0}.cta-button{display:inline-block;background:linear-gradient(135deg,#d4af37,#b8941f);color:#1a1a2e;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold}.footer{text-align:center;margin-top:30px;font-size:12px;color:#888}</style>
</head><body>
<div class="container"><div class="logo">MAAT FEED</div><div class="celebration">🎉</div><div class="content">
<h1>Félicitations ${displayName} !</h1><center><div class="level">${newLevel.toUpperCase()}</div></center>
<p style="text-align:center">Votre engagement sur MAAT FEED a été remarqué !</p>
<div class="benefits"><h3 style="color:#d4af37">Nouveaux avantages débloqués :</h3><ul>${benefitsHtml}</ul></div>
<center><a href="${exploreUrl}" class="cta-button">Continuer l'exploration</a></center>
</div><div class="footer"><p>© 2024 MAAT FEED</p></div></div>
</body></html>`,
    text: `🏆 Félicitations ${displayName} !\n\nVous êtes maintenant "${newLevel}" sur MAAT FEED !\n\nNouveaux avantages :\n${benefitsPlain}\n\nContinuez : ${exploreUrl}\n\n© 2024 MAAT FEED`
  };
}

// Send email using Resend API
async function sendEmailInternal(to: string, result: TemplateResult): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!RESEND_API_KEY) {
      logger.warn({ msg: "RESEND_API_KEY not configured, email would be sent", to, subject: result.subject });
      return { success: true, messageId: "dev-mode" };
    }

    // Build request body with optional attachments
    const requestBody: Record<string, unknown> = {
      from: FROM_EMAIL,
      to: [to],
      subject: result.subject,
      html: result.html,
      text: result.text
    };

    // Add attachments if present
    if (result.attachments && result.attachments.length > 0) {
      requestBody.attachments = result.attachments.map(att => ({
        content: att.content,
        filename: att.filename,
        content_id: att.contentId,
        content_type: att.contentType
      }));
    }

    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const responseData = await response.json();
    logger.info({ msg: "Email sent successfully", to, messageId: responseData.id });

    return { success: true, messageId: responseData.id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error({ msg: "Failed to send email", to, subject: result.subject, error: errorMessage });
    return { success: false, error: errorMessage };
  }
}

// Public API - Welcome email
export async function sendWelcomeEmail(to: string, displayName: string) {
  const result = getWelcomeEmail(displayName, `${APP_BASE_URL}/auth`);
  return sendEmailInternal(to, result);
}

// Public API - Verification email
export async function sendVerificationEmail(to: string, displayName: string, token: string) {
  const result = getVerificationEmail(displayName, `${APP_BASE_URL}/verify-email?token=${token}`, "24 heures");
  return sendEmailInternal(to, result);
}

// Public API - Password reset email
export async function sendPasswordResetEmail(to: string, displayName: string, token: string, ipAddress?: string) {
  const result = getPasswordResetEmail(displayName, `${APP_BASE_URL}/reset-password?token=${token}`, "1 heure", ipAddress);
  return sendEmailInternal(to, result);
}

// Public API - Password changed confirmation
export async function sendPasswordChangedEmail(to: string, displayName: string, ipAddress?: string) {
  const result = getPasswordChangedEmail(displayName, new Date().toLocaleString("fr-FR"), `${APP_BASE_URL}/auth`, ipAddress);
  return sendEmailInternal(to, result);
}

// Public API - Security alert
export async function sendSecurityAlertEmail(to: string, displayName: string, alertType: string, details: string, ipAddress?: string) {
  const result = getSecurityAlertEmail(displayName, alertType, details, `${APP_BASE_URL}/profile/security`, ipAddress);
  return sendEmailInternal(to, result);
}

// Public API - Trust level upgraded
export async function sendTrustLevelUpgradedEmail(to: string, displayName: string, newLevel: string, benefits: string[]) {
  const result = getTrustLevelEmail(displayName, newLevel, benefits, `${APP_BASE_URL}/`);
  return sendEmailInternal(to, result);
}
