import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Hero, About, Events, News, Gallery, Join, Give, Contact } from '@/components/sections';

export default function HomePage() {
  const location = useLocation();

  useEffect(() => {
    const scrollTo = (location.state as { scrollTo?: string })?.scrollTo;
    if (scrollTo) {
      const element = document.getElementById(scrollTo);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location.state]);

  return (
    <>
      <Hero />
      <About />
      <Events />
      <News />
      <Gallery />
      <Join />
      <Give />
      <Contact />
    </>
  );
}
