import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isLive, setIsLive] = useState(false);

  // November 1st, 2025 at 10:00 AM EAT (UTC+3)
  const launchDate = new Date('2025-11-01T07:00:00.000Z'); // 10:00 AM EAT = 07:00 AM UTC

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate.getTime() - now;

      if (distance < 0) {
        setIsLive(true);
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (isLive) {
    return (
      <div className="text-center space-y-8 animate-in fade-in-0 zoom-in-95 duration-1000">
        <div className="relative">
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-primary bg-clip-text text-transparent animate-pulse">
            WEBSITE IS LIVE
          </h1>
          <div className="absolute -inset-4 bg-gradient-primary opacity-20 blur-3xl -z-10"></div>
        </div>
        
        <div className="space-y-6">
          <p className="text-xl md:text-2xl text-muted-foreground">
            Visit our official website now:
          </p>
          <a 
            href="https://febexgroup.netlify.app" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-xl bg-gradient-primary text-primary-foreground hover:shadow-glow-primary transition-all duration-500 hover:scale-105 group"
          >
            <span>Visit FEBEX Group</span>
            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          FEBEX GROUP
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground">
          Launching Soon
        </p>
        <div className="text-sm md:text-base text-muted-foreground">
          November 1st, 2025 • 10:00 AM EAT
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
        <TimeUnit value={timeLeft.days} label="Days" />
        <TimeUnit value={timeLeft.hours} label="Hours" />
        <TimeUnit value={timeLeft.minutes} label="Minutes" />
        <TimeUnit value={timeLeft.seconds} label="Seconds" />
      </div>

      <div className="space-y-4">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Get ready for exceptional service from FEBEX Group. Wanna know how we'll make money? Just COME BACK !
        </p>

        <p>And bytheway, its pronounced /fibeks/ 😁 cool right ?</p>
      </div>
    </div>
  );
};

interface TimeUnitProps {
  value: number;
  label: string;
}

const TimeUnit = ({ value, label }: TimeUnitProps) => (
  <Card className="p-6 bg-gradient-card border-border/50 backdrop-blur-sm hover:shadow-glow-primary/20 transition-all duration-500 hover:scale-105">
    <div className="space-y-2">
      <div className="text-3xl md:text-5xl font-bold text-primary tabular-nums">
        {String(value).padStart(2, '0')}
      </div>
      <div className="text-sm md:text-base text-muted-foreground uppercase tracking-wider">
        {label}
      </div>
    </div>
  </Card>
);

export default CountdownTimer;
