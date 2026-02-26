import { memo, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/common';
import { useNavigation } from '@/hooks/useData';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/cn';

export const Header = memo(function Header() {
  const { t, i18n } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: navItems = [] } = useNavigation();
  const { user, profile, logout, hasRole } = useAuth();
  const location = useLocation();

  const toggleMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const toggleLanguage = useCallback(() => {
    const newLang = i18n.language === 'ko' ? 'en' : 'ko';
    i18n.changeLanguage(newLang);
  }, [i18n]);

  // Filter nav items by role requirement
  const roleHierarchy: Record<string, number> = { admin: 3, manager: 2, member: 1 };
  const visibleNavItems = navItems.filter(item => {
    if (!item.requiredRole) return true;
    if (!profile) return false;
    return (roleHierarchy[profile.role] ?? 0) >= (roleHierarchy[item.requiredRole] ?? 0);
  });

  return (
    <header className="sticky top-0 z-50 bg-byuh-crimson">
      <Container className="flex h-16 items-center justify-between md:h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3" onClick={closeMenu}>
          <img src="/images/byuh-monogram-white.png" alt="BYUH" className="h-9 object-contain md:h-11" />
          <span className="hidden font-heading text-lg font-bold text-white sm:block">
            {t('auth.siteName')}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {visibleNavItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-white',
                location.pathname === item.href
                  ? 'text-white'
                  : 'text-white/70',
              )}
            >
              {t(item.label)}
            </Link>
          ))}
        </nav>

        {/* Auth Section (Desktop) */}
        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={toggleLanguage}
            className="rounded-md px-2 py-1 text-xs font-medium text-white/70 hover:text-white hover:bg-white/10"
          >
            {i18n.language === 'ko' ? 'EN' : 'KR'}
          </button>
          {user ? (
            <>
              {hasRole(['admin', 'manager']) && (
                <Link to="/admin" className="text-sm font-medium text-byuh-gold-light hover:text-white">
                  {t('nav.admin')}
                </Link>
              )}
              <Link to="/profile" className="text-sm text-white/70 hover:text-white">
                {profile?.name || t('nav.profile')}
              </Link>
              <button
                type="button"
                onClick={logout}
                className="text-sm text-white/70 hover:text-white"
              >
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <Link to="/login" className="text-sm font-medium text-white hover:text-byuh-gold-light">
              {t('nav.login')}
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/10 md:hidden"
          onClick={toggleMenu}
          aria-label={isMobileMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
          aria-expanded={isMobileMenuOpen}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </Container>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="border-t border-white/20 bg-white md:hidden">
          <Container>
            <nav className="flex flex-col py-4">
              {visibleNavItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={closeMenu}
                  className={cn(
                    'rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-surface',
                    location.pathname === item.href
                      ? 'text-byuh-crimson'
                      : 'text-text-secondary',
                  )}
                >
                  {t(item.label)}
                </Link>
              ))}
              {/* Language Toggle (Mobile) */}
              <button
                type="button"
                onClick={toggleLanguage}
                className="rounded-lg px-4 py-3 text-left text-sm font-medium text-text-secondary hover:bg-surface"
              >
                {i18n.language === 'ko' ? 'English' : '한국어'}
              </button>
              {/* Mobile Auth Links */}
              <div className="mt-2 border-t border-gray-100 pt-2">
                {user ? (
                  <>
                    {hasRole(['admin', 'manager']) && (
                      <Link to="/admin" onClick={closeMenu} className="block rounded-lg px-4 py-3 text-sm font-medium text-byuh-crimson">
                        {t('nav.admin')}
                      </Link>
                    )}
                    <Link to="/profile" onClick={closeMenu} className="block rounded-lg px-4 py-3 text-sm font-medium text-text-secondary hover:bg-surface">
                      {profile?.name || t('nav.profile')}
                    </Link>
                    <button
                      type="button"
                      onClick={() => { logout(); closeMenu(); }}
                      className="block w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-text-secondary hover:bg-surface"
                    >
                      {t('nav.logout')}
                    </button>
                  </>
                ) : (
                  <Link to="/login" onClick={closeMenu} className="block rounded-lg px-4 py-3 text-sm font-medium text-byuh-crimson">
                    {t('nav.login')}
                  </Link>
                )}
              </div>
            </nav>
          </Container>
        </div>
      )}
    </header>
  );
});
