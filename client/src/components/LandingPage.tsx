import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { GraduationCap, Theater, Sparkles, Clock, Users, BookOpen, Star, CheckCircle, ArrowRight, Target, Heart, Award, Play, Zap } from 'lucide-react';

interface LandingPageProps {
  onSignIn: () => void;
  onSignUp: () => void;
  onShowLessons: () => void;
}

const LandingPage = ({ onSignIn, onSignUp, onShowLessons }: LandingPageProps) => {
  const values = [
    {
      icon: Target,
      title: 'Purpose-Driven',
      description: 'Every lesson is designed with clear learning objectives and outcomes in mind.'
    },
    {
      icon: Heart,
      title: 'Inclusive Learning',
      description: 'We believe drama education should be accessible to students of all backgrounds and abilities.'
    },
    {
      icon: Award,
      title: 'Quality Content',
      description: 'Our lessons are crafted by experienced educators and continuously refined.'
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{animationDelay: '0s'}}></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute -top-8 left-1/2 w-72 h-72 bg-yellow-500/20 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Hero Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8)), url('juliet.png')`
        }}
      />
      
      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6 flex justify-between items-center backdrop-blur-sm bg-white/5 border-b border-white/10">
          <div className="flex items-center gap-2 group">
            <div className="relative">
              <Theater className="w-8 h-8 text-purple-400 group-hover:text-purple-300 transition-all duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-md group-hover:bg-purple-300/30 transition-all duration-300"></div>
            </div>
            <span className="text-2xl font-bold text-white group-hover:text-purple-100 transition-colors duration-300">JulietLessons</span>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="ghost" 
              onClick={onSignIn}
              className="text-white hover:bg-white/10 border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
            >
              Sign In
            </Button>
            <Button 
              onClick={onSignUp}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
            >
              Sign Up
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-4xl mx-auto text-center">
            {/* Hero Title */}
            <div className="mb-8 animate-fade-in">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="relative">
                  <GraduationCap className="w-12 h-12 text-purple-400 animate-float" />
                  <div className="absolute inset-0 bg-purple-400/30 blur-lg rounded-full animate-pulse"></div>
                </div>
                <div className="relative">
                  <Sparkles className="w-8 h-8 text-yellow-400 animate-bounce" />
                  <div className="absolute inset-0 bg-yellow-400/30 blur-md rounded-full animate-ping"></div>
                </div>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                <span className="inline-block hover:scale-105 transition-transform duration-300">Craft</span>{' '}
                <span className="inline-block hover:scale-105 transition-transform duration-300">Perfect</span>
                <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent animate-pulse">
                  Drama Lessons
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed max-w-3xl mx-auto hover:text-white transition-colors duration-300">
                Generate engaging, structured drama lessons tailored to your students' experience level. 
                From warm-ups to cool-downs, create the perfect theatrical learning experience.
              </p>
            </div>

            {/* CTA Button */}
            <div className="animate-fade-in mb-16" style={{ animationDelay: '0.3s' }}>
              <Button 
                onClick={onShowLessons}
                size="lg"
                className="relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg px-12 py-4 h-auto font-semibold shadow-2xl transform hover:scale-110 transition-all duration-300 overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                <Theater className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                <span className="relative z-10">Generate Lessons</span>
                <div className="absolute inset-0 rounded-md bg-purple-500/20 blur-xl group-hover:bg-purple-400/40 transition-all duration-300"></div>
              </Button>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <div className="group glass-effect p-6 rounded-lg border border-white/10 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-500/40 transition-all duration-300 group-hover:scale-110">
                  <GraduationCap className="w-6 h-6 text-purple-400 group-hover:text-purple-300" />
                </div>
                <h3 className="text-white font-semibold mb-2 group-hover:text-purple-200 transition-colors">Level-Based</h3>
                <p className="text-gray-300 text-sm group-hover:text-white transition-colors">Activities matched to your students' experience level</p>
              </div>
              
              <div className="group glass-effect p-6 rounded-lg border border-white/10 hover:border-pink-400/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/20">
                <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-pink-500/40 transition-all duration-300 group-hover:scale-110">
                  <Theater className="w-6 h-6 text-pink-400 group-hover:text-pink-300" />
                </div>
                <h3 className="text-white font-semibold mb-2 group-hover:text-pink-200 transition-colors">Structured Flow</h3>
                <p className="text-gray-300 text-sm group-hover:text-white transition-colors">Warm-up, main activity, and cool-down sequences</p>
              </div>
              
              <div className="group glass-effect p-6 rounded-lg border border-white/10 hover:border-yellow-400/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/20">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-yellow-500/40 transition-all duration-300 group-hover:scale-110">
                  <Sparkles className="w-6 h-6 text-yellow-400 group-hover:text-yellow-300" />
                </div>
                <h3 className="text-white font-semibold mb-2 group-hover:text-yellow-200 transition-colors">Instant Generation</h3>
                <p className="text-gray-300 text-sm group-hover:text-white transition-colors">Get complete lesson plans in seconds</p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Extended Content Sections */}
      <div className="relative z-10 bg-gradient-to-b from-transparent via-background/80 to-background">
        {/* Our Story Section */}
        <section className="py-16 px-6 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 to-pink-900/10 backdrop-blur-sm"></div>
          <div className="container mx-auto max-w-4xl relative z-10">
            <Card className="glass-effect border-purple-500/30 hover:border-purple-400/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20">
              <CardHeader>
                <CardTitle className="text-3xl gradient-text text-center animate-fade-in">
                  <h2 className="text-3xl md:text-4xl font-bold text-white text-center">
                    Our <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Story</span>
                  </h2>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-lg leading-relaxed">
                <p className="text-gray-300 hover:text-purple-100 transition-colors duration-300">
                  Born from the collaboration between seasoned drama educators and innovative technologists, 
                  our platform addresses a critical need in the creative education space: the time-consuming 
                  process of developing structured, engaging drama lessons.
                </p>
                <p className="text-gray-300 hover:text-purple-100 transition-colors duration-300">
                  We recognized that while drama teachers are incredibly creative and passionate, they often 
                  struggle with the administrative burden of lesson planning, especially when trying to adapt 
                  content for different age groups and skill levels.
                </p>
                <p className="text-gray-300 hover:text-purple-100 transition-colors duration-300">
                  Our AI-powered lesson generator doesn't replace the educator's creativity—it amplifies it, 
                  providing a structured foundation that teachers can build upon and customize for their unique classroom needs.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Our Values Section */}
        <section className="py-16 px-6 bg-gradient-to-br from-purple-50/5 to-pink-50/5 relative">
          <div className="absolute inset-0 backdrop-blur-sm"></div>
          <div className="container mx-auto max-w-6xl relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 text-center">
              Our <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Values</span>
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <Card 
                  key={index} 
                  className="group glass-effect border-purple-500/30 text-center hover:border-purple-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
                  style={{animationDelay: `${index * 0.2}s`}}
                >
                  <CardHeader>
                    <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-500/40 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                      <value.icon className="w-8 h-8 text-purple-400 group-hover:text-purple-300" />
                    </div>
                    <CardTitle className="text-xl text-gray-100 group-hover:text-purple-200 transition-colors">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-gray-300 group-hover:text-white transition-colors">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced How It Works Section with Beautiful Effects */}
        <section className="py-24 px-6 relative overflow-hidden">
          {/* Magical Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-500/20 to-violet-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-full mix-blend-multiply filter blur-2xl animate-bounce-slow"></div>
          </div>
          
          {/* Animated Grid Background */}
          <div className="absolute inset-0 opacity-10">
            <div className="grid grid-cols-12 gap-4 h-full">
              {Array.from({ length: 144 }).map((_, i) => (
                <div 
                  key={i} 
                  className="bg-white/5 rounded animate-shimmer" 
                  style={{animationDelay: `${(i % 12) * 0.1}s`}}
                ></div>
              ))}
            </div>
          </div>

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-20">
              <div className="relative inline-block mb-6">
                <h2 className="text-5xl md:text-6xl font-bold text-white animate-fade-in relative z-10">
                  How It{' '}
                  <span className="relative">
                    <span className="rounded-md px-2 bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent animate-glow">
                      Works
                    </span>
                    <div className="absolute -inset-2 bg-gradient-to-r from-purple-400/30 via-pink-400/30 to-yellow-400/30 blur-xl rounded-lg animate-pulse"></div>
                  </span>
                </h2>
                <div className="absolute -top-4 -right-4">
                  <Sparkles className="w-8 h-8 text-yellow-400 animate-spin" style={{animationDuration: '3s'}} />
                </div>
                <div className="absolute -bottom-2 -left-6">
                  <Zap className="w-6 h-6 text-purple-400 animate-bounce" />
                </div>
              </div>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{animationDelay: '0.3s'}}>
                Creating professional drama lessons has never been easier. Follow these simple steps to transform your teaching experience.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-16">
              {/* Step 1 - Enhanced with magical effects */}
              <div className="text-center group animate-fade-in relative" style={{animationDelay: '0.4s'}}>
                <div className="relative mb-8">
                  {/* Magical circle background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-full blur-2xl group-hover:blur-xl transition-all duration-500 animate-pulse"></div>
                  <div className="absolute inset-2 bg-gradient-to-r from-purple-400/10 to-purple-500/10 rounded-full blur-xl group-hover:blur-lg transition-all duration-500"></div>
                  
                  {/* Main number circle */}
                  <div className="relative w-24 h-24 bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 rounded-full flex items-center justify-center mx-auto group-hover:scale-125 transition-all duration-500 shadow-2xl group-hover:shadow-purple-500/50 border-2 border-purple-400/30 group-hover:border-purple-300/60">
                    <span className="text-3xl font-bold text-white relative z-10 group-hover:scale-110 transition-transform duration-300">1</span>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
                  </div>
                  
                  {/* Floating particles */}
                  <div className="absolute -top-2 -right-2 w-3 h-3 bg-purple-400 rounded-full animate-ping"></div>
                  <div className="absolute -bottom-1 -left-3 w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
                  <div className="absolute top-1/2 -right-4 w-1 h-1 bg-yellow-400 rounded-full animate-bounce"></div>
                </div>
                
                <h3 className="text-2xl font-semibold text-white mb-6 group-hover:text-purple-200 transition-colors duration-300 relative">
                  Choose Your Settings
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-500"></div>
                </h3>
                <p className="text-gray-300 group-hover:text-white transition-colors duration-300 leading-relaxed">
                  Select age group, experience level, and lesson focus to customize your drama activities with precision.
                </p>
              </div>

              {/* Step 2 - Enhanced with magical effects */}
              <div className="text-center group animate-fade-in relative" style={{animationDelay: '0.6s'}}>
                <div className="relative mb-8">
                  {/* Magical circle background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-pink-600/20 rounded-full blur-2xl group-hover:blur-xl transition-all duration-500 animate-pulse" style={{animationDelay: '1s'}}></div>
                  <div className="absolute inset-2 bg-gradient-to-r from-pink-400/10 to-pink-500/10 rounded-full blur-xl group-hover:blur-lg transition-all duration-500"></div>
                  
                  {/* Main number circle */}
                  <div className="relative w-24 h-24 bg-gradient-to-br from-pink-600 via-pink-700 to-pink-800 rounded-full flex items-center justify-center mx-auto group-hover:scale-125 transition-all duration-500 shadow-2xl group-hover:shadow-pink-500/50 border-2 border-pink-400/30 group-hover:border-pink-300/60">
                    <span className="text-3xl font-bold text-white relative z-10 group-hover:scale-110 transition-transform duration-300">2</span>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
                  </div>
                  
                  {/* Floating particles */}
                  <div className="absolute -top-3 -left-2 w-3 h-3 bg-pink-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
                  <div className="absolute -bottom-2 -right-2 w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                  <div className="absolute top-0 right-0 w-1 h-1 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '1.5s'}}></div>
                </div>
                
                <h3 className="text-2xl font-semibold text-white mb-6 group-hover:text-pink-200 transition-colors duration-300 relative">
                  Generate Instantly
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-pink-400 to-yellow-400 group-hover:w-full transition-all duration-500"></div>
                </h3>
                <p className="text-gray-300 group-hover:text-white transition-colors duration-300 leading-relaxed">
                  Our AI creates a complete lesson plan with warm-ups, main activities, and cool-downs in seconds.
                </p>
              </div>

              {/* Step 3 - Enhanced with magical effects */}
              <div className="text-center group animate-fade-in relative" style={{animationDelay: '0.8s'}}>
                <div className="relative mb-8">
                  {/* Magical circle background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-full blur-2xl group-hover:blur-xl transition-all duration-500 animate-pulse" style={{animationDelay: '2s'}}></div>
                  <div className="absolute inset-2 bg-gradient-to-r from-yellow-400/10 to-yellow-500/10 rounded-full blur-xl group-hover:blur-lg transition-all duration-500"></div>
                  
                  {/* Main number circle */}
                  <div className="relative w-24 h-24 bg-gradient-to-br from-yellow-600 via-yellow-700 to-yellow-800 rounded-full flex items-center justify-center mx-auto group-hover:scale-125 transition-all duration-500 shadow-2xl group-hover:shadow-yellow-500/50 border-2 border-yellow-400/30 group-hover:border-yellow-300/60">
                    <span className="text-3xl font-bold text-white relative z-10 group-hover:scale-110 transition-transform duration-300">3</span>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
                  </div>
                  
                  {/* Floating particles */}
                  <div className="absolute -top-1 -right-3 w-3 h-3 bg-yellow-400 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
                  <div className="absolute -bottom-3 -left-1 w-2 h-2 bg-orange-400 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
                  <div className="absolute top-1/4 -left-4 w-1 h-1 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '2s'}}></div>
                </div>
                
                <h3 className="text-2xl font-semibold text-white mb-6 group-hover:text-yellow-200 transition-colors duration-300 relative">
                  Teach & Engage
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 group-hover:w-full transition-all duration-500"></div>
                </h3>
                <p className="text-gray-300 group-hover:text-white transition-colors duration-300 leading-relaxed">
                  Use your personalized lesson plan to create memorable theatrical experiences for your students.
                </p>
              </div>
            </div>

            {/* Connecting Lines with Animation */}
            <div className="hidden md:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl">
              <div className="relative">
                <div className="absolute top-0 left-1/6 w-1/3 h-0.5 bg-gradient-to-r from-purple-400/50 to-pink-400/50 animate-shimmer"></div>
                <div className="absolute top-0 right-1/6 w-1/3 h-0.5 bg-gradient-to-r from-pink-400/50 to-yellow-400/50 animate-shimmer" style={{animationDelay: '1s'}}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24 px-6 bg-gradient-to-r from-purple-900/20 to-pink-900/20 relative">
          <div className="absolute inset-0 backdrop-blur-sm"></div>
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="animate-fade-in">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
                  Why Choose <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">JulietLessons?</span>
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4 group">
                    <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-green-200 transition-colors">Save Hours of Planning</h3>
                      <p className="text-gray-300 group-hover:text-white transition-colors">Generate complete lesson plans in seconds instead of spending hours researching and planning.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 group">
                    <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-green-200 transition-colors">Age-Appropriate Content</h3>
                      <p className="text-gray-300 group-hover:text-white transition-colors">Every activity is carefully tailored to your students' age group and experience level.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 group">
                    <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-green-200 transition-colors">Professional Structure</h3>
                      <p className="text-gray-300 group-hover:text-white transition-colors">Each lesson follows proven pedagogical principles with clear warm-up, main, and cool-down phases.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 group">
                    <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-green-200 transition-colors">Endless Variety</h3>
                      <p className="text-gray-300 group-hover:text-white transition-colors">Never run out of fresh ideas with our vast database of drama activities and exercises.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="group glass-effect p-6 rounded-lg border border-white/10 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20">
                  <Clock className="w-10 h-10 text-purple-400 mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-200 transition-colors">Immediately</h3>
                  <p className="text-gray-300 group-hover:text-white transition-colors">Create a complete lesson using auto generation</p>
                </div>
                
                <div className="group glass-effect p-6 rounded-lg border border-white/10 hover:border-pink-400/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-pink-500/20">
                  <Users className="w-10 h-10 text-pink-400 mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-pink-200 transition-colors">10K+</h3>
                  <p className="text-gray-300 group-hover:text-white transition-colors">Educators using our platform</p>
                </div>
                
                <div className="group glass-effect p-6 rounded-lg border border-white/10 hover:border-yellow-400/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-yellow-500/20">
                  <BookOpen className="w-10 h-10 text-yellow-400 mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-yellow-200 transition-colors">500+</h3>
                  <p className="text-gray-300 group-hover:text-white transition-colors">Unique drama activities</p>
                </div>
                
                <div className="group glass-effect p-6 rounded-lg border border-white/10 hover:border-green-400/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/20">
                  <Star className="w-10 h-10 text-green-400 mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-green-200 transition-colors">4.9/5</h3>
                  <p className="text-gray-300 group-hover:text-white transition-colors">Average user rating</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 px-6 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-pink-900/10"></div>
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in">
                What Educators <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Say</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Join thousands of drama teachers who are transforming their lesson planning.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="group glass-effect p-8 rounded-lg border border-white/10 hover:border-purple-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 animate-fade-in">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current group-hover:scale-110 transition-transform duration-300" style={{transitionDelay: `${i * 0.1}s`}} />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic group-hover:text-white transition-colors">
                  "JulietLessons has revolutionized my teaching. I can create engaging lessons in minutes instead of hours. My students love the variety!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white font-bold">SM</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold group-hover:text-purple-200 transition-colors">Sarah Mitchell</p>
                    <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">High School Drama Teacher</p>
                  </div>
                </div>
              </div>

              <div className="group glass-effect p-8 rounded-lg border border-white/10 hover:border-pink-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/20 animate-fade-in" style={{animationDelay: '0.2s'}}>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current group-hover:scale-110 transition-transform duration-300" style={{transitionDelay: `${i * 0.1}s`}} />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic group-hover:text-white transition-colors">
                  "The age-appropriate content is spot on. Every lesson is perfectly structured and my elementary students are always engaged."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white font-bold">MR</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold group-hover:text-pink-200 transition-colors">Michael Rodriguez</p>
                    <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">Elementary Arts Coordinator</p>
                  </div>
                </div>
              </div>

              <div className="group glass-effect p-8 rounded-lg border border-white/10 hover:border-yellow-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/20 animate-fade-in" style={{animationDelay: '0.4s'}}>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current group-hover:scale-110 transition-transform duration-300" style={{transitionDelay: `${i * 0.1}s`}} />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic group-hover:text-white transition-colors">
                  "As a new teacher, this platform gave me the confidence to deliver professional drama lessons from day one. Absolutely incredible!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white font-bold">EL</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold group-hover:text-yellow-200 transition-colors">Emily Lane</p>
                    <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">Community Theater Director</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 px-6 bg-gradient-to-r from-purple-900/40 to-pink-900/40 relative">
          <div className="absolute inset-0 backdrop-blur-sm"></div>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
              Ready to Transform Your
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                Drama Teaching?
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Join thousands of educators who are already creating amazing drama lessons with our AI-powered platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={onShowLessons}
                size="lg"
                className="relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xl px-12 py-6 h-auto font-semibold shadow-2xl transform hover:scale-110 transition-all duration-300 overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                <Theater className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                <span className="relative z-10">Generate Lessons</span>
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
                <div className="absolute inset-0 rounded-md bg-purple-500/20 blur-xl group-hover:bg-purple-400/40 transition-all duration-300"></div>
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="p-6 text-center border-t border-white/10 backdrop-blur-sm bg-white/5">
          <div className="flex justify-center gap-6 mb-4">
            <a href="#" className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-105">
              Home
            </a>
            <span className="text-gray-600">•</span>
            <a href="#" onClick={onSignIn} className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-105">
              Sign In
            </a>
            <span className="text-gray-600">•</span>
            <a href="#" onClick={onSignUp} className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-105">
              Sign Up
            </a>
          </div>
          <p className="text-gray-400 text-sm hover:text-white transition-colors duration-300">
            Empowering drama educators with intelligent lesson planning
          </p>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
