
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  images: string[];
}

const ProductSlider: React.FC<Props> = ({ images }) => {
  const [index, setIndex] = useState(0);

  if (!images.length) return <div className="aspect-square bg-gray-100 flex items-center justify-center">Rasm yo'q</div>;

  return (
    <div className="relative w-full aspect-[3/4] overflow-hidden rounded-xl group">
      <img 
        src={images[index]} 
        alt="Dress" 
        className="w-full h-full object-cover transition-all duration-500"
      />
      
      {images.length > 1 && (
        <>
          <button 
            onClick={() => setIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => setIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-1.5">
            {images.map((_, i) => (
              <div 
                key={i} 
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === index ? 'bg-amber-600 w-4' : 'bg-gray-300'}`} 
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductSlider;
