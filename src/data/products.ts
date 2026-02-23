
export interface Product {
  id: string;
  name: string;
  category: string;
  description?: string;
  image: string;
  bgColor?: string; // For the placeholder background to match packaging
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
}

export const categories: Category[] = [
  {
    id: 'guioza',
    name: 'Guiozas',
    description: 'Deliciosos pastéis orientais com recheios variados.',
    image: 'https://images.unsplash.com/photo-1626805176884-2076d6a6a5de?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'massa',
    name: 'Massas',
    description: 'Massas finas e crocantes para seus preparos.',
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'harumaki',
    name: 'Harumakis',
    description: 'Rolinhos primavera crocantes e saborosos.',
    image: 'https://images.unsplash.com/photo-1541592390-86e54050d5b9?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'nikuman',
    name: 'Nikumans',
    description: 'Pães cozidos no vapor com recheio suculento.',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'bao',
    name: 'Baos',
    description: 'Pãezinhos macios e levemente adocicados.',
    image: 'https://images.unsplash.com/photo-1625220194771-7eb586ea71b0?q=80&w=800&auto=format&fit=crop'
  }
];

export const products: Product[] = [
  // Guiozas (Matching user image)
  {
    id: 'g1',
    name: 'Guioza Coquetel Legumes',
    category: 'guioza',
    description: 'Sabor leve e natural, perfeito para entradas.',
    image: 'https://placehold.co/600x600/fef3c7/d97706?text=Guioza+Coquetel\nLegumes&font=roboto',
    bgColor: 'bg-yellow-50'
  },
  {
    id: 'g2',
    name: 'Guioza Coquetel Suíno com Legumes',
    category: 'guioza',
    description: 'A combinação clássica e suculenta.',
    image: 'https://placehold.co/600x600/fef3c7/d97706?text=Guioza+Coquetel\nSuino+com+Legumes&font=roboto',
    bgColor: 'bg-yellow-50'
  },
  {
    id: 'g3',
    name: 'Guioza Suíno com Nirá Bandeja',
    category: 'guioza',
    description: 'Praticidade na bandeja, sabor intenso do nirá.',
    image: 'https://placehold.co/600x600/dcfce7/166534?text=Guioza+Suino\ncom+Nira+Bandeja&font=roboto',
    bgColor: 'bg-green-50'
  },
  {
    id: 'g4',
    name: 'Guioza Suíno com Nirá Pacote',
    category: 'guioza',
    description: 'Embalagem econômica para toda a família.',
    image: 'https://placehold.co/600x600/dcfce7/166534?text=Guioza+Suino\ncom+Nira+Pacote&font=roboto',
    bgColor: 'bg-green-50'
  },
  {
    id: 'g5',
    name: 'Guioza Carne Suína com Legumes',
    category: 'guioza',
    description: 'O sabor tradicional da carne suína com vegetais frescos.',
    image: 'https://placehold.co/600x600/fef3c7/d97706?text=Guioza+Carne+Suina\ncom+Legumes&font=roboto',
    bgColor: 'bg-yellow-50'
  },
  {
    id: 'g6',
    name: 'Guioza Carne Bovina com Legumes',
    category: 'guioza',
    description: 'Recheio robusto de carne bovina selecionada.',
    image: 'https://placehold.co/600x600/fee2e2/991b1b?text=Guioza+Carne+Bovina\ncom+Legumes&font=roboto',
    bgColor: 'bg-red-50'
  },
  {
    id: 'g7',
    name: 'Guioza Legumes',
    category: 'guioza',
    description: 'Opção vegetariana cheia de sabor.',
    image: 'https://placehold.co/600x600/dcfce7/166534?text=Guioza\nLegumes&font=roboto',
    bgColor: 'bg-green-50'
  },
  
  // Massas
  {
    id: 'm1',
    name: 'Massa para Guioza',
    category: 'massa',
    description: 'Massa fina e elástica, ideal para fechar seus guiozas.',
    image: 'https://placehold.co/600x600/f3f4f6/374151?text=Massa+para\nGuioza&font=roboto',
    bgColor: 'bg-gray-50'
  },
  {
    id: 'm2',
    name: 'Massa para Harumaki',
    category: 'massa',
    description: 'Crocância garantida para seus rolinhos.',
    image: 'https://placehold.co/600x600/f3f4f6/374151?text=Massa+para\nHarumaki&font=roboto',
    bgColor: 'bg-gray-50'
  },

  // Harumakis
  {
    id: 'h1',
    name: 'Harumaki de Legumes',
    category: 'harumaki',
    description: 'Rolinho primavera clássico e crocante.',
    image: 'https://placehold.co/600x600/fff7ed/c2410c?text=Harumaki\nde+Legumes&font=roboto',
    bgColor: 'bg-orange-50'
  },
  {
    id: 'h2',
    name: 'Harumaki de Queijo',
    category: 'harumaki',
    description: 'Recheio cremoso de queijo que derrete na boca.',
    image: 'https://placehold.co/600x600/fff7ed/c2410c?text=Harumaki\nde+Queijo&font=roboto',
    bgColor: 'bg-orange-50'
  },

  // Nikumans
  {
    id: 'n1',
    name: 'Nikuman Tradicional',
    category: 'nikuman',
    description: 'Pãozinho macio cozido no vapor.',
    image: 'https://placehold.co/600x600/f3f4f6/1f2937?text=Nikuman\nTradicional&font=roboto',
    bgColor: 'bg-gray-50'
  },

  // Baos
  {
    id: 'b1',
    name: 'Bao Tradicional',
    category: 'bao',
    description: 'A base perfeita para seus sanduíches asiáticos.',
    image: 'https://placehold.co/600x600/f3f4f6/1f2937?text=Bao\nTradicional&font=roboto',
    bgColor: 'bg-gray-50'
  }
];
