# Interactive Tours System - Ferry77

## 📖 Overview

Ferry77 now features a comprehensive interactive tour system powered by Driver.js, designed to onboard new users and guide them through key platform functionalities. This system provides contextual, step-by-step guidance with custom Ferry77 branding and seamless navigation between components.

## 🚀 Features

### Core Tour Types
- **Dashboard Tour**: Introduction to main platform features and navigation
- **Quick Request Tour**: Complete walkthrough of the request creation process
- **Company Tour**: Specialized guidance for business users managing quotes
- **Notifications Tour**: Overview of the notification system

### Key Capabilities
- ✅ **Multi-component navigation**: Tours seamlessly transition between different pages
- ✅ **Automatic tour continuation**: Smart detection and resumption of tours across page transitions
- ✅ **Custom Ferry77 branding**: Styled popovers with platform-specific design
- ✅ **TypeScript compatibility**: Full type safety with Driver.js integration
- ✅ **Mobile responsive**: Tours adapt to different screen sizes
- ✅ **Accessibility compliant**: Keyboard navigation and ARIA support

## 🛠 Technical Implementation

### Architecture

```
src/
├── hooks/
│   └── useDriverTour.ts          # Main tour management hook
├── pages/
│   ├── NewRequestSelector.tsx    # Tour entry point detection
│   └── NewRequest.tsx           # Tour continuation and completion
└── styles/
    └── driver-tour.css          # Custom Ferry77 tour styling
```

### Core Hook: `useDriverTour.ts`

The central tour management system provides:

```typescript
interface TourFunctions {
  startDashboardTour: () => void;
  startQuickRequestTour: () => void; 
  startNewRequestPageTour: () => void;
  startCompanyTour: () => void;
  startNotificationsTour: () => void;
  createTour: (steps: TourStep[], config?: TourConfig) => DriverInstance;
}
```

### Tour Navigation Flow

1. **Initiation**: Tour starts from dashboard or direct component access
2. **Detection**: Components automatically detect tour continuation parameters
3. **Transition**: Seamless navigation between components with state preservation
4. **Completion**: Automatic return to dashboard with tour completion feedback

### URL Parameter System

Tours use URL parameters for state management:
- `?tour=quick-request&continue=true` - Standard tour continuation
- `?continuar-tour=2` - Alternative continuation format for legacy support

## 🎨 Styling & Branding

### Custom CSS Classes
- `.ferry-tour-dashboard` - Dashboard-specific styling
- `.ferry-tour-quick-request` - Request creation tour styling
- `.ferry-tour-company` - Business user tour styling
- `.ferry-tour-notifications` - Notification system styling

### Design Principles
- **Ferry77 Color Palette**: Consistent with platform branding
- **High Contrast**: Ensures visibility and accessibility
- **Smooth Animations**: Enhanced user experience with Driver.js animations
- **Progressive Disclosure**: Information revealed step-by-step

## 🔧 Configuration

### Tour Step Configuration

```typescript
interface TourStep {
  element: string;
  popover: {
    title: string;
    description: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
  };
}
```

### Global Tour Settings

```typescript
const defaultConfig = {
  showProgress: true,
  allowClose: true,
  popoverClass: 'ferry-tour-popover',
  progressText: 'Paso {{current}} de {{total}}',
  nextBtnText: 'Siguiente →',
  prevBtnText: '← Anterior',
  doneBtnText: '¡Entendido!'
};
```

## 📱 Component Integration

### Data Tour Attributes

Components use `data-tour` attributes for tour targeting:

```tsx
// Dashboard elements
<div data-tour="welcome">Welcome Section</div>
<div data-tour="quick-actions">Quick Actions Panel</div>
<div data-tour="my-requests">Requests Overview</div>

// Request form elements
<form data-tour="request-form">...</form>
<div data-tour="upload-files">...</div>
<div data-tour="text-description">...</div>
<button data-tour="preview-request">...</button>
```

### Automatic Tour Detection

