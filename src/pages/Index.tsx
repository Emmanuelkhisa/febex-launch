import CountdownTimer from '@/components/CountdownTimer';
import BackgroundEffects from '@/components/BackgroundEffects';

const Index = () => {
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
