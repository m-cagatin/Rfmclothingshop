import { CustomProductCard } from '../components/CustomProductCard';
import { Button } from '../components/ui/button';
import { SlidersHorizontal, Palette, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import Slider from 'react-slick';

export function CustomProductsPage() {
  const customProducts = [
    {
      id: '1',
      name: 'T-Shirt - Round Neck',
      price: 250,
      image: 'https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHQtc2hpcnQlMjByb3VuZCUyMG5lY2t8ZW58MXx8fHwxNzYyOTg3NTQ5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      category: 'T-Shirt',
      isNew: true,
    },
    {
      id: '2',
      name: 'T-Shirt - V Neck',
      price: 250,
      image: 'https://images.unsplash.com/photo-1620799139652-715e4d5b232d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHYlMjBuZWNrJTIwdHNoaXJ0fGVufDF8fHx8MTc2Mjk4NzU1MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      category: 'T-Shirt',
      isNew: true,
    },
    {
      id: '3',
      name: 'T-Shirt - Chinese Collar',
      price: 280,
      image: 'https://images.unsplash.com/photo-1651659802584-08bf160743dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMGNoaW5lc2UlMjBjb2xsYXIlMjBzaGlydHxlbnwxfHx8fDE3NjI5ODc1NTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      category: 'T-Shirt',
      isNew: false,
    },
    {
      id: '4',
      name: 'Varsity Jacket',
      price: 650,
      image: 'https://images.unsplash.com/photo-1760458955495-9712cc8f79c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHZhcnNpdHklMjBqYWNrZXR8ZW58MXx8fHwxNzYyOTg3NTUxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      category: 'Jacket',
      isNew: true,
    },
    {
      id: '5',
      name: 'Hoodie - Premium Cotton',
      price: 480,
      image: 'https://images.unsplash.com/photo-1639600280284-6ef3f0d67fe1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMGhvb2RpZSUyMHByZW1pdW18ZW58MXx8fHwxNzYyOTcxODA4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      category: 'Hoodie',
      isNew: false,
    },
    {
      id: '6',
      name: 'Polo Shirt',
      price: 320,
      image: 'https://images.unsplash.com/photo-1671438118097-479e63198629?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHBvbG8lMjBzaGlydHxlbnwxfHx8fDE3NjI5MzkzNDJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      category: 'Shirt',
      isNew: false,
    },
    {
      id: '7',
      name: 'Kids T-Shirt',
      price: 200,
      image: 'https://images.unsplash.com/photo-1731267776886-90f90af75eb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraWRzJTIwdC1zaGlydCUyMHdoaXRlfGVufDF8fHx8MTc2Mjk5MDk5MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      category: 'Kids',
      isNew: true,
    },
    {
      id: '8',
      name: 'Kids Polo Shirt',
      price: 220,
      image: 'https://images.unsplash.com/photo-1659779193831-97ccb9fecfeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraWRzJTIwcG9sbyUyMHNoaXJ0fGVufDF8fHx8MTc2MjkzMjQzOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      category: 'Kids',
      isNew: true,
    },
  ];

  const scrollToProducts = () => {
    const productsSection = document.getElementById('products-section');
    if (productsSection) {
      const navbarHeight = 80; // Approximate height of the fixed navbar
      const elementPosition = productsSection.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navbarHeight;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    arrows: true,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          arrows: true,
        }
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          arrows: true,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: true,
          centerPadding: '40px',
          arrows: false,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: false,
          centerPadding: '0px',
          arrows: false,
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="container mx-auto px-4 py-20 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Sparkles className="size-4" />
              <span className="text-sm">Express Your Creativity</span>
            </div>
            <h1 className="mb-6">
              Customize Your Own Clothing
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Turn your ideas into reality. Choose from our premium collection of blank apparel and design something uniquely yours with our intuitive design studio. Whether it's a personal statement or a brand identity, your creativity has no limits.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" className="bg-white text-black hover:bg-gray-100" onClick={scrollToProducts}>
                <Palette className="mr-2 size-5" />
                Choose to Design
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white border-b py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="inline-flex items-center justify-center size-12 rounded-full bg-black text-white mb-4">
                <Palette className="size-6" />
              </div>
              <h3 className="mb-2">Easy Design Tools</h3>
              <p className="text-gray-600 text-sm">
                Intuitive drag-and-drop interface with powerful editing capabilities
              </p>
            </div>
            <div>
              <div className="inline-flex items-center justify-center size-12 rounded-full bg-black text-white mb-4">
                <Sparkles className="size-6" />
              </div>
              <h3 className="mb-2">Premium Quality</h3>
              <p className="text-gray-600 text-sm">
                High-quality fabrics and professional printing on every item
              </p>
            </div>
            <div>
              <div className="inline-flex items-center justify-center size-12 rounded-full bg-black text-white mb-4">
                <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mb-2">Fast Delivery</h3>
              <p className="text-gray-600 text-sm">
                Quick turnaround time from design to doorstep
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Page Header */}
      <section className="bg-white border-b" id="products-section">
        <div className="container mx-auto px-4 py-8 md:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="mb-2">Select Your Canvas</h2>
              <p className="text-gray-600">
                Choose the perfect base for your custom design
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 py-12 md:px-6">
        <div className="custom-products-carousel">
          <Slider {...carouselSettings}>
            {customProducts.map((product) => (
              <div key={product.id} className="px-3">
                <CustomProductCard {...product} />
              </div>
            ))}
          </Slider>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-gray-100 border-t py-16">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="mb-4">Need Help Getting Started?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our design team is here to help you bring your vision to life. Browse our templates or start from scratch.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button>
              Contact Support
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default CustomProductsPage;