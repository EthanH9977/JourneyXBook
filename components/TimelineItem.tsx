import React from 'react';
import { MapPin, Info, Edit2 } from 'lucide-react';
import { ItineraryItem, EventType } from '../types';
import { getIconForType } from '../constants';

interface TimelineItemProps {
  item: ItineraryItem;
  isLast: boolean;
  onEdit: (item: ItineraryItem) => void;
  onShowDetails: (item: ItineraryItem) => void;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ item, isLast, onEdit, onShowDetails }) => {
  
  // Define color themes based on event type
  const getThemeColor = (type: EventType) => {
    switch(type) {
      case EventType.FLIGHT:
      case EventType.TRAIN:
      case EventType.BUS:
        return 'border-shikoku-indigo text-shikoku-indigo';
      case EventType.SIGHTSEEING:
      case EventType.WALKING:
        return 'border-shikoku-red text-shikoku-red';
      case EventType.FOOD:
        return 'border-shikoku-matcha text-shikoku-matcha';
      case EventType.HOTEL:
        return 'border-shikoku-wood text-shikoku-wood';
      default:
        return 'border-shikoku-ink text-shikoku-ink';
    }
  };

  const themeClass = getThemeColor(item.type);

  return (
    <div className="flex gap-3 relative group">
      
      {/* 1. Time Column - Fixed Width for Mobile */}
      <div className="flex flex-col items-end min-w-[48px] pt-1 text-right shrink-0">
        <span className="text-lg font-bold text-shikoku-ink tracking-tight leading-none">
          {item.time}
        </span>
        {item.endTime && (
          <span className="text-[10px] text-stone-400 mt-1">{item.endTime}</span>
        )}
      </div>

      {/* 2. Timeline Visuals */}
      <div className="flex flex-col items-center relative shrink-0">
        {/* The Dot / Stamp */}
        <div className={`
          w-8 h-8 rounded-full bg-shikoku-paper z-10 
          flex items-center justify-center 
          border-[1.5px] ${themeClass}
          shadow-sm transition-transform duration-300 group-hover:scale-105
        `}>
          {getIconForType(item.type)}
        </div>
        
        {/* The Line */}
        {!isLast && (
          <div className="w-[1px] bg-stone-300 absolute top-8 bottom-[-24px]"></div>
        )}
      </div>

      {/* 3. Content Card */}
      <div className="flex-1 pb-2 min-w-0">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-100/80 active:scale-[0.99] transition-transform relative">
          
          {/* Edit Button - Visible on touch/hover */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(item);
            }}
            className="absolute top-3 right-3 p-1.5 text-stone-300 hover:text-shikoku-wood transition-colors rounded-full hover:bg-stone-50"
          >
            <Edit2 size={14} />
          </button>

          {/* Title */}
          <h3 className="font-bold text-base text-shikoku-ink pr-8 leading-snug mb-1">
            {item.title}
          </h3>
          
          {/* Location Link - Keeps Google Maps link for specific spots */}
          <a 
            href={item.locationUrl || `https://www.google.com/maps/search/?api=1&query=${item.locationName}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center text-xs font-medium text-stone-500 mb-2 hover:text-shikoku-red transition-colors active:text-shikoku-red"
          >
            <MapPin size={11} className="mr-0.5" />
            <span className="border-b border-dotted border-stone-300 hover:border-shikoku-red">{item.locationName}</span>
          </a>

          {/* Description */}
          {item.description && (
            <p className="text-sm text-stone-600 leading-relaxed mb-3 line-clamp-3">
              {item.description}
            </p>
          )}

          {/* Footer: Tags */}
          {item.details && item.details.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-stone-50 mt-1">
              {item.details.map((detail, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    onShowDetails(item);
                  }}
                  className="flex items-center text-[10px] font-bold text-shikoku-indigo bg-indigo-50/50 px-2 py-1 rounded hover:bg-indigo-100 transition-colors"
                >
                  <Info size={10} className="mr-1" />
                  {detail.title}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimelineItem;