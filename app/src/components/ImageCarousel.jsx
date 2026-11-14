import { useState } from "react";
import { toProxyUrl } from "../utils/imageProxy";

export default function ImageCarousel({ images = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const image = images?.[currentIndex];
  const src = image ? toProxyUrl(image) : null;

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-gray-50">
      {src ? (
        <img
          src={src}
          alt="Postagem"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center">
          <span className="text-gray-400 text-sm">Sem imagem</span>
        </div>
      )}

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrev();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white px-2 py-1 rounded-lg hover:bg-black/50 transition"
            aria-label="Imagem anterior"
          >
            ‹
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white px-2 py-1 rounded-lg hover:bg-black/50 transition"
            aria-label="Próxima imagem"
          >
            ›
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                aria-label={`Imagem ${i + 1}`}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentIndex
                    ? "bg-white"
                    : "bg-white/50 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
