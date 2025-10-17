import React from 'react';
import { HelpCircle, Play, BookOpen, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDriverTour } from '@/hooks/useDriverTour';

interface TourMenuProps {
  userType?: 'cliente' | 'empresa' | 'admin';
}

const TourMenu: React.FC<TourMenuProps> = ({ userType = 'cliente' }) => {
  const {
    startDashboardTour,
    startQuickRequestTour,
    startCompanyTour,
    startNotificationsTour
  } = useDriverTour();

  const handleTourStart = (tourType: string) => {
    switch (tourType) {
      case 'dashboard':
        startDashboardTour();
        break;
      case 'quick-request':
        startQuickRequestTour();
        break;
      case 'company':
        startCompanyTour();
        break;
      case 'notifications':
        startNotificationsTour();
        break;
      default:
        startDashboardTour();
    }
  };

  const clienteTours = [
    {
      id: 'dashboard',
      title: 'Tour del Dashboard',
      description: 'Conoce las funciones principales',
      icon: <BookOpen className="w-4 h-4" />,
      color: 'text-blue-600'
    },
    {
      id: 'quick-request',
      title: 'Crear Solicitud Rápida',
      description: 'Aprende a usar la IA para solicitudes',
      icon: <Zap className="w-4 h-4" />,
      color: 'text-green-600'
    },
    {
      id: 'notifications',
      title: 'Sistema de Notificaciones',
      description: 'Cómo recibir y gestionar notificaciones',
      icon: <Play className="w-4 h-4" />,
      color: 'text-purple-600'
    }
  ];

  const empresaTours = [
    {
      id: 'company',
      title: 'Dashboard de Empresa',
      description: 'Gestiona solicitudes y cotizaciones',
      icon: <BookOpen className="w-4 h-4" />,
      color: 'text-amber-600'
    },
    {
      id: 'notifications',
      title: 'Notificaciones Empresariales',
      description: 'Recibe alertas de nuevas solicitudes',
      icon: <Play className="w-4 h-4" />,
      color: 'text-purple-600'
    }
  ];

  const tours = userType === 'empresa' ? empresaTours : clienteTours;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center space-x-2 bg-white hover:bg-blue-50 border-blue-200 text-blue-700"
        >
          <HelpCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Tours Interactivos</span>
          <span className="sm:hidden">Tours</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64 p-2">
        <DropdownMenuLabel className="text-blue-700 font-semibold">
          🎯 Aprende a usar Ferry77
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {tours.map((tour) => (
          <DropdownMenuItem
            key={tour.id}
            onClick={() => handleTourStart(tour.id)}
            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-blue-50 cursor-pointer"
          >
            <div className={`${tour.color} mt-0.5`}>
              {tour.icon}
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900 text-sm">
                {tour.title}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {tour.description}
              </div>
            </div>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator className="my-2" />
        
        <div className="px-3 py-2 text-xs text-gray-500">
          💡 Los tours te guiarán paso a paso para aprovechar al máximo la plataforma
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TourMenu;