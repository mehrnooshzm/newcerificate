import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

// List of FAQ items
const faqItems = [
  {
    question: 'How do I create a certificate?',
    answer:
      "Simply click the 'New Certificate' button, choose a template from our library, and customize the details like name, date, and title.",
  },
  {
    question: 'Can I download my certificate as a PDF?',
    answer:
      'Yes! Once you finish designing your certificate, you can download it in high-quality PDF or PNG format.',
  },
  {
    question: 'Is it free to use?',
    answer:
      'You can create and preview certificates for free. Downloading high-resolution certificates may require a premium plan.',
  },
  {
    question: 'Can I use my own logo or design?',
    answer:
      'Absolutely! You can upload your own logo or background image and include it in your certificate design.',
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null); // Track which FAQ is open

  // Toggle open/close for a FAQ item
  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      {/* Video Tutorial Section */}
      <section className='max-w-4xl mx-auto px-6 py-12'>
        <h2 className='text-3xl font-bold text-center mb-8'>
          Frequently Asked Questions
        </h2>

        {/* Video Section */}
        <div className='mb-12 text-center'>
          <h3 className='text-2xl font-semibold mb-4'>How It Works</h3>
          <div className='bg-gray-100 rounded-lg p-4'>
            <video
              controls
              className='max-w-full mx-auto rounded-lg shadow-md'
              poster='/videos/expl-poster.jpg' // Optional: add a poster image
            >
              <source src='/videos/Expl.mp4' type='video/mp4' />
              Your browser does not support the video tag.
            </video>
          </div>
          <p className='text-gray-600 mt-2'>
            Watch this quick tutorial to see how easy it is to create
            certificates
          </p>
        </div>
      </section>
      {/* FAQ Section */}
      <section className='relative z-20 py-24 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-4xl mx-auto'>
          <h2 className='text-4xl font-bold text-[#7D31FF] text-center mb-16'>
            Frequently Asked Questions
          </h2>

          <div className='space-y-4'>
            {faqItems.map((item, index) => (
              <div
                key={index}
                className='border-2 border-[#7D31FF] rounded-lg overflow-hidden'
              >
                {/* FAQ Question Button */}
                <button
                  className='w-full px-6 py-4 text-left flex items-center justify-between bg-white hover:bg-[#F0FF69] transition-colors duration-300'
                  onClick={() => toggleFAQ(index)}
                >
                  <span className='text-lg font-semibold text-[#7D31FF]'>
                    {item.question}
                  </span>

                  {openIndex === index ? (
                    <ChevronUp className='text-[#7D31FF] flex-shrink-0' />
                  ) : (
                    <ChevronDown className='text-[#7D31FF] flex-shrink-0' />
                  )}
                </button>
                {/* FAQ Answer */}
                {openIndex === index && (
                  <div className='px-6 py-4 bg-white'>
                    <p className='text-gray-700'>{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default FAQSection;
