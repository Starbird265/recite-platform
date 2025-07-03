'use client';

import React from 'react';
import Link from 'next/link';

const PixelIcon = ({ src, alt }: { src: string; alt: string }) => (
  <img src={src} alt={alt} style={{ width: 48, height: 48, imageRendering: 'pixelated' }} className="mb-2" />
);

const LandingPage = () => {
  return (
    <div className="pixel-bg min-h-screen">
      {/* Hero Section */}
      <section className="container py-5 text-center">
        <h1 className="pixel-font display-4 fw-bold mb-3">RS-CIT Hybrid Micro-Learning Platform</h1>
        <p className="pixel-font lead mb-4">Democratizing RS-CIT certification with AI-driven micro-lessons, adaptive quizzes, and trusted local ITGK centres.</p>
        <div className="d-flex flex-wrap justify-content-center gap-3 mb-4">
          <Link href="/enquiry" className="pixel-btn btn btn-primary btn-lg">Sign Up</Link>
          <Link href="/find-centre" className="pixel-btn btn btn-success btn-lg">Find a Centre</Link>
          <Link href="/partnership" className="pixel-btn btn btn-outline-info btn-lg">Become a Partner</Link>
        </div>
        <img src="/rscit-hero.png" alt="RS-CIT Learning" className="img-fluid rounded shadow mt-4 pixel-border" style={{ maxHeight: 320, imageRendering: 'pixelated' }} />
      </section>

      {/* Features Section */}
      <section className="container py-5">
        <h2 className="pixel-font text-center mb-4">Why Choose Us?</h2>
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card h-100 shadow-sm pixel-border">
              <div className="card-body text-center">
                <PixelIcon src="/pixel-student.png" alt="Student" />
                <h5 className="pixel-font card-title">For Students</h5>
                <p className="pixel-font card-text">30-min daily micro-lessons, adaptive quizzes, flexible EMI, and instant centre booking. Track your progress, earn badges, and get 24×7 doubt support.</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 shadow-sm pixel-border">
              <div className="card-body text-center">
                <PixelIcon src="/pixel-centre.png" alt="Centre" />
                <h5 className="pixel-font card-title">For Centres</h5>
                <p className="pixel-font card-text">Receive fully-paid, pre-qualified students, referral earnings, attendance insights, and zero upfront marketing. Manage everything from your dashboard.</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 shadow-sm pixel-border">
              <div className="card-body text-center">
                <PixelIcon src="/pixel-admin.png" alt="Admin" />
                <h5 className="pixel-font card-title">For Admins</h5>
                <p className="pixel-font card-text">Approve centres, manage content, track analytics, and handle payouts—all from a powerful admin panel.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container py-5">
        <h2 className="pixel-font text-center mb-4">What Our Users Say</h2>
        <div className="row g-4 justify-content-center">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100 pixel-border">
              <div className="card-body">
                <PixelIcon src="/pixel-avatar1.png" alt="Priya" />
                <p className="pixel-font fst-italic">“The daily lessons and quizzes made learning so easy. I passed RS-CIT with confidence!”</p>
                <p className="pixel-font fw-bold mb-0">— Priya S., Student</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100 pixel-border">
              <div className="card-body">
                <PixelIcon src="/pixel-avatar2.png" alt="Rajesh" />
                <p className="pixel-font fst-italic">“We got more students and no marketing headache. The dashboard is super simple!”</p>
                <p className="pixel-font fw-bold mb-0">— Rajesh K., ITGK Centre Owner</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container py-5">
        <h2 className="pixel-font text-center mb-4">Frequently Asked Questions</h2>
        <div className="accordion" id="faqAccordion">
          <div className="accordion-item">
            <h2 className="accordion-header" id="faq1">
              <button className="accordion-button pixel-font" type="button" data-bs-toggle="collapse" data-bs-target="#collapse1" aria-expanded="true" aria-controls="collapse1">
                How do I enroll for RS-CIT?
              </button>
            </h2>
            <div id="collapse1" className="accordion-collapse collapse show" aria-labelledby="faq1" data-bs-parent="#faqAccordion">
              <div className="accordion-body pixel-font">
                Just sign up, complete your profile, select a centre and EMI plan, and start learning instantly!
              </div>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header" id="faq2">
              <button className="accordion-button collapsed pixel-font" type="button" data-bs-toggle="collapse" data-bs-target="#collapse2" aria-expanded="false" aria-controls="collapse2">
                How do centres get paid?
              </button>
            </h2>
            <div id="collapse2" className="accordion-collapse collapse" aria-labelledby="faq2" data-bs-parent="#faqAccordion">
              <div className="accordion-body pixel-font">
                Centres receive ₹350 per successful student referral, paid out automatically on schedule.
              </div>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header" id="faq3">
              <button className="accordion-button collapsed pixel-font" type="button" data-bs-toggle="collapse" data-bs-target="#collapse3" aria-expanded="false" aria-controls="collapse3">
                Is my data secure?
              </button>
            </h2>
            <div id="collapse3" className="accordion-collapse collapse" aria-labelledby="faq3" data-bs-parent="#faqAccordion">
              <div className="accordion-body pixel-font">
                Yes! We use Supabase for secure authentication and data storage, and all payments are handled via Razorpay.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-light py-4 mt-5">
        <div className="container text-center">
          <p className="mb-1 pixel-font">&copy; {new Date().getFullYear()} RS-CIT Hybrid Micro-Learning Platform</p>
          <p className="mb-0 pixel-font">Made with ❤️ for Rajasthan's learners and ITGK partners</p>
        </div>
      </footer>

      {/* Pixel Style */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .pixel-font {
          font-family: 'Press Start 2P', monospace !important;
          letter-spacing: 1px;
        }
        .pixel-btn {
          border: 3px solid #222;
          border-radius: 0;
          box-shadow: 2px 2px 0 #222;
          font-family: 'Press Start 2P', monospace !important;
          text-transform: uppercase;
        }
        .pixel-btn:active {
          box-shadow: none;
          transform: translate(2px, 2px);
        }
        .pixel-border {
          border: 3px solid #222 !important;
          border-radius: 0 !important;
        }
        .pixel-bg {
          background: repeating-linear-gradient(45deg, #f8fafc, #f8fafc 20px, #e0e0e0 20px, #e0e0e0 40px);
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
