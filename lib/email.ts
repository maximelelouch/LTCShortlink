import nodemailer from 'nodemailer';

// 1. Création d'un "transporteur" SMTP réutilisable.
// Il est configuré une seule fois en lisant les variables d'environnement.
// Configuration du transporteur SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465, // `true` pour le port 465, `false` pour les autres (comme 587)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // Utilisation de SMTP_PASS au lieu de SMTP_PASSWORD
  },
  tls: {
    // Ne pas échouer sur des certificats non valides (utile en développement)
    rejectUnauthorized: process.env.NODE_ENV !== 'production',
  },
});

// 2. Interface pour les options d'email pour garder notre code propre
interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Fonction centrale pour envoyer un e-mail.
 * @param mailOptions - L'objet contenant le destinataire, le sujet et le contenu HTML.
 */
async function sendMail({ to, subject, html }: MailOptions) {
  const options = {
    from: process.env.SMTP_FROM, // Utilisation de SMTP_FROM au lieu de SMTP_FROM_EMAIL
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(options);
    console.log('Email envoyé avec succès : %s', info.messageId);
    return info;
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email via Nodemailer:", error);
    // On lance une erreur pour que l'API appelante sache que l'envoi a échoué.
    throw new Error("Impossible d'envoyer l'email.");
  }
}

/**
 * Envoie l'e-mail de vérification de compte.
 * @param to - L'adresse e-mail du nouvel utilisateur.
 * @param code - Le code de vérification à 6 chiffres.
 */
export async function sendVerificationEmail(to: string, code: string) {
  const subject = 'Votre code de vérification pour Shorty';
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Bonjour !</h2>
      <p>Merci de vous être inscrit sur Shorty. Veuillez utiliser le code ci-dessous pour vérifier votre compte :</p>
      <p style="font-size: 24px; font-weight: bold; letter-spacing: 5px; background-color: #f4f4f4; padding: 10px; border-radius: 5px; text-align: center;">
        ${code}
      </p>
      <p>Ce code expirera dans 10 minutes.</p>
      <p>Si vous n'êtes pas à l'origine de cette inscription, vous pouvez ignorer cet e-mail.</p>
      <p>L'équipe Shorty</p>
    </div>
  `;
  await sendMail({ to, subject, html });
}

/**
 * Envoie l'e-mail d'invitation à une équipe.
 * @param to - L'adresse e-mail de la personne invitée.
 * @param inviterName - Le nom de la personne qui invite.
 * @param teamName - Le nom de l'équipe.
 * @param token - Le token d'invitation unique.
 */
export async function sendTeamInvitationEmail(to: string, inviterName: string, teamName: string, token: string) {
  const invitationUrl = `${process.env.NEXTAUTH_URL}/team/join?token=${token}`;
  const subject = `Invitation à rejoindre l'équipe ${teamName} sur Shorty`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Bonjour !</h2>
      <p><strong>${inviterName}</strong> vous a invité à rejoindre l'équipe <strong>${teamName}</strong> sur Shorty.</p>
      <p>Cliquez sur le bouton ci-dessous pour accepter l'invitation :</p>
      <a href="${invitationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
        Accepter l'invitation
      </a>
      <p style="margin-top: 20px;">Ce lien d'invitation expirera dans 7 jours.</p>
      <p>L'équipe Shorty</p>
    </div>
  `;
  await sendMail({ to, subject, html });
}