import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { ProductCard } from '@/components/ProductCard';
import { ProductGridSkeleton } from '@/components/ProductSkeleton';
import { CartSheet } from '@/components/CartSheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { products } from '@/data/products';
import { Sparkles, ArrowRight } from 'lucide-react';

const categories = [
  { id: 'all', label: 'All Products' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'fresh', label: 'Fresh' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'home', label: 'Home' },
  { id: 'beauty', label: 'Beauty' },
];

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartSheet />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 gradient-dark opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_50%)]" />

        <div className="container relative py-16 md:py-24">
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">
            <Sparkles className="h-3 w-3 mr-1" />
            FraudX Protected
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 max-w-3xl">
            Shop with confidence
            <br />
            every single time
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mb-8">
            Catalyst Market is the next-generation e-commerce platform with
            built-in fraud protection and instant verification.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="gradient-primary border-0 text-primary-foreground">
              Start Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">
              How it works
            </Button>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="container py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h2 className="text-2xl font-semibold">Featured Products</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(cat.id)}
                className={activeCategory === cat.id ? 'gradient-primary border-0' : ''}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <ProductGridSkeleton count={8} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-fadeIn"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">C</span>
            </div>
            <span className="text-sm font-medium">Catalyst Market</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2024 Catalyst Market. FraudX Testing Environment.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
