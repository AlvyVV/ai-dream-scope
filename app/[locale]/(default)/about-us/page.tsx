import Header from '@/components/blocks/header';
import { Avatar } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export async function generateMetadata() {
  return {
    title: 'About AI Dream Scope | Expert Dream Analysis & Interpretation Team',
    description:
      'Meet the team behind AI Dream Scope - combining expertise in psychology, mythology, and AI technology to deliver accurate dream interpretations that unlock the secrets of your subconscious mind.',
  };
}

const AboutUsPage = () => {
  return (
    <>
      <Header />
      <div className="container mx-auto py-12 px-4 md:px-6 mt-16">
        {/* Main Title Area */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">The Visionaries Behind Your Dream Interpretations</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Bridging Ancient Wisdom and Modern Technology to Decode Your Dreams Founded by a diverse team of dream researchers, psychologists, and AI specialists, AI Dream Scope was born from a shared
            passion to make professional dream analysis accessible to everyone. We've analyzed over 50,000 dreams and developed proprietary AI algorithms that recognize patterns human analysts might
            miss, while maintaining the nuanced understanding only human expertise can provide.
          </p>
        </div>

        {/* Our Story */}
        <section className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-primary">Our Story</h2>
              <p className="mb-4 text-foreground/80">
                At DreamScope, we are passionate about understanding and interpreting dreams. As a small team of psychology enthusiasts and dream researchers, we've united in our shared exploration of
                the fascinating world of human subconsciousness.
              </p>
              <p className="mb-4 text-foreground/80">
                Our journey began with a simple yet profound question: "Why do we dream, and what do our dreams mean?" This question led us to deeply research the
                <Link href="/dream-dictionary" className="text-primary hover:underline">
                  &nbsp;Dream Dictionary&nbsp;
                </Link>
                and theories about dreams from across cultures and time periods, blending modern psychology with traditional wisdom to create a comprehensive
                <Link href="/dream-interpreter" className="text-primary hover:underline">
                  &nbsp;Dream Interpreter&nbsp;
                </Link>
                platform.
              </p>
              <p className="text-foreground/80">
                DreamScope is more than just a tool; it's a community, a window into understanding our deeper psychological states. We believe that by interpreting dreams, we can better understand
                ourselves, promote mental health, and even spark creativity.
              </p>
            </div>
            <div className="bg-muted rounded-2xl overflow-hidden shadow-xl">
              <div className="aspect-video w-full bg-gradient-to-br from-secondary/30 to-accent/20 flex items-center justify-center">
                <img src="/banner.webp" alt="Team Photo" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="mb-20 bg-card rounded-3xl p-8 md:p-12 shadow-lg">
          <h2 className="text-3xl font-bold mb-8 text-center text-card-foreground">Mission & Vision</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-background/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl text-primary">✨</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Inspire Self-Awareness</h3>
                <p className="text-muted-foreground">
                  Through our professional
                  <Link href="/dream-dictionary" className="text-primary hover:underline">
                    &nbsp;Dream Dictionary&nbsp;
                  </Link>
                  and interpretation tools, we help people gain deeper insight into their subconscious, fostering personal growth and mental well-being.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl text-primary">🔍</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Innovative Dream Analysis</h3>
                <p className="text-muted-foreground">
                  By combining traditional psychological theories with modern AI technology, we've created the most accurate and personalized
                  <Link href="/dream-interpreter" className="text-primary hover:underline">
                    &nbsp;Dream Interpreter&nbsp;
                  </Link>
                  methods, providing users with profound insights.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl text-primary">🌐</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Build a Dream Community</h3>
                <p className="text-muted-foreground">
                  Create an open, supportive community where people interested in dreams can share experiences, exchange insights, and collectively explore the mysteries of the subconscious.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Our Team */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-10 text-center text-primary">Meet Our Expert Team</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            {/* Expert 1 */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <Avatar className="w-32 h-32 border-4 border-primary/20 shadow-xl">
                <div className="w-full h-full bg-muted flex items-center justify-center text-lg">
                  <img src="/imgs/users/Zia.webp" alt="Team Leader Photo" className="w-full h-full object-cover" />
                </div>
              </Avatar>
              <div>
                <h3 className="text-2xl font-bold mb-2">Zia</h3>
                <p className="text-accent font-medium mb-3">Psychology Graduate Student & Dream Research Enthusiast</p>
                <p className="text-foreground/80 mb-4">
                  Zia is currently a psychology graduate student at a prestigious university, focusing on cognitive psychology and dream research. She began studying dream analysis during her
                  undergraduate years and has participated in multiple research projects on subconsciousness and dreams. She combines modern cognitive psychology theories with traditional
                  psychological analysis to develop more scientific
                  <Link href="/dream-dictionary" className="text-primary hover:underline">
                    &nbsp;dream symbol interpretation&nbsp;
                  </Link>
                  methods.
                </p>
                <p className="text-foreground/80">
                  "Dreams are windows into our inner world, containing our deepest fears, desires, and wisdom. Through understanding our dreams, we can better understand ourselves." - Zia
                </p>
              </div>
            </div>

            {/* Expert 2 */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <Avatar className="w-32 h-32 border-4 border-primary/20 shadow-xl">
                <div className="w-full h-full bg-muted flex items-center justify-center text-lg">VV</div>
              </Avatar>
              <div>
                <h3 className="text-2xl font-bold mb-2">Vivian Vega</h3>
                <p className="text-accent font-medium mb-3">AI Researcher & Dream Enthusiast</p>
                <p className="text-foreground/80 mb-4">
                  Vivian combines her dual background in computer science and psychology to develop advanced AI
                  <Link href="/dream-interpreter" className="text-primary hover:underline">
                    &nbsp;Dream Interpreter&nbsp;
                  </Link>
                  systems. She previously worked at top Silicon Valley tech companies on natural language processing and sentiment analysis projects, and now applies these technologies to dream
                  analysis.
                </p>
                <p className="text-foreground/80">
                  "Artificial intelligence offers new possibilities for understanding complex dream patterns. By analyzing thousands of dream cases, our AI can identify unique symbols and themes in
                  individual dreams, providing more personalized interpretations." - Vivian
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Beyond our core team, DreamScope is supported by dream research enthusiasts and volunteers from around the world, collectively building this growing platform for dream exploration.
            </p>
          </div>
        </section>

        {/* Our Methodology */}
        <section className="mb-20 bg-gradient-to-br from-primary/5 to-secondary/10 rounded-3xl p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-8 text-center text-primary">Our Dream Interpretation Methodology</h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3">1</span>
                Comprehensive Theoretical Foundation
              </h3>
              <p className="pl-11 text-foreground/80">
                Our
                <Link href="/dream-dictionary" className="text-primary hover:underline">
                  &nbsp;Dream Dictionary&nbsp;
                </Link>
                and interpretation methods integrate Jungian analytical psychology, Freudian psychoanalysis, modern cognitive psychology, and dream wisdom from various cultural traditions. This
                diverse theoretical foundation allows us to understand the significance of dream symbols from different perspectives.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3">2</span>
                AI-Assisted Analysis
              </h3>
              <p className="pl-11 text-foreground/80">
                Our specialized
                <Link href="/dream-interpreter" className="text-primary hover:underline">
                  &nbsp;AI Dream Interpreter&nbsp;
                </Link>
                has been trained on tens of thousands of real dream cases and can identify key elements, emotions, and themes in dreams. The AI provides not only general symbol interpretations but
                also considers the dreamer's personal background and context for more personalized analysis.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3">3</span>
                Personal Association Analysis
              </h3>
              <p className="pl-11 text-foreground/80">
                We believe that dream meanings are highly personalized, and the same dream symbol may have completely different meanings for different individuals. Therefore, our interpretation
                methods encourage users to explore the connections between dream elements and their personal life experiences and emotions, leading to deeper self-understanding.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3">4</span>
                Continuous Research and Updates
              </h3>
              <p className="pl-11 text-foreground/80">
                Our team continuously tracks the latest dream research and psychological advances, regularly updating our
                <Link href="/dream-dictionary" className="text-primary hover:underline">
                  &nbsp;Dream Dictionary&nbsp;
                </Link>
                and interpretation methods. User feedback is also a valuable resource for improving our system, helping us create a more accurate and valuable dream interpretation platform.
              </p>
            </div>
          </div>
        </section>

        {/* User Testimonials */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-10 text-center text-primary">Voices from Our Users</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Testimonial Card */}
            <Card className="bg-background border-primary/10 shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <Avatar className="w-10 h-10 mr-3">
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <img src="/imgs/users/Jennifer.webp" alt="Team Leader Photo" className="w-full h-full object-cover" />
                    </div>
                  </Avatar>
                  <div>
                    <p className="font-medium">Jennifer</p>
                    <p className="text-xs text-muted-foreground">New York, USA</p>
                  </div>
                </div>
                <p className="text-foreground/80 italic">
                  "DreamScope's
                  <Link href="/dream-interpreter" className="text-primary hover:underline">
                    &nbsp;Dream Interpreter&nbsp;
                  </Link>
                  helped me understand a recurring dream that had troubled me for years. Through the interpretation, I realized the dream was related to a childhood experience, an insight that has
                  been tremendously helpful in my therapeutic journey."
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background border-primary/10 shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <Avatar className="w-10 h-10 mr-3">
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <img src="/imgs/users/Sarah.webp" alt="Team Leader Photo" className="w-full h-full object-cover" />
                    </div>
                  </Avatar>
                  <div>
                    <p className="font-medium">Sarah</p>
                    <p className="text-xs text-muted-foreground">Toronto, Canada</p>
                  </div>
                </div>
                <p className="text-foreground/80 italic">
                  "I've always been interested in my dreams but never found a tool that could provide such in-depth analysis. DreamScope's
                  <Link href="/dream-dictionary" className="text-primary hover:underline">
                    &nbsp;Dream Dictionary&nbsp;
                  </Link>
                  is incredibly comprehensive, with detailed explanations backed by academic research, unlike other websites that only offer surface-level interpretations."
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background border-primary/10 shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <Avatar className="w-10 h-10 mr-3">
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <img src="/imgs/users/Nakamura.webp" alt="Team Leader Photo" className="w-full h-full object-cover" />
                    </div>
                  </Avatar>
                  <div>
                    <p className="font-medium">Nakamura</p>
                    <p className="text-xs text-muted-foreground">Tokyo, JP</p>
                  </div>
                </div>
                <p className="text-foreground/80 italic">
                  "As an artist, I often look to my dreams for creative inspiration. DreamScope not only helps me interpret my dreams but also allows me to discover hidden creative elements within
                  them. This platform has become an indispensable part of my creative process."
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact Us */}
        <section className="bg-card rounded-3xl p-8 md:p-12 shadow-lg">
          <h2 className="text-3xl font-bold mb-6 text-center text-card-foreground">Join Our Dream Exploration Journey</h2>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            Whether you're an ordinary user interested in dream interpretation or a professional looking to collaborate with us, we welcome your participation and feedback.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl text-primary">📧</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Email</h3>
              <p className="text-muted-foreground">contact@aidreamscope.com</p>
            </div>

            <div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl text-primary">🌐</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Social Media</h3>
              <p className="text-muted-foreground">@AiDreamScope</p>
            </div>

            <div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl text-primary">📝</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Blog</h3>
              <p className="text-muted-foreground">
                <Link href="/blogs" className="text-primary hover:underline">
                  &nbsp;Read Our Latest Articles&nbsp;
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AboutUsPage;
