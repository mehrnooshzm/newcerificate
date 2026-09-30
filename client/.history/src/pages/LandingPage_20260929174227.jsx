import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  MoveRight,
  Github,
  Linkedin,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import { useAuthContext } from '@/hooks/useAuthContext';

// Categories for filtering gallery images
const categories = [
  'All',
  'Educational & Academic',
  'Awards & Recognitions',
  'Professional & Career',
  'Kids & Youth',
];

// Gallery images with categories
const images = [
  { src: '/images/designs/design-1.png', category: 'Awards & Recognitions' },
  { src: '/images/designs/design-2.png', category: 'Kids & Youth' },
  { src: '/images/designs/design-3.png', category: 'Kids & Youth' },
  { src: '/images/designs/design-4.png', category: 'Educational & Academic' },
  { src: '/images/designs/design-5.png', category: 'Educational & Academic' },
  { src: '/images/designs/design-6.png', category: 'Professional & Career' },
  { src: '/images/designs/design-7.png', category: 'Educational & Academic' },
  { src: '/images/designs/design-8.png', category: 'Kids & Youth' },
  { src: '/images/designs/design-9.png', category: 'Awards & Recognitions' },
  { src: '/images/designs/design-10.png', category: 'Professional & Career' },
  { src: '/images/designs/design-11.png', category: 'Awards & Recognitions' },
  { src: '/images/designs/design-12.png', category: 'Educational & Academic' },
];

// Features section data
const features = [
  {
    title: 'High-Quality Templates',
    image: '/images/designs/design-1.png',
    description:
      'Access a collection of professional templates you can easily customize',
  },
  {
    title: 'Custom Designs',
    image: '/images/designs/design-2.png',
    description:
      'Easily craft your own designs that look polished and professional',
  },
  {
    title: 'Beginner-Friendly Tools',
    image: '/images/designs/design-3.png',
    description: 'Easy-to-use editor — no design skills required',
  },
  {
    title: 'Free & Affordable Options',
    image: '/images/designs/design-4.png',
    description: 'Get started for free, with low-cost premium upgrades',
  },
  {
    title: 'Cross-Browser Support',
    image: '/images/designs/design-5.png',
    description: 'Works seamlessly on all major browsers',
  },
  {
    title: 'Work Saved Online',
    image: '/images/designs/design-6.png',
    description:
      'Create, save, and pick up where you left off — all in one account',
  },
];

// Newly added team members (shown in the first "Our Team" tab)
const newTeamMembers = [
  {
    name: 'Anjali Yadav',
    role: 'Full Stack Developer',
    image: '/images/team/Anjali.jpg',
    description:
      'Passionate about solving problems, building useful solutions, and continuously learning new technologies.',
    linkedin: 'https://linkedin.com/in/anjali-yadav-234b70205',
    github: 'https://github.com/anjali65-dev/',
  },
  {
    name: 'Isabella Ribeiro',
    role: 'Full Stack Developer',
    image: '/images/team/Isabella.jpg',
    description:
      'Software developer with a background in Biology, bringing a mix of scientific curiosity and hands-on development experience.',
    linkedin: 'https://www.linkedin.com/in/izabellamcr/',
    github: 'https://github.com/Bellamcr',
  },
  {
    name: 'Mehrnoosh',
    role: 'Full Stack Developer',
    image: '/images/team/Mehrnoosh.png',
    description:
      'Passionate about continuous learning, solving complex workflows, and building tools that drive efficiency.',
    linkedin: 'https://www.linkedin.com/in/mehrnoosh-z-929913192/',
    github: 'https://github.com/mehrnooshzm',
    portfolio: 'https://mehrnoosh-portfolio.vercel.app/',
  },
  {
    name: 'Ragini Felicia Suruti',
    role: 'Full Stack Developer',
    image: '/images/team/Ragini.png',
    description:
      'Solving problems, building useful solutions, and continuously learning to make tech work better for users.',
    linkedin:
      'https://www.linkedin.com/in/ragini-felicia-suruti-francis-xavier-285b09157/',
    github: 'https://github.com/rafelshu12',
  },
  {
    name: 'Surathul',
    role: 'Full Stack Developer',
    image: '/images/team/Surathul.jpg',
    description:
      'Passionate about creating impactful solutions and delivering high-quality work.',
    linkedin: 'https://www.linkedin.com/in/surathul-siddique',
  },
];

