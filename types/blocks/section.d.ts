import { Image, Button } from '@/types/blocks/base';

export interface SectionItem {
  title?: string;
  description?: string;
  label?: string;
  icon?: string;
  image?: Image;
  buttons?: Button[];
  url?: string;
  target?: string;
  children?: SectionItem[];
  author?: string;
  role?: string;
}

export interface Section {
  disabled?: boolean;
  name?: string;
  title?: string;
  description?: string;
  label?: string;
  icon?: string;
  image?: Image;
  buttons?: Button[];
  items?: SectionItem[];
}
