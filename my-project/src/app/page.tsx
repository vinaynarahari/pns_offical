"use client";

import React, { useEffect, useRef, useState } from "react";
import "./app.css";

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const waveRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorFollowerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [currentSlide, setCurrentSlide] = useState(0);
  const timelineWrapperRef = useRef<HTMLDivElement>(null);
  const [isLogoSpinning, setIsLogoSpinning] = useState(false);
  
  const handleLogoClick = () => {
    if (!isLogoSpinning) {
      setIsLogoSpinning(true);
    }
  };

  const handleLogoAnimationEnd = (e: React.AnimationEvent<HTMLImageElement>) => {
    if (e.animationName === 'spin') {
      setIsLogoSpinning(false);
    }
  };

  const timelineEvents = [
    {
      date: "July 26th",
      title: "Cardshow At The Park",
      description: "Join us for a family-friendly outdoor show featuring 100+ vendors, raffles, and a hot dog eating contest.",
      cta: "Learn More →"
    },
    {
      date: "October 25th", 
      title: "Doughnuts, Go Nuts, Trade Day",
      description: "Fuel up on doughnuts and trade cards while supporting food relief efforts in the community.",
      cta: "Get Involved →"
    },
    {
      date: "December 20th",
      title: "Black Tie Gala", 
      description: "Dress to impress for an evening of elevated collecting, cocktails, and charitable giving.",
      cta: "Join Us →"
    },
    {
      date: "June 18",
      title: "The Chip Contest",
      description: "Enter our high-stakes chip-eating showdown while browsing one-of-a-kind trading card finds.",
      cta: "Register →"
    }
  ];

  useEffect(() => {
    // --- General Animations ---
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach((el) => observer.observe(el));

    // --- Timeline Scroll Logic ---
    const currentSlideRef = { current: 0 }; // Use a ref to avoid stale state in the closure
    
    const handleTimelineScroll = () => {
      if (!timelineWrapperRef.current) return;
      
      const wrapper = timelineWrapperRef.current;
      const rect = wrapper.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      const scrollableHeight = rect.height - viewportHeight;
      if (scrollableHeight < 0) return;

      const progress = Math.max(0, Math.min(1, -rect.top / scrollableHeight));
      
      let newSlide = Math.floor(progress * timelineEvents.length);
      newSlide = Math.max(0, Math.min(timelineEvents.length - 1, newSlide));
      
      if (newSlide !== currentSlideRef.current) {
        currentSlideRef.current = newSlide;
        setCurrentSlide(newSlide);
      }
    };
    
    // --- Main Scroll Handler ---
    const handleScroll = () => {
      requestAnimationFrame(() => {
        // Hero parallax
        const scrolled = window.pageYOffset;
        if (heroRef.current) heroRef.current.style.transform = `translate3d(0, ${scrolled * 0.2}px, 0)`;
        if (waveRef.current) waveRef.current.style.transform = `translate3d(0, ${scrolled * 0.05}px, 0)`;
        
        // Timeline update - immediate response
        handleTimelineScroll();
      });
    };

    // --- Custom Cursor Logic ---
    const updateCursor = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      if (cursorRef.current) cursorRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
      if (cursorFollowerRef.current) cursorFollowerRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
    };
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      updateCursor(e);
    };

    // --- Magnetic Button Logic ---
    const magneticButtons = document.querySelectorAll('.magnetic-button');
    magneticButtons.forEach((button) => {
      const htmlButton = button as HTMLElement;
      const span = htmlButton.querySelector('span');
      if (!span) return;

      htmlButton.addEventListener('mousemove', (e: MouseEvent) => {
        const rect = htmlButton.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        span.style.transform = `translate3d(${x * 0.2}px, ${y * 0.2}px, 0)`;
      });

      htmlButton.addEventListener('mouseleave', () => {
        const span = htmlButton.querySelector('span');
        if (span) {
          span.style.transform = 'translate3d(0, 0, 0)';
        }
      });
    });

    // --- Event Listener Setup ---
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    handleTimelineScroll(); // Initial check

    // Counter animation
    const animateCounters = () => {
      const counters = document.querySelectorAll('.counter');
      counters.forEach((counter) => {
        const target = parseFloat(counter.getAttribute('data-target') || '0');
        const increment = target / 100;
        let current = 0;
        
        const updateCounter = () => {
          if (current < target) {
            current += increment;
            counter.textContent = current < target ? Math.ceil(current).toString() : target.toString();
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = target.toString(); // Ensure it ends on the exact target
          }
        };
        updateCounter();
      });
    };

    // Trigger counter animation when stats section is visible
    const statsSection = document.querySelector('.stats-showcase');
    if (statsSection) {
      const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounters();
            statsObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      
      statsObserver.observe(statsSection);
    }

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []); // Empty dependency array ensures this runs only once.

  return (
    <main className="jeton-style">
      <div ref={cursorRef} className="custom-cursor"></div>
      <div ref={cursorFollowerRef} className="custom-cursor-follower"></div>
      
      {/* Hero Section */}
      <section className="hero-section" ref={heroRef}>
        <div className="hero-background">
          <div className="gradient-overlay"></div>
          <div className="wave-container" ref={waveRef}>
            {/* Multiple layered waves for depth */}
            <svg className="wave-animation wave-layer-1" viewBox="0 0 1200 320" preserveAspectRatio="none">
              <defs>
                <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(0, 172, 76, 0.9)" />
                  <stop offset="50%" stopColor="rgba(0, 150, 60, 0.7)" />
                  <stop offset="100%" stopColor="rgba(0, 172, 76, 0.5)" />
                </linearGradient>
              </defs>
              <path 
                className="wave-path wave-1" 
                d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,186.7C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" 
                fill="url(#waveGradient1)"
              />
            </svg>
            
            <svg className="wave-animation wave-layer-2" viewBox="0 0 1200 320" preserveAspectRatio="none">
              <defs>
                <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(255, 255, 255, 0.3)" />
                  <stop offset="50%" stopColor="rgba(255, 255, 255, 0.2)" />
                  <stop offset="100%" stopColor="rgba(255, 255, 255, 0.1)" />
                </linearGradient>
              </defs>
              <path 
                className="wave-path wave-2" 
                d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,208C672,213,768,203,864,176C960,149,1056,107,1152,106.7C1248,107,1344,149,1392,170.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" 
                fill="url(#waveGradient2)"
              />
            </svg>

            <svg className="wave-animation wave-layer-3" viewBox="0 0 1200 320" preserveAspectRatio="none">
              <defs>
                <linearGradient id="waveGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(255, 107, 107, 0.4)" />
                  <stop offset="50%" stopColor="rgba(238, 90, 36, 0.3)" />
                  <stop offset="100%" stopColor="rgba(255, 107, 107, 0.2)" />
                </linearGradient>
              </defs>
              <path 
                className="wave-path wave-3" 
                d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,229.3C672,245,768,267,864,250.7C960,235,1056,181,1152,181.3C1248,181,1344,235,1392,261.3L1440,288L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" 
                fill="url(#waveGradient3)"
              />
            </svg>
          </div>
        </div>
        
        <div className="hero-content">
          <div className="hero-text animate-on-scroll">
            {/* Cool Brand Title */}
            <div className="logo-container animate-on-scroll">
              <img 
                src="/FINAl_ps_mat-16-removebg-preview.png" 
                alt="Packs N' Snacks Logo" 
                className={`logo-image ${isLogoSpinning ? 'spinning' : ''}`}
                onClick={handleLogoClick}
                onAnimationEnd={handleLogoAnimationEnd}
              />
            </div>
            
            <h2 className="hero-title">
              Rip Packs, <br /> Eat Good
            </h2>
            <p className="hero-subtitle">
              Building community, giving back, and fueling your trading card passions—all in one place.
            </p>
            <button className="cta-button primary magnetic-button">
              <span>Join the Community</span>
              <div className="button-ripple"></div>
            </button>
          </div>
          <div className="hero-visual animate-on-scroll">
            <div className="floating-cards">
              <div 
                className="card-float card-1"
                style={{ 
                  transform: `translate3d(${mousePos.x * 10}px, ${mousePos.y * 10}px, 0)` 
                }}
              >
                <div className="card-inner">🎉</div>
                <div className="card-glow"></div>
              </div>
              <div 
                className="card-float card-2"
                style={{ 
                  transform: `translate3d(${mousePos.x * 15}px, ${mousePos.y * 15}px, 0)` 
                }}
              >
                <div className="card-inner">🤝</div>
                <div className="card-glow"></div>
              </div>
              <div 
                className="card-float card-3"
                style={{ 
                  transform: `translate3d(${mousePos.x * 8}px, ${mousePos.y * 8}px, 0)` 
                }}
              >
                <div className="card-inner">🃏</div>
                <div className="card-glow"></div>
              </div>
              <div className="floating-particles">
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="scroll-indicator">
          <div className="scroll-text">Scroll to explore</div>
          <div className="scroll-line"></div>
        </div>
      </section>

      {/* Features Section with Enhanced Animations */}
      <section className="features-section">
        <div className="container">
          <div className="section-header animate-on-scroll">
            <h2>Unify your community experience</h2>
            <div className="section-decoration"></div>
          </div>
          <div className="features-grid">
            <div className="feature-card animate-on-scroll hover-tilt">
              <div className="feature-icon">🎯</div>
              <h3>Events</h3>
              <p>Join exciting tournaments and community gatherings</p>
            </div>
            <div className="feature-card animate-on-scroll hover-tilt" style={{ animationDelay: '0.1s' }}>
              <div className="feature-icon">🤝</div>
              <h3>Give Back</h3>
              <p>Support local families through our meal programs</p>
            </div>
            <div className="feature-card animate-on-scroll hover-tilt" style={{ animationDelay: '0.2s' }}>
              <div className="feature-icon">🃏</div>
              <h3>Trade</h3>
              <p>Buy, sell, and trade cards with fellow enthusiasts</p>
            </div>
            <div className="feature-card animate-on-scroll hover-tilt" style={{ animationDelay: '0.3s' }}>
              <div className="feature-icon">💬</div>
              <h3>Community</h3>
              <p>Connect with members and share your passion</p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section with Morphing Background */}
      <section className="impact-section">
        <div className="morphing-bg"></div>
        <div className="container">
          <div className="impact-content">
            <div className="impact-text animate-on-scroll">
              <h2>Making a difference across Dupage Valley</h2>
              <p>Connect with fellow card enthusiasts while supporting families in need.</p>
              <div className="impact-features">
                <div className="impact-feature animate-item">
                  <span className="feature-check">✓</span>
                  <span>60,000+ meals provided</span>
                </div>
                <div className="impact-feature animate-item">
                  <span className="feature-check">✓</span>
                  <span>1,400+ families supported</span>
                </div>
                <div className="impact-feature animate-item">
                  <span className="feature-check">✓</span>
                  <span>50+ community events hosted</span>
                </div>
              </div>
            </div>
            <div className="impact-visual animate-on-scroll">
              <div className="stats-showcase">
                <div className="stat-item pulse-animation">
                  <div className="stat-number counter" data-target="60">0</div>
                  <div className="stat-unit">K</div>
                  <div className="stat-label">Meals Provided</div>
                </div>
                <div className="stat-item pulse-animation">
                  <div className="stat-number counter" data-target="1.4">0</div>
                  <div className="stat-unit">K</div>
                  <div className="stat-label">Families Helped</div>
                </div>
                <div className="stat-item pulse-animation">
                  <div className="stat-number counter" data-target="50">0</div>
                  <div className="stat-unit">+</div>
                  <div className="stat-label">Events Hosted</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="process-section">
        <div className="container">
          <div className="section-header animate-on-scroll">
            <h2>Simple, fast & impactful</h2>
            <div className="section-decoration"></div>
          </div>
          <div className="process-steps animate-on-scroll">
            <div className="process-grid">
              <div className="process-step">
                <div className="step-number-container">
                  <div className="step-number">01</div>
                  <div className="step-line"></div>
                </div>
                <div className="step-content">
                  <h3>Join</h3>
                  <p>Sign up for our community</p>
                </div>
              </div>
              <div className="process-step">
                <div className="step-number-container">
                  <div className="step-number">02</div>
                  <div className="step-line"></div>
                </div>
                <div className="step-content">
                  <h3>Participate</h3>
                  <p>Attend events and trade cards</p>
                </div>
              </div>
              <div className="process-step">
                <div className="step-number-container">
                  <div className="step-number">03</div>
                  <div className="step-line"></div>
                </div>
                <div className="step-content">
                  <h3>Give Back</h3>
                  <p>Help feed families in need</p>
                </div>
              </div>
              <div className="process-step">
                <div className="step-number-container">
                  <div className="step-number">04</div>
                </div>
                <div className="step-content">
                  <h3>Connect</h3>
                  <p>Build lasting friendships</p>
                </div>
              </div>
              <div className="process-step">
                <div className="step-number-container">
                  <div className="step-number">05</div>
                </div>
                <div className="step-content">
                  <h3>Grow</h3>
                  <p>Expand your collection and impact</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vertical Scroll Timeline */}
      <section className="events-section">
        <div className="container">
          <div className="section-header animate-on-scroll">
            <h2>Our Community Timeline</h2>
            <p>Scroll down to explore our upcoming events.</p>
            <div className="section-decoration"></div>
          </div>
          <div className="timeline-container">
            <div className="timeline-interactive-wrapper" ref={timelineWrapperRef}>
              <div className="timeline-viewport">
                <div className="timeline-slides">
                  {timelineEvents.map((event, index) => (
                    <div key={index} className={`timeline-slide ${index === currentSlide ? 'active' : ''}`}>
                      <div className="timeline-slide-content">
                        <div className="timeline-slide-card">
                          <div className="timeline-slide-date">{event.date}</div>
                          <h3 className="timeline-slide-title">{event.title}</h3>
                          <p className="timeline-slide-description">{event.description}</p>
                          <a href="#" className="timeline-slide-cta">{event.cta}</a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header animate-on-scroll">
            <h2>Hear it from our community</h2>
            <div className="section-decoration"></div>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card animate-on-scroll hover-lift" style={{ animationDelay: '0.1s' }}>
              <div className="testimonial-rating">★★★★★</div>
              <p>&ldquo;Amazing community! Love how we can trade cards while helping families in need.&rdquo;</p>
              <div className="testimonial-author">Sarah M.</div>
              <div className="card-shine"></div>
            </div>
            <div className="testimonial-card animate-on-scroll hover-lift" style={{ animationDelay: '0.2s' }}>
              <div className="testimonial-rating">★★★★★</div>
              <p>&ldquo;The Pizza Palooza event was incredible. 7,000 meals raised in one night!&rdquo;</p>
              <div className="testimonial-author">Mike T.</div>
              <div className="card-shine"></div>
            </div>
            <div className="testimonial-card animate-on-scroll hover-lift" style={{ animationDelay: '0.3s' }}>
              <div className="testimonial-rating">★★★★★</div>
              <p>&ldquo;Great organization doing amazing work in our community. Highly recommend!&rdquo;</p>
              <div className="testimonial-author">Lisa R.</div>
              <div className="card-shine"></div>
            </div>
            <div className="testimonial-card animate-on-scroll hover-lift" style={{ animationDelay: '0.4s' }}>
              <div className="testimonial-rating">★★★★★</div>
              <p>&ldquo;I&rsquo;ve met so many great people through Packs N&rsquo; Snacks. It&rsquo;s more than just a hobby group; it&rsquo;s a family.&rdquo;</p>
              <div className="testimonial-author">David P.</div>
              <div className="card-shine"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content animate-on-scroll">
            <h2>1,400+ families helped, plus yours.</h2>
            <p>It only takes a few minutes to get started.</p>
            <button className="cta-button primary large magnetic-button">
              <span>Get Started</span>
              <div className="button-ripple"></div>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
