import { useState } from 'react';
import { assetUrl } from '../../utils/assetUrl.js';

export default function ImageGallery({ images = [] }) {
  const [active, setActive] = useState(0);

  if (!images.length) {
    return <div className="w-full h-96 bg-gray-100 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--color-muted)] text-sm">No images</div>;
  }

  return (
    <div className="flex gap-4">
      {/* Thumbnail strip */}
      <div className="flex flex-col gap-2 w-16">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setActive(i)}
            className={`w-16 h-16 rounded-[var(--radius-sm)] overflow-hidden border-2 transition-colors ${
              active === i ? 'border-[var(--color-primary)]' : 'border-[var(--color-border)]'
            }`}
          >
            <img src={assetUrl(img.url)} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div className="flex-1 relative overflow-hidden rounded-[var(--radius-md)] bg-gray-50 group">
        <img
          src={assetUrl(images[active].url)}
          alt=""
          className="w-full h-[480px] object-contain group-hover:scale-110 transition-transform duration-300"
        />
      </div>
    </div>
  );
}
