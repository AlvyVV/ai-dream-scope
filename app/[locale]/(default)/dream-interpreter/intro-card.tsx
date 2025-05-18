'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Info, Lightbulb, Star } from 'lucide-react';
import { useLocale } from 'next-intl';

export default function IntroCard() {
  const locale = useLocale();

  // Dream interpretation tips
  const tips = [
    {
      icon: <Lightbulb className="h-4 w-4 text-amber-500" />,
      title: 'Detailed Dream Description',
      description: 'Provide complete dream details including scenes, characters, colors, emotions, and key dream symbols for accurate AI dream interpretation',
    },
    {
      icon: <Brain className="h-4 w-4 text-indigo-500" />,
      title: 'Record Dream Emotions',
      description: 'Share feelings during the dream and emotional reactions after waking up, these are crucial for AI Dream Scope interpretation',
    },
    {
      icon: <Info className="h-4 w-4 text-blue-500" />,
      title: 'Add Life Context',
      description: 'Mention life events or concerns related to your dream for more personalized and deeper dream interpretation',
    },
  ];

  // User ratings
  const highlights = [
    {
      rating: 4.9,
      totalReviews: '12K+',
      text: 'Dream Interpreter Satisfaction',
    },
    {
      rating: 92,
      unit: '%',
      text: 'Dream Interpretation Accuracy',
    },
  ];

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-xl dark:from-gray-800/80 dark:to-gray-900/80 backdrop-filter backdrop-blur-sm h-full">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 py-3">
        <CardTitle className="text-center text-base font-bold text-white">Get More Accurate AI Dream Interpretation Service</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {tips.map((tip, index) => (
            <div key={index} className="flex items-start gap-2 group hover:bg-white/60 dark:hover:bg-gray-700/40 p-2 rounded-lg transition-colors duration-300">
              <div className="flex-shrink-0 rounded-full bg-white p-1.5 shadow-md dark:bg-gray-700 group-hover:shadow-lg group-hover:scale-110 transition-transform duration-300">{tip.icon}</div>
              <div>
                <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100">{tip.title}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-300">{tip.description}</p>
              </div>
            </div>
          ))}

          <div className="mt-4 rounded-lg bg-white/80 p-3 shadow-md dark:bg-gray-700/80 transform transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
            <h3 className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">AI Dream Scope User Ratings</h3>
            <div className="flex justify-between">
              {highlights.map((item, index) => (
                <div key={index} className="text-center px-2">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{item.rating}</span>
                    {item.unit && <span className="text-sm text-purple-600 dark:text-purple-400">{item.unit}</span>}
                    {!item.unit && <Star className="h-5 w-5 fill-amber-400 text-amber-400" />}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">{item.text}</p>
                  {item.totalReviews && <p className="text-[10px] text-gray-500 dark:text-gray-400">{item.totalReviews}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
