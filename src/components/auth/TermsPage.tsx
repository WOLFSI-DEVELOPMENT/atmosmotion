import React from 'react';
import { ArrowLeft02Icon } from 'hugeicons-react';

interface Props {
  onNavigate: () => void;
}

export default function TermsPage({ onNavigate }: Props) {
  return (
    <div className="w-full min-h-screen bg-black text-white overflow-y-auto font-sans relative">
      <div className="absolute top-6 left-1/2 z-20 -translate-x-1/2 md:top-8">
        <img
          src="https://res.cloudinary.com/dwthgcx5j/image/upload/v1780066101/ChatGPT_Image_May_29_2026_07_42_50_AM_1_tptgxp.png"
          alt="Atmos Motion"
          className="h-12 w-12 object-contain brightness-0 invert"
        />
      </div>

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
          src="https://res.cloudinary.com/dwthgcx5j/image/upload/v1780544881/Blurred_text_privacy_policy_202606032047_o3ivwm.jpg" 
          alt="Terms Banner"
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/10" />
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-16 md:py-24 font-sans text-white/70 leading-[1.7]">
        <p className="mb-6 text-sm text-white/45 uppercase tracking-widest font-semibold">Last updated: June 4, 2026</p>

        <h2 className="text-xl md:text-2xl font-medium text-white mb-6 mt-12">1. Agreement to Terms</h2>
        <p className="mb-6">
          These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity (“you”) and Atmos AI ("we," "us" or "our"), concerning your access to and use of our application as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto.
        </p>

        <h2 className="text-xl md:text-2xl font-medium text-white mb-6 mt-12">2. Intellectual Property Rights</h2>
        <p className="mb-6">
          Unless otherwise indicated, the Application is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Application (collectively, the “Content”) and the trademarks, service marks, and logos contained therein (the “Marks”) are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
        </p>

        <h2 className="text-xl md:text-2xl font-medium text-white mb-6 mt-12">3. User Representations</h2>
        <p className="mb-6">
          By using the Application, you represent and warrant that:
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-2 text-white/62">
          <li>All registration information you submit will be true, accurate, current, and complete.</li>
          <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
          <li>You have the legal capacity and you agree to comply with these Terms of Service.</li>
          <li>You are not a minor in the jurisdiction in which you reside.</li>
        </ul>

        <h2 className="text-xl md:text-2xl font-medium text-white mb-6 mt-12">4. Prohibited Activities</h2>
        <p className="mb-6">
          You may not access or use the Application for any purpose other than that for which we make the Application available. The Application may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
        </p>

        <h2 className="text-xl md:text-2xl font-medium text-white mb-6 mt-12">5. Contact Us</h2>
        <p className="mb-6">
          If you have questions about these Terms of Service, contact us at <a href="mailto:emartinezra2121@gmail.com" className="text-white border-b border-white/30 hover:border-white transition-colors">emartinezra2121@gmail.com</a>.
        </p>

      </div>

      {/* Simple Footer */}
      <div className="w-full border-t border-white/10 bg-black py-12 text-center text-sm text-white/35">
        © {new Date().getFullYear()} Atmos AI, Inc. All rights reserved.
      </div>
    </div>
  );
}
