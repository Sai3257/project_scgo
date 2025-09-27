import { useState } from 'react';
import { Mail, ArrowRight, Brain, Target, TrendingUp, BookOpen, CheckCircle } from 'lucide-react';
import { loginWithEmail } from '../api/endpoints';

interface LoginPageProps {
  onLogin: (user: any) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [step, setStep] = useState<'input' | 'success'>('input');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  // Base regex provided by you
  const emailRegex = /^[\w\.-]+@[\w\.-]+\.\w{2,}$/;
  // Additional rule to reject domains like gm.com (second-level label length === 2) but allow g.com
  const isValidEmail = (() => {
    if (!emailRegex.test(email)) return false;
    const parts = email.split('@');
    if (parts.length !== 2) return false;
    const domain = parts[1];
    const labels = domain.split('.');
    if (labels.length < 2) return false;
    const secondLevel = labels[labels.length - 2];
    // Reject exactly 2-char second-level labels (e.g., gm.com); allow 1-char (g.com)
    if (secondLevel && secondLevel.length === 2) return false;
    return true;
  })();

  const handleSendMagicLink = async () => {
    setErrorMessage('');
    if (!email.trim() || !isValidEmail) {
      setErrorMessage('⚠️ Please enter a valid email address (example: user@example.com)');
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await loginWithEmail(email);
      const redirectUrl = data?.redirect_url || data?.redirect || data?.url || data?.link;
      if (redirectUrl) {
        window.location.href = String(redirectUrl);
        return;
      }
      setStep('success');
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to send magic link. Please try again.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (value: string) => {
    setErrorMessage('');
    setEmail(value);
  };

  const studentQuotes = [
    "Stay consistent, not perfect. Progress adds up.",
    "Every small step today builds your tomorrow.",
    "Your learning journey is unique—own it.",
    "Track progress, celebrate wins, keep going."
  ];

  const features = [
    { icon: BookOpen, title: "Smart Learning Paths", description: "Personalized study guidance" },
    { icon: TrendingUp, title: "Progress Tracker", description: "Visualize achievements" },
    { icon: Target, title: "Goal Setting", description: "Stay focused on what matters" }
  ];

  // Instant visual validation states
  const showInlineEmailWarning = email.length > 0 && !isValidEmail;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0C1445] to-[#1E2A78] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 left-32 w-1 h-1 bg-cyan-300 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-60 left-20 w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute top-80 left-40 w-1 h-1 bg-cyan-400 rounded-full animate-pulse delay-500"></div>
        <div className="absolute top-32 right-20 w-2 h-2 bg-cyan-300 rounded-full animate-pulse delay-1500"></div>
        <div className="absolute top-52 right-32 w-1 h-1 bg-cyan-500 rounded-full animate-pulse delay-3000"></div>
        <div className="absolute top-72 right-16 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse delay-500"></div>
        <div className="absolute top-96 right-28 w-1 h-1 bg-cyan-300 rounded-full animate-pulse delay-2500"></div>
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Motivational Content */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-8 xl:px-12">
          {/* Logo */}
          <div className="flex items-center mb-12">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center mr-3">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">SuperCoach Go</h1>
          </div>

          {/* Main Headline */}
          <div className="mb-8">
            <h2 className="text-4xl xl:text-5xl font-bold text-white mb-4">
              Your AI-Powered
            </h2>
            <h2 className="text-4xl xl:text-5xl font-bold text-cyan-400 mb-6">
              Learning Companion
            </h2>
            <p className="text-xl text-gray-300">
              Transform Your Learning Journey with AI
            </p>
          </div>

          {/* Quote */}
          <div className="mb-12">
            <blockquote className="text-lg text-gray-300 italic">
              "{studentQuotes[Math.floor(Math.random() * studentQuotes.length)]}"
            </blockquote>
          </div>

          {/* Feature Cards */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-cyan-400/20 rounded-lg flex items-center justify-center mr-4">
                    <feature.icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Login Card */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">SuperCoach Go</h1>
            </div>

            {/* Login Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {step === 'input' ? 'Welcome Back!' : 'Check your email'}
                </h2>
                <p className="text-gray-300">
                  {step === 'input' 
                    ? 'Sign in to continue your learning journey' 
                    : 'We sent you a magic link to sign in. Click the link in your email to sign in.'
                  }
                </p>
              </div>

              {step === 'input' ? (
                <div className="space-y-6">
                  {/* Email Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={email}
                          onChange={(e) => handleEmailChange(e.target.value)}
                          placeholder="Enter your email"
                          className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                          (errorMessage) ? 'border-red-400' : 'border-white/20'
                          }`}
                        />
                      </div>
                      {showInlineEmailWarning && (
                        <p className="mt-2 text-xs text-red-400">⚠️ Please enter a valid email address (example: user@example.com)</p>
                      )}
                    {errorMessage && (
                        <p className="mt-2 text-xs text-red-400">{errorMessage}</p>
                      )}
                    </div>

                  {/* Magic Link Button */}
                  <button
                    onClick={handleSendMagicLink}
                    disabled={isLoading || !isValidEmail}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        Sign in with Magic Link
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-6 text-center">
                  <div className="mx-auto w-14 h-14 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <CheckCircle className="w-7 h-7 text-cyan-400" />
                  </div>
                  <button
                    onClick={() => setStep('input')}
                    className="w-full text-gray-300 hover:text-white py-2 text-sm transition-colors duration-200"
                  >
                    Use a different email
                  </button>
                </div>
              )}

              {/* Footer */}
              <div className="mt-8 text-center">
                <p className="text-xs text-gray-400">
                  By signing in, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
