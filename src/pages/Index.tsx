import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import CountdownTimer from '@/components/CountdownTimer';
import BackgroundEffects from '@/components/BackgroundEffects';

const Index = () => {
  useEffect(() => {
    const log = async () => {
      try {
        await supabase.functions.invoke('log-visit', { body: {} });
      } catch (e) {
        console.error('Failed to log visit', e);
      }
    };
    log();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <BackgroundEffects />
      
      <main className="container mx-auto px-4 py-8 relative z-10">
        <CountdownTimer />
      </main>
    </div>
  );
};

export default Index;
