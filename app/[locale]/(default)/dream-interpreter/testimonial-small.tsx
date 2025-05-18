'use client';

import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import AutoScroll from 'embla-carousel-auto-scroll';
import { Quote, Star } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useRef } from 'react';

export default function TestimonialSmall() {
  const locale = useLocale();

  const plugin = useRef(
    AutoScroll({
      startDelay: 500,
      speed: 0.5,
    })
  );

  // 用户评价数据
  const items = [
    {
      title: 'James',
      label: 'Tokyo',
      description:
        'I was really struggling with these recurring falling dreams - they were driving me crazy! The AI analysis was eye-opening. It helped me realize they were connected to my anxiety about a big project at work. Now I actually feel more in control. Way better than those generic dream meaning websites!',
      image: {
        src: '/imgs/users/James.webp',
      },
      variant: 'purple',
    },
    {
      title: 'Ruby',
      label: 'London',
      description:
        "Honestly? I thought this was going to be another gimmicky AI thing. But when it analyzed my wedding dreams, it picked up on anxieties about commitment I didn't even realize I had. My therapist was impressed when I brought it up - it really helped move our sessions forward.",
      image: {
        src: '/imgs/users/Ruby.webp',
      },
      variant: 'blue',
    },
    {
      title: 'Ben',
      label: 'Sydney',
      description:
        'Been keeping a dream journal for 3+ years, and this tool is something else. It spotted patterns across months of entries that completely flew over my head. Turns out my dreams about locked doors were all tied to my fear of opening up in relationships. Pretty mind-blowing stuff.',
      image: {
        src: '/imgs/users/Ben.webp',
      },
      variant: 'pink',
    },
    {
      title: 'Ella',
      label: 'Paris',
      description:
        "Started using this after my grandfather passed away. He kept appearing in my dreams, and I couldn't understand why some felt peaceful while others left me upset. The AI helped me see these dreams were actually about unresolved conversations. It's been really healing.",
      image: {
        src: '/imgs/users/Ella.webp',
      },
      variant: 'amber',
    },
    {
      title: 'Neil',
      label: 'Berlin',
      description:
        "The accuracy is wild! I kept having dreams about being on boats in stormy water - turns out it wasn't random at all. The AI connected it to my uncertainty about switching careers. That interpretation gave me the push I needed to finally make the jump to a new industry.",
      image: {
        src: '/imgs/users/Neil.webp',
      },
      variant: 'default',
    },
    {
      title: 'Aurora',
      label: 'SLC',
      description:
        "This app is like having a dream expert in your pocket! I had this weird recurring dream about flying but always getting stuck. The AI helped me understand it was about feeling held back in my creative projects. Since then, I've actually started taking more risks with my art.",
      image: {
        src: '/imgs/users/Aurora.webp',
      },
      variant: 'default',
    },
  ];

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
          {items.map((item, index) => (
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