```typescript
useEffect(() => {
  const params = new URLSearchParams(location.search);
  const tourParam = params.get('tour');
  const continueParam = params.get('continue');
  const continuarTourParam = params.get('continuar-tour');
  
  if ((tourParam === 'quick-request' && continueParam === 'true') || continuarTourParam) {
    // Auto-switch to appropriate mode and continue tour
    setSelectedMode('manual');
    // Tour continuation logic...
  }
}, [location.search]);
```

## 🚀 Usage Examples

### Starting a Dashboard Tour

```typescript
const { startDashboardTour } = useDriverTour();

// Trigger from button or component
<button onClick={startDashboardTour}>
  Iniciar Tour del Dashboard
</button>
```

### Creating Custom Tours

```typescript
const { createTour } = useDriverTour();

const customSteps = [
  {
    element: '[data-tour="custom-element"]',
    popover: {
      title: 'Custom Feature',
      description: 'This is a custom tour step',
      position: 'bottom'
    }
  }
];

const customTour = createTour(customSteps, {
  popoverClass: 'custom-tour-style'
});

customTour.drive();
```

## 🔒 Error Handling & Validation

### Element Validation
- Tours verify element existence before starting
- Graceful fallbacks for missing elements
- User feedback for tour initialization issues

### Navigation Safety
- URL parameter sanitization
- Safe navigation with timeout management
- Cleanup of tour state on component unmount

## 📊 Performance Considerations

### Optimization Strategies
- **Lazy loading**: Tours only load when needed
- **Element caching**: Efficient DOM queries
- **Memory management**: Proper cleanup of Driver.js instances
- **Bundle size**: Driver.js adds ~15KB gzipped

### Browser Compatibility
- Modern browsers with ES6+ support
- Progressive enhancement for older browsers
- Graceful degradation when JavaScript is disabled

## 🧪 Testing Strategy

### Test Coverage Areas
- Tour initialization and navigation
- Multi-component tour flow
- URL parameter handling
- Element detection and validation
- Mobile responsiveness

### Recommended Testing Approach
```typescript
// Example test structure
describe('Interactive Tours', () => {
  it('should start dashboard tour correctly', () => {
    // Test tour initialization
  });
  
  it('should navigate between components during tour', () => {
    // Test multi-component flow
  });
  
  it('should handle missing elements gracefully', () => {
    // Test error handling
  });
});
```

## 🚀 Future Enhancements

### Planned Features
- **Analytics integration**: Track tour completion rates
- **Personalization**: Adaptive tours based on user behavior
- **A/B testing**: Different tour variations
- **Multilingual support**: Tours in multiple languages
- **Tour templates**: Reusable tour configurations

### Technical Improvements
- **Tour recording**: Record user interactions for tour optimization
- **Smart highlighting**: AI-powered element detection
- **Voice guidance**: Audio narration for accessibility
- **Tour branching**: Conditional tour paths based on user choices

## 📋 Dependencies

### Core Dependencies
- **Driver.js**: ^1.3.6 - Interactive tour library
- **React**: ^18.x - Component framework
- **TypeScript**: ^5.x - Type safety
- **React Router**: ^6.x - Navigation management

### Development Dependencies
- **@types/node**: TypeScript definitions
- **Vite**: Build tooling
- **TailwindCSS**: Styling framework

## 🔧 Maintenance Notes

### Regular Maintenance Tasks
- Update Driver.js library for security patches
- Review and update tour content for UI changes
- Monitor tour completion analytics
- Test tours after major component updates

### Troubleshooting Common Issues
- **Tours not starting**: Check data-tour attributes and element visibility
- **Navigation issues**: Verify URL routing configuration
- **Styling problems**: Review CSS class conflicts and specificity
- **Performance issues**: Audit tour step count and complexity

---

## 📞 Support

For technical issues or feature requests related to the Interactive Tours system:
- Create GitHub issue with `tour-system` label
- Include browser information and reproduction steps
- Provide component and tour step details

---

*Last updated: October 17, 2025*
*Version: 1.0.0*
*Author: Ferry77 Development Team*