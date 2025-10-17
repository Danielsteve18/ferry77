import React, { useEffect, useState } from 'react';
import { X, Play, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useDriverTour } from '@/hooks/useDriverTour';

interface WelcomeTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  userType?: 'cliente' | 'empresa';
  userName?: string;
}

const WelcomeTourModal: React.FC<WelcomeTourModalProps> = ({ 
  isOpen, 
  onClose, 
  userType = 'cliente',
  userName = 'Usuario'
}) => {
  const [selectedTour, setSelectedTour] = useState<string>('dashboard');
  const { startDashboardTour, startQuickRequestTour, startCompanyTour } = useDriverTour();

  const clienteTours = [
    {
      id: 'dashboard',
      title: 'Conocer el Dashboard',
      description: 'Te mostraremos las funciones principales y cómo navegar',
      duration: '2-3 min',
      steps: 5,
      recommended: true
    },
    {
      id: 'quick-request',
      title: 'Crear tu Primera Solicitud',
      description: 'Aprende a usar la IA para crear solicitudes rápidamente',
      duration: '3-4 min',
      steps: 4,
      recommended: false
    }
  ];

  const empresaTours = [
    {
      id: 'company',
      title: 'Dashboard de Empresa',
      description: 'Aprende a gestionar solicitudes y crear cotizaciones',
      duration: '4-5 min',
      steps: 6,
      recommended: true
    }
  ];

  const tours = userType === 'empresa' ? empresaTours : clienteTours;

  const handleStartTour = () => {
    onClose();
    
    // Pequeño delay para que el modal se cierre completamente
    setTimeout(() => {
      switch (selectedTour) {
        case 'dashboard':
          startDashboardTour();
          break;
        case 'quick-request':
          startQuickRequestTour();
          break;
        case 'company':
          startCompanyTour();
          break;
        default:
          startDashboardTour();
      }
    }, 300);
  };

  const handleSkip = () => {
    // Marcar que el usuario saltó el tour de bienvenida
    localStorage.setItem('ferry77_welcome_tour_skipped', 'true');
    onClose();
  };

  useEffect(() => {
    // Auto-seleccionar el tour recomendado
    const recommendedTour = tours.find(tour => tour.recommended);
    if (recommendedTour) {
      setSelectedTour(recommendedTour.id);
    }
  }, [userType]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-white shadow-2xl">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-blue-100 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🚢</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">¡Bienvenido a Ferry77, {userName}!</h2>
                <p className="text-blue-100 mt-1">
                  Te ayudamos a empezar con un tour interactivo
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Elige tu primer tour:
              </h3>
              <p className="text-gray-600 text-sm">
                Selecciona el tour que más te interese. Siempre podrás acceder a otros tours desde el menú de ayuda.
              </p>
            </div>

            {/* Tour Options */}
            <div className="space-y-3 mb-6">
              {tours.map((tour) => (
                <div
                  key={tour.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedTour === tour.id
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedTour(tour.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-gray-900">
                          {tour.title}
                        </h4>
                        {tour.recommended && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                            Recomendado
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mt-1">
                        {tour.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>⏱️ {tour.duration}</span>
                        <span>📋 {tour.steps} pasos</span>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedTour === tour.id
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedTour === tour.id && (
                        <CheckCircle className="w-3 h-3 text-white fill-current" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Features highlight */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-2">
                Lo que aprenderás:
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {userType === 'empresa' ? (
                  <>
                    <li>• Cómo ver y filtrar solicitudes de tu ciudad</li>
                    <li>• Crear cotizaciones competitivas</li>
                    <li>• Usar el chat para comunicarte con clientes</li>
                    <li>• Gestionar el estado de tus propuestas</li>
                  </>
                ) : (
                  <>
                    <li>• Navegar por el dashboard principal</li>
                    <li>• Crear solicitudes con IA automática</li>
                    <li>• Recibir y comparar cotizaciones</li>
                    <li>• Usar el sistema de notificaciones</li>
                  </>
                )}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleSkip}
                className="text-gray-500 hover:text-gray-700 text-sm underline"
              >
                Saltar por ahora
              </button>
              
              <div className="space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Tal vez después
                </Button>
                <Button 
                  onClick={handleStartTour}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Comenzar Tour
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomeTourModal;