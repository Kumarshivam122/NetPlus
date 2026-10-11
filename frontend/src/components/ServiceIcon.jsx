import React from 'react';
import { Truck, Thermometer, Package, ShieldCheck, CreditCard, CalendarClock } from 'lucide-react';

// Line icons for the service list (data/store.js -> SERVICES[].icon holds the name)
const ICONS = {
  'truck': Truck,
  'thermometer': Thermometer,
  'package': Package,
  'shield': ShieldCheck,
  'credit-card': CreditCard,
  'calendar': CalendarClock,
};

export default function ServiceIcon({ name, size = 24 }) {
  const Icon = ICONS[name] || Package;
  return <Icon size={size} strokeWidth={1.75} aria-hidden="true" />;
}
