import { CustomProductCard } from '../components/CustomProductCard';
import { Button } from '../components/ui/button';
import { SlidersHorizontal, Palette, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import Slider from 'react-slick';
import { useCustomizableProducts } from '../hooks/useCustomizableProducts';
import { useMemo } from 'react';

// Helper function to get representative product with color priority
function getRepresentativeProduct(categoryProducts: any[]) {
  if (!categoryProducts || categoryProducts.length === 0) return null;
  
  // Priority 1: White color
  let product = categoryProducts.find(p => 
    p.color?.name?.toLowerCase() === 'white'
  );
  
  // Priority 2: Light colors (closest to white)
  if (!product) {
    const lightColors = ['cream', 'ivory', 'beige', 'light gray', 'off-white', 'pearl', 'off white'];
    product = categoryProducts.find(p => {
      const colorName = p.color?.name?.toLowerCase() || '';
      return lightColors.some(c => colorName.includes(c));
    });
  }
  
  // Priority 3: Black (opposite of white)
  if (!product) {
    product = categoryProducts.find(p => 
      p.color?.name?.toLowerCase() === 'black'
    );
  }
  
  // Priority 4: First available in array
  return product || categoryProducts[0];
}

export function CustomProductsPage() {
  const { products, loading, error } = useCustomizableProducts();

  // Group products by category and select representative for each
  const representativeProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    // Group by exact category string
    const grouped = products.reduce((acc: Record<string, any[]>, product: any) => {
      const category = product.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    }, {});

    // Select representative for each category
    return Object.entries(grouped).map(([category, categoryProducts]) => {
      const representative = getRepresentativeProduct(categoryProducts);
      if (!representative) return null;

      // Get primary image (front view preferred)
      const frontImage = representative.images?.find((img: any) => img.type === 'front');
      const imageUrl = frontImage?.url || representative.images?.[0]?.url || 'https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?w=500';

      return {
        id: representative.id,
        name: representative.category, // Use category as display name
        price: representative.retailPrice || 0,
        image: imageUrl,
        category: representative.category,
        isNew: false, // Can be determined by createdAt if needed
      };
    }).filter(Boolean); // Remove null entries
  }, [products]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading customizable products...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load products: {error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

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
        {representativeProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No customizable products available at the moment.</p>
          </div>
        ) : (
          <div className="custom-products-carousel">
            <Slider {...carouselSettings}>
              {representativeProducts.map((product) => (
                <div key={product.id} className="px-3">
                  <CustomProductCard {...product} />
                </div>
              ))}
            </Slider>
          </div>
        )}
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