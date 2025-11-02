export const colors = {
  // Brand Colors
  primaryDark: '#0B1722',
  primaryBlue: '#17A0F0',
  secondaryTeal: '#12B3A6',
  
  // Neutral Colors
  neutralLight: '#F7F8FA',
  white: '#FFFFFF',
  mutedGray: '#667085',
  
  // Status Colors
  successGreen: '#22C55E',
  errorRed: '#EF4444',
  warningYellow: '#F59E0B',
  
  // Shadows
  shadowColor: 'rgba(10, 20, 30, 0.06)',
};

export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
  },
  h2: {
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
};

export const spacing = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 20,
};

export const VEHICLE_ANGLES = {
  exterior: [
    { 
      id: 'front', 
      label: 'Front View', 
      icon: 'car-front',
      image: 'https://images.unsplash.com/photo-1683778782676-2506103ba90e?w=400&q=80',
      description: 'Capture the full front of the vehicle'
    },
    { 
      id: 'front_left', 
      label: 'Front Left (3/4)', 
      icon: 'car-front',
      image: 'https://images.unsplash.com/photo-1614541385622-3b852280154d?w=400&q=80',
      description: 'Three-quarter view from front left'
    },
    { 
      id: 'left', 
      label: 'Left Side', 
      icon: 'car-side',
      image: 'https://images.unsplash.com/photo-1670241398875-d3f5978ce2fd?w=400&q=80',
      description: 'Full side profile view'
    },
    { 
      id: 'rear_left', 
      label: 'Rear Left (3/4)', 
      icon: 'car-back',
      image: 'https://images.unsplash.com/photo-1706863411207-6db2c0393641?w=400&q=80',
      description: 'Three-quarter view from rear left'
    },
    { 
      id: 'rear', 
      label: 'Rear View', 
      icon: 'car-back',
      image: 'https://images.unsplash.com/photo-1619300027229-337a3361a225?w=400&q=80',
      description: 'Capture the full rear of the vehicle'
    },
    { 
      id: 'rear_right', 
      label: 'Rear Right (3/4)', 
      icon: 'car-back',
      image: 'https://images.unsplash.com/photo-1625510873508-fd4e72670f5a?w=400&q=80',
      description: 'Three-quarter view from rear right'
    },
    { 
      id: 'front_right', 
      label: 'Front Right (3/4)', 
      icon: 'car-front',
      image: 'https://images.unsplash.com/photo-1714161830116-3f2490013f96?w=400&q=80',
      description: 'Three-quarter view from front right'
    },
  ],
  interior: [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: 'gauge',
      image: 'https://images.unsplash.com/photo-1549064233-945d7063292f?w=400&q=80',
      description: 'Center console and dashboard view'
    },
    { 
      id: 'front_seats', 
      label: 'Front Seats', 
      icon: 'armchair',
      image: 'https://images.unsplash.com/photo-1533630217389-3a5e4dff5683?w=400&q=80',
      description: 'Driver and passenger seat view'
    },
    { 
      id: 'rear_seats', 
      label: 'Rear Seats', 
      icon: 'armchair',
      image: 'https://images.unsplash.com/photo-1625690180114-5530b1304127?w=400&q=80',
      description: 'Back seat area view'
    },
    { 
      id: 'trunk', 
      label: 'Trunk/Boot', 
      icon: 'box',
      image: 'https://images.unsplash.com/photo-1683778782578-6dbe29091ebc?w=400&q=80',
      description: 'Cargo area view'
    },
    { 
      id: 'door_panels', 
      label: 'Door Panels', 
      icon: 'door-open',
      image: 'https://images.unsplash.com/photo-1621639532859-8b26570b96fc?w=400&q=80',
      description: 'Interior door trim and controls'
    },
  ],
};

export const BACKGROUNDS = [
  { id: 'studio_white', label: 'Studio White', preview: colors.neutralLight },
  { id: 'outdoor_natural', label: 'Outdoor Natural', preview: '#87CEEB' },
  { id: 'luxury_showroom', label: 'Luxury Showroom', preview: '#2C3E50' },
  { id: 'premium_night', label: 'Premium Night', preview: '#1A1A2E' },
];