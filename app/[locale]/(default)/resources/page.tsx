import Header from '@/components/blocks/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


export const runtime = "edge";

export async function generateMetadata() {
  return {
    title: 'Resource Library | AI Dream Scope',
    description: 'A carefully curated collection of valuable resources related to dream interpretation, psychology, and personal growth.',
  };
}

const resourceLinks = [
  {
    category: 'Dream Resources',
    links: [
      {
        title: 'はてなブックマーク',
        url: 'https://b.hatena.ne.jp/entry?url=https%3A%2F%2Faidreamscope.com%2F',
      },
      {
        title: 'AI Dream Scope Book',
        url: 'https://alvy.gitbook.io/ai-dream-scope-book',
      },
      {
        title: 'Cal Bio',
        url: 'https://cal.com/alvy-vv-b3jyk5',
      },
      {
        title: 'Linktr Bio',
        url: 'https://linktr.ee/aidreamscope',
      },
      {
        title: 'Creem',
        url: 'https://www.creem.io/bip/ai-dream-scope',
      },
      {
        title: 'Steemit',
        url: 'https://steemit.com/steemhunt/@alvyvv/introduction-to-ai-dream-scope-unlocking-the-mysteries-of-your-dreams',
      },
      {
        title: 'Github',
        url: 'https://github.com/AlvyVV',
      },
      {
        title: 'Quora',
        url: 'https://www.quora.com/profile/Alvy-VV',
      },
      {
        title: 'Vocus',
        url: 'https://vocus.cc/article/67f3f011fd89780001eb64a9',
      },
    ],
  },
];

export default function ResourcePage() {
  return (
    <>
      <Header />
      <div className="container mx-auto py-12 px-4 md:px-6 mt-16">
        {/* Main Title Area */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Useful Resource Library</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            My carefully curated collection of resources related to dream interpretation, psychology, and personal growth to support your dream exploration and self-development journey. All links are
            provided for reference, with content managed by their respective websites.
          </p>
        </div>

        {/* Resource Links Area */}
        <div className="space-y-12">
          {resourceLinks.map((category, index) => (
            <section key={index}>
              <h2 className="text-2xl font-bold mb-6 text-primary border-l-4 border-primary pl-4">{category.category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.links.map((link, linkIndex) => (
                  <Card key={linkIndex} className="transition-all hover:shadow-md">
                    <CardHeader>
                      <CardTitle className="text-xl">{link.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <a href={link.url} target="_blank" rel="nofollow" className="inline-flex items-center text-primary hover:text-primary/80 transition-colors">
                        Visit Resource
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="ml-2"
                        >
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Resource Submission Area */}
        <div className="mt-20 p-8 bg-muted rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Recommend Valuable Resources</h2>
          <p className="mb-6 text-muted-foreground">
            If you discover high-quality dream interpretation or psychology resources, please share them with me. I'll consider adding them to the resource library.
          </p>
          <a
            href="mailto:info@aidreamscope.com"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            Recommend Resource
          </a>
        </div>
      </div>
    </>
  );
}
