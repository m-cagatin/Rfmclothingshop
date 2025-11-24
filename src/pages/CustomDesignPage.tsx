import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';
import { 
  ArrowLeft,
  ArrowRight,
  Info,
  X,
  MousePointer2,
  Square,
  Circle,
  Type,
  Image as ImageIcon,
  Layers,
  FolderOpen,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Maximize,
  Upload,
  Grid3x3,
  Check,
  Package
} from 'lucide-react';

type ViewSide = 'front' | 'back';

interface ClothingProduct {
  id: string;
  name: string;
  color: string;
  sizes: string[];
  image: string;
  noPrint: boolean;
  frontPrint: boolean;
  backPrint: boolean;
  category: string;
  subcategory: string;
}

interface LayerItem {
  id: string;
  productName: string;
  color: string;
  size: string;
  image: string;
  variants: {
    view: ViewSide;
    design: string;
  }[];
}

// Category-specific clothing images - Better quality mockups
const categoryImages: Record<string, { front: string; back: string }> = {
  'T-Shirt': {
    front: 'https://images.unsplash.com/photo-1618354691551-44de113f0164?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGFpbiUyMHdoaXRlJTIwdHNoaXJ0JTIwbW9ja3VwfGVufDF8fHx8MTc2Mzk5MTM2M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    back: 'https://images.unsplash.com/photo-1566969208329-c6bcccc57bb2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHRzaGlydCUyMGJhY2slMjB2aWV3fGVufDF8fHx8MTc2Mzk5MTM2M3ww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  'Jacket': {
    front: 'https://images.unsplash.com/photo-1577595130703-4c61a9256b34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHZhcnNpdHklMjBqYWNrZXQlMjBtb2NrdXB8ZW58MXx8fHwxNzYzOTkxMzYzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    back: 'https://images.unsplash.com/photo-1577595130703-4c61a9256b34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHZhcnNpdHklMjBqYWNrZXQlMjBtb2NrdXB8ZW58MXx8fHwxNzYzOTkxMzYzfDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  'Hoodie': {
    front: 'https://images.unsplash.com/photo-1685328403732-64be6bb9d112?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMGhvb2RpZSUyMG1vY2t1cCUyMGZyb250fGVufDF8fHx8MTc2Mzk5MTM2NHww&ixlib=rb-4.1.0&q=80&w=1080',
    back: 'https://images.unsplash.com/photo-1685328403732-64be6bb9d112?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMGhvb2RpZSUyMG1vY2t1cCUyMGZyb250fGVufDF8fHx8MTc2Mzk5MTM2NHww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  'Shirt': {
    front: 'https://images.unsplash.com/photo-1671438118097-479e63198629?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHBvbG8lMjBzaGlydCUyMG1vY2t1cHxlbnwxfHx8fDE3NjM5OTEzNjR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    back: 'https://images.unsplash.com/photo-1671438118097-479e63198629?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHBvbG8lMjBzaGlydCUyMG1vY2t1cHxlbnwxfHx8fDE3NjM5OTEzNjR8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  'Kids': {
    front: 'https://images.unsplash.com/photo-1618354691551-44de113f0164?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGFpbiUyMHdoaXRlJTIwdHNoaXJ0JTIwbW9ja3VwfGVufDF8fHx8MTc2Mzk5MTM2M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    back: 'https://images.unsplash.com/photo-1566969208329-c6bcccc57bb2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHRzaGlydCUyMGJhY2slMjB2aWV3fGVufDF8fHx8MTc2Mzk5MTM2M3ww&ixlib=rb-4.1.0&q=80&w=1080',
  },
};

export function CustomDesignPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [zoom, setZoom] = useState(100);
  const [activeTab, setActiveTab] = useState('edit');
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isClothingPanelOpen, setIsClothingPanelOpen] = useState(false);
  const [isProductionCostOpen, setIsProductionCostOpen] = useState(true);
  const [isPrintAreaOpen, setIsPrintAreaOpen] = useState(true);
  const [selectedSize, setSelectedSize] = useState('medium');
  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [selectedView, setSelectedView] = useState<ViewSide>('front');
  const [layers, setLayers] = useState<LayerItem[]>([]);
  
  // Get category and subcategory from navigation state
  const selectedCategory = location.state?.category || 'T-Shirt';
  const selectedSubcategory = location.state?.subcategory || '';
  const selectedProductName = location.state?.productName || '';

  // Set initial product info from passed state
  useEffect(() => {
    if (selectedProductName) {
      setProductName(selectedProductName);
    }
    if (selectedCategory) {
      setProductCategory(selectedCategory);
    }
  }, [selectedProductName, selectedCategory]);

  const handleAddToCustomize = (product: ClothingProduct) => {
    const newLayer: LayerItem = {
      id: `${product.id}-${Date.now()}`,
      productName: product.name,
      color: product.color,
      size: product.sizes[0] || 'M',
      image: product.image,
      variants: []
    };
    setLayers((prev) => [...prev, newLayer]);
  };

  // Mock clothing products with subcategories
  const clothingProducts: ClothingProduct[] = [
    // Jacket/Varsity Variants
    { 
      id: '1', 
      name: 'Classic Black Varsity', 
      color: 'Black', 
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'], 
      image: 'https://images.unsplash.com/photo-1588011025378-15f4778d2558?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YXJzaXR5JTIwamFja2V0JTIwYmxhY2t8ZW58MXx8fHwxNzYzNjU1NjcxfDA&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: true,
      frontPrint: true,
      backPrint: true,
      category: 'Jacket',
      subcategory: 'Varsity Jacket'
    },
    { 
      id: '2', 
      name: 'White Premium Edition', 
      color: 'White', 
      sizes: ['S', 'M', 'L', 'XL'], 
      image: 'https://images.unsplash.com/photo-1760458955495-9712cc8f79c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YXJzaXR5JTIwamFja2V0JTIwd2hpdGV8ZW58MXx8fHwxNzYzNjU1NjczfDA&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: false,
      frontPrint: true,
      backPrint: true,
      category: 'Jacket',
      subcategory: 'Varsity Jacket'
    },
    { 
      id: '3', 
      name: 'Navy Blue Classic', 
      color: 'Navy Blue', 
      sizes: ['M', 'L', 'XL', '2XL', '3XL'], 
      image: 'https://images.unsplash.com/photo-1639270601211-9265bafae0f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YXJzaXR5JTIwamFja2V0JTIwbmF2eSUyMGJsdWV8ZW58MXx8fHwxNzYzNjU1NjczfDA&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: true,
      frontPrint: true,
      backPrint: false,
      category: 'Jacket',
      subcategory: 'Varsity Jacket'
    },
    { 
      id: '4', 
      name: 'Gray Heather Varsity', 
      color: 'Gray', 
      sizes: ['XS', 'S', 'M', 'L', 'XL'], 
      image: 'https://images.unsplash.com/photo-1715408153725-186c6c77fb45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YXJzaXR5JTIwamFja2V0JTIwZ3JheXxlbnwxfHx8fDE3NjM2NTU2NzN8MA&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: false,
      frontPrint: true,
      backPrint: true,
      category: 'Jacket',
      subcategory: 'Varsity Jacket'
    },
    { 
      id: '5', 
      name: 'Forest Green Limited', 
      color: 'Green', 
      sizes: ['S', 'M', 'L', 'XL', '2XL'], 
      image: 'https://images.unsplash.com/photo-1727063165870-0a1bc4c75240?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YXJzaXR5JTIwamFja2V0JTIwZ3JlZW58ZW58MXx8fHwxNzYzNjU1NjczfDA&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: true,
      frontPrint: false,
      backPrint: true,
      category: 'Jacket',
      subcategory: 'Varsity Jacket'
    },
    { 
      id: '6', 
      name: 'Red Sport Edition', 
      color: 'Red', 
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'], 
      image: 'https://images.unsplash.com/photo-1761439703714-b9dd3ef8af4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YXJzaXR5JTIwamFja2V0JTIwcmVkfGVufDF8fHx8MTc2MzY1NTY3M3ww&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: true,
      frontPrint: true,
      backPrint: true,
      category: 'Jacket',
      subcategory: 'Varsity Jacket'
    },
    // T-Shirt Variants - Round Neck
    {
      id: '7',
      name: 'Round Neck White',
      color: 'White',
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
      image: 'https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHQtc2hpcnQlMjByb3VuZCUyMG5lY2t8ZW58MXx8fHwxNzYyOTg3NTQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: true,
      frontPrint: true,
      backPrint: true,
      category: 'T-Shirt',
      subcategory: 'Round Neck'
    },
    {
      id: '8',
      name: 'Round Neck Black',
      color: 'Black',
      sizes: ['S', 'M', 'L', 'XL', '2XL'],
      image: 'https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHQtc2hpcnQlMjByb3VuZCUyMG5lY2t8ZW58MXx8fHwxNzYyOTg3NTQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: true,
      frontPrint: true,
      backPrint: true,
      category: 'T-Shirt',
      subcategory: 'Round Neck'
    },
    {
      id: '25',
      name: 'Round Neck Navy Blue',
      color: 'Navy Blue',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      image: 'https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHQtc2hpcnQlMjByb3VuZCUyMG5lY2t8ZW58MXx8fHwxNzYyOTg3NTQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: true,
      frontPrint: true,
      backPrint: true,
      category: 'T-Shirt',
      subcategory: 'Round Neck'
    },
    // T-Shirt Variants - V Neck
    {
      id: '9',
      name: 'V Neck White',
      color: 'White',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      image: 'https://images.unsplash.com/photo-1620799139652-715e4d5b232d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHYlMjBuZWNrJTIwdHNoaXJ0fGVufDF8fHx8MTc2Mjk4NzU1MHww&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: true,
      frontPrint: true,
      backPrint: true,
      category: 'T-Shirt',
      subcategory: 'V Neck'
    },
    {
      id: '10',
      name: 'V Neck Gray',
      color: 'Gray',
      sizes: ['M', 'L', 'XL', '2XL'],
      image: 'https://images.unsplash.com/photo-1620799139652-715e4d5b232d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHYlMjBuZWNrJTIwdHNoaXJ0fGVufDF8fHx8MTc2Mjk4NzU1MHww&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: true,
      frontPrint: true,
      backPrint: false,
      category: 'T-Shirt',
      subcategory: 'V Neck'
    },
    {
      id: '26',
      name: 'V Neck Black',
      color: 'Black',
      sizes: ['S', 'M', 'L', 'XL', '2XL'],
      image: 'https://images.unsplash.com/photo-1620799139652-715e4d5b232d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHYlMjBuZWNrJTIwdHNoaXJ0fGVufDF8fHx8MTc2Mjk4NzU1MHww&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: true,
      frontPrint: true,
      backPrint: true,
      category: 'T-Shirt',
      subcategory: 'V Neck'
    },
    // T-Shirt Variants - Chinese Collar
    {
      id: '27',
      name: 'Chinese Collar White',
      color: 'White',
      sizes: ['S', 'M', 'L', 'XL'],
      image: 'https://images.unsplash.com/photo-1651659802584-08bf160743dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMGNoaW5lc2UlMjBjb2xsYXIlMjBzaGlydHxlbnwxfHx8fDE3NjI5ODc1NTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: true,
      frontPrint: true,
      backPrint: true,
      category: 'T-Shirt',
      subcategory: 'Chinese Collar'
    },
    {
      id: '28',
      name: 'Chinese Collar Black',
      color: 'Black',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      image: 'https://images.unsplash.com/photo-1651659802584-08bf160743dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMGNoaW5lc2UlMjBjb2xsYXIlMjBzaGlydHxlbnwxfHx8fDE3NjI5ODc1NTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: false,
      frontPrint: true,
      backPrint: true,
      category: 'T-Shirt',
      subcategory: 'Chinese Collar'
    },
    // Hoodie Variants
    {
      id: '11',
      name: 'Premium Cotton Hoodie White',
      color: 'White',
      sizes: ['S', 'M', 'L', 'XL', '2XL'],
      image: 'https://images.unsplash.com/photo-1639600280284-6ef3f0d67fe1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMGhvb2RpZSUyMHByZW1pdW18ZW58MXx8fHwxNzYyOTcxODA4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: true,
      frontPrint: true,
      backPrint: true,
      category: 'Hoodie',
      subcategory: 'Premium Cotton'
    },
    {
      id: '12',
      name: 'Premium Cotton Hoodie Black',
      color: 'Black',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      image: 'https://images.unsplash.com/photo-1639600280284-6ef3f0d67fe1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMGhvb2RpZSUyMHByZW1pdW18ZW58MXx8fHwxNzYyOTcxODA4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: true,
      frontPrint: true,
      backPrint: true,
      category: 'Hoodie',
      subcategory: 'Premium Cotton'
    },
    {
      id: '13',
      name: 'Premium Cotton Hoodie Gray',
      color: 'Gray',
      sizes: ['M', 'L', 'XL', '2XL', '3XL'],
      image: 'https://images.unsplash.com/photo-1639600280284-6ef3f0d67fe1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMGhvb2RpZSUyMHByZW1pdW18ZW58MXx8fHwxNzYyOTcxODA4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: false,
      frontPrint: true,
      backPrint: true,
      category: 'Hoodie',
      subcategory: 'Premium Cotton'
    },
    // Polo Shirt Variants
    {
      id: '14',
      name: 'Polo Shirt White',
      color: 'White',
      sizes: ['S', 'M', 'L', 'XL'],
      image: 'https://images.unsplash.com/photo-1671438118097-479e63198629?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHBvbG8lMjBzaGlydHxlbnwxfHx8fDE3NjI5MzkzNDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: true,
      frontPrint: true,
      backPrint: true,
      category: 'Shirt',
      subcategory: 'Polo'
    },
    {
      id: '15',
      name: 'Polo Shirt Black',
      color: 'Black',
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
      image: 'https://images.unsplash.com/photo-1671438118097-479e63198629?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHBvbG8lMjBzaGlydHxlbnwxfHx8fDE3NjI5MzkzNDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: true,
      frontPrint: true,
      backPrint: false,
      category: 'Shirt',
      subcategory: 'Polo'
    },
    {
      id: '16',
      name: 'Polo Shirt Navy Blue',
      color: 'Navy Blue',
      sizes: ['M', 'L', 'XL', '2XL'],
      image: 'https://images.unsplash.com/photo-1671438118097-479e63198629?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHBvbG8lMjBzaGlydHxlbnwxfHx8fDE3NjI5MzkzNDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: true,
      frontPrint: true,
      backPrint: true,
      category: 'Shirt',
      subcategory: 'Polo'
    },
    // Kids Variants
    {
      id: '17',
      name: 'Kids T-Shirt White',
      color: 'White',
      sizes: ['2T', '3T', '4T', '5T', 'XS', 'S'],
      image: 'https://images.unsplash.com/photo-1731267776886-90f90af75eb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraWRzJTIwdC1zaGlydCUyMHdoaXRlfGVufDF8fHx8MTc2Mjk5MDk5MHww&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: true,
      frontPrint: true,
      backPrint: true,
      category: 'Kids',
      subcategory: 'Kids T-Shirt'
    },
    {
      id: '18',
      name: 'Kids T-Shirt Black',
      color: 'Black',
      sizes: ['2T', '3T', '4T', '5T', 'XS', 'S'],
      image: 'https://images.unsplash.com/photo-1731267776886-90f90af75eb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraWRzJTIwdC1zaGlydCUyMHdoaXRlfGVufDF8fHx8MTc2Mjk5MDk5MHww&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: true,
      frontPrint: true,
      backPrint: false,
      category: 'Kids',
      subcategory: 'Kids T-Shirt'
    },
    {
      id: '19',
      name: 'Kids Polo Shirt White',
      color: 'White',
      sizes: ['2T', '3T', '4T', '5T', 'XS'],
      image: 'https://images.unsplash.com/photo-1659779193831-97ccb9fecfeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraWRzJTIwcG9sbyUyMHNoaXJ0fGVufDF8fHx8MTc2MjkzMjQzOHww&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: true,
      frontPrint: true,
      backPrint: true,
      category: 'Kids',
      subcategory: 'Kids Polo'
    },
  ];

  // Filter clothing products based on selected category AND subcategory
  const filteredClothingProducts = clothingProducts.filter(product => {
    // If subcategory is specified, filter by both category and subcategory
    if (selectedSubcategory) {
      return product.category === selectedCategory && product.subcategory === selectedSubcategory;
    }
    // Otherwise, just filter by category
    return product.category === selectedCategory;
  });

  // Get category display name with subcategory support
  const getCategoryDisplayName = (category: string, subcategory?: string) => {
    if (subcategory) {
      return `${subcategory} Variants`;
    }
    
    const displayNames: Record<string, string> = {
      'T-Shirt': 'T-Shirt Variants',
      'Jacket': 'Varsity Jacket Variants',
      'Hoodie': 'Hoodie Variants',
      'Shirt': 'Polo Shirt Variants',
      'Kids': 'Kids Clothing Variants'
    };
    return displayNames[category] || `${category} Variants`;
  };

  const leftTools = [
    { id: 'back', icon: ArrowLeft, label: 'Back' },
    { id: 'upload', icon: Upload, label: 'Upload Image' },
    { id: 'text', icon: Type, label: 'Add Text' },
    { id: 'library', icon: Layers, label: 'My Library' },
    { id: 'graphics', icon: ImageIcon, label: 'Graphics' },
    { id: 'templates', icon: FolderOpen, label: 'My Templates' },
    { id: 'patterns', icon: Grid3x3, label: 'Patterns/Textures' },
  ];

  const handleToolClick = (toolId: string) => {
    if (toolId === 'back') {
      navigate('/');
    } else {
      setActiveTool(toolId);
    }
  };

  return (
    <div className="h-screen flex bg-gray-100 overflow-x-hidden">
      {/* Left Vertical Toolbar - Spans full height */}
      <div className="bg-white border-r w-20 flex flex-col items-center py-6 gap-4 z-10">
        {leftTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              className={`w-full flex flex-col items-center justify-center gap-1.5 py-2 px-1 transition-colors group ${
                activeTool === tool.id
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="size-5" />
              <span className={`text-[10px] text-center leading-tight ${
                activeTool === tool.id ? '' : 'text-gray-500'
              }`}>
                {tool.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right side: Top bar, content, and bottom bar */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="size-8" onClick={() => setIsPanelOpen(!isPanelOpen)}>
              <Info className="size-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsClothingPanelOpen(!isClothingPanelOpen)}
              className={`${isClothingPanelOpen ? 'bg-gray-800 text-white hover:bg-gray-700 hover:text-white' : 'hover:bg-gray-100 hover:text-gray-900'}`}
            >
              My Clothing
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={'default'}
              size="sm"
              className="bg-gray-800 hover:bg-gray-700 text-white"
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/custom-design-preview')}
              className="hover:bg-gray-100 hover:text-gray-900"
            >
              Preview
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab(activeTab === 'layers' ? '' : 'layers')}
              className={`relative ${activeTab === 'layers' ? 'bg-gray-800 text-white hover:bg-gray-700 hover:text-white' : 'hover:bg-gray-100 hover:text-gray-900'}`}
            >
              Layers
              {layers.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs size-5 rounded-full flex items-center justify-center">
                  {layers.length}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Product Information Panel - Printify Style - Absolute positioned overlay */}
          {isPanelOpen && (
            <div className="absolute left-0 top-0 bottom-0 bg-white border-r w-[320px] overflow-y-auto z-20 shadow-lg">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <h2 className="text-lg">Product details</h2>
                  <Button variant="ghost" size="icon" className="size-8" onClick={() => setIsPanelOpen(false)}>
                    <X className="size-4" />
                  </Button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {/* Product Image and Name */}
                  <div className="space-y-3">
                    <div className="w-full aspect-square bg-gray-100 rounded-lg border overflow-hidden">
                      <img 
                        src={categoryImages[selectedCategory]?.front} 
                        alt={productName}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="mb-1">{productName || 'Product Name'}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Package className="size-4" />
                        <span>Your Brand Store</span>
                      </div>
                    </div>
                  </div>

                  {/* Stock Status */}
                  <div className="flex items-center gap-2 py-2 px-3 bg-green-50 border border-green-200 rounded-lg">
                    <Check className="size-4 text-green-600" />
                    <span className="text-sm text-green-700">In stock</span>
                  </div>

                  {/* Production Cost */}
                  <Collapsible open={isProductionCostOpen} onOpenChange={setIsProductionCostOpen}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                        <span className="text-sm">Production cost: PHP 800.00</span>
                        {isProductionCostOpen ? (
                          <ChevronUp className="size-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="size-4 text-gray-500" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4 space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Blank product</span>
                          <span>PHP 350.00</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Front print</span>
                          <span>PHP 225.00</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Back print</span>
                          <span>PHP 225.00</span>
                        </div>
                        <div className="pt-2 border-t flex items-center justify-between">
                          <span className="text-sm">Subtotal</span>
                          <span className="text-sm">PHP 800.00</span>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Print Area Details */}
                  <Collapsible open={isPrintAreaOpen} onOpenChange={setIsPrintAreaOpen} className="border-t pt-6">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent mb-4">
                        <span className="text-sm">Print area</span>
                        {isPrintAreaOpen ? (
                          <ChevronUp className="size-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="size-4 text-gray-500" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Size</span>
                          <span>4800 × 5400 px</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">DPI</span>
                          <span>300</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Product size</span>
                          <span>16" × 18" (40.6 × 45.7 cm)</span>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </div>
            </div>
          )}

          {/* Clothing Variants Panel - LEFT SIDE */}
          {isClothingPanelOpen && (
            <div className="absolute left-0 top-0 bottom-0 bg-white border-r border-gray-300 w-[480px] overflow-hidden z-20 shadow-xl">
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="p-5 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl">{getCategoryDisplayName(selectedCategory, selectedSubcategory)}</h2>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="size-2 rounded-full bg-green-500"></div>
                        <span className="text-gray-600">Available</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="size-8 hover:bg-gray-200" onClick={() => setIsClothingPanelOpen(false)}>
                      <X className="size-5" />
                    </Button>
                  </div>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-5">
                  <style>{`
                    .variants-scroll::-webkit-scrollbar {
                      width: 8px;
                    }
                    .variants-scroll::-webkit-scrollbar-track {
                      background: #f1f1f1;
                      border-radius: 4px;
                    }
                    .variants-scroll::-webkit-scrollbar-thumb {
                      background: #888;
                      border-radius: 4px;
                    }
                    .variants-scroll::-webkit-scrollbar-thumb:hover {
                      background: #555;
                    }
                  `}</style>
                  
                  <div className="variants-scroll h-full overflow-y-auto space-y-4">
                    {filteredClothingProducts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center px-6">
                        <Package className="size-16 text-gray-300 mb-4" />
                        <p className="text-sm text-gray-600 mb-2">No products found</p>
                        <p className="text-xs text-gray-500">
                          Try selecting a different category
                        </p>
                      </div>
                    ) : (
                      filteredClothingProducts.map((product) => {
                        const colorMap: Record<string, string> = {
                          'Black': '#1a1a1a',
                          'White': '#ffffff',
                          'Navy Blue': '#1e3a8a',
                          'Gray': '#6b7280',
                          'Green': '#16a34a',
                          'Red': '#dc2626',
                        };
                        const bgColor = colorMap[product.color] || '#d9d9d9';

                        return (
                          <div
                            key={product.id}
                            className="w-full bg-white border-2 border-gray-200 rounded-xl hover:border-gray-400 hover:shadow-lg transition-all"
                          >
                            <div className="p-4 space-y-3">
                              {/* Top Section: Image and Details */}
                              <div className="flex gap-4">
                                <div className="w-32 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                  <img 
                                    src={product.image} 
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>

                                <div className="flex-1 space-y-2.5">
                                  <h3 className="text-base hover:text-gray-900 transition-colors">
                                    {product.name}
                                  </h3>

                                  <div className="space-y-1">
                                    <span className="text-xs text-gray-500">Sizes:</span>
                                    <div className="flex flex-wrap gap-1.5">
                                      {product.sizes.map((size) => (
                                        <span
                                          key={size}
                                          className="px-2 py-0.5 text-xs bg-gray-100 border border-gray-300 rounded"
                                        >
                                          {size}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 pl-1">
                                <div 
                                  className="size-12 rounded-md border-2 border-gray-300 shadow-sm flex-shrink-0"
                                  style={{ backgroundColor: bgColor }}
                                />
                                <div className="flex flex-col">
                                  <span className="text-xs text-gray-500">Color</span>
                                  <span className="text-sm text-gray-800">{product.color}</span>
                                </div>
                              </div>

                              <div className="space-y-2 pt-2 border-t border-gray-100">
                                <div className="flex items-center justify-between py-1.5 px-2 bg-gray-50 border border-gray-200 rounded">
                                  <span className="text-xs text-gray-700">No Print</span>
                                  <span className="text-xs">PHP 350.00</span>
                                </div>
                                <div className="flex items-center justify-between py-1.5 px-2 bg-gray-50 border border-gray-200 rounded">
                                  <span className="text-xs text-gray-700">Front Print</span>
                                  <span className="text-xs">PHP 450.00</span>
                                </div>
                                <div className="flex items-center justify-between py-1.5 px-2 bg-gray-50 border border-gray-200 rounded">
                                  <span className="text-xs text-gray-700">Back Print</span>
                                  <span className="text-xs">PHP 500.00</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between gap-2 pt-2">
                                <Button 
                                  size="sm"
                                  className="bg-gray-800 hover:bg-gray-700 text-white text-xs h-8"
                                  onClick={() => handleAddToCustomize(product)}
                                >
                                  Add to Customize
                                </Button>
                                <button 
                                  onClick={() => navigate(`/custom-product/${product.id}`)}
                                  className="text-xs text-gray-600 hover:text-gray-900 hover:underline"
                                >
                                  More details →
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Layers Panel - RIGHT SIDE */}
          {activeTab === 'layers' && (
            <div className="absolute right-0 top-0 bottom-0 bg-white border-l border-gray-300 w-[480px] overflow-hidden z-20 shadow-xl">
              <div className="h-full flex flex-col">
                <div className="p-5 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Layers className="size-5 text-gray-700" />
                      <h2 className="text-xl">Layers</h2>
                    </div>
                    <Button variant="ghost" size="icon" className="size-8 hover:bg-gray-200" onClick={() => setActiveTab('edit')}>
                      <X className="size-5" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="size-2 rounded-full bg-blue-500"></div>
                    <span className="text-gray-600">{layers.length} {layers.length === 1 ? 'item' : 'items'} added</span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {layers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-6">
                      <Layers className="size-16 text-gray-300 mb-4" />
                      <p className="text-sm text-gray-600 mb-2">No layers yet</p>
                      <p className="text-xs text-gray-500">
                        Click "Add to Customize" in My Clothing to add items here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {layers.map((layer, index) => (
                        <div key={layer.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-gray-50 p-3 flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                              <img src={layer.image} alt={layer.productName} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm truncate">{layer.productName}</h4>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>{layer.color}</span>
                                <span>•</span>
                                <span>Size {layer.size}</span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">#{index + 1}</div>
                          </div>

                          <div className="p-3 space-y-2">
                            {layer.variants.length === 0 ? (
                              <p className="text-xs text-gray-500 italic">No designs added yet</p>
                            ) : (
                              layer.variants.map((variant, vIndex) => (
                                <div
                                  key={vIndex}
                                  className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded text-xs"
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="size-2 rounded-full bg-blue-500"></div>
                                    <span className="capitalize">{variant.view}</span>
                                  </div>
                                  <span className="text-gray-600">{variant.design}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {layers.length > 0 && (
                  <div className="p-4 border-t border-gray-200">
                    <Button variant="outline" size="sm" className="w-full">
                      Clear All Layers
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Canvas Area */}
          <div className="flex-1 overflow-auto p-8 flex flex-col items-center justify-center bg-[#f5f4f0]">
            <div className="relative flex items-center justify-center mb-8">
              <div className="relative w-[500px] h-[600px] flex items-center justify-center">
                <img 
                  src={selectedView === 'front' 
                    ? categoryImages[selectedCategory]?.front 
                    : categoryImages[selectedCategory]?.back
                  }
                  alt={`${selectedCategory} ${selectedView}`}
                  className="w-full h-full object-contain"
                  style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
                />

                <div
                  className="absolute border-2 border-dashed border-gray-800 rounded pointer-events-none"
                  style={{
                    width: '260px',
                    height: '330px',
                    top: selectedView === 'front' ? '180px' : '150px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                  }}
                >
                  <div className="absolute -top-6 left-0 text-xs text-gray-600">Design Area</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedView('front')}
                className={`px-6 py-2.5 rounded-full transition-all ${
                  selectedView === 'front'
                    ? 'bg-gray-800 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Front side
              </button>
              <button
                onClick={() => setSelectedView('back')}
                className={`px-6 py-2.5 rounded-full transition-all ${
                  selectedView === 'back'
                    ? 'bg-gray-800 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Back side
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="bg-white border-t px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => setZoom(Math.max(50, zoom - 10))}
            >
              <ZoomOut className="size-4" />
            </Button>
            <span className="text-sm min-w-[50px] text-center">{zoom}%</span>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => setZoom(Math.min(200, zoom + 10))}
            >
              <ZoomIn className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8 ml-1"
            >
              <Maximize2 className="size-4" />
            </Button>
          </div>

          <Button variant="outline" size="sm">
            Reset view
          </Button>

          <Button size="sm" className="bg-green-600 hover:bg-green-700">
            Save Product
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CustomDesignPage;
