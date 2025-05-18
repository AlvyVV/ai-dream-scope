import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalize(str: string): string {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Development environment log function, only outputs logs in development environment
 * @param message Log message
 * @param data Additional data
 */
export function devLog(message: string, ...data: any[]) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEV LOG] ${message}`, ...data);
  }
}
