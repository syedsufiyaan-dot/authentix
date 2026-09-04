import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Cpu, 
  BatteryCharging, 
  HardDrive, 
  Wifi, 
  Zap, 
  BarChart3, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight,
  ArrowRight,
  Eye,
  Grid,
  Camera,
  Mic,
  Compass
} from 'lucide-react';
import { AuthentixLogo } from '../components/common/AuthentixLogo';
import { PhoneModel3D } from '../components/three/PhoneModel3D';
import { TrustScoreModal } from '../components/diagnostic/TrustScoreModal';
import { PlatformDisclaimerBanner } from '../components/common/DisclaimerBadge';

export const LandingPage: React.FC = () => {
  const [showScoreModal, setShowScoreModal] = useState(false);

  const capabilities = [
    {
      icon: Eye,
      title: 'Full-Screen Display Diagnostics',
      desc: 'Interactive color canvas cycling to inspect for OLED burn-in, dead sub-pixels, and backlight bleeding.'
    },
    {
      icon: Grid,
      title: 'Touch Screen Coverage Grid',
      desc: 'Multi-touch digitizer drag test with real-time percentage coverage calculation and dead zone detection.'
    },
    {
      icon: Camera,
      title: 'Front & Rear Camera Sensors',
      desc: 'Live high-definition streams with optical focus checks, capture snapshots, and sensor integrity testing.'
    },
    {
      icon: Mic,
      title: 'Microphone & Speaker Acoustics',
      desc: 'Web Audio level meters with voice loopback verification and dual-channel synthesized tone sweeps.'
    },
    {
      icon: Compass,
      title: 'Motion, GPS & Sensor Fidelity',
      desc: 'Real-time 3D orientation tilt card, accelerometer telemetry, and satellite positioning accuracy.'
    },
    {
      icon: BarChart3,
      title: 'Transparent Trust Score',
      desc: 'A unified 0–100 index weighted across active hardware tests with downloadable PDF inspection certificates.'
    }
  ];

  return (
    <div className="min-h-screen bg-bg-darkest text-text-primary selection:bg-accent-teal selection:text-bg-darkest overflow-x-hidden">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-bg-darkest/80 backdrop-blur-lg border-b border-bg-border px-6 py-4 flex items-center justify-between">
        <AuthentixLogo variant="full" size={36} />
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-medium text-text-muted hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 rounded-xl bg-accent-teal/15 hover:bg-accent-teal/25 border border-accent-teal/30 text-accent-teal text-sm font-semibold transition-all shadow-teal-glow"
          >
            Start Diagnostic
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-12 pb-20 md:pt-20 md:pb-28 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent-teal/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="lg:col-span-7 space-y-6 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-teal/10 border border-accent-teal/25 text-accent-teal text-xs font-mono font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            Interactive Mobile Device Inspection Platform
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
            Know the device. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-teal to-accent-cyan">
              Trust the decision.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-text-muted max-w-xl leading-relaxed">
            AuthentiX puts your smartphone through a 16-step interactive hardware testing workflow — evaluating displays, digitizers, cameras, acoustics, and sensors to produce a verifiable <strong>Trust Score</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              to="/register"
              className="px-6 py-3.5 rounded-xl bg-accent-teal text-bg-darkest font-bold text-sm tracking-wide hover:bg-accent-teal/90 transition-all shadow-teal-glow flex items-center gap-2"
            >
              Start Diagnostic
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="px-6 py-3.5 rounded-xl glass-panel hover:border-accent-teal/40 text-text-primary font-medium text-sm transition-all"
            >
              Sign In to Workstation
            </Link>
          </div>

          <div className="pt-6 flex items-center gap-6 text-xs text-text-muted font-mono">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-accent-teal" /> 16 Real Hardware Tests
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-accent-cyan" /> Zero Fake Simulations
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-status-success" /> Exportable PDF Reports
            </span>
          </div>
        </div>

        <div className="lg:col-span-5 h-[420px] md:h-[480px] relative z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-accent-teal/5 to-transparent rounded-3xl border border-bg-border/40 p-2">
            <PhoneModel3D isScanning={true} />
          </div>
        </div>
      </section>

      {/* Diagnostic Capabilities */}
      <section className="px-6 py-20 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-xs font-mono uppercase tracking-widest text-accent-teal">Diagnostic Workflow</h2>
          <h3 className="text-3xl font-bold text-white">Component-By-Component Testing</h3>
          <p className="text-sm text-text-muted">
            Test actual hardware components one by one on the smartphone being inspected.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((c) => (
            <div
              key={c.title}
              className="p-6 rounded-2xl glass-panel hover:border-accent-teal/40 transition-all space-y-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-accent-teal/10 border border-accent-teal/30 flex items-center justify-center text-accent-teal group-hover:scale-110 transition-transform">
                <c.icon className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white group-hover:text-accent-teal transition-colors">
                {c.title}
              </h4>
              <p className="text-xs text-text-muted leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center pt-4">
          <button
            onClick={() => setShowScoreModal(true)}
            className="px-5 py-2.5 rounded-xl glass-panel hover:border-accent-cyan text-accent-cyan text-xs font-mono font-semibold transition-all flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            View Trust Score Mathematical Formula
          </button>
        </div>
      </section>

      {/* Technical Disclaimer Callout */}
      <section className="px-6 py-12 max-w-5xl mx-auto">
        <PlatformDisclaimerBanner />
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 max-w-5xl mx-auto text-center space-y-6">
        <div className="p-10 rounded-3xl glass-panel-glow border border-accent-teal/30 space-y-6 relative overflow-hidden">
          <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Ready to Inspect Smarter?
            </h2>
            <p className="text-sm text-text-muted">
              Connect or load AuthentiX on your phone, complete the 16-step inspection wizard, and generate verified diagnostic certificates.
            </p>
            <div className="pt-2">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-accent-teal text-bg-darkest font-bold text-sm tracking-wide hover:bg-accent-teal/90 transition-all shadow-teal-glow"
              >
                Start Diagnostic Now
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10 bg-bg-darkest border-t border-bg-border text-xs text-text-muted">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <AuthentixLogo variant="sidebar" size={28} />
          <div className="flex items-center gap-6 font-mono text-[11px]">
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-white transition-colors">Create Account</Link>
            <span className="text-text-dim">v2.0 Interactive Diagnostic Engine</span>
          </div>
          <p>© 2026 AuthentiX Diagnostic Systems. All rights reserved.</p>
        </div>
      </footer>

      <TrustScoreModal isOpen={showScoreModal} onClose={() => setShowScoreModal(false)} />
    </div>
  );
};
