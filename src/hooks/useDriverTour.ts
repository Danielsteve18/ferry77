import React from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

interface TourStep {
  element: string;
  popover: {
    title: string;
    description: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
  };
}

interface TourConfig {
  showProgress?: boolean;
  allowClose?: boolean;
  popoverClass?: string;
  progressText?: string;
  nextBtnText?: string;
  prevBtnText?: string;
  doneBtnText?: string;
}

export const useDriverTour = () => {
  const defaultConfig = {
    showProgress: true,
    allowClose: true,
    popoverClass: 'ferry-tour-popover',
    progressText: 'Paso {{current}} de {{total}}',
    nextBtnText: 'Siguiente →',
    prevBtnText: '← Anterior',
    doneBtnText: '¡Entendido!'
  };

  const createTour = (steps: TourStep[], config: Partial<TourConfig> = {}) => {
    const finalConfig = { ...defaultConfig, ...config };
    
    const driverObj = driver({
      showProgress: finalConfig.showProgress,
      allowClose: finalConfig.allowClose,
      popoverClass: finalConfig.popoverClass,
      progressText: finalConfig.progressText,
      nextBtnText: finalConfig.nextBtnText,
      prevBtnText: finalConfig.prevBtnText,
      doneBtnText: finalConfig.doneBtnText,
      animate: true,
      smoothScroll: true,
      stagePadding: 8,
      stageRadius: 12,
      steps: steps.map(step => ({
        element: step.element,
        popover: {
          title: step.popover.title,
          description: step.popover.description,
          side: (step.popover.position || 'bottom') as 'top' | 'bottom' | 'left' | 'right',
          align: 'start' as const
        }
      }))
    });

    return driverObj;
  };

  // Tour para nuevos usuarios - Dashboard principal
  const startDashboardTour = () => {
    console.log('🎯 Iniciando tour del dashboard...');
    
    // Limpiar cualquier tour anterior
    try {
      const existingOverlay = document.querySelector('.driver-overlay');
      if (existingOverlay) {
        existingOverlay.remove();
      }
    } catch (e) {
      console.log('No hay overlay anterior');
    }
    
    // Configurar steps del tour
    const tourSteps = [
      {
        element: '[data-tour="welcome"]',
        popover: {
          title: '¡Bienvenido a Ferry77! 🚢✨',
          description: 'Esta es tu página principal donde puedes ver un resumen de tu actividad y acceder a todas las funciones.',
          side: 'bottom' as 'bottom',
          align: 'start' as 'start'
        }
      },
      {
        element: '[data-tour="quick-actions"]',
        popover: {
          title: 'Caja de Herramientas 🧰⚡',
          description: 'Accede rápidamente a crear solicitudes, rastrear pedidos y explorar empresas.',
          side: 'top' as 'top',
          align: 'start' as 'start'
        }
      },
      {
        element: '[data-tour="my-requests"]',
        popover: {
          title: 'Mis Solicitudes 📋💼',
          description: 'Aquí verás todas tus solicitudes y podrás hacer seguimiento de cada una.',
          side: 'top' as 'top',
          align: 'start' as 'start'
        }
      }
    ];

    // Crear el driver con configuración específica
    const driverObj = driver({
      showProgress: true,
      allowClose: true,
      animate: true,
      smoothScroll: true,
      stagePadding: 8,
      stageRadius: 12,
      popoverClass: 'ferry-tour-dashboard',
      progressText: 'Paso {{current}} de {{total}}',
      nextBtnText: 'Siguiente →',
      prevBtnText: '← Anterior',
      doneBtnText: '¡Entendido!',
      steps: tourSteps
    });

    // Verificar elementos antes de iniciar
    let elementsFound = 0;
    tourSteps.forEach((step, index) => {
      const element = document.querySelector(step.element);
      if (element) {
        console.log(`✅ Paso ${index + 1}: Elemento encontrado`, step.element);
        elementsFound++;
      } else {
        console.log(`❌ Paso ${index + 1}: Elemento NO encontrado`, step.element);
      }
    });

    if (elementsFound === 0) {
      alert('No se encontraron elementos para el tour. Por favor recarga la página.');
      return;
    }

    console.log(`🚀 Iniciando tour con ${elementsFound} elementos encontrados`);
    
    try {
      driverObj.drive();
    } catch (error) {
      console.error('❌ Error al iniciar tour:', error);
      alert('Error al iniciar el tour. Revisa la consola para más detalles.');
    }
  };

  // Tour para crear solicitud rápida
  const startQuickRequestTour = () => {
    console.log('🚀 Iniciando tour de solicitud rápida...');
    
    // Si estamos en el dashboard, mostrar el botón primero
    if (window.location.pathname === '/' || window.location.pathname === '/dashboard') {
      console.log('📍 Estamos en dashboard, mostrando botón Nueva Solicitud primero...');
      
      const newRequestButton = document.querySelector('[data-tour="new-request"]') || 
                              document.querySelector('a[href="/new-request"]') ||
                              document.querySelector('button:contains("Nueva Solicitud")');
      
      if (newRequestButton) {
        // Tour de transición en el dashboard
        const transitionSteps: any[] = [
          {
            element: newRequestButton.getAttribute('data-tour') ? '[data-tour="new-request"]' : 'a[href="/new-request"]',
            popover: {
              title: 'Crear Solicitud Rápida 🚀',
              description: 'Haz clic aquí para crear una nueva solicitud con ayuda de IA. Te llevaremos a la página especializada.',
              side: 'bottom' as 'bottom',
              align: 'start' as 'start'
            }
          }
        ];

        const transitionDriver = driver({
          showProgress: false,
          allowClose: false,
          animate: true,
          smoothScroll: true,
          popoverClass: 'ferry-tour-quick-request',
          nextBtnText: 'Ir a Nueva Solicitud →',
          doneBtnText: 'Ir a Nueva Solicitud →',
          steps: transitionSteps,
          onDestroyed: () => {
            // Navegar después de que termine el primer paso y marcar que debe continuar el tour
            setTimeout(() => {
              // Ir directamente al modo manual del selector para que funcione mejor
              window.location.href = '/new-request?tour=quick-request&continue=true';
            }, 500);
          }
        });

        transitionDriver.drive();
        return;
      } else {
        // Si no encontramos el botón, navegar directamente
        window.location.href = '/new-request-selector?tour=quick-request&continue=true';
        return;
      }
    }
    
    // Si ya estamos en la página correcta, continuar con el tour normal
    if (window.location.pathname.includes('/new-request')) {
      console.log('📍 Ya estamos en new-request, iniciando tour completo...');
      startNewRequestPageTour();
      return;
    }
    
    // Fallback: navegar a la página
    window.location.href = '/new-request?tour=quick-request&continue=true';
  };

  // Tour específico para la página de nueva solicitud
  const startNewRequestPageTour = () => {
    
    console.log('🎯 Iniciando tour en página de nueva solicitud...');
    
    const tourSteps: any[] = [
      {
        element: 'h1, .page-title, .main-title',
        popover: {
          title: '¡Bienvenido a Solicitud Rápida! 🚀',
          description: 'Aquí puedes crear solicitudes de forma inteligente usando IA. Te guiaremos paso a paso.',
          side: 'bottom' as 'bottom',
          align: 'start' as 'start'
        }
      },
      {
        element: '[data-tour="request-form"]',
        popover: {
          title: 'Información General �✨',
          description: 'Completa los datos básicos de tu solicitud: título y tipo de trabajo que necesitas.',
          side: 'top' as 'top',
          align: 'start' as 'start'
        }
      },
      {
        element: '[data-tour="upload-files"]',
        popover: {
          title: 'Lista de Herramientas 🔨⚡',
          description: 'Agrega todas las herramientas que necesitas. Puedes buscar productos específicos y la IA te ayudará con sugerencias.',
          side: 'top' as 'top',
          align: 'start' as 'start'
        }
      },
      {
        element: '[data-tour="text-description"]',
        popover: {
          title: 'Detalles del Proyecto 💬🎯',
          description: 'Especifica el tipo de trabajo, presupuesto estimado y otros detalles importantes para tu proyecto.',
          side: 'top' as 'top',
          align: 'start' as 'start'
        }
      },
      {
        element: '[data-tour="preview-request"]',
        popover: {
          title: 'Publicar Solicitud ✅📋',
          description: 'Una vez completa toda la información, publica tu solicitud y las empresas empezarán a enviarte cotizaciones.',
          side: 'bottom' as 'bottom',
          align: 'start' as 'start'
        }
      },
      {
        element: '[data-tour="back-to-dashboard"]',
        popover: {
          title: '¡Tour Completado! ��🏠',
          description: 'Ahora ya sabes cómo crear solicitudes rápidas. Al hacer clic en "¡Ir al Dashboard!" regresarás al panel principal para gestionar todas tus solicitudes.',
          side: 'bottom' as 'bottom',
          align: 'end' as 'end'
        }
      }
    ];

    const driverObj = driver({
      showProgress: true,
      allowClose: true,
      animate: true,
      smoothScroll: true,
      stagePadding: 8,
      stageRadius: 12,
      popoverClass: 'ferry-tour-quick-request',
      progressText: 'Paso {{current}} de {{total}}',
      nextBtnText: 'Siguiente →',
      prevBtnText: '← Anterior',
      doneBtnText: '¡Ir al Dashboard!',
      steps: tourSteps,
      onDestroyed: () => {
        // Cuando termine el tour, regresar al dashboard
        console.log('🏠 Tour completado, regresando al dashboard...');
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      }
    });

    // Verificar elementos
    let elementsFound = 0;
    tourSteps.forEach((step, index) => {
      const element = document.querySelector(step.element);
      if (element) {
        console.log(`✅ Paso ${index + 1}: Elemento encontrado`, step.element);
        elementsFound++;
      } else {
        console.log(`❌ Paso ${index + 1}: Elemento NO encontrado`, step.element);
      }
    });

    if (elementsFound === 0) {
      alert('Este tour funciona mejor en la página de nueva solicitud. Navega allí primero.');
      return;
    }

    console.log(`🚀 Iniciando tour con ${elementsFound} elementos encontrados`);
    
    try {
      driverObj.drive();
    } catch (error) {
      console.error('❌ Error al iniciar tour:', error);
    }
  };

  // Tour para empresas
  const startCompanyTour = () => {
    const steps: any[] = [
      {
        element: '[data-tour="pending-requests"]',
        popover: {
          title: 'Solicitudes Pendientes 📋',
          description: 'Aquí verás todas las solicitudes de tu ciudad que puedes cotizar.',
          side: 'top' as 'top',
          align: 'start' as 'start'
        }
      },
      {
        element: '[data-tour="request-details"]',
        popover: {
          title: 'Detalles de Solicitud',
          description: 'Haz clic en cualquier solicitud para ver los detalles completos y crear tu cotización.',
          side: 'right' as 'right',
          align: 'start' as 'start'
        }
      },
      {
        element: '[data-tour="quick-response"]',
        popover: {
          title: 'Respuesta Rápida ⚡',
          description: 'Puedes enviar una respuesta rápida con mensaje o archivo antes de hacer la cotización formal.',
          side: 'left' as 'left',
          align: 'start' as 'start'
        }
      },
      {
        element: '[data-tour="create-quote"]',
        popover: {
          title: 'Crear Cotización 💰',
          description: 'Crea cotizaciones detalladas con precios por item y tiempo de entrega.',
          side: 'bottom' as 'bottom',
          align: 'start' as 'start'
        }
      },
      {
        element: '[data-tour="chat"]',
        popover: {
          title: 'Chat Directo 💬',
          description: 'Comunícate directamente con los clientes para aclarar dudas sobre sus solicitudes.',
          side: 'top' as 'top',
          align: 'start' as 'start'
        }
      }
    ];

    const driverObj = driver({
      showProgress: true,
      allowClose: true,
      animate: true,
      smoothScroll: true,
      stagePadding: 8,
      stageRadius: 12,
      popoverClass: 'ferry-tour-company',
      progressText: 'Paso {{current}} de {{total}}',
      nextBtnText: 'Siguiente →',
      prevBtnText: '← Anterior',
      doneBtnText: '¡Entendido!',
      steps: steps
    });
    
    driverObj.drive();
  };

  // Tour para el sistema de notificaciones
  const startNotificationsTour = () => {
    console.log('🔔 Iniciando tour de notificaciones...');
    
    // Intentar encontrar la campana de notificaciones en diferentes formas
    const notificationSelectors = [
      '[data-tour="notification-bell"]',
      '[data-tour="notifications"]',
      '.notification-bell',
      '.notifications-button',
      'button[aria-label*="notification"]',
      'button[title*="notification"]',
      '[class*="notification"]',
      '[class*="bell"]',
      'header button:last-child',
      'nav button:last-child'
    ];
    
    let notificationElement = null;
    for (const selector of notificationSelectors) {
      notificationElement = document.querySelector(selector);
      if (notificationElement) {
        console.log(`✅ Campana encontrada con selector: ${selector}`);
        break;
      }
    }
    
    const tourSteps: any[] = [
      {
        element: 'body',
        popover: {
          title: 'Sistema de Notificaciones 🔔✨',
          description: 'Ferry77 te mantiene informado en tiempo real sobre todas las actividades importantes de tu cuenta.',
          side: 'bottom',
          align: 'start'
        }
      }
    ];
    
    // Solo agregar el paso de la campana si la encontramos
    if (notificationElement) {
      const bellSelector = notificationSelectors.find(s => document.querySelector(s));
      tourSteps.push({
        element: bellSelector!,
        popover: {
          title: 'Campana de Notificaciones 🔔',
          description: 'Haz clic aquí para ver todas tus notificaciones. El número rojo indica cuántas tienes pendientes.',
          side: 'bottom',
          align: 'start'
        }
      });
    }
    
    // Agregar paso sobre las solicitudes si existe
    if (document.querySelector('[data-tour="my-requests"]')) {
      tourSteps.push({
        element: '[data-tour="my-requests"]',
        popover: {
          title: 'Notificaciones de Solicitudes 📋💬',
          description: 'Recibirás notificaciones cuando las empresas respondan con cotizaciones, mensajes o actualizaciones.',
          side: 'top',
          align: 'start'
        }
      });
    }

    const driverObj = driver({
      showProgress: true,
      allowClose: true,
      animate: true,
      smoothScroll: true,
      stagePadding: 8,
      stageRadius: 12,
      popoverClass: 'ferry-tour-notifications',
      progressText: 'Paso {{current}} de {{total}}',
      nextBtnText: 'Siguiente →',
      prevBtnText: '← Anterior',
      doneBtnText: '¡Perfecto!',
      steps: tourSteps
    });

    // Verificar elementos disponibles
    let elementsFound = 0;
    tourSteps.forEach((step, index) => {
      const element = document.querySelector(step.element);
      if (element) {
        console.log(`✅ Paso ${index + 1}: Elemento encontrado`, step.element);
        elementsFound++;
      } else {
        console.log(`❌ Paso ${index + 1}: Elemento NO encontrado`, step.element);
      }
    });

    // Si no hay elementos específicos, crear un tour general
    if (elementsFound === 0) {
      const generalSteps: any[] = [
        {
          element: 'body',
          popover: {
            title: 'Sistema de Notificaciones 🔔✨',
            description: 'Ferry77 te envía notificaciones por correo y en la plataforma para mantenerte al día con tus solicitudes.',
            side: 'bottom',
            align: 'start'
          }
        }
      ];
      
      const generalDriver = driver({
        showProgress: false,
        allowClose: true,
        popoverClass: 'ferry-tour-notifications',
        nextBtnText: 'Entendido →',
        doneBtnText: '¡Perfecto!',
        steps: generalSteps
      });
      
      generalDriver.drive();
      return;
    }

    console.log(`🚀 Iniciando tour con ${elementsFound} elementos encontrados`);
    
    try {
      driverObj.drive();
    } catch (error) {
      console.error('❌ Error al iniciar tour:', error);
    }
  };

  return {
    startDashboardTour,
    startQuickRequestTour,
    startNewRequestPageTour,
    startCompanyTour,
    startNotificationsTour,
    createTour
  };
};

export default useDriverTour;