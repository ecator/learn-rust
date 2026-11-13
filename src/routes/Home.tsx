import React from 'react';
import { Link } from 'react-router-dom';
import { FerrisIcon } from '@/components/FerrisIcon';
import {
  Layers,
  BookOpen,
  Award,
  Globe,
  Sparkles,
  ArrowRight,
  Code2,
} from 'lucide-react';

export const Home: React.FC = () => {
  const stats = [
    { label: 'Interactive Modules', value: '10' },
    { label: 'Visual Concept Simulators', value: '6' },
    { label: 'Interactive Challenges', value: '30+' },
    { label: 'Languages Supported', value: '3 (ZH/EN/JA)' },
  ];

  const features = [
    {
      title: 'Visual Concept Simulators',
      description:
        'Watch ownership transfer, borrow scopes, and stack vs. heap allocations happen in animated real-time step-by-step simulations.',
      icon: Layers,
      color: 'text-amber-500 bg-amber-500/10 dark:bg-amber-500/20',
      link: '/visualizers',
    },
    {
      title: 'Zero-to-Mastery Curriculum',
      description:
        'Structured learning path from Cargo basics and primitive types through trait objects, unsafe boundaries, and fearless concurrency.',
      icon: BookOpen,
      color: 'text-[#CE412B] bg-[#CE412B]/10 dark:bg-[#CE412B]/20',
      link: '/curriculum',
    },
    {
      title: 'Local Progress & XP Tracking',
      description:
        'Your learning trajectory, completed quizzes, and streak counts are persisted safely in your browser localStorage without telemetry.',
      icon: Award,
      color: 'text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20',
      link: '/progress',
    },
    {
      title: 'Tri-lingual Localization',
      description:
        'Designed from day one for seamless switching between Chinese (简体中文), English, and Japanese (日本語), matching browser preferences.',
      icon: Globe,
      color: 'text-blue-500 bg-blue-500/10 dark:bg-blue-500/20',
      link: '/curriculum',
    },
  ];

  return (
    <div className="space-y-16 px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-orange-500/10 via-slate-100 to-transparent p-8 sm:p-12 lg:p-16 dark:from-[#CE412B]/15 dark:via-slate-900 dark:to-transparent border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col-reverse items-center justify-between gap-8 lg:flex-row">
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-3 py-1 text-xs font-semibold text-[#CE412B] dark:border-orange-900/60 dark:bg-slate-900/80">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Rust Made Intuitive & Interactive</span>
            </div>

            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
              Master Rust with <br />
              <span className="text-[#CE412B]">Visual Clarity</span> & Zero Fear
            </h1>

            <p className="max-w-xl text-base sm:text-lg text-slate-600 dark:text-slate-300">
              Stop fighting the borrow checker in the dark. Experience interactive memory diagrams,
              step-by-step ownership transfer visualizations, and guided practice crafted with love.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/curriculum"
                className="inline-flex items-center gap-2 rounded-xl bg-[#CE412B] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#CE412B]/25 hover:bg-[#B33621] transition-all hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#CE412B]"
              >
                <span>Start Learning</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/visualizers"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 transition-all hover:scale-[1.02]"
              >
                <Layers className="h-4 w-4 text-[#CE412B]" />
                <span>Explore Visualizers</span>
              </Link>
            </div>
          </div>

          {/* Hero Ferris Mascot Illustration */}
          <div className="relative flex shrink-0 items-center justify-center p-6">
            <div className="absolute inset-0 rounded-full bg-[#CE412B]/20 blur-3xl animate-pulse" />
            <div className="relative rounded-3xl border border-orange-200 bg-white/60 p-8 shadow-2xl backdrop-blur-md dark:border-orange-900/50 dark:bg-slate-900/60">
              <FerrisIcon size={180} className="drop-shadow-xl animate-bounce [animation-duration:3s]" />
              <div className="mt-4 text-center">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  Hi, I&apos;m Ferris! Let&apos;s build fast & safe software.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats Grid */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900/60 shadow-sm"
          >
            <div className="text-2xl sm:text-3xl font-extrabold text-[#CE412B]">{stat.value}</div>
            <div className="mt-1 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
              {stat.label}
            </div>
          </div>
        ))}
      </section>

      {/* Core Pillars */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Why Learn Rust Here?
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Traditional textbooks explain the borrow checker with words. We explain it with live
            interactivity, graphical memory diagrams, and instant feedback.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <Link
                key={feat.title}
                to={feat.link}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-[#CE412B]/40 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60 transition-all"
              >
                <div className="space-y-4">
                  <div className={`inline-flex rounded-xl p-3 ${feat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-[#CE412B] transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-[#CE412B]">
                  <span>Explore</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Highlight Banner */}
      <section className="rounded-2xl border border-[#CE412B]/20 bg-[#CE412B]/5 p-8 text-center sm:p-10 dark:bg-[#CE412B]/10">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#CE412B]">
            <Code2 className="h-4 w-4" />
            <span>Pure Client-Side React SPA</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Zero Server Setup. Deploy Anywhere.
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Hosted statically on GitHub Pages with automated CI/CD. All compiler simulations and
            progress tracking run securely inside your browser runtime.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              to="/curriculum"
              className="rounded-xl bg-[#CE412B] px-5 py-2.5 text-xs font-semibold text-white shadow hover:bg-[#B33621] transition-colors"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
