'use client';

import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Testimonial } from '@/types/pages/dream-interpreter';
import AutoScroll from 'embla-carousel-auto-scroll';
import { Quote, Star } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useRef } from 'react';

interface TestimonialSmallProps {
  testimonials: Testimonial[];
}

export default function TestimonialSmall({ testimonials }: TestimonialSmallProps) {
  const locale = useLocale();
  const plugin = useRef(
    AutoScroll({
      startDelay: 500,
      speed: 0.5,
    })
  );

  // 获取卡片样式
  const getCardStyle = (variant: string) => {
    switch (variant) {
      case 'purple':
        return 'bg-purple-50 dark:bg-purple-950/30 border-purple-100 dark:border-purple-900/50';
      case 'blue':
        return 'bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/50';
      case 'indigo':
        return 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/50';
      case 'pink':
        return 'bg-pink-50 dark:bg-pink-950/30 border-pink-100 dark:border-pink-900/50';
      case 'amber':
        return 'bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/50';
      default:
        return 'bg-white/80 dark:bg-gray-800/80';
    }
  };

  return (
    <div className="relative mx-auto max-w-5xl py-8">
      <h3 className="mb-6 text-center text-xl font-semibold text-gray-900 dark:text-white">{locale === 'zh' ? '用户体验分享' : 'User Experiences'}</h3>

      <Carousel
        opts={{
          loop: true,
          align: 'start',
        }}
        plugins={[plugin.current]}
        onMouseEnter={() => plugin.current.stop()}
        onMouseLeave={() => plugin.current.play()}
        className="relative mx-auto w-full max-w-5xl before:absolute before:bottom-0 before:left-0 before:top-0 before:z-10 before:w-16 before:bg-gradient-to-r before:from-background before:to-transparent after:absolute after:bottom-0 after:right-0 after:top-0 after:z-10 after:w-16 after:bg-gradient-to-l after:from-background after:to-transparent"
      >
        <CarouselContent>
          {testimonials.map((item, index) => (
            <CarouselItem key={index} className="basis-full md:basis-1/2 xl:basis-1/3 pl-4">
              <Card className={`h-full select-none border p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${getCardStyle(item.variant)}`}>
                <div className="flex justify-between">
                  <div className="mb-3 flex gap-3">
                    <Avatar className="h-10 w-10 rounded-full ring-1 ring-input">
                      <AvatarImage src={item.image?.src} alt={item.title} />
                    </Avatar>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <Quote className="absolute -left-1 -top-1 h-4 w-4 text-muted-foreground/30" />
                  <q className="line-clamp-5 text-sm leading-relaxed text-muted-foreground pl-3">{item.description}</q>
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
