// Product data helper - in a real app, this would come from an API
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

export const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Classic White T-Shirt - Round Neck",
    price: 200,
    image: "https://images.unsplash.com/photo-1636458939465-9209848a5688?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwbW9kZWwlMjB0c2hpcnR8ZW58MXx8fHwxNzYyOTI0MDc1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "T-Shirts",
  },
  {
    id: "2",
    name: "Varsity Jacket - Blue & White",
    price: 600,
    image: "https://images.unsplash.com/photo-1761245332312-fddc4f0b5bab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YXJzaXR5JTIwamFja2V0JTIwc3RyZWV0fGVufDF8fHx8MTc2Mjk3Nzk3OXww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Jackets",
  },
  {
    id: "3",
    name: "Oversized Hoodie - Premium Cotton",
    price: 450,
    image: "https://images.unsplash.com/photo-1688111421205-a0a85415b224?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwaG9vZGllfGVufDF8fHx8MTc2Mjk1MjY5MHww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Hoodies",
  },
  {
    id: "4",
    name: "Denim Jacket - Classic Blue",
    price: 550,
    image: "https://images.unsplash.com/photo-1657349038547-b18a07fb4329?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW5pbSUyMGphY2tldCUyMHN0eWxlfGVufDF8fHx8MTc2MjkzMjg2MXww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Jackets",
  },
  {
    id: "5",
    name: "Premium Black Hoodie",
    price: 480,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMGhvb2RpZXxlbnwxfHx8fDE3NjI5MjQwNzV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Hoodies",
  },
  {
    id: "6",
    name: "Graphic Print Tee",
    price: 250,
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFwaGljJTIwdGVlfGVufDF8fHx8MTc2MjkyNDA3NXww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "T-Shirts",
  },
  {
    id: "7",
    name: "Classic Polo Shirt",
    price: 280,
    image: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW4lMjBwb2xvJTIwc2hpcnR8ZW58MXx8fHwxNzYyOTI0MDc1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Polo",
  },
  {
    id: "8",
    name: "Casual Button-Up Shirt",
    price: 320,
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW4lMjBzaGlydHxlbnwxfHx8fDE3NjI5MjQwNzV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Shirts",
  },
  {
    id: "9",
    name: "Slim Fit Chinos",
    price: 420,
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW4lMjBjaGlub3N8ZW58MXx8fHwxNzYyOTI0MDc1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Pants",
  },
  {
    id: "10",
    name: "Bomber Jacket",
    price: 680,
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW4lMjBib21iZXIlMjBqYWNrZXR8ZW58MXx8fHwxNzYyOTI0MDc1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Jackets",
  },
  {
    id: "11",
    name: "Floral Summer Dress",
    price: 580,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGRyZXNzfGVufDF8fHx8MTc2MjkyNDA3NXww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Dresses",
  },
  {
    id: "12",
    name: "Oversized Blazer - Black",
    price: 720,
    image: "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGJsYXplcnxlbnwxfHx8fDE3NjI5MjQwNzV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Blazers",
  },
  {
    id: "13",
    name: "Casual Crop Top",
    price: 180,
    image: "https://images.unsplash.com/photo-1564859228273-274232fdb516?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGNyb3AlMjB0b3B8ZW58MXx8fHwxNzYyOTI0MDc1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Tops",
  },
  {
    id: "14",
    name: "High-Waisted Jeans",
    price: 480,
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGplYW5zfGVufDF8fHx8MTc2MjkyNDA3NXww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Jeans",
  },
  {
    id: "15",
    name: "Knit Sweater - Cream",
    price: 420,
    image: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMHN3ZWF0ZXJ8ZW58MXx8fHwxNzYyOTI0MDc1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Sweaters",
  },
  {
    id: "16",
    name: "Leather Jacket - Brown",
    price: 890,
    image: "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGxlYXRoZXIlMjBqYWNrZXR8ZW58MXx8fHwxNzYyOTI0MDc1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Jackets",
  },
  {
    id: "k1",
    name: "Kids Classic T-Shirt",
    price: 150,
    image: "https://images.unsplash.com/photo-1731267776886-90f90af75eb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraWRzJTIwdC1zaGlydCUyMHdoaXRlfGVufDF8fHx8MTc2Mjk5MDk5MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    category: "T-Shirts",
  },
  {
    id: "k2",
    name: "Kids Polo Shirt - Classic",
    price: 180,
    image: "https://images.unsplash.com/photo-1659779193831-97ccb9fecfeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraWRzJTIwcG9sbyUyMHNoaXJ0fGVufDF8fHx8MTc2MjkzMjQzOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    category: "Shirts",
  },
  {
    id: "k3",
    name: "Kids Casual Outfit",
    price: 280,
    image: "https://images.unsplash.com/photo-1759313560190-d160c3567170?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraWRzJTIwZmFzaGlvbiUyMGNhc3VhbHxlbnwxfHx8fDE3NjI5OTA5OTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    category: "Casual",
  },
  {
    id: "k4",
    name: "Kids Stylish Wear",
    price: 320,
    image: "https://images.unsplash.com/photo-1695262620869-fedab63bcc41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZHJlbiUyMGNsb3RoaW5nJTIwc3R5bGV8ZW58MXx8fHwxNzYyOTkwOTkxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    category: "Clothing",
  },
];

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

