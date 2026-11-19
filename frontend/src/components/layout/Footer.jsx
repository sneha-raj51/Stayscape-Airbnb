import React from 'react';
import { Link } from 'react-router-dom';
import { FiGlobe, FiGithub, FiTwitter, FiInstagram, FiHeart } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-neutral-50 border-t border-neutral-200 mt-auto text-neutral-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Support */}
          <div>
            <h4 className="font-semibold text-neutral-900 mb-4">Support</h4>
            <ul className="space-y-3">
              <li>
                <a href="#help" className="hover:underline hover:text-neutral-900">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#safety" className="hover:underline hover:text-neutral-900">
                  AirCover & Safety
                </a>
              </li>
              <li>
                <a href="#anti-discrimination" className="hover:underline hover:text-neutral-900">
                  Anti-discrimination
                </a>
              </li>
              <li>
                <a href="#disability" className="hover:underline hover:text-neutral-900">
                  Disability support
                </a>
              </li>
              <li>
                <a href="#cancellation" className="hover:underline hover:text-neutral-900">
                  Cancellation options
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Hosting */}
          <div>
            <h4 className="font-semibold text-neutral-900 mb-4">Hosting</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/register" className="hover:underline hover:text-neutral-900">
                  StayScape your home
                </Link>
              </li>
              <li>
                <a href="#hosting-resources" className="hover:underline hover:text-neutral-900">
                  Hosting resources
                </a>
              </li>
              <li>
                <a href="#community-forum" className="hover:underline hover:text-neutral-900">
                  Community forum
                </a>
              </li>
              <li>
                <a href="#hosting-responsibly" className="hover:underline hover:text-neutral-900">
                  Hosting responsibly
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: StayScape */}
          <div>
            <h4 className="font-semibold text-neutral-900 mb-4">StayScape</h4>
            <ul className="space-y-3">
              <li>
                <a href="#newsroom" className="hover:underline hover:text-neutral-900">
                  Newsroom
                </a>
              </li>
              <li>
                <a href="#new-features" className="hover:underline hover:text-neutral-900">
                  New features
                </a>
              </li>
              <li>
                <a href="#careers" className="hover:underline hover:text-neutral-900">
                  Careers
                </a>
              </li>
              <li>
                <a href="#investors" className="hover:underline hover:text-neutral-900">
                  Investors
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Platform Summary */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-neutral-900">StayScape</span>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed mb-4">
              Premium vacation rentals, unique cabins, luxury beach houses, and boutique apartments across the world.
            </p>
            <div className="flex items-center space-x-4 text-neutral-400">
              <a href="#twitter" aria-label="Twitter" className="hover:text-neutral-800 transition-colors">
                <FiTwitter className="w-5 h-5" />
              </a>
              <a href="#instagram" aria-label="Instagram" className="hover:text-neutral-800 transition-colors">
                <FiInstagram className="w-5 h-5" />
              </a>
              <a href="#github" aria-label="GitHub" className="hover:text-neutral-800 transition-colors">
                <FiGithub className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-neutral-200 flex flex-col md:flex-row items-center justify-between text-xs text-neutral-500 space-y-4 md:space-y-0">
          <div className="flex flex-wrap items-center space-x-4">
            <span>© {new Date().getFullYear()} StayScape, Inc. All rights reserved.</span>
            <span>·</span>
            <a href="#privacy" className="hover:underline">
              Privacy
            </a>
            <span>·</span>
            <a href="#terms" className="hover:underline">
              Terms
            </a>
            <span>·</span>
            <a href="#sitemap" className="hover:underline">
              Sitemap
            </a>
          </div>

          <div className="flex items-center space-x-4 font-semibold text-neutral-700">
            <span className="flex items-center space-x-1.5 cursor-pointer hover:underline">
              <FiGlobe className="w-4 h-4" />
              <span>English (US)</span>
            </span>
            <span className="cursor-pointer hover:underline">$ USD</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