// Founding team members (shown in the second "Our Team" tab)
const foundingTeamMembers = [
  {
    name: 'Kseniia Priakhina',
    role: 'Team Lead, Full Stack Developer',
    image: '/images/team/kseniia.png',
    description:
      'Brings creative concepts to life with modern technology technics and attention to user experience.',
    linkedin: 'https://www.linkedin.com/in/kseniia-priakhina/',
    github: 'https://github.com/priakhina',
  },
  {
    name: 'Elena Nekhoroshkova',
    role: 'Web & Graphic Designer',
    image: '/images/team/elena.png',
    description:
      'Specialized in creating visually appealing designs with attention to detail and brand consistency.',
    linkedin: 'https://www.linkedin.com/in/elena-nekhoroshkova-862438229/',
    github: 'https://github.com/ElenaKatN',
    portfolio: 'https://www.designelle.ca/',
  },
  {
    name: 'Faranak Panahi',
    role: 'Graphic Designer & UI Developer',
    image: '/images/team/faranak.jpg',
    description:
      'Creative designer focused on elegant typography and layout design. Created our logo design.',
    linkedin: 'https://www.linkedin.com/in/faranak-panahivaghar/',
    github: 'https://github.com/faranakpanahi',
    portfolio: 'https://www.behance.net/FaranakPanahiv/info',
  },
  {
    name: 'Olesia Fatenko',
    role: 'Full Stack Developer',
    image: '/images/team/olesia.png',
    description:
      'Expert in building responsive web applications with modern technologies and seamless user experience.',
    linkedin: 'https://www.linkedin.com/in/olesia-fatenko-2aa843212/',
    github: 'https://github.com/OlesiaFa',
  },
  {
    name: 'Sarah Byekwaso',
    role: 'Graphic Designer & Full Stack Developer',
    image: '/images/team/sarah.png',
    description:
      'Passionate about creating efficient backend systems and intuitive frontend interfaces.',
    linkedin: 'https://www.linkedin.com/in/sarah-byekwaso/',
    github: 'https://sarahbyekwaso.github.io/Portfolio/',
  },
  {
    name: 'Basra Noor',
    role: 'Full Stack Developer',
    image: '/images/team/basra.png',
    description:
      'Passion for building secure, scalable web applications and a strong belief in lifelong learning.',
    linkedin: 'https://www.linkedin.com/in/basra-hassan-noor-9ba179363/',
    github: 'https://github.com/basranooryyc',
  },
];

const LandingPage = () => {
  // State for hero animation, active category, carousel position, transition, feature hover, and contact form
  const [animate, setAnimate] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [positionIndex, setPositionIndex] = useState(0);
  const [isTransition, setIsTransition] = useState(true);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [activeTeamTab, setActiveTeamTab] = useState('new');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const scrollRef = useRef(null);
  const intervalRef = useRef(null);

  const { loading } = useAuthContext();

  // ------- tuning constants -------
  const CARD_WIDTH = 450; // px (card content width)
  const CARD_HEIGHT = 300; // px (card content height)
  const GAP = 20; // px gap between cards
  const STEP = CARD_WIDTH + GAP;
  const TRANSITION_MS = 1500; // slide animation duration
  const PAUSE_MS = 900; // pause time after each slide
  // ---------------------------------

  // Add contact form handlers
  const handleContactChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here (e.g., send data to backend or email)
    console.log('Contact Form Submitted:', contactForm);
    alert('Thank you for reaching out! We will get back to you soon.');
    // Reset form after submission
    setContactForm({
      name: '',
      email: '',
      subject: '',
      message: '',
    });
  };

  // Trigger hero text animation on mount
  useEffect(() => {
    setAnimate(true);
  }, []);

  // Auto-slide carousel
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setIsTransition(true);
      setPositionIndex((prev) => {
        const next = prev + 1;

        // If we've moved past the original block, schedule a reset
        if (next >= images.length) {
          // After slide transition ends, jump back to equivalent index in first block without animation
          setTimeout(() => {
            setIsTransition(false); // disable transition for jump
            setPositionIndex(next - images.length); // jump to the mirrored position
            // Re-enable transition on next tick to keep animations smooth
            setTimeout(() => setIsTransition(true), 30);
          }, TRANSITION_MS);
        }

        return next;
      });
    }, TRANSITION_MS + PAUSE_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [TRANSITION_MS, PAUSE_MS]);

  // Click category: set active category
  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
  };

  if (loading) return null;

  // Compute translateX in pixels
  const translateX = positionIndex * STEP;

  return (
    <div className='relative w-full min-h-screen overflow-hidden'>
      {/* Background Floating Elements */}
      <div className='absolute top-1/3 left-10 w-40 h-40 rounded-full bg-[#F0FF69]/20 floating-element delay-2'></div>
      <div className='absolute bottom-1/4 right-10 w-48 h-48 rounded-full bg-gradient-to-br from-white/10 to-[#7D31FF]/10 backdrop-blur-sm border border-white/20 floating-element delay-3'></div>
      {/* Gradient glass morphism circles */}
      <div className='absolute top-1/4 right-1/4 w-56 h-56 rounded-full bg-gradient-to-br from-white/10 to-[#7D31FF]/10 backdrop-blur-sm border border-white/20 floating-element delay-1'></div>
      <div className='absolute top-8/10 left-10 w-36 h-36 rounded-full bg-gradient-to-r from-[#7D31FF]/20 to-[#F0FF69]/20 floating-element delay-3'></div>
      <div className='absolute bottom-48 left-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-white/10 to-[#F0FF69]/30 backdrop-blur-sm border border-white/20 floating-element delay-1'></div>

      {/* Content Layer - Wrap all your existing content in this div */}

      <div className='relative w-full h-[700px] md:h-[600px] lg:h-[700px]'>
        {/* Video Background */}
        <video
          className='absolute inset-0 w-full h-full object-cover'
          src='/videos/hero-section.mp4'
          autoPlay
          loop
          muted
          playsInline
          preload='auto'
        />

        {/* Gradient Overlay */}
        <div className='absolute inset-0 z-10 bg-gradient-to-tr from-[#ff80b5]/40 to-[#9089fc]/40' />

        {/* Hero Section */}
        <div className='relative z-20 flex flex-col items-center justify-center h-full text-center px-6 pt-14 lg:px-8'>
          <div className='mx-auto max-w-2xl py-32 sm:py-48 lg:py-56 text-center'>
            <h1
              className={`text-5xl font-semibold sm:text-7xl text-[#7D31FF] transform transition-all delay-1000 duration-1000 ${
                animate
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10'
              }`}
            >
              Certificate making process has never been easier
            </h1>

            {/* Buttons */}
            <div
              className={`mt-10 flex items-center justify-center gap-x-6 transform transition-all delay-1500 duration-1000 ${
                animate
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10'
              }`}
            >
              <Link
                to='/login'
                className='px-4 py-2.5 text-sm font-semibold text-white rounded-sm shadow-xs transition-transform duration-300 hover:scale-105 active:scale-95 bg-[#7D31FF]'
              >
                Get started
              </Link>

              <a
                href='#customize'
                className='text-sm font-semibold text-white flex items-center gap-1 group'
              >
                Learn more
                <MoveRight
                  className='inline-block transition-transform duration-300 group-hover:translate-x-2'
                  size={18}
                />
              </a>
            </div>
          </div>
        </div>

        {/* Step Links Container (OVERLAPPING hero + gallery) */}
        <div className='absolute bottom-[-40px] left-1/2 transform -translate-x-1/2 z-30 w-[70%]'>
          <div
            className='grid grid-cols-1 gap-6 sm:grid-cols-3 text-center p-2 rounded-lg shadow-xl'
            style={{ backgroundColor: 'var(--tertiary-color)' }}
          >
            {[
              { label: 'Choose a Template' },
              { label: 'Customize It' },
              { label: 'Preview & Download' },
            ].map((item) => (
              <p
                key={item.label}
                className='font-semibold text-lg text-gray-900 p-4 rounded-sm'
              >
                {item.label}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className='bg-white flex flex-col gap-30 py-30'>
        <section id='about' className='relative'>
          {/* Glass morphism circles for About section */}
          <div className='absolute left-20 bottom-1/3 w-32 h-32 rounded-full bg-gradient-to-r from-[#F0FF69]/20 to-[#7D31FF]/20 floating-element'></div>
          <div className='absolute left-1/4 top-1/4 w-24 h-24 rounded-full bg-white/5 backdrop-blur-sm border border-[#7D31FF]/20 floating-element delay-1'></div>
          <div className='absolute right-20 top-40 w-48 h-48 rounded-full bg-gradient-to-br from-white/10 to-[#7D31FF]/10 backdrop-blur-sm border border-white/20 floating-element delay-3'></div>
          <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='max-w-4xl mx-auto text-center'>
              {/* Section Header */}
              <div className='mt-24 mb-24'>
                <h2
                  className='text-5xl font-semibold text-[#7D31FF] transition-all duration-1000 opacity-0 translate-y-10'
                  ref={(el) => {
                    if (el) {
                      const observer = new IntersectionObserver(
                        ([entry]) => {
                          if (entry.isIntersecting) {
                            el.classList.remove('opacity-0', 'translate-y-10');
                            el.classList.add('opacity-100', 'translate-y-0');
                          }
                        },
                        { threshold: 0.3 }
                      );
                      observer.observe(el);
                    }
                  }}
                >
                  About Certi4U
                </h2>
              </div>

              {/* Main Content */}
              <div className='grid md:grid-cols-2 gap-24 items-center'>
                {/* Text Content */}
                <div
                  className='text-left space-y-6 opacity-0 translate-y-10 transition-all duration-1000 delay-300'
                  ref={(el) => {
                    if (el) {
                      const observer = new IntersectionObserver(
                        ([entry]) => {
                          if (entry.isIntersecting) {
                            el.classList.remove('opacity-0', 'translate-y-10');
                            el.classList.add('opacity-100', 'translate-y-0');
                          }
                        },
                        { threshold: 0.2 }
                      );
                      observer.observe(el);
                    }
                  }}
                >
                  <p className='text-lg text-gray-700 leading-relaxed'>
                    Certi4U is a modern, intuitive platform designed to simplify
                    certificate creation for educators, event organizers, and
                    businesses. We believe that recognizing achievements should
                    be easy and accessible to everyone.
                  </p>

                  <p className='text-lg text-gray-700 leading-relaxed'>
                    Our mission is to provide powerful yet user-friendly tools
                    that enable you to create professional, personalized
                    certificates in minutes, not hours.
                  </p>

                  {/* Key Features List */}
                  <div className='space-y-4'>
                    <h3 className='text-xl font-semibold text-gray-900'>
                      Why Choose Certi4U?
                    </h3>
                    <ul className='space-y-3 text-gray-700'>
                      {/* Each feature item */}
                      <li className='flex items-start group cursor-pointer'>
                        <div className='relative'>
                          {/* Checkmark icon with hover animation */}
                          <svg
                            className='w-5 h-5 text-[#7D31FF] mr-3 mt-0.5 flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12'
                            fill='currentColor'
                            viewBox='0 0 20 20'
                          >
                            <path
                              fillRule='evenodd'
                              d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                              clipRule='evenodd'
                            />
                          </svg>
                          {/* Pulse effect on hover */}
                          <div className='absolute inset-0 bg-[#7D31FF] rounded-full opacity-0 group-hover:opacity-20 group-hover:animate-ping transition-opacity duration-300'></div>
                        </div>
                        <span className='transition-all duration-300 group-hover:text-[#7D31FF] group-hover:font-medium group-hover:translate-x-1'>
                          Bulk certificate generation with CSV files
                        </span>
                      </li>
                      <li className='flex items-start group cursor-pointer'>
                        <div className='relative'>
                          <svg
                            className='w-5 h-5 text-[#7D31FF] mr-3 mt-0.5 flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12'
                            fill='currentColor'
                            viewBox='0 0 20 20'
                          >
                            <path
                              fillRule='evenodd'
                              d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                              clipRule='evenodd'
                            />
                          </svg>
                          <div className='absolute inset-0 bg-[#7D31FF] rounded-full opacity-0 group-hover:opacity-20 group-hover:animate-ping transition-opacity duration-300'></div>
                        </div>
                        <span className='transition-all duration-300 group-hover:text-[#7D31FF] group-hover:font-medium group-hover:translate-x-1'>
                          Fully customizable templates and designs
                        </span>
                      </li>
                      {/* Multiple export formats */}
                      <li className='flex items-start group cursor-pointer'>
                        <div className='relative'>
                          <svg
                            className='w-5 h-5 text-[#7D31FF] mr-3 mt-0.5 flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12'
                            fill='currentColor'
                            viewBox='0 0 20 20'
                          >
                            <path
                              fillRule='evenodd'
                              d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                              clipRule='evenodd'
                            />
                          </svg>
                          <div className='absolute inset-0 bg-[#7D31FF] rounded-full opacity-0 group-hover:opacity-20 group-hover:animate-ping transition-opacity duration-300'></div>
                        </div>
                        <span className='transition-all duration-300 group-hover:text-[#7D31FF] group-hover:font-medium group-hover:translate-x-1'>
                          Multiple export formats (PDF, PNG, ZIP)
                        </span>
                      </li>
                      {/* Secure cloud storage */}
                      <li className='flex items-start group cursor-pointer'>
                        <div className='relative'>
                          <svg
                            className='w-5 h-5 text-[#7D31FF] mr-3 mt-0.5 flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12'
                            fill='currentColor'
                            viewBox='0 0 20 20'
                          >
                            <path
                              fillRule='evenodd'
                              d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                              clipRule='evenodd'
                            />
                          </svg>
                          <div className='absolute inset-0 bg-[#7D31FF] rounded-full opacity-0 group-hover:opacity-20 group-hover:animate-ping transition-opacity duration-300'></div>
                        </div>
                        <span className='transition-all duration-300 group-hover:text-[#7D31FF] group-hover:font-medium group-hover:translate-x-1'>
                          Secure cloud storage for your projects
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Visual Element */}
                <div
                  className='relative opacity-0 translate-y-10 transition-all duration-1000 delay-500'
                  ref={(el) => {
                    if (el) {
                      const observer = new IntersectionObserver(
                        ([entry]) => {
                          if (entry.isIntersecting) {
                            el.classList.remove('opacity-0', 'translate-y-10');
                            el.classList.add('opacity-100', 'translate-y-0');
                          }
                        },
                        { threshold: 0.2 }
                      );
                      observer.observe(el);
                    }
                  }}
                >
                  <div className='bg-gradient-to-br from-[#F0FF69]/20 to-[#7D31FF]/10 rounded-2xl p-8 shadow-lg border border-[#7D31FF]/20'>
                    <div className='grid grid-cols-2 gap-4'>
                      {/* Certificate Mockup 1 */}
                      <div className='bg-white rounded-lg shadow-md p-4 transform transition-all duration-500 hover:rotate-0 border-2 border-[#7D31FF] rotate-3'>
                        <div className='h-32 bg-gradient-to-r from-[#F0FF69]/20 to-[#7D31FF]/20 rounded flex items-center justify-center transition-all duration-300 hover:from-[#F0FF69]/40 hover:to-[#7D31FF]/40'>
                          <span className='text-[#7D31FF] font-semibold'>
                            Certificate Template
                          </span>
                        </div>
                      </div>
                      {/* Certificate Mockup 2 */}
                      <div className='bg-white rounded-lg shadow-md p-4 transform transition-all duration-500 hover:rotate-0 border-2 border-[#F0FF69] -rotate-2 mt-8'>
                        <div className='h-32 bg-gradient-to-r from-[#7D31FF]/20 to-[#F0FF69]/20 rounded flex items-center justify-center transition-all duration-300 hover:from-[#7D31FF]/40 hover:to-[#F0FF69]/40'>
                          <span className='text-[#7D31FF] font-semibold'>
                            Custom Design
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className='mt-8 grid grid-cols-3 gap-4 text-center'>
                      {/* Certificates count */}
                      <div
                        className='opacity-0 translate-y-4 transition-all duration-700 delay-700'
                        ref={(el) => {
                          if (el) {
                            const observer = new IntersectionObserver(
                              ([entry]) => {
                                if (entry.isIntersecting) {
                                  // Animate element when it comes into view
                                  el.classList.remove(
                                    'opacity-0',
                                    'translate-y-4'
                                  );
                                  el.classList.add(
                                    'opacity-100',
                                    'translate-y-0'
                                  );
                                }
                              },
                              { threshold: 0.2 }
                            );
                            observer.observe(el);
                          }
                        }}
                      >
                        <div className='text-2xl font-bold text-[#7D31FF]'>
                          10K+
                        </div>
                        <div className='text-sm text-gray-600'>
                          Certificates
                        </div>
                      </div>
                      {/* Templates count */}
                      <div
                        className='opacity-0 translate-y-4 transition-all duration-700 delay-800'
                        ref={(el) => {
                          if (el) {
                            const observer = new IntersectionObserver(
                              ([entry]) => {
                                if (entry.isIntersecting) {
                                  el.classList.remove(
                                    'opacity-0',
                                    'translate-y-4'
                                  );
                                  el.classList.add(
                                    'opacity-100',
                                    'translate-y-0'
                                  );
                                }
                              },
                              { threshold: 0.2 }
                            );
                            observer.observe(el);
                          }
                        }}
                      >
                        <div className='text-2xl font-bold text-[#7D31FF]'>
                          500+
                        </div>
                        <div className='text-sm text-gray-600'>Templates</div>
                      </div>
                      {/* Satisfaction rate */}
                      <div
                        className='opacity-0 translate-y-4 transition-all duration-700 delay-900'
                        ref={(el) => {
                          if (el) {
                            const observer = new IntersectionObserver(
                              ([entry]) => {
                                if (entry.isIntersecting) {
                                  el.classList.remove(
                                    'opacity-0',
                                    'translate-y-4'
                                  );
                                  el.classList.add(
                                    'opacity-100',
                                    'translate-y-0'
                                  );
                                }
                              },
                              { threshold: 0.2 }
                            );
                            observer.observe(el);
                          }
                        }}
                      >
                        <div className='text-2xl font-bold text-[#7D31FF]'>
                          99%
                        </div>
                        <div className='text-sm text-gray-600'>
                          Satisfaction
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div
                className='mt-12 opacity-0 translate-y-10 transition-all duration-1000 delay-700'
                ref={(el) => {
                  if (el) {
                    const observer = new IntersectionObserver(
                      ([entry]) => {
                        if (entry.isIntersecting) {
                          el.classList.remove('opacity-0', 'translate-y-10');
                          el.classList.add('opacity-100', 'translate-y-0');
                        }
                      },
                      { threshold: 0.2 }
                    );
                    observer.observe(el);
                  }
                }}
              >
                <Link
                  to='/login'
                  className='bg-[var(--secondary-color)] hover:bg-[#F0FF69] text-white hover:text-[var(--secondary-color)] font-semibold py-3 px-8 rounded-sm transition duration-300 transform hover:scale-105 border-2 border-transparent hover:border-[var(--secondary-color)] inline-block'
                >
                  Start Creating Today
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery (white background) */}

        <section className='relative z-20'>
          <div className='mx-auto max-w-2xl my-24 py-8 sm:py-2 lg:py-4 text-center'>
            <h2
              className={`text-5xl font-semibold text-[#7D31FF] transition-all duration-1000 ${
                animate
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10'
              }`}
            >
              Template Categories
            </h2>
          </div>

          {/* Category Buttons */}
          <div className='flex flex-wrap justify-center gap-3 mb-20'>
            {categories.map((cat) => {
              const active = cat === activeCategory;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`px-4 py-2 font-semibold rounded-sm border-2 transition-all duration-200 ${
                    active
                      ? 'bg-[#F0FF69] text-[#9558FF] border-[#9558FF]'
                      : 'bg-[#9558FF] text-[#F0FF69] border-transparent hover:bg-[#F0FF69] hover:text-[#9558FF] hover:border-[#9558FF]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Carousel viewport */}
          <div className='relative overflow-hidden mx-auto max-w-[1300px] h-[380px]'>
            <div
              ref={scrollRef}
              className='flex items-center h-full rounded-lg'
              style={{
                transform: `translateX(-${translateX}px)`,
                transition: isTransition
                  ? `transform ${TRANSITION_MS}ms ease`
                  : 'none',
                gap: `${GAP}px`,
              }}
            >
              {images.map((item, idx) => {
                const isActiveCategory =
                  activeCategory !== 'All' && item.category === activeCategory;

                return (
                  <div
                    key={`${idx}-${item.src}`}
                    className='flex-shrink-0 transition-all duration-300'
                    style={{
                      width: `${isActiveCategory ? CARD_WIDTH * 1.2 : CARD_WIDTH}px`,
                      height: `${isActiveCategory ? CARD_HEIGHT * 1.2 : CARD_HEIGHT}px`,
                      border: `4px solid ${isActiveCategory ? '#F0FF69' : '#9558FF'}`,
                    }}
                  >
                    <img
                      src={item.src}
                      alt={item.category}
                      className='w-full h-full object-cover'
                      draggable={false}
                    />
                  </div>
                );
              })}
            </div>

            {/* Arrow Button */}
            {images.length >= 6 && (
              <div className='absolute top-1/2 right-4 z-20 -translate-y-1/2'>
                <Link
                  to='/login'
                  className='w-16 h-16 text-white hover:text-[var(--secondary-color)] bg-[var(--secondary-color)] hover:bg-[#F0FF69] flex items-center justify-center rotate-45 transition duration-300 shadow-xl hover:scale-110'
                >
                  <ArrowRight className='w-6 h-6 -rotate-45' />
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className='relative z-20   sm:px-6 lg:px-8'>
          <div className='max-w-7xl mt-24 mx-auto'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8 items-start'>
              {/* First Column */}
              <div className='flex flex-col'>
                <h2
                  className='text-4xl font-bold text-[#7D31FF] pb-8 -mt-12 mb-6 transition-all duration-1000 opacity-0 translate-x-10'
                  ref={(el) => {
                    if (el) {
                      const observer = new IntersectionObserver(
                        ([entry]) => {
                          if (entry.isIntersecting) {
                            el.classList.remove('opacity-0', 'translate-x-10');
                            el.classList.add('opacity-100', 'translate-x-0');
                          }
                        },
                        { threshold: 0.3 }
                      );
                      observer.observe(el);
                    }
                  }}
                >
                  Explore Our Highlights
                </h2>

                {/* Add spacing between title and the picture */}
                <div className='mb-4'></div>

                <Link
                  to='/login'
                  className='px-6 py-3 border-2 border-transparent bg-[var(--secondary-color)] text-[#F0FF69] font-semibold rounded-sm w-fit mb-8 hover:bg-[#F0FF69] hover:text-[var(--secondary-color)] hover:border-[var(--secondary-color)] transition-colors duration-300'
                >
                  Browse all
                </Link>

                {/* Add spacing between title and the picture */}
                <div className='mb-4'></div>

                {/* Picture with Arrow Button */}
                <div className='relative'>
                  <img
                    src={images[0].src}
                    alt={images[0].category}
                    className='w-full h-auto object-cover rounded-lg shadow-lg'
                  />
                  <h3 className='text-xl font-semibold text-[#7D31FF] mt-4'>
                    {images[0].category}
                  </h3>
                </div>
              </div>

              {/* Second Column - Two pictures stacked */}
              <div className='flex flex-col gap-8 mt-12'>
                {/* Top Picture */}
                <div className='relative'>
                  <img
                    src={images[1].src}
                    alt={images[1].category}
                    className='w-full h-auto object-cover rounded-lg shadow-lg'
                  />
                  <h3 className='text-xl font-semibold text-[#7D31FF] mt-4'>
                    {images[1].category}
                  </h3>
                </div>

                {/* Bottom Picture */}
                <div className='relative'>
                  <img
                    src={images[3].src}
                    alt={images[3].category}
                    className='w-full h-auto object-cover rounded-lg shadow-lg'
                  />
                  <h3 className='text-xl font-semibold text-[#7D31FF] mt-4'>
                    {images[3].category}
                  </h3>
                </div>
              </div>

              {/* Third Column - Two pictures stacked, positioned higher */}
              <div className='flex flex-col gap-8 -mt-12'>
                {/* Top Picture */}
                <div className='relative'>
                  <img
                    src={images[9].src}
                    alt={images[9].category}
                    className='w-full h-auto object-cover rounded-lg shadow-lg'
                  />
                  <h3 className='text-xl font-semibold text-[#7D31FF] mt-4'>
                    {images[9].category}
                  </h3>
                </div>

                {/* Bottom Picture */}
                <div className='relative'>
                  <img
                    src={images[8].src}
                    alt={images[8].category}
                    className='w-full h-auto object-cover rounded-lg shadow-lg'
                  />
                  <h3 className='text-xl font-semibold text-[#7D31FF] mt-4'>
                    {images[8].category}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* New "Why you'll love Certi4U" Section - Fixed hover effect */}

        <section className='relative z-20 px-4 sm:px-6 lg:px-8'>
          <div className='max-w-7xl mx-auto'>
            <h2 className='text-4xl font-bold text-[#7D31FF] text-center mt-24 mb-24'>
              Why You'll Love Certi4U
            </h2>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Reduced gap between rows */}
              {features.map((feature, index) => (
                <div
                  key={index}
                  className='relative overflow-hidden rounded-lg transition-all duration-500 group'
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                >
                  {/* Image with border */}
                  <div className='border-4 border-[#7D31FF] rounded-lg p-1'>
                    {/* Added padding inside border */}
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className='w-full h-32 object-cover rounded-md' /* Added rounded corners to image */
                    />
                  </div>

                  {/* Text overlay on hover - matching image height */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-36 bg-[#7D31FF] bg-opacity-90 flex flex-col items-center justify-center p-4 transition-all duration-500 rounded-md ${
                      hoveredFeature === index ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <h3 className='text-xl font-semibold text-white mb-1 text-center'>
                      {/* Slightly smaller text */}
                      {feature.title}
                    </h3>
                    <p className='text-white text-sm text-center'>
                      {/* Smaller text for description */}
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Two Column Section with Video and Steps */}

        <section className='relative z-20 px-4 sm:px-6 lg:px-8'>
          <div className='max-w-7xl mx-auto'>
            {/* Centered Title */}
            <div className='text-center mt-24 mb-24'>
              <h2 className='text-4xl font-bold text-[#7D31FF]' id='customize'>
                Bring Your Ideas to Life with Us
              </h2>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24'>
              {/* Left Column - Video */}
              <div className='flex flex-col'>
                <div className='rounded-lg overflow-hidden shadow-lg border-4 border-[#7D31FF]'>
                  <video
                    className='w-full h-auto'
                    src='/videos/Explainer 00.mp4'
                    controls
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload='auto'
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>

              {/* Right Column - Graphic Elements */}
              <div className='flex flex-col pl-12 pt-8'>
                {/* Vertical line with numbered squares */}
                <div className='relative flex flex-col items-center'>
                  {/* Vertical line */}
                  <div className='absolute left-0 transform -translate-x-1/2 w-1 h-full bg-[#7D31FF]'></div>

                  {/* Numbered squares container */}
                  <div className='relative w-full max-w-4xl mx-auto'>
                    {[
                      {
                        number: 1,
                        title: 'Choose a Template',
                        text: 'Pick a design that fits your needs and style',
                      },
                      {
                        number: 2,
                        title: 'Add Your Details',
                        text: 'Enter names, dates, and other personalized information',
                      },
                      {
                        number: 3,
                        title: 'Style Your Certificate',
                        text: 'Adjust fonts, colors, and layout to make it truly yours',
                      },
                      {
                        number: 4,
                        title: 'Save Your Work',
                        text: 'Keep your design safe and accessible in your account',
                      },
                      {
                        number: 5,
                        title: 'Download Your Certificate',
                        text: 'Available in PDF and PNG formats — ready to print or share digitally',
                      },
                      {
                        number: 6,
                        title: 'Share or Print',
                        text: 'Print, present, or share your certificate with others',
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className='group flex items-center mb-20 last:mb-0'
                      >
                        {/* Rotated square with number - with hover animation */}
                        <div className='w-16 h-16 bg-[var(--secondary-color)] text-white flex items-center justify-center border-2 border-transparent rotate-45 transform absolute left-0 -translate-x-1/2 z-10 transition-all duration-300 group-hover:bg-[#F0FF69] group-hover:text-[var(--secondary-color)] group-hover:border-[var(--secondary-color)] group-hover:scale-110'>
                          <span className='text-xl font-bold -rotate-45'>
                            {item.number}
                          </span>
                        </div>
                        {/* Text */}
                        <div className='w-full ml-10 pl-4 text-left'>
                          <p className='text-lg font-semibold text-gray-800 group-hover:text-[#7D31FF]'>
                            {item.title}
                          </p>
                          <p>{item.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Add spacing between title and the picture */}
            <div className='mb-12'></div>

            {/* Centered Big button */}
            <div className='text-center'>
              <Link
                to='/login'
                className='inline-block px-16 py-4 bg-[var(--secondary-color)] border-2 border-transparent text-white text-xl font-semibold rounded-sm hover:bg-[#F0FF69] hover:text-[var(--secondary-color)] hover:border-[var(--secondary-color)] transition-colors duration-300 transform hover:scale-105'
              >
                Start creating now
              </Link>
            </div>
          </div>
        </section>

        {/* Our Team Section - Horizontal Card Layout */}

        <section className='relative z-20  px-4 sm:px-6 lg:px-8'>
          <div className='max-w-7xl mx-auto'>
            <h2 className='text-4xl font-bold text-[#7D31FF] text-center mt-24 mb-12'>
              Our Team
            </h2>

            {/* Tabs */}
            <div className='flex justify-center border-b-2 border-gray-200 mb-16'>
              <button
                type='button'
                onClick={() => setActiveTeamTab('new')}
                className={`px-8 py-3 font-medium text-lg -mb-0.5 border-b-2 transition-colors duration-300 ${
                  activeTeamTab === 'new'
                    ? 'border-[#7D31FF] text-[#7D31FF]'
                    : 'border-transparent text-gray-500 hover:text-[#7D31FF]'
                }`}
              >
                Version 2 Team Members
              </button>
              <button
                type='button'
                onClick={() => setActiveTeamTab('founding')}
                className={`px-8 py-3 font-medium text-lg -mb-0.5 border-b-2 transition-colors duration-300 ${
                  activeTeamTab === 'founding'
                    ? 'border-[#7D31FF] text-[#7D31FF]'
                    : 'border-transparent text-gray-500 hover:text-[#7D31FF]'
                }`}
              >
                Version 1 Team Members
              </button>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {(activeTeamTab === 'new'
                ? newTeamMembers
                : foundingTeamMembers
              ).map((member, index) => (
                <div
                  key={index}
                  className='bg-white rounded-xl shadow-lg overflow-hidden border-2 border-[#7D31FF] transition-all duration-300 hover:shadow-xl hover:border-[#F0FF69] flex flex-col'
                >
                  {/* Image Section */}
                  <div className='relative'>
                    <img
                      src={member.image}
                      alt={member.name}
                      className='w-full h-80 object-cover object-top'
                    />
                    <div className='absolute top-4 right-4 flex items-center gap-4'>
                      {/* LinkedIn icon with real link */}
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='bg-white p-2 rounded-full text-[#7D31FF] hover:text-[#F0FF69] hover:bg-[#7D31FF] transition-colors duration-300'
                          aria-label={`Connect with ${member.name} on LinkedIn`}
                        >
                          <Linkedin size={20} />
                        </a>
                      )}
                      {/* Github icon with real link */}
                      {member.github && (
                        <a
                          href={member.github}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='bg-white p-2 rounded-full text-[#7D31FF] hover:text-[#F0FF69] hover:bg-[#7D31FF] transition-colors duration-300'
                          aria-label={`Connect with ${member.name} on Github`}
                        >
                          <Github size={20} />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className='p-4 flex flex-col'>
                    <div className='mb-1'>
                      <h3 className='text-lg font-semibold text-gray-800'>
                        {member.name}
                      </h3>
                      <p className='text-[#7D31FF] text-sm font-medium'>
                        {member.role}
                      </p>
                    </div>

                    <p className='text-gray-600 text-xs leading-snug line-clamp-3'>
                      {member.description}
                    </p>

                    {/* Portfolio link */}
                    {member.portfolio && (
                      <a
                        href={member.portfolio}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='mt-2 text-[#7D31FF] text-sm font-medium self-start transition-colors duration-300 group'
                      >
                        View Portfolio
                        <MoveRight
                          className='inline-block transition-transform duration-300 group-hover:translate-x-2'
                          size={18}
                        />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Us Section - PLACE THIS RIGHT AFTER THE "OUR TEAM" SECTION */}
        <section className='relative z-20 px-4 sm:px-6 lg:px-8 mt-24'>
          <div className='max-w-7xl mx-auto'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
              {/* Contact Information */}
              <div className='space-y-8'>
                <h2
                  className='text-4xl font-bold text-[#7D31FF] -mt-12 mb-6 transition-all duration-1000 opacity-0 translate-x-10'
                  ref={(el) => {
                    if (el) {
                      const observer = new IntersectionObserver(
                        ([entry]) => {
                          if (entry.isIntersecting) {
                            el.classList.remove('opacity-0', 'translate-x-10');
                            el.classList.add('opacity-100', 'translate-x-0');
                          }
                        },
                        { threshold: 0.3 }
                      );
                      observer.observe(el);
                    }
                  }}
                >
                  Get in Touch
                </h2>
                <p className='text-gray-600 pb-8'>
                  Have any questions about our services? Feel free to reach out
                  to us using the contact information below or fill out the
                  form.
                </p>

                {/* Contact Details */}
                <div className='flex flex-col items-start space-y-12'>
                  <div className='group flex items-start space-x-4'>
                    <div className='bg-[#7D31FF]/10 p-3 rounded-full group-hover:scale-125 transition-all ease-in-out duration-300'>
                      <MapPin className='w-6 h-6 text-[#7D31FF]' />
                    </div>
                    <div>
                      <h4 className='font-semibold text-gray-800'>
                        Our Office
                      </h4>
                      <p className='text-gray-600'>
                        123 Business Street
                        <br />
                        Suite 100, Calgary, AB
                      </p>
                    </div>
                  </div>
                  {/* Phone Number */}
                  <div className='group flex items-start space-x-4'>
                    <div className='bg-[#7D31FF]/10 p-3 rounded-full group-hover:scale-125 transition-all ease-in-out duration-300'>
                      <Phone className='w-6 h-6 text-[#7D31FF]' />
                    </div>
                    <div>
                      <h4 className='font-semibold text-gray-800'>Phone</h4>
                      <p className='text-gray-600'>
                        +1 (587) 123-4567
                        <br />
                        Mon-Fri from 8am to 6pm
                      </p>
                    </div>
                  </div>
                  {/* Email */}
                  <div className='group flex items-start space-x-4'>
                    <div className='bg-[#7D31FF]/10 p-3 rounded-full group-hover:scale-125 transition-all ease-in-out duration-300'>
                      <Mail className='w-6 h-6 text-[#7D31FF]' />
                    </div>
                    <div>
                      <h4 className='font-semibold text-gray-800'>Email</h4>
                      <p className='text-gray-600'>
                        hello@certi4u.com
                        <br />
                        We reply within 24 hours
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Contact Form */}
              <div className='bg-[#7D31FF]/10 p-8 rounded-xl border border-gray-100'>
                <h3 className='text-2xl font-semibold text-gray-800 mb-6'>
                  Send Us a Message
                </h3>
                {/* Form */}
                <form onSubmit={handleContactSubmit} className='space-y-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                      <label
                        htmlFor='name'
                        className='block text-sm font-medium text-gray-700 mb-2'
                      >
                        Full Name *
                      </label>
                      <input
                        type='text'
                        id='name'
                        name='name'
                        value={contactForm.name}
                        onChange={handleContactChange}
                        required
                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D31FF] focus:border-transparent transition-colors'
                        placeholder='Your full name'
                      />
                    </div>
                    {/* Subject */}
                    <div>
                      <label
                        htmlFor='email'
                        className='block text-sm font-medium text-gray-700 mb-2'
                      >
                        Email Address *
                      </label>
                      <input
                        type='email'
                        id='email'
                        name='email'
                        value={contactForm.email}
                        onChange={handleContactChange}
                        required
                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D31FF] focus:border-transparent transition-colors'
                        placeholder='your.email@example.com'
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor='subject'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Subject *
                    </label>
                    <input
                      type='text'
                      id='subject'
                      name='subject'
                      value={contactForm.subject}
                      onChange={handleContactChange}
                      required
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D31FF] focus:border-transparent transition-colors'
                      placeholder='What is this regarding?'
                    />
                  </div>
                  {/* Message */}
                  <div>
                    <label
                      htmlFor='message'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Message *
                    </label>
                    <textarea
                      id='message'
                      name='message'
                      value={contactForm.message}
                      onChange={handleContactChange}
                      required
                      rows={6}
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D31FF] focus:border-transparent transition-colors resize-none'
                      placeholder='Tell us how we can help you...'
                    />
                  </div>
                  {/* Submit Button */}
                  <button
                    type='submit'
                    className='w-full bg-[var(--secondary-color)] text-white
                    font-semibold py-4 px-8 rounded-sm border-2 border-[var(--secondary-color)] hover:bg-[#F0ff69] hover:text-[var(--secondary-color)]
                    transition-colors shadow-md'
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer className='bg-[var(--secondary-color)] py-8 text-center text-sm text-white'>
        <div>
          © Copyright 2025 | All Rights Reserved | Design by Team Certi4U
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
