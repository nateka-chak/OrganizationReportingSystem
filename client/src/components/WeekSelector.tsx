import React from 'react';

interface WeekSelectorProps {
  weeks: string[];
  currentWeek: string;
  onWeekChange: (week: string) => void;
}

const WeekSelector: React.FC<WeekSelectorProps> = ({ weeks, currentWeek, onWeekChange }) => {
  const formatWeekDisplay = (week: string) => {
    const [year, weekNum] = week.split('-');
    return `Week ${weekNum}, ${year}`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Select Week</h2>
      
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {weeks.map(week => (
          <button
            key={week}
            onClick={() => onWeekChange(week)}
            className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
              week === currentWeek
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {formatWeekDisplay(week)}
          </button>
        ))}
        
        {weeks.length === 0 && (
          <p className="text-gray-500 text-center py-2">No weeks available</p>
        )}
      </div>
    </div>
  );
};

export default WeekSelector;