'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ArrowRight, Zap, Shield, Users, BarChart2, Check } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const pricingPlans = [
  {
    name: 'Standard',
    price: '€9.99',
    period: '/mois',
    description: 'Pour les créateurs de contenu et les petites entreprises',
    features: [
      'Jusqu\'à 10 000 clics/mois',
      'Liens personnalisés',
      'Statistiques avancées',
      'QR Codes personnalisables',
      'Support par email',
      'Jusqu\'à 5 membres d\'équipe'
    ],
    buttonText: 'Choisir Standard',
    popular: false
  },
  {
    name: 'Pro',
    price: '€29.99',
    period: '/mois',
    description: 'Pour les entreprises en croissance',
    features: [
      'Jusqu\'à 50 000 clics/mois',
      'Toutes les fonctionnalités Standard',
      'Jusqu\'à 15 membres d\'équipe',
      'API complète',
      'Support prioritaire',
      'Export de données',
      'Domaines personnalisés',
      'A/B Testing'
    ],
    buttonText: 'Choisir Pro',
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Entreprise',
    price: '5 000€',
    period: '/an',
    description: 'Pour les entreprises avec des besoins avancés',
    features: [
      'Volume illimité de liens',
      'Volume illimité de clics',
      'Toutes les fonctionnalités Pro',
      'Jusqu\'à 50 membres d\'équipe',
      'Gestion des rôles avancée',
      'Support 24/7',
      'Domaines personnalisés illimités',
      'Intégrations personnalisées',
      'SLA 99.9%',
      'Accompagnement personnalisé',
      'Fonctionnalités exclusives'
    ],
    buttonText: 'Choisir Entreprise',
    popular: false
  }
];

export default function UpgradePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleUpgrade = async (plan: string) => {
    console.log('Début de la mise à jour du plan:', plan);
    setIsLoading(plan);
    
    try {
      console.log('Appel API vers /api/v1/user/upgrade avec le plan:', plan);
      const response = await fetch('/api/v1/user/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetRole: plan.toUpperCase() }),
      });

      const responseData = await response.json().catch(e => {
        console.error('Erreur lors de l\'analyse de la réponse:', e);
        throw new Error('Réponse du serveur invalide');
      });

      console.log('Réponse de l\'API:', responseData);
      
      if (!response.ok || !responseData.success) {
        const errorMsg = responseData?.error || 'Échec de la mise à jour du plan';
        console.error('Erreur de l\'API:', errorMsg, responseData);
        throw new Error(errorMsg);
      }

      console.log('Mise à jour de la session avec le nouveau rôle:', responseData.data.role);
      
      try {
        // Mettre à jour la session avec le nouveau rôle
        const sessionUpdate = await fetch('/api/auth/update-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            update: { 
              role: responseData.data.role 
            } 
          })
        });
        
        if (!sessionUpdate.ok) {
          throw new Error('Échec de la mise à jour de la session');
        }
        
        // Mettre à jour la session avec le nouveau rôle
        const updateResult = await update({
          ...session,
          user: {
            ...session.user,
            role: responseData.data.role
          }
        });
        
        console.log('Résultat de la mise à jour de session:', updateResult);
        
        // Forcer un rechargement complet pour s'assurer que tous les composants sont mis à jour
        if (typeof window !== 'undefined') {
          window.location.href = '/dashboard';
        }
        
        toast.success(`Félicitations ! Votre compte a été mis à jour vers le plan ${plan}.`);
      } catch (updateError) {
        console.error('Erreur lors de la mise à jour de la session:', updateError);
        throw new Error('La mise à jour a réussi mais la session n\'a pas pu être mise à jour');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du plan:', error);
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Choisissez votre forfait</h1>
        <p className="text-xl text-gray-600">Sélectionnez le plan qui correspond le mieux à vos besoins</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {pricingPlans.map((plan) => {
          const planId = plan.id || plan.name.toLowerCase();
          const isCurrentPlan = session?.user?.role?.toLowerCase() === plan.name.toLowerCase();
          const isLoadingState = isLoading === planId;
          
          return (
            <div
              key={planId}
              className={`rounded-lg border ${
                plan.popular 
                  ? 'border-2 border-indigo-600 transform scale-105' 
                  : isCurrentPlan 
                    ? 'border-2 border-green-500' 
                    : 'border-gray-200'
              } bg-white p-6 shadow-sm flex flex-col transition-all duration-200`}
            >
              {plan.popular && (
                <div className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full inline-block mb-4">
                  Le plus populaire
                </div>
              )}
              {isCurrentPlan && !plan.popular && (
                <div className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full inline-block mb-4">
                  Votre forfait actuel
                </div>
              )}
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h2>
              <p className="text-gray-600 mb-6">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                {!plan.customButton && <span className="text-gray-500">/mois</span>}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto">
                {plan.customButton ? (
                  <a
                    href="/contact?plan=enterprise"
                    className="w-full block text-center py-3 px-6 rounded-md font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-colors"
                  >
                    {plan.buttonText}
                  </a>
                ) : (
                  <button
                    onClick={() => handleUpgrade(planId)}
                    disabled={isLoadingState || isCurrentPlan}
                    className={`w-full py-3 px-6 rounded-md font-medium transition-colors ${
                      isCurrentPlan
                        ? 'bg-green-100 text-green-700 cursor-not-allowed'
                        : isLoadingState
                          ? 'bg-indigo-400 text-white cursor-wait'
                          : plan.popular
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {isLoadingState ? (
                      <span className="flex items-center justify-center">
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                        Traitement...
                      </span>
                    ) : isCurrentPlan ? (
                      'Forfait actuel'
                    ) : (
                      <span className="flex items-center justify-center">
                        {plan.buttonText}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-16 bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Questions fréquentes</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900">Puis-je changer de forfait à tout moment ?</h3>
            <p className="text-gray-600 mt-1">Oui, vous pouvez passer à un forfait supérieur ou inférieur à tout moment depuis votre tableau de bord.</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Y a-t-il des frais cachés ?</h3>
            <p className="text-gray-600 mt-1">Non, les prix affichés sont tout compris. Aucun frais caché.</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Puis-je annuler à tout moment ?</h3>
            <p className="text-gray-600 mt-1">Oui, vous pouvez annuler votre abonnement à tout moment. Aucun remboursement n'est effectué pour la période en cours.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
