# 🎯 Sistema de Tours Ferry77 - Guía Completa

## ✨ **Tours Disponibles**

### **🚢 Tour del Dashboard**
- **Dónde**: Página principal del cliente
- **Qué incluye**: Bienvenida, Caja de Herramientas, Mis Solicitudes
- **Color**: Azul Ferry77
- **Estado**: ✅ Completo y funcional

### **🤖 Tour de Solicitud Rápida** 
- **Dónde**: Página `/new-request`
- **Qué incluye**: Subir archivos, IA, Preview
- **Color**: Verde (IA)
- **Estado**: ✅ Completo con navegación automática

### **🔔 Tour de Notificaciones**
- **Dónde**: Cualquier página
- **Qué incluye**: Sistema de notificaciones
- **Color**: Púrpura
- **Estado**: ✅ Completo con fallback

## 📚 **Cómo Usar los Tours**

### **1. Activación Automática**
- **Nuevos usuarios**: Modal de bienvenida automático
- **Primera vez**: Aparece tras 1 segundo de carga
- **Persistencia**: Se guarda en localStorage

### **2. Activación Manual**
- **Botón "Tours Interactivos"** en la navbar
- **Menú desplegable** con todos los tours disponibles
- **Iconos y descripciones** para cada tour

#### **Botones Directos**
```jsx
import { useDriverTour } from '@/hooks/useDriverTour';

const MiComponente = () => {
  const { startDashboardTour, startQuickRequestTour } = useDriverTour();
  
  return (
    <Button onClick={startDashboardTour}>
      Iniciar Tour del Dashboard
    </Button>
  );
};
```

### **3. Tours Disponibles**

#### **Para Clientes:**
- `startDashboardTour()` - Tour general de la plataforma
- `startQuickRequestTour()` - Cómo crear solicitudes con IA
- `startNotificationsTour()` - Sistema de notificaciones

#### **Para Empresas:**
- `startCompanyTour()` - Panel de empresas y cotizaciones
- `startNotificationsTour()` - Notificaciones empresariales

### **4. Elementos con data-tour**

Cada elemento importante tiene un atributo `data-tour`:

```jsx
// Ejemplos de elementos marcados
<h1 data-tour="welcome">¡Bienvenido!</h1>
<Button data-tour="new-request">Nueva Solicitud</Button>
<div data-tour="my-requests">Mis Solicitudes</div>
<Card data-tour="notifications">Notificaciones</Card>
<section data-tour="profile">Mi Perfil</section>

// Para empresas
<Card data-tour="pending-requests">Solicitudes Pendientes</Card>
<Button data-tour="create-quote">Crear Cotización</Button>
<Button data-tour="chat">Chat Directo</Button>

// Para solicitud rápida
<div data-tour="upload-files">Subir Archivos</div>
<textarea data-tour="text-description">Descripción</textarea>
<Button data-tour="ai-processing">Procesar con IA</Button>
<div data-tour="preview-request">Preview</div>
```

### **5. Personalización de Tours**

```typescript
// Crear tour personalizado
import { useDriverTour } from '@/hooks/useDriverTour';

const { createTour } = useDriverTour();

const miTourPersonalizado = createTour([
  {
    element: '[data-tour="mi-elemento"]',
    popover: {
      title: 'Mi Paso',
      description: 'Descripción del paso',
      position: 'bottom'
    }
  }
], {
  popoverClass: 'mi-tour-personalizado'
});

miTourPersonalizado.drive();
```

### **6. Estilos Personalizados**

Los tours usan estilos personalizados para Ferry77:

```css
/* Clases disponibles */
.ferry-tour-dashboard     /* Tour del dashboard */
.ferry-tour-quick-request /* Tour de solicitud rápida */
.ferry-tour-company       /* Tour de empresas */
.ferry-tour-notifications /* Tour de notificaciones */
```

### **7. Configuración Avanzada**

```typescript
const config = {
  showProgress: true,        // Mostrar progreso "Paso 1 de 5"
  allowClose: true,          // Permitir cerrar el tour
  progressText: 'Paso {{current}} de {{total}}',
  nextBtnText: 'Siguiente →',
  prevBtnText: '← Anterior',
  doneBtnText: '¡Entendido!'
};
```

### **8. Probar los Tours**

#### **Página de Demo:**
Navega a `/tour-demo` para probar todos los tours:

```bash
# URL de desarrollo
http://localhost:8080/tour-demo
```

#### **Reiniciar Tours:**
```javascript
// Borrar localStorage para que aparezca de nuevo el modal
localStorage.removeItem('ferry77_welcome_tour_seen');
localStorage.removeItem('ferry77_welcome_tour_skipped');
```

### **9. Integración Completa**

#### **En Index.tsx (Dashboard Principal):**
```jsx
import WelcomeTourModal from '../components/WelcomeTourModal';

// Modal de bienvenida
<WelcomeTourModal
  isOpen={showWelcomeTour}
  onClose={handleWelcomeTourClose}
  userType="cliente"
  userName={userData.nombreCompleto}
/>
```

#### **En Navbar.tsx:**
```jsx
import TourMenu from './TourMenu';

// En la navbar
<TourMenu userType="cliente" />
```

### **10. Eventos del Tour**

```typescript
const tour = createTour(steps);

// Eventos disponibles
tour.onHighlightStarted = (element) => {
  console.log('Elemento resaltado:', element);
};

tour.onDestroyStarted = () => {
  console.log('Tour terminado');
};
```

---

## 🚀 **Activación Rápida**

Para activar un tour inmediatamente:

```javascript
// En la consola del navegador
import { useDriverTour } from './src/hooks/useDriverTour';
const { startDashboardTour } = useDriverTour();
startDashboardTour();
```

¡Listo! Los tours están completamente integrados y listos para guiar a los usuarios por Ferry77. 🚢