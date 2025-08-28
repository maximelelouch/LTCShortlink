import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '@/lib/email';

/**
 * Génère un code de vérification numérique à 6 chiffres.
 * @returns {string} Un code de 6 chiffres sous forme de chaîne.
 */
const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Gère l'inscription de nouveaux utilisateurs.
 * Étapes :
 * 1. Valide les données d'entrée (username, email, password).
 * 2. Vérifie si l'email ou le nom d'utilisateur n'est pas déjà utilisé.
 * 3. Hache le mot de passe de l'utilisateur.
 * 4. Crée un nouvel utilisateur dans la base de données avec un statut non vérifié.
 * 5. Envoie un e-mail de vérification contenant un code unique.
 */
export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    // 2. Logique de validation des entrées
    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Le nom d\'utilisateur, l\'email et le mot de passe sont requis.' },
        { status: 400 }
      );
    }
    if (username.length < 3 || username.length > 20) {
      return NextResponse.json(
        { success: false, error: 'Le nom d\'utilisateur doit contenir entre 3 et 20 caractères.' },
        { status: 400 }
      );
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Le format de l\'email est invalide.' },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Le mot de passe doit contenir au moins 8 caractères.' },
        { status: 400 }
      );
    }

    // 3. Vérification de l'unicité (email et nom d'utilisateur)
    const lowercasedEmail = email.toLowerCase();
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: lowercasedEmail }, { username: username }],
      },
    });

    if (existingUser) {
      const message = existingUser.email === lowercasedEmail
        ? 'Un compte avec cet email existe déjà.'
        : 'Ce nom d\'utilisateur est déjà pris.';
      return NextResponse.json(
        { success: false, error: message },
        { status: 409 }
      );
    }

    // 4. Hachage du mot de passe et génération du code
    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationCode = generateVerificationCode();
    const verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // Expire dans 10 minutes

    // 5. Création de l'utilisateur dans la base de données
    let user;
    try {
      user = await prisma.user.create({
        data: {
          username,
          email: lowercasedEmail,
          password: hashedPassword,
          verificationCode,
          verificationCodeExpiry,
          role: 'FREE', // Rôle par défaut pour tout nouvel utilisateur
        },
      });

      // 6. Envoi de l'email de vérification après la création réussie de l'utilisateur
      await sendVerificationEmail(lowercasedEmail, verificationCode);
    } catch (error) {
      // Si l'une des opérations ci-dessus échoue (ex: l'envoi d'email),
      // nous nous assurons de nettoyer en supprimant l'utilisateur qui a pu être créé.
      if (user) {
        await prisma.user.delete({ where: { id: user.id } });
      }
      // On relance l'erreur pour qu'elle soit attrapée par le bloc catch principal.
      throw error;
    }

    // 7. Envoi de la réponse de succès
    return NextResponse.json(
      { success: true, message: 'Inscription réussie. Un code de vérification a été envoyé à votre email.' },
      { status: 201 }
    );

  } catch (error) {
    console.error("Erreur d'inscription ou d'envoi d'email:", error);
    return NextResponse.json(
      { success: false, error: 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}