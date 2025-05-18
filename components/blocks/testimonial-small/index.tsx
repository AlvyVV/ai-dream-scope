'use client';

import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

import Icon from '@/components/icon';
import { Card } from '@/components/ui/card';
import { Section as SectionType } from '@/types/blocks/section';
import AutoScroll from 'embla-carousel-auto-scroll';
import { Star } from 'lucide-react';
import { useRef } from 'react';

export default function Testimonial({ section }: { section: SectionType }) {
  if (section.disabled) {
    return null;
  }

  const plugin = useRef(
    AutoScroll({
      startDelay: 500,
      speed: 0.7,
    })
  );
  const items = [
    {
      title: 'Edric',
      label: 'Toronto',
      description:
        "After years of recurring falling dreams, the AI interpretation helped me connect them to my fear of losing control at work. The personalized dream analysis was far more insightful than any dream dictionary I've used before.",
      image: {
        src: '/imgs/users/Edric.webp',
      },
    },
    {
      title: 'Roxanne',
      label: 'London',
      description:
        "I was skeptical about AI dream interpretation until I tried it for my wedding dreams. The analysis uncovered commitment fears I hadn't consciously acknowledged. Three months later, I had a breakthrough in therapy about these exact issues!",
      image: {
        src: '/imgs/users/Roxanne.webp',
      },
    },
    {
      title: 'Jessie',
      label: 'Dubai',
      description:
        'The cultural perspectives in these dream interpretations are incredible. As someone with a mixed heritage, I appreciate how the analysis incorporates both Eastern and Western viewpoints on my symbol dreams.',
      image: {
        src: '/imgs/users/Jessie.webp',
      },
    },
    {
      title: 'Chad',
      label: 'Sydney',
      description:
        "I've been journaling my dreams for years, but this AI tool takes interpretation to another level. It found connections between dreams I had months apart that revealed a pattern about my relationship issues.",
      image: {
        src: '/imgs/users/Chad.webp',
      },
    },
    {
      title: 'Brian',
      label: 'Barcelona',
      description:
        'La interpretación de sueños que ofrece esta plataforma es impresionante. Antes consultaba libros tradicionales, pero la profundidad del análisis personalizado que recibo aquí ha transformado mi comprensión de mis sueños recurrentes sobre el océano.',
      image: {
        src: '/imgs/users/Brian.webp',
      },
    },
    {
      title: 'Candice',
      label: 'Ciudad de México',
      description:
        'Como psicólogo, estaba escéptico sobre la interpretación de sueños mediante IA, pero debo admitir que el análisis cultural y psicológico integrado es sorprendentemente sofisticado. Ahora lo recomiendo a mis pacientes como complemento a nuestras sesiones.',
      image: {
        src: '/imgs/users/Candice.webp',
      },
    },
  ];
  return (
    <section id={section.name} className="py-16">
      <div className="flex flex-col items-center gap-4">
        {section.label && (
          <div className="flex items-center gap-1 text-sm font-semibold text-primary">
            {section.icon && <Icon name={section.icon} className="h-6 w-auto border-primary" />}
            {section.label}
          </div>
        )}
        <h2 className="text-center text-3xl font-semibold lg:text-4xl">{section.title}</h2>
        <p className="text-center text-muted-foreground lg:text-lg">{section.description}</p>
      </div>
      <div className="lg:container">
        <div className="mt-16 space-y-4">
          <Carousel
            opts={{
              loop: true,
            }}
            plugins={[plugin.current]}
            onMouseLeave={() => plugin.current.play()}
            className="relative before:absolute before:bottom-0 before:left-0 before:top-0 before:z-10 before:w-36 before:bg-gradient-to-r before:from-background before:to-transparent after:absolute after:bottom-0 after:right-0 after:top-0 after:z-10 after:w-36 after:bg-gradient-to-l after:from-background after:to-transparent"
          >
            <CarouselContent>
              {items?.map((item, index) => (
                <CarouselItem key={index} className="basis-auto">
                  <Card className="max-w-96 select-none p-6">
                    <div className="flex justify-between">
                      <div className="mb-4 flex gap-4">
                        <Avatar className="size-14 rounded-full ring-1 ring-input">
                          <AvatarImage src={item.image?.src} alt={item.title} />
                        </Avatar>
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.label}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="size-5 fill-amber-500 text-amber-500" />
                        ))}
                      </div>
                    </div>
                    <q className="leading-7 text-muted-foreground">{item.description}</q>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </section>
  );
}
