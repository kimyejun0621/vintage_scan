import { Download, MessageCircle, FileText } from 'lucide-react';

export function LandingFooter() {
  const links = [
    { label: 'Download App', icon: Download, href: '#' },
    { label: 'Discord Community', icon: MessageCircle, href: '#' },
    { label: 'Terms', icon: FileText, href: '#' },
  ];

  return (
    <footer className="border-t border-white/10 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Logo/Brand */}
        <div className="text-center mb-12">
          <h3 className="text-4xl font-black tracking-wider mb-2">VINTAGE SNIPER</h3>
          <p className="font-mono text-xs text-white/40 uppercase tracking-widest">
            Trust No One. Verify Everything.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-8 mb-12">
          {links.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors font-mono text-sm uppercase tracking-wider"
            >
              <link.icon size={16} />
              {link.label}
            </a>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 mb-8" />

        {/* Bottom Info */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-white/30">
          <div>© 2026 Vintage Sniper. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white/60 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white/60 transition-colors">Cookie Policy</a>
            <a href="#" className="hover:text-white/60 transition-colors">Contact</a>
          </div>
        </div>

        {/* Easter Egg */}
        <div className="text-center mt-12">
          <p className="font-mono text-[10px] text-white/20">
            POWERED BY AI • BUILT FOR CULTURE • TRUSTED BY COLLECTORS
          </p>
        </div>
      </div>
    </footer>
  );
}
