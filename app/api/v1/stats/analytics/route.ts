import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { Session } from 'next-auth';

// Étendre le type Session pour inclure notre `id` personnalisé
interface CustomSession extends Session {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    id?: string;
    role?: string;
  };
}

export async function GET(request: NextRequest) {
  console.log('Début de la requête GET /api/v1/stats/analytics');
  try {
    // 1. Authentification et récupération de la session
    const session: CustomSession | null = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.error('Erreur d\'authentification: Aucun utilisateur connecté');
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }
    const userId = parseInt(session.user.id);

    const { searchParams } = new URL(request.url);
    const teamIdStr = searchParams.get('teamId');

    // 2. Logique de contexte (équipe ou personnel)
    let linkWhereClause: any = { user_id: userId, team_id: null };
    
    if (teamIdStr) {
      const teamId = parseInt(teamIdStr);
      if (isNaN(teamId)) {
          return NextResponse.json({ success: false, error: 'ID d\'équipe invalide.' }, { status: 400 });
      }

      // Vérification des permissions
      const teamAccess = await prisma.teamMember.findFirst({
        where: { teamId: teamId, userId: userId }
      });
      if (!teamAccess) {
        return NextResponse.json({ success: false, error: 'Accès non autorisé à cette équipe' }, { status: 403 });
      }
      linkWhereClause = { team_id: teamId };
    }
    
    console.log('Clause WHERE pour les liens:', JSON.stringify(linkWhereClause, null, 2));
    
    // 3. Débogage : Vérification des données existantes
    console.log('=== DÉBOGAGE : Vérification des données ===');
    
    // Vérifier les liens de l'utilisateur
    const userLinks = await prisma.link.findMany({
      where: linkWhereClause,
      select: { id: true, short_code: true, long_url: true, click_count: true }
    });
    console.log(`Liens trouvés pour l'utilisateur ${userId}:`, userLinks.length);
    console.log('Détails des liens:', userLinks);
    
    if (userLinks.length === 0) {
      console.log('Aucun lien trouvé pour cet utilisateur');
      return NextResponse.json({
        success: true,
        data: {
          totalClicks: 0,
          uniqueVisitors: 0,
          countries: [],
          browsers: [],
          os: [],
          devices: [],
          cities: [],
          referers: []
        }
      });
    }
    
    // Vérifier tous les clics
    const allClicks = await prisma.click.findMany({
      where: {
        link_id: { in: userLinks.map(link => link.id) }
      },
      select: { 
        id: true, 
        link_id: true, 
        ip_address: true, 
        country: true, 
        browser: true, 
        os: true, 
        device_type: true, 
        city: true, 
        referer: true 
      }
    });
    console.log(`Clics trouvés:`, allClicks.length);
    console.log('Échantillon de clics:', allClicks.slice(0, 3));
    
    if (allClicks.length === 0) {
      console.log('Aucun clic trouvé pour ces liens');
      return NextResponse.json({
        success: true,
        data: {
          totalClicks: 0,
          uniqueVisitors: 0,
          countries: [],
          browsers: [],
          os: [],
          devices: [],
          cities: [],
          referers: []
        }
      });
    }
    
    // 4. Calculs directs avec les données récupérées
    const totalClicks = allClicks.length;
    
    // Visiteurs uniques (IPs distinctes)
    const uniqueIPs = new Set(allClicks.filter(click => click.ip_address).map(click => click.ip_address));
    const uniqueVisitors = uniqueIPs.size;
    
    // Fonction pour compter et grouper
    const groupAndCount = (field: keyof typeof allClicks[0]) => {
      const counts: { [key: string]: number } = {};
      allClicks.forEach(click => {
        const value = click[field];
        if (value && value !== null) {
          const key = String(value);
          counts[key] = (counts[key] || 0) + 1;
        }
      });
      
      return Object.entries(counts)
        .map(([name, clicks]) => ({ name, clicks }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 10);
    };
    
    const countries = groupAndCount('country');
    const browsers = groupAndCount('browser');
    const os = groupAndCount('os');
    const devices = groupAndCount('device_type');
    const cities = groupAndCount('city');
    const referers = groupAndCount('referer');
    
    console.log('=== RÉSULTATS CALCULÉS ===');
    console.log('Total clics:', totalClicks);
    console.log('Visiteurs uniques:', uniqueVisitors);
    console.log('Pays:', countries.length, 'éléments');
    console.log('Navigateurs:', browsers.length, 'éléments');
    console.log('OS:', os.length, 'éléments');
    console.log('Appareils:', devices.length, 'éléments');
    console.log('Villes:', cities.length, 'éléments');
    console.log('Référents:', referers.length, 'éléments');
    
    // 5. Préparation de la réponse finale
    const responseData = {
      success: true,
      data: {
        totalClicks,
        uniqueVisitors,
        countries,
        browsers,
        os,
        devices,
        cities,
        referers
      }
    };

    console.log('Données finales envoyées:', responseData);
    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('Erreur détaillée lors de la récupération des statistiques:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      meta: error.meta
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération des statistiques',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}