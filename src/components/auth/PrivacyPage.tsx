import React from 'react';
import { ArrowLeft02Icon } from 'hugeicons-react';

interface Props {
  onNavigate: () => void;
}

export default function PrivacyPage({ onNavigate }: Props) {
  return (
    <div className="w-full min-h-screen bg-white text-[#111] overflow-y-auto font-sans relative">
      {/* Back button */}
      <div className="absolute top-6 left-6 z-10 md:top-8 md:left-8">
        <button 
          onClick={onNavigate}
          className="flex items-center text-white bg-black/20 backdrop-blur-md rounded-full px-4 py-2 hover:bg-black/40 transition-all font-medium text-sm gap-2"
        >
          <ArrowLeft02Icon className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Top Banner Image */}
      <div className="w-full h-[30vh] sm:h-[40vh] relative">
        <img 
          src="https://res.cloudinary.com/dwthgcx5j/image/upload/v1780544896/Blurred_text_privacy_policy_202606032045_aue27s.jpg" 
          alt="Privacy Banner"
          className="w-full h-full object-cover shadow-sm"
        />
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-16 md:py-24 font-sans text-gray-700 leading-[1.7]">
        <p className="mb-6 text-sm text-gray-500 uppercase tracking-widest font-semibold">Last updated: June 4, 2026</p>

        <h2 className="text-xl md:text-2xl font-medium text-[#111] mb-6 mt-12">1. Introduction</h2>
        <p className="mb-6">
          Atmos AI ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our application.
        </p>

        <h2 className="text-xl md:text-2xl font-medium text-[#111] mb-6 mt-12">2. Information We Collect</h2>
        <p className="mb-6">
          We may collect information about you in a variety of ways. The information we may collect via the Application includes:
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-600">
          <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, and demographic information.</li>
          <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Application, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Application.</li>
        </ul>

        <h2 className="text-xl md:text-2xl font-medium text-[#111] mb-6 mt-12">3. Use of Your Information</h2>
        <p className="mb-6">
          Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Application to:
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-600">
          <li>Assist law enforcement and respond to subpoena.</li>
          <li>Compile anonymous statistical data and analysis for use internally or with third parties.</li>
          <li>Create and manage your account.</li>
          <li>Deliver targeted advertising, coupons, newsletters, and other information regarding promotions and the Application to you.</li>
        </ul>

        <h2 className="text-xl md:text-2xl font-medium text-[#111] mb-6 mt-12">4. Disclosure of Your Information</h2>
        <p className="mb-6">
          We may share information we have collected about you in certain situations. Your information may be disclosed as follows: 
          By Law or to Protect Rights, Third-Party Service Providers, Marketing Communications, Interactions with Other Users, and Online Postings.
        </p>
      </div>

      {/* Simple Footer */}
      <div className="w-full border-t border-gray-100 bg-white py-12 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Atmos AI, Inc. All rights reserved.
      </div>
    </div>
  );
}
