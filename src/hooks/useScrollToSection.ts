import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export function useScrollToSection() {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback((sectionId: string) => {
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: sectionId } });
      return;
    }
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  }, [navigate, location.pathname]);
}
