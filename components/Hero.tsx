
import React from 'react';
import { Cloud, HardDrive } from 'lucide-react';

interface HeroProps {
  dayStr: string;
  region: string;
  dateStr: string;
  isOfflineMode: boolean;
}

const Hero: React.FC<HeroProps> = ({ dayStr, region, dateStr, isOfflineMode }) => {
  // Parse region to remove english part for cleaner look
  const jpRegion = region.split(' ')[0];
  const enRegion = region.split(' ').slice(1).join(' ');

  return (
    <div className="relative bg-shikoku-indigo text-shikoku-paper pt-5 pb-3 px-5 overflow-visible transition-all duration-500 rounded-b-[1.25rem] shadow-lg shadow-indigo-900/20 z-20">

      {/* Decorative Traditional Patterns */}
      <div className="absolute inset-0 overflow-hidden rounded-b-[1.25rem] pointer-events-none">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl translate-x-1/3 -translate-y-1/3"></div>
      </div>

      {/* Main Content Area: Compact Row */}
      <div className="flex items-end justify-between relative z-10">

        {/* Left: Location & Date */}
        <div className="pb-1">
          <div className="flex items-baseline gap-2 mb-0.5 opacity-80">
            <span className="text-[10px] font-medium tracking-widest bg-white/10 px-1.5 py-0.5 rounded text-indigo-100">{dayStr}</span>
            <span className="text-[10px] text-indigo-200">{dateStr}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white leading-none">
            {jpRegion}
          </h1>
          {enRegion && (
            <p className="text-indigo-200 text-[10px] tracking-wider uppercase opacity-60 mt-0.5 font-medium">
              {enRegion}
            </p>
          )}
        </div>

        {/* Right: Connection Status */}
        <div className={`flex items-center gap-1 px-3 py-2 rounded-full border text-[10px] font-bold ${isOfflineMode
            ? 'bg-orange-500/20 text-orange-200 border-orange-500/30'
            : 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30'
          }`}>
          {isOfflineMode ? <HardDrive size={12} /> : <Cloud size={12} />}
          <span>{isOfflineMode ? 'Local' : 'Firebase'}</span>
        </div>
      </div>
    </div>
  );
};

export default Hero;
