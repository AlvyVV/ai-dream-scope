'use client';

import { Carousel, CarouselApi, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Section as SectionType } from '@/types/blocks/section';

export default function Showcase({ section }: { section: SectionType }) {
  if (section.disabled) {
    return null;
  }

  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!carouselApi) {
      return;
    }
    const updateSelection = () => {
      setCanScrollPrev(carouselApi.canScrollPrev());
      setCanScrollNext(carouselApi.canScrollNext());
    };
    updateSelection();
    carouselApi.on('select', updateSelection);
    return () => {
      carouselApi.off('select', updateSelection);
    };
  }, [carouselApi]);

  return (
    <section id={section.name} className="py-16">
      <div className="container">
        <div className="mb-8 flex flex-col justify-between md:mb-14 lg:mb-16">
          <h2 className="mb-2 text-pretty text-3xl font-bold lg:text-4xl">{section.title}</h2>
          <p className="text-muted-foreground">{section.description}</p>
          <div className="shrink-0 gap-2 flex justify-end items-end">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                carouselApi?.scrollPrev();
              }}
              disabled={!canScrollPrev}
              className="disabled:pointer-events-auto"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                carouselApi?.scrollNext();
              }}
              disabled={!canScrollNext}
              className="disabled:pointer-events-auto"
            >
              <ArrowRight className="size-5" />
            </Button>
          </div>
        </div>
      </div>
      <div className="w-full">
        <Carousel
          setApi={setCarouselApi}
          opts={{
            breakpoints: {
              '(max-width: 768px)': {
                dragFree: false,
                containScroll: 'trimSnaps',
              },
            },
            loop: false,
            align: 'start',
          }}
        >
          <CarouselContent className="container ml-[calc(theme(container.padding)-20px)] mr-[calc(theme(container.padding))] 2xl:ml-[calc(50vw-720px+theme(container.padding)-20px)] 2xl:mr-[calc(50vw-700px+theme(container.padding))]">
            {section.items?.map((item, i) => (
              <CarouselItem key={i} className="max-w-[320px] pl-[20px] lg:max-w-[360px]">
                <a href={item.url} target={item.target} className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-3xl">
                  <Image
                    src={item.image?.src || ''}
                    alt={item.image?.alt || item.title || ''}
                    className="absolute inset-x-0 top-0 h-full w-full object-cover"
                    width={360}
                    height={480}
                    loading="lazy"
                  />
                  <div aria-hidden="true" className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black from-[calc(5/16*100%)] ring-1 ring-gray-950/10 ring-inset" />
                  <figure className="relative p-8">
                    {item.label && (
                      <div className="mb-4">
                        <Badge className="bg-white/20 text-white hover:bg-white/30">{item.label}</Badge>
                      </div>
                    )}
                    <div className="mb-4 line-clamp-4 text-sm text-white/80">{item.description}</div>
                    <figcaption className="mt-4 border-t border-white/20 pt-4">
                      {item.title && (
                        <p className="text-sm font-medium">
                          <span className="bg-gradient-to-r from-[#fff1be] from-28% via-[#ee87cb] via-70% to-[#b060ff] bg-clip-text text-transparent">{item.title}</span>
                        </p>
                      )}
                    </figcaption>
                  </figure>
                </a>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}
