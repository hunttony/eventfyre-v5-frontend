import { Link } from 'react-router-dom';

// Icon components
const Icons = {
  calendar: (
    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  'check-circle': (
    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  bookmark: (
    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  ),
};

const colorMap = {
  indigo: 'bg-indigo-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
};

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  color = 'indigo', 
  link, 
  linkText = 'View all',
  onClick,
  isActive = false,
  trend = null, // 'up', 'down', or null
  trendValue = '', // e.g., '12%'
  description = '' // Optional description below the value
}) => {
  const bgColor = colorMap[color] || 'bg-indigo-500';
  const IconComponent = typeof icon === 'string' ? Icons[icon] : icon;

  const trendColors = {
    up: 'text-green-600 bg-green-100',
    down: 'text-red-600 bg-red-100',
  };

  const trendIcons = {
    up: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M12 7a1 1 0 01-1.414 0L9 4.414V16a1 1 0 11-2 0V4.414L4.707 7.707a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4A1 1 0 0112 7z" clipRule="evenodd" />
      </svg>
    ),
    down: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M12 13a1 1 0 01-1.414 0L9 10.414V4a1 1 0 012 0v5.586l1.707-1.707a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 10.586V4a1 1 0 012 0v7.586l1.293-1.293a1 1 0 011.414 1.414l-3 3z" clipRule="evenodd" />
      </svg>
    ),
  };

  const cardClasses = [
    'bg-white overflow-hidden shadow rounded-lg h-full flex flex-col',
    'transition-all duration-200',
    isActive ? 'ring-2 ring-indigo-500' : '',
    onClick ? 'cursor-pointer hover:shadow-md' : ''
  ].filter(Boolean).join(' ');

  const content = (
    <div className="p-5 flex-1">
      <div className="flex items-center">
        <div className={`flex-shrink-0 ${bgColor} rounded-md p-3`}>
          {IconComponent}
        </div>
        <div className="ml-4 flex-1 min-w-0">
          <dt className="text-sm font-medium text-gray-500 truncate">
            {title}
          </dt>
          <dd className="mt-1 flex items-baseline">
            <span className="text-2xl font-semibold text-gray-900">
              {value}
            </span>
            {trend && trendValue && (
              <span className={`ml-2 flex items-center text-xs font-medium rounded-full px-2.5 py-0.5 ${trendColors[trend]}`}>
                {trendIcons[trend]}
                <span className="ml-1">{trendValue}</span>
              </span>
            )}
          </dd>
          {description && (
            <p className="mt-1 text-xs text-gray-500 truncate">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const footer = link && (
    <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
      <div className="text-sm">
        <Link 
          to={link} 
          className="font-medium text-indigo-600 hover:text-indigo-500 flex items-center"
        >
          {linkText}
          <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </div>
  );

  return (
    <div 
      className={cardClasses}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(e);
        }
      } : undefined}
    >
      {content}
      {footer}
    </div>
  );
};

export default StatsCard;
