const BackgroundEffects = () => {
  return (
    <>
      {/* Main gradient background */}
      <div className="fixed inset-0 bg-gradient-secondary -z-20"></div>
      
      {/* Animated gradient orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-ping"></div>
      </div>

      {/* Subtle grid pattern */}
      <div 
        className="fixed inset-0 -z-15 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}
      ></div>
    </>
  );
};

export default BackgroundEffects;