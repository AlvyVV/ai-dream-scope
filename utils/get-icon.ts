import * as LucideIcons from 'lucide-react';

export function getLucideIcon(iconName: string) {
  if (!iconName) return null;
  return (LucideIcons as any)[iconName];
}
