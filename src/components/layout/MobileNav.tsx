import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Layers, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

export const MobileNav: React.FC = () => {
  const { t } = useI18n();
  const tabs = [
    { key: 'home', path: '/', icon: Home, end: true },
    { key: 'curriculum', path: '/curriculum', icon: BookOpen },
    { key: 'visualizers', path: '/visualizers', icon: Layers },
    { key: 'progress', path: '/progress', icon: Award },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 flex h-14 border-t border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 lg:hidden"
    >
      <div className="mx-auto flex w-full max-w-md items-center justify-around px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const label = t(`nav.${tab.key}`);
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.end}
              aria-label={label}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-0.5 rounded-lg py-1 px-3 text-[11px] font-medium transition-colors',
                  isActive
                    ? 'text-[#CE412B] font-semibold'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                )
              }
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
