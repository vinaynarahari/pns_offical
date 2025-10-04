"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import "./app.css";
import Slideshow from "../components/Slideshow";

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const waveRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorFollowerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isLogoSpinning, setIsLogoSpinning] = useState(false);
  const [score, setScore] = useState(0);
  const [interactedElements, setInteractedElements] = useState(new Set());
  const [mouseMovements, setMouseMovements] = useState(0);
  const [scrollDistance, setScrollDistance] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  
  const handleLogoClick = () => {
    if (!isLogoSpinning) {
      setIsLogoSpinning(true);
      addScore(100, 'logo');
    }
  };

  const handleLogoAnimationEnd = (e: React.AnimationEvent<HTMLImageElement>) => {
    if (e.animationName === 'spin') {
      setIsLogoSpinning(false);
    }
  };

  const addScore = (points: number, elementId: string) => {
    if (!interactedElements.has(elementId)) {
      setScore(prev => prev + points);
      setInteractedElements(prev => new Set(prev).add(elementId));
    }
  };

  const addInstantScore = (points: number) => {
    setScore(prev => prev + points);
  };

  const handleButtonClick = (points: number, elementId: string) => {
    addScore(points, elementId);
    setClickCount(prev => prev + 1);
    // Bonus for click streaks
    if (clickCount > 0 && clickCount % 10 === 0) {
      addInstantScore(50); // Bonus for 10 clicks
    }
  };

  const handleCardHover = (points: number, elementId: string) => {
    addScore(points, elementId);
  };

  const handleMouseMovement = () => {
    setMouseMovements(prev => {
      const newCount = prev + 1;
      // Award points for every 100 mouse movements
      if (newCount % 100 === 0) {
        addInstantScore(10);
      }
      return newCount;
    });
  };

  const handleGeneralClick = () => {
    setClickCount(prev => prev + 1);
    addInstantScore(1); // 1 point for any click
  };

  const handleScroll = (scrollTop: number) => {
    const newDistance = Math.floor(scrollTop / 100);
    if (newDistance > scrollDistance) {
      addInstantScore(2); // 2 points per 100px scrolled
      setScrollDistance(newDistance);
    }
  };

  const timelineEvents = [
    {
      date: "July 26th",
      title: "Cardshow At The Park",
      description: "Join us for a family-friendly outdoor show featuring 100+ vendors, raffles, and a hot dog eating contest.",
      cta: "Learn More →",
      difficulty: "EASY"
    },
    {
      date: "October 25th", 
      title: "Doughnuts, Go Nuts,<br />Trade Day",
      description: "Fuel up on doughnuts and trade cards while supporting food relief efforts in the community.",
      cta: "Get Involved →",
      difficulty: "MEDIUM"
    },
    {
      date: "December 20th",
      title: "Black Tie Gala", 
      description: "Dress to impress for an evening of elevated collecting, cocktails, and charitable giving.",
      cta: "Join Us →",
      difficulty: "EXPERT"
    },
    {
      date: "June 18",
      title: "The Chip Contest",
      description: "Enter our high-stakes chip-eating showdown while browsing one-of-a-kind trading card finds.",
      cta: "Register →",
      difficulty: "HARD"
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

    
    // --- Main Scroll Handler ---
    const handleScrollEvent = () => {
      requestAnimationFrame(() => {
        // Hero parallax
        const scrolled = window.pageYOffset;
        if (heroRef.current) heroRef.current.style.transform = `translate3d(0, ${scrolled * 0.2}px, 0)`;
        if (waveRef.current) waveRef.current.style.transform = `translate3d(0, ${scrolled * 0.05}px, 0)`;
        
        
        // Add scroll scoring
        handleScroll(scrolled);
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
      handleMouseMovement();
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
    window.addEventListener('scroll', handleScrollEvent, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('click', handleGeneralClick, { passive: true });

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
            addScore(50, 'stats-section');
          }
        });
      }, { threshold: 0.5 });
      
      statsObserver.observe(statsSection);
    }

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScrollEvent);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleGeneralClick);
    };
  }, [timelineEvents.length, addScore]); // Include timelineEvents.length and addScore dependencies

  return (
    <main className="jeton-style">
      {/* Ensure hero is first visible content */}
      <div ref={cursorRef} className="custom-cursor" aria-hidden="true"></div>
      <div ref={cursorFollowerRef} className="custom-cursor-follower" aria-hidden="true"></div>
      
      {/* Retro Score Display */}
      <div className="retro-score">
        <div className="score-label">SCORE</div>
        <div className="score-value">{score.toString().padStart(6, '0')}</div>
      </div>

      {/* Add offset so hero is not hidden behind any fixed overlays */}
      <div style={{ height: "24px" }}></div>
      
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
            {/* Retro Logo Container */}
            <div className="logo-container animate-on-scroll">
              <Image 
                src="/FINAl_ps_mat-16-removebg-preview.png" 
                alt="Packs N' Snacks Logo" 
                width={280}
                height={280}
                className={`logo-image ${isLogoSpinning ? 'spinning' : ''}`}
                onClick={handleLogoClick}
                onAnimationEnd={handleLogoAnimationEnd}
                priority
              />
            </div>
            
            <h2 className="hero-title">
              PACKS N&apos;<br />SNACKS
            </h2>
            <p className="hero-subtitle">
            Trade. Connect. Give Back. 
            </p>
          </div>
          <div className="hero-visual animate-on-scroll">
            <div className="floating-cards">
              <div 
                className="card-float card-1"
                style={{ 
                  transform: `translate3d(${mousePos.x * 10}px, ${mousePos.y * 10}px, 0)` 
                }}
                onMouseEnter={() => handleCardHover(25, 'card-1')}
              >
                <div className="card-inner">🎉</div>
                <div className="card-glow"></div>
              </div>
              <div 
                className="card-float card-2"
                style={{ 
                  transform: `translate3d(${mousePos.x * 15}px, ${mousePos.y * 15}px, 0)` 
                }}
                onMouseEnter={() => handleCardHover(25, 'card-2')}
              >
                <div className="card-inner">🤝</div>
                <div className="card-glow"></div>
              </div>
              <div 
                className="card-float card-3"
                style={{ 
                  transform: `translate3d(${mousePos.x * 8}px, ${mousePos.y * 8}px, 0)` 
                }}
                onMouseEnter={() => handleCardHover(25, 'card-3')}
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

      {/* Slideshow Section */}
      <section className="slideshow-section" style={{ paddingTop: "8rem", paddingBottom: "8rem", background: "linear-gradient(135deg, rgba(0,0,0,0.02) 0%, rgba(255,255,255,0.01) 100%)" }}>
        <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
          <div className="section-header animate-on-scroll">
            <h2>CHECK OUT OUR LATEST EVENT</h2>
            <div className="section-decoration"></div>
          </div>
          <div className="slideshow-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "0 1rem", position: "relative", zIndex: "1" }}>
            <div style={{ width: "100%", maxWidth: "900px", aspectRatio: "16/9", overflow: "hidden", borderRadius: "20px", position: "relative" }}>
              <Slideshow
                autoPlayMs={6000}
                items={[
                  { type: "video", src: "/8mb.video-eYb-6ZM1JQZA.mp4", alt: "Event highlight video" },
                  { type: "image", src: "/Packs n Snacks _ Event _ 2025-53.jpg", alt: "Event photo 53" },
                  { type: "image", src: "/Packs n Snacks _ Event _ 2025-34.jpg", alt: "Event photo 34" },
                  { type: "image", src: "/Packs n Snacks _ Event _ 2025-144.jpg", alt: "Event photo 144" }
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Enhanced Animations */}
      <section className="features-section">
        <div className="container">
          <div className="section-header animate-on-scroll">
            <h2>CHOOSE YOUR MISSION</h2>
            <div className="section-decoration"></div>
          </div>
          <div className="features-grid">
            <div 
              className="feature-card animate-on-scroll hover-tilt"
              onMouseEnter={() => handleCardHover(30, 'feature-events')}
            >
              <div className="feature-icon">🎯</div>
              <h3>EVENTS</h3>
              <p>Join exciting food-eating competitions and share snacks
From hot dog contests to cookie challenges, our events are built for fun-and fueled by flavor.</p>
            </div>
            <div 
              className="feature-card animate-on-scroll hover-tilt" 
              style={{ animationDelay: '0.1s' }}
              onMouseEnter={() => handleCardHover(30, 'feature-giveback')}
            >
              <div className="feature-icon">🤝</div>
              <h3>GIVE BACK</h3>
              <p>Support families across the U.S. by attending events or entering raffles
Every ticket purchased and every bite taken helps us provide meals through Feeding&nbsp;America.</p>
            </div>
            <div 
              className="feature-card animate-on-scroll hover-tilt" 
              style={{ animationDelay: '0.2s' }}
              onMouseEnter={() => handleCardHover(30, 'feature-trade')}
            >
              <div className="feature-icon">🃏</div>
              <h3>TRADE</h3>
              <p>Buy, sell, and trade cards with fellow collectors
Whether you&apos;re new to the hobby or a seasoned collector, our shows are built for connection-and deals.</p>
            </div>
            <div 
              className="feature-card animate-on-scroll hover-tilt" 
              style={{ animationDelay: '0.3s' }}
              onMouseEnter={() => handleCardHover(30, 'feature-community')}
            >
              <div className="feature-icon">💬</div>
              <h3>COMMUNITY</h3>
              <p>Connect with fellow collectors and share your passion
We bring together people who love cards, food, and giving back. It&apos;s more than a hobby-it&apos;s a&nbsp;movement.</p>
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
              <h2>Making a Difference Across the USA</h2>
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
                <div 
                  className="stat-item pulse-animation"
                  onMouseEnter={() => handleCardHover(20, 'stat-meals')}
                >
                  <div className="stat-number counter" data-target="60">0</div>
                  <div className="stat-unit">K</div>
                  <div className="stat-label">Meals Provided</div>
                </div>
                <div 
                  className="stat-item pulse-animation"
                  onMouseEnter={() => handleCardHover(20, 'stat-families')}
                >
                  <div className="stat-number counter" data-target="1.4">0</div>
                  <div className="stat-unit">K</div>
                  <div className="stat-label">Families Helped</div>
                </div>
                <div 
                  className="stat-item pulse-animation"
                  onMouseEnter={() => handleCardHover(20, 'stat-events')}
                >
                  <div className="stat-number counter" data-target="50">0</div>
                  <div className="stat-unit">+</div>
                  <div className="stat-label">Events Hosted</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Horizontal Events Timeline */}
      <section className="events-section">
        <div className="container">
          <div className="section-header animate-on-scroll">
            <h2>UPCOMING EVENTS</h2>
            <p>Scroll horizontally to see all our upcoming events</p>
            <div className="section-decoration"></div>
          </div>
          <div className="events-timeline-horizontal">
            <div className="timeline-track">
              {timelineEvents.map((event, index) => (
                <div 
                  key={index} 
                  className="timeline-event animate-on-scroll"
                  style={{ animationDelay: `${index * 0.2}s` }}
                  onMouseEnter={() => handleCardHover(30, `timeline-event-${index}`)}
                >
                  <div className="timeline-marker">
                    <div className="marker-dot"></div>
                    <div className="marker-date">{event.date}</div>
                  </div>
                  <div className="timeline-content">
                    <div className="difficulty-badge-small">{event.difficulty}</div>
                    <h3 className="timeline-title" dangerouslySetInnerHTML={{ __html: event.title }}></h3>
                    <p className="timeline-description">{event.description}</p>
                    <button 
                      className="timeline-cta magnetic-button"
                      onClick={() => handleButtonClick(40, `timeline-cta-${index}`)}
                    >
                      <span>{event.cta}</span>
                      <div className="button-ripple"></div>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content animate-on-scroll">
            <h2>1,000+ FAMILIES HELPED. JOIN US TO HELP MORE.</h2>
            <p>It only takes a few minutes to get started.</p>
            <button 
              className="cta-button primary large magnetic-button"
              onClick={() => handleButtonClick(200, 'final-cta')}
            >
              <span>Join Us Now!</span>
              <div className="button-ripple"></div>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
