import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withRoleAuthorization } from '@/lib/authMiddleware';

// Helper pour agréger les données
const aggregateBy = (clicks: { [key: string]: any }[], key: string) => {
    const aggregation = clicks.reduce((acc, click) => {
        const value = click[key] || 'Inconnu';
        acc[value] = (acc[value] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    return Object.entries(aggregation).map(([name, value]) => ({ name, clicks: value }));
};

// Configuration pour éviter la mise en cache
export const dynamic = 'force-dynamic';

// Définir la fonction GET avec le middleware
const GET = withRoleAuthorization(['STANDARD', 'PRO', 'ENTERPRISE'])(
    async function GET(request: Request, { params }: { params: { shortCode: string } }) {
        try {
            const { shortCode } = params;
            const user = (request as any).user; // Récupérer l'utilisateur du middleware
            
            // D'abord récupérer le lien de base pour vérifier s'il appartient à une équipe
            const baseLink = await prisma.link.findUnique({
                where: { short_code: shortCode },
                select: { id: true, team_id: true, user_id: true }
            });

            if (!baseLink) {
                return NextResponse.json(
                    { success: false, error: 'Lien non trouvé' },
                    { status: 404 }
                );
            }

            // Ensuite, récupérer les détails complets avec les clics
            const linkWithClicks = await prisma.link.findUnique({
                where: { id: baseLink.id },
                include: { 
                    clicks: {
                        orderBy: { clicked_at: 'desc' },
                        take: 1000
                    },
                    user: {
                        select: {
                            id: true,
                            email: true,
                            role: true
                        }
                    },
                    ...(baseLink.team_id ? {
                        team: {
                            select: {
                                id: true,
                                members: {
                                    where: { userId: user.id },
                                    select: { role: true }
                                }
                            }
                        }
                    } : {})
                }
            });

            if (!linkWithClicks) {
                return NextResponse.json(
                    { success: false, error: 'Lien non trouvé' },
                    { status: 404 }
                );
            }

            // Vérifier les permissions
            const hasAccess = linkWithClicks.user_id === user.id || 
                (linkWithClicks.team_id && 
                 linkWithClicks.team?.members?.some(member => 
                    member.role === 'ADMIN' || member.role === 'OWNER'
                 ));

            if (!hasAccess) {
                return NextResponse.json(
                    { success: false, error: 'Accès non autorisé.' },
                    { status: 403 }
                );
            }

            // Préparer les statistiques avec typage fort
            const clicks = linkWithClicks.clicks || [];
            const stats = {
                totalClicks: linkWithClicks.click_count || 0,
                long_url: linkWithClicks.long_url,
                title: linkWithClicks.title || '',
                createdAt: linkWithClicks.created_at,
                lastClicked: clicks[0]?.clicked_at || null,
                userId: linkWithClicks.user_id,
                teamId: linkWithClicks.team_id || null,
                countries: aggregateBy(clicks, 'country'),
                referers: aggregateBy(clicks, 'referer'),
                devices: aggregateBy(clicks, 'device_type'),
                browsers: aggregateBy(clicks, 'browser'),
                os: aggregateBy(clicks, 'os'),
                dailyClicks: clicks.reduce<Record<string, number>>((acc, click) => {
                    const date = new Date(click.clicked_at).toISOString().split('T')[0];
                    acc[date] = (acc[date] || 0) + 1;
                    return acc;
                }, {})
            };

            return NextResponse.json({ success: true, data: stats });
            
        } catch (error) {
            console.error('Error fetching link stats:', error);
            return NextResponse.json(
                { 
                    success: false, 
                    error: error instanceof Error ? error.message : 'Erreur serveur' 
                },
                { status: 500 }
            );
        }
    }
);

export { GET };
