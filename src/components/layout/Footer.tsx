import React from 'react';
import { FerrisIcon } from '@/components/FerrisIcon';
import { GithubIcon } from '@/components/GithubIcon';
import { BookOpen, ExternalLink, Heart } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export const Footer: React.FC = () => {
  const { t } = useI18n();

  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand & mission */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <FerrisIcon size={28} />
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {t('common.appName')}
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
              {t('footer.description')}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
              <span>{t('footer.ferrisCredit')}</span>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              {t('footer.officialResources')}
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a
                  href="https://doc.rust-lang.org/book/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-slate-600 hover:text-[#CE412B] dark:text-slate-400 dark:hover:text-[#CE412B] transition-colors"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>{t('footer.theRustBook')}</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://doc.rust-lang.org/rust-by-example/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-slate-600 hover:text-[#CE412B] dark:text-slate-400 dark:hover:text-[#CE412B] transition-colors"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>{t('footer.rustByExample')}</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://doc.rust-lang.org/std/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-slate-600 hover:text-[#CE412B] dark:text-slate-400 dark:hover:text-[#CE412B] transition-colors"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>{t('footer.stdApi')}</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </li>
            </ul>
          </div>

          {/* Community & Open Source */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              {t('footer.openSource')}
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a
                  href="https://github.com/ecator/learn-rust"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-slate-600 hover:text-[#CE412B] dark:text-slate-400 dark:hover:text-[#CE412B] transition-colors"
                >
                  <GithubIcon size={14} className="h-3.5 w-3.5 inline" />
                  <span>{t('nav.githubRepo')}</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </li>
              <li className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                {t('footer.license')}
              </li>
              <li className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500 shrink-0" />
                <span>{t('footer.builtWith')}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-500">
          <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
};
