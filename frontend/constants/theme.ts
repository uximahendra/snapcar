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
    { id: 'front', label: 'Front', icon: 'car-front' },
    { id: 'front_left', label: 'Front Left', icon: 'car-front' },
    { id: 'left', label: 'Left', icon: 'car-side' },
    { id: 'rear_left', label: 'Rear Left', icon: 'car-back' },
    { id: 'rear', label: 'Rear', icon: 'car-back' },
    { id: 'rear_right', label: 'Rear Right', icon: 'car-back' },
    { id: 'front_right', label: 'Front Right', icon: 'car-front' },
  ],
  interior: [
    { id: 'dashboard', label: 'Dashboard', icon: 'gauge' },
    { id: 'front_seats', label: 'Front Seats', icon: 'armchair' },
    { id: 'rear_seats', label: 'Rear Seats', icon: 'armchair' },
    { id: 'trunk', label: 'Trunk', icon: 'box' },
    { id: 'door_panels', label: 'Door Panels', icon: 'door-open' },
  ],
};

export const BACKGROUNDS = [
  { id: 'studio_white', label: 'Studio White', preview: colors.neutralLight },
  { id: 'outdoor_natural', label: 'Outdoor Natural', preview: '#87CEEB' },
  { id: 'luxury_showroom', label: 'Luxury Showroom', preview: '#2C3E50' },
  { id: 'premium_night', label: 'Premium Night', preview: '#1A1A2E' },
];