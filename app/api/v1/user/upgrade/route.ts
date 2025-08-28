import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// Définition du schéma de validation avec Zod
const upgradeSchema = z.object({
  targetRole: z.enum(['STANDARD', 'PRO', 'ENTERPRISE'], {
    required_error: 'Le rôle cible est requis',
    invalid_type_error: 'Le rôle cible doit être STANDARD, PRO ou ENTERPRISE'
  })
});

// Types dérivés du schéma
type UpgradeInput = z.infer<typeof upgradeSchema>;

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }
    
    const requestData = await request.json();
    
    // Validation des données avec Zod
    const validation = upgradeSchema.safeParse(requestData);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Données de requête invalides',
          details: validation.error.format()
        },
        { status: 400 }
      );
    }
    
    const { targetRole } = validation.data;
    const userId = session.user.id;
    
    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId, 10) }
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    // Mise à jour du rôle de l'utilisateur
    await prisma.user.update({
      where: { id: parseInt(userId, 10) },
      data: { role: targetRole },
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Compte mis à niveau avec succès',
      data: {

        
        
        role: targetRole
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la mise à niveau du compte:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Une erreur est survenue lors de la mise à niveau du compte',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
