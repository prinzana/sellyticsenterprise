import React from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import logo from '../../Assets/newlogo.png';
const footerLinks = {
  Product: [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Use Cases', href: '#use-cases' },

  ],
  Company: [
    { name: 'About Us', href: '#' },
    //{ name: 'Team', href: '#team' },
    //{ name: 'Careers', href: '#' },
    // { name: 'Press', href: '#' },
    //{ name: 'Blog', href: '#' },
  ],

  //Legal: [
  //{ name: 'Privacy Policy', href: '#' },
  //{ name: 'Terms of Service', href: '#' },
  // { name: 'Cookie Policy', href: '#' },
  //{ name: 'GDPR', href: '#' },
  //],
};

const socialLinks = [
  // { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: 'https://www.linkedin.com/company/sellyticshq/', label: 'LinkedIn' },
  { icon: Instagram, href: 'https://www.instagram.com/sellyticshq?igsh=Mjd5cHAwMmlhNXYx&utm_source=qr', label: 'Instagram' },
  //{ icon: Facebook, href: '#', label: 'Facebook' },
];

export default function Footer() {
  return (
    <footer className="relative bg-slate-950 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Top Section */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12 mb-12">
          {/* Logo & Description */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-16 sm:h-20 md:h-28 w-auto min-h-[48px] max-h-[80%] max-w-[80%]">
                <img src={logo}
                  alt="Sellytics Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </Link>
            <p className="text-sm sm:text-base text-slate-400 mb-6 max-w-xs">
              Sellytics — the modern way to manage inventory, track sales, and grow your retail business. Offline-first. Mobile-optimized. AI-powered.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <a href="mailto:hello@sellytics.com" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
                hello@sellytics.com
              </a>
              <a href="tel:+2349012345678" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                <Phone className="w-4 h-4" />
                +234 901 234 5678
              </a>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <MapPin className="w-4 h-4" />
                Lagos, Nigeria
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-white mb-4">{category}</h4>
              <ul className="space-y-2 sm:space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500 text-center sm:text-left">
            © {new Date().getFullYear()} Sellytics. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <social.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}