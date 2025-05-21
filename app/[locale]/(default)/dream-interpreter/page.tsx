import Header from '@/components/blocks/header';
import { Card, CardContent } from '@/components/ui/card';
import { getPage } from '@/services/load-page';
import { DreamInterpreterPage } from '@/types/pages/dream-interpreter';
import { getLucideIcon } from '@/utils/get-icon';
import { Globe, Moon } from 'lucide-react';
import { getLocale } from 'next-intl/server';
import Chat from './chat';
import DreamAnimation from './dream-animation';
import IntroCard from './intro-card';
import WorldMap from './map';
import TestimonialSmall from './testimonial-small';

export async function generateMetadata() {
  const locale = await getLocale();
  const page = await getPage<DreamInterpreterPage>(locale, 'dream-interpreter');

  return {
    title: page.meta.title,
    description: page.meta.description,
  };
}

/**
 * Dream Interpretation Page
 */
export default async function DreamInterpreter() {
  const locale = await getLocale();
  const page = await getPage<DreamInterpreterPage>(locale, 'dream-interpreter');

  return (
    <>
      <div className="min-h-screen px-2 py-3 sm:py-4 md:px-8">
        <Header />
        {/* Page Title and Introduction */}
        <section className="max-w-6xl mx-auto mb-8 sm:mb-20 text-center mt-8 sm:mt-16 px-4 sm:px-8">
          <div className="relative hidden mb-4 sm:mb-6  md:inline-block">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full blur-md opacity-75 animate-pulse"></div>
            <div className="relative bg-white rounded-full p-1">
              <Moon className="h-10 w-10 sm:h-12 sm:w-12 text-purple-500 mx-auto" />
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">{page.header.title}</h1>

            <h2 className="text-lg sm:text-xl text-gray-800 font-medium max-w-4xl mx-auto">{page.header.subtitle}</h2>

            <p className="text-base text-gray-600 max-w-2xl mx-auto">{page.header.description}</p>
          </div>
        </section>

        {/* Main Content Area: Chat and Introduction Card */}
        <div id="chat-section" className="max-w-6xl mx-auto mb-16 sm:mb-24 relative px-4 sm:px-8">
          <div className="absolute -top-10 -left-10 w-72 h-72 bg-purple-300/20 rounded-full filter blur-3xl opacity-70 -z-10"></div>
          <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-indigo-300/20 rounded-full filter blur-3xl opacity-70 -z-10"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
            {/* Chat Area - Occupies 2/3 width */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-r from-purple-600/10 to-indigo-600/10 rounded-b-2xl rounded-t-none shadow-xl h-full">
                <div className="bg-white/80 backdrop-filter backdrop-blur-sm rounded-b-xl rounded-t-none overflow-hidden h-full">
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2"></div>
                  <Chat />
                </div>
              </div>
            </div>

            {/* Animation - Mobile only */}
            <DreamAnimation />
            {/* Introduction Card Area - Occupies 1/3 width */}
            <div className="w-full">
              <IntroCard data={page.introCard} />
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <section className="max-w-6xl mx-auto mb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {page.features.map((feature, index) => {
              const Icon = getLucideIcon(feature.icon);
              return (
                <Card key={index} className="bg-white/60 backdrop-blur-sm hover:shadow-md transition-all duration-500 ease-out border-0 overflow-hidden">
                  <CardContent className="pt-8 pb-6 px-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="rounded-full bg-purple-100 p-3 mb-5 shadow-md">{Icon && <Icon className="h-7 w-7 text-purple-500" />}</div>
                      <h3 className="font-bold mb-3 text-lg">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* User Reviews */}
        <div className="max-w-6xl mx-auto mb-24">
          <h2 className="text-2xl font-bold text-center mb-10 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">{page.testimonials.title}</h2>
          <TestimonialSmall testimonials={page.testimonials.items} />
        </div>

        {/* Map Area - Below the conversation */}
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-center md:justify-start mb-6">
              <Globe className="h-6 w-6 mr-3 text-purple-500" />
              <h3 className="text-xl font-semibold">{page.worldMap.title}</h3>
            </div>
            <p className="text-gray-600 mb-6 max-w-2xl">{page.worldMap.description}</p>
            <div className="rounded-xl overflow-hidden shadow-lg">
              <WorldMap />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
