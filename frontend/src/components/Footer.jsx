import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-theme-secondary text-theme-primary pt-16 pb-8 border-t border-theme-primary/10 transition-colors duration-500">
      <div className="container mx-auto px-4 max-w-6xl">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
          
          <div>
            <h3 className="text-2xl font-bold italic font-serif mb-6 text-theme-bgPrimary">
              Контакти
            </h3>
            <div className="space-y-3 text-theme-bgPrimary/80">
              <p><span className="font-semibold">Ел. пошта:</span> hello@marginnotes.com</p>
              <p><span className="font-semibold">Телефон:</span> (555) 123-4567</p>
              <p><span className="font-semibold">Адреса:</span> вул. Книжкова, 123, Київ</p>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold italic font-serif mb-6 text-theme-bgPrimary">
              Ми в соцмережах
            </h3>
            <div className="flex gap-4 text-theme-bgPrimary/80">
              <a href="#!" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors cursor-pointer" aria-label="Facebook">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="#!" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors cursor-pointer" aria-label="Twitter">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                </svg>
              </a>
              <a href="#!" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors cursor-pointer" aria-label="Instagram">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="#!" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors cursor-pointer" aria-label="Email">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </a>
            </div>
          </div>

        </div>

        <hr className="border-theme-bgPrimary/20 mb-8" />

        <div className="text-center text-sm text-theme-bgPrimary/60">
          <p>© 2026 MarginNotes. Всі права захищено.</p>
        </div>

      </div>
    </footer>
  );
}