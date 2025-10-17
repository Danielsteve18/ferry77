import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TourMenu from '../components/TourMenu';
import { useDriverTour } from '../hooks/useDriverTour';
import { Play, HelpCircle, Zap, Users, Package, MessageSquare } from 'lucide-react';

const TourDemo = () => {
  const [showDemo, setShowDemo] = useState(false);
  const { startDashboardTour, startQuickRequestTour, startCompanyTour } = useDriverTour();

  useEffect(() => {
    // Auto-start demo after component mounts
    setTimeout(() => setShowDemo(true), 500);
  }, []);

  const demoElements = [
    {
      id: 'demo-welcome',
      title: 'Bienvenido a Ferry77',
      description: 'Tu plataforma de herramientas profesionales',
      icon: <Package className="w-6 h-6" />
    },
    {
      id: 'demo-new-request',
      title: 'Nueva Solicitud',
      description: 'Crea solicitudes con IA o manualmente',
      icon: <Zap className="w-6 h-6" />
    },
    {
      id: 'demo-my-requests',
      title: 'Mis Solicitudes',
      description: 'Gestiona todas tus solicitudes',
      icon: <Users className="w-6 h-6" />
    },
    {
      id: 'demo-chat',
      title: 'Chat Directo',
      description: 'Comunícate con empresas',
      icon: <MessageSquare className="w-6 h-6" />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8" data-tour="welcome">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Demo de Tours Interactivos
          </h1>
          <p className="text-gray-600">
            Explora cómo funciona el sistema de tours guiados de Ferry77
          </p>
        </div>

        {/* Tour Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HelpCircle className="w-5 h-5" />
              <span>Controles de Tours</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={startDashboardTour}
                className="flex items-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>Tour del Dashboard</span>
              </Button>
              
              <Button 
                onClick={startQuickRequestTour}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>Tour Solicitud Rápida</span>
              </Button>
              
              <Button 
                onClick={startCompanyTour}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Users className="w-4 h-4" />
                <span>Tour de Empresa</span>
              </Button>

              <TourMenu userType="cliente" />
            </div>
          </CardContent>
        </Card>

        {/* Demo Elements */}
        <div className="grid md:grid-cols-2 gap-6">
          {demoElements.map((element, index) => (
            <Card 
              key={element.id} 
              className={`transition-all duration-500 transform ${
                showDemo ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
              data-tour={element.id.replace('demo-', '')}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    {element.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{element.title}</h3>
                    <p className="text-gray-600 text-sm">{element.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Demo Quick Actions */}
        <Card className="mt-8" data-tour="quick-actions">
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Cemento', 'Martillo', 'Pintura', 'Cables'].map((item, index) => (
                <div 
                  key={item}
                  className="bg-gray-100 rounded-lg p-4 text-center hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  <Package className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <HelpCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                Cómo funcionan los tours
              </h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Los tours guían a los usuarios paso a paso</li>
                <li>• Se activan automáticamente para usuarios nuevos</li>
                <li>• Los usuarios pueden acceder a ellos desde el menú</li>
                <li>• Cada tour está adaptado al tipo de usuario</li>
                <li>• Los elementos tienen atributos data-tour para ser identificados</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDemo;