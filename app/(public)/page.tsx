'use client';
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { Copy, Link as LinkIcon, Zap } from 'lucide-react';

export default function HomePage() {
  const [longUrl, setLongUrl] = useState('');
  const [shortLink, setShortLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setShortLink('');

    try {
      const response = await fetch('/api/v1/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ longUrl }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      // Utiliser directement le short_code de la réponse
      const shortCode = result.data.short_code || result.data.shortCode;
      if (!shortCode) throw new Error('Aucun code court généré');
      setShortLink(`${window.location.origin}/${shortCode}`);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shortLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-indigo-50">
      <header className="p-4 flex justify-between items-center bg-white shadow-sm">
        <Link href="/" className="flex items-center">
          <Zap className="h-6 w-6 text-indigo-600 mr-2" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">ShortLink</h1>
        </Link>
        <div className="flex items-center space-x-4">
          <Link 
            href="/login" 
            className="px-4 py-2 text-sm font-medium text-indigo-600 bg-white border-2 border-indigo-100 rounded-lg hover:border-indigo-200 transition-colors"
          >
            Se connecter
          </Link>
          <Link 
            href="/register" 
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 shadow-md transition-all"
          >
            S'inscrire
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
              Des liens plus courts, des <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">idées plus grandes</span>.
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
              Transformez vos URLs longues en liens courts, mémorables et traçables. Gratuitement et instantanément.
            </p>

            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    value={longUrl}
                    onChange={(e) => setLongUrl(e.target.value)}
                    placeholder="Collez votre URL ici..."
                    required
                    className="block w-full pl-10 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-4 text-lg font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-70"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Zap className="w-5 h-5 mr-2" />
                      Raccourcir
                    </span>
                  )}
                </button>
              </div>
              {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
            </form>

            {shortLink && (
              <div className="mt-6 p-4 bg-white rounded-xl shadow-md max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between animate-fade-in">
                <span className="font-mono text-indigo-800 mb-2 sm:mb-0 overflow-x-auto max-w-full">
                  {shortLink}
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {copied ? 'Copié !' : 'Copier'}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Comment ça marche */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Comment ça marche ?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-xl bg-gray-50 hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-indigo-600">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Collez votre lien</h3>
                <p className="text-gray-600">Copiez et collez n'importe quelle URL longue dans le champ ci-dessus.</p>
              </div>
              <div className="text-center p-6 rounded-xl bg-gray-50 hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-indigo-600">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Cliquez sur Raccourcir</h3>
                <p className="text-gray-600">Notre système génère instantanément un lien court et unique.</p>
              </div>
              <div className="text-center p-6 rounded-xl bg-gray-50 hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-indigo-600">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Partagez</h3>
                <p className="text-gray-600">Copiez et partagez votre nouveau lien court partout.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Fonctionnalités Premium */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Passez à la vitesse supérieure</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Créez un compte gratuitement pour débloquer des fonctionnalités avancées
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: '📊', title: 'Analytiques avancées', desc: 'Suivez les clics et les performances de vos liens' },
                { icon: '🔗', title: 'Liens personnalisés', desc: 'Créez des liens courts personnalisés' },
               
              ].map((feature, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-3xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link 
                href="/register" 
                className="inline-flex items-center px-8 py-3 text-lg font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg transform hover:-translate-y-0.5 transition-all"
              >
                Créer un compte gratuit
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="p-6 text-center border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center justify-center md:justify-start mb-4 md:mb-0">
              <Zap className="h-5 w-5 text-indigo-600 mr-2" />
              <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                ShortLink
              </span>
            </div>
            <div className="flex space-x-6">
              <a href="/privacy" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">Confidentialité</a>
              <a href="/terms" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">Conditions d'utilisation</a>
              <a href="/contact" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-400">
            © {new Date().getFullYear()} ShortLink. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}