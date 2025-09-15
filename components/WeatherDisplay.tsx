import React from 'react';
import { WeatherForecast, DailyForecast, WeatherIcon } from '@/types';
import { Icon } from '@/components/common/Icon';

const WeatherCard: React.FC<{ dayForecast: DailyForecast }> = ({ dayForecast }) => {
  const getIconName = (icon: WeatherIcon): string => {
      if (icon === 'storm') return 'bolt';
      return icon;
  };

  const getIconColor = (icon: WeatherIcon): string => {
      switch(icon) {
          case 'sun': return 'text-yellow-500';
          case 'rain': return 'text-blue-500';
          case 'snow': return 'text-sky-400';
          case 'storm': return 'text-slate-600';
          case 'partly-cloudy': return 'text-yellow-600';
          case 'cloud':
          default:
            return 'text-slate-500';
      }
  };

  return (
    <div className="flex-shrink-0 w-32 text-center p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-white/30 shadow-md">
      <p className="font-bold text-sm text-slate-800">{dayForecast.day}</p>
      <Icon name={getIconName(dayForecast.icon)} className={`h-10 w-10 mx-auto my-2 ${getIconColor(dayForecast.icon)}`} />
      <div className="text-sm">
        <span className="font-semibold text-slate-900">{dayForecast.highTemp}°</span>
        <span className="text-slate-500"> / {dayForecast.lowTemp}°</span>
      </div>
      <p className="text-xs text-slate-600 mt-1 capitalize">{dayForecast.description}</p>
    </div>
  );
};


interface WeatherDisplayProps {
  forecast: WeatherForecast;
}

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ forecast }) => {
  return (
    <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg p-4 border border-blue-200">
      <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
        <Icon name="sun" className="h-5 w-5 mr-2 text-blue-600" />
        Weather Forecast
      </h3>
      <div className="flex space-x-4 overflow-x-auto pb-2 -mb-2">
        {forecast.map((day, index) => (
          <WeatherCard key={index} dayForecast={day} />
        ))}
      </div>
    </div>
  );
};

export default WeatherDisplay;