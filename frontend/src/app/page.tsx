import Link from 'next/link';
import FeedbackForm from '@/components/FeedbackForm';
import {
  FileText,
  Sparkles,
  Target,
} from 'lucide-react';

const steps = [
  {
    icon: FileText,
    step: '01',
    title: 'Submit',
    description:
      'Fill in the form below with your feedback, bug report, or feature idea. No account required.',
  },
  {
    icon: Sparkles,
    step: '02',
    title: 'AI Analyses',
    description:
      'Gemini AI automatically categorises, scores priority, and summarises your feedback instantly.',
  },
  {
    icon: Target,
    step: '03',
    title: 'Gets Prioritised',
    description:
      'Our product team reviews AI-prioritised feedback and takes action on what matters most.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">

      {/* HEADER */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">
              <span className="text-foreground">Feed</span>
              <span style={{ color: '#0ba5ec' }}>Pulse</span>
            </span>
          </div>

          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors border border-border rounded-full px-5 py-2 hover:border-primary"
          >
            Admin Portal
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="hero-gradient py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">

          <div className="flex justify-center mb-6">
            <span className="throughout-label">
              <span>●</span>
              <span>AI-Powered Feedback Platform</span>
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Share Your{' '}
            <span className="text-gradient">Product Feedback</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
            Help us build better products. Submit bug reports, suggest features,
            or share your thoughts. Our AI will automatically analyse and
            prioritise your submission.
          </p>

          <p className="text-sm text-muted-foreground">
            No account required · Takes less than 2 minutes
          </p>
        </div>
      </section>

      {/* FEEDBACK FORM SECTION */}
      <section className="py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <FeedbackForm />
        </div>
      </section>

      <section className="throughout-gradient py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">

          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <span className="throughout-label">
                <span>●</span>
                <span>How It Works</span>
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              From Feedback to Action
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Your feedback is automatically processed by AI and reviewed by our
              product team.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map(({ icon: Icon, step, title, description }) => (
              <div
                key={step}
                className="bg-white rounded-2xl border border-border p-6 card-hover"
              >
                <div className="throughout-icon-bg mb-4">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-xs font-bold text-primary mb-2 tracking-widest">
                  STEP {step}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer-dark py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <span className="text-xl font-bold text-white">
                Feed<span style={{ color: '#0ba5ec' }}>Pulse</span>
              </span>
              <p className="text-sm mt-1" style={{ color: '#a1a8b0' }}>
                AI-Powered Product Feedback Platform
              </p>
            </div>
            <div className="text-sm" style={{ color: '#a1a8b0' }}>
              Built for{" "}
              <a
                href="https://throughout.io"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
                style={{ color: '#0ba5ec' }}
              >
                Throughout
              </a>{" "}
              · Powered by Google Gemini AI
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}