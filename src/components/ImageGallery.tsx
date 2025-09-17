import { useState } from 'react';
import styles from './ImageGallery.module.css';

interface ImageGalleryProps {
  mainImage: string;
  additionalImages: string[];
  title: string;
}

export function ImageGallery({ mainImage, additionalImages, title }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(mainImage);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const allImages = [mainImage, ...additionalImages];
  const hasMultipleImages = allImages.length > 1;

  const getFallbackImage = () => {
    return 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = getFallbackImage();
  };

  const handleImageClick = (image: string) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleThumbnailClick = (image: string) => {
    setSelectedImage(image);
  };

  const getCurrentImageIndex = () => {
    return allImages.findIndex(img => img === selectedImage);
  };

  const handlePrevious = () => {
    const currentIndex = getCurrentImageIndex();
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : allImages.length - 1;
    setSelectedImage(allImages[prevIndex]);
  };

  const handleNext = () => {
    const currentIndex = getCurrentImageIndex();
    const nextIndex = currentIndex < allImages.length - 1 ? currentIndex + 1 : 0;
    setSelectedImage(allImages[nextIndex]);
  };

  return (
    <div className={styles.imageGallery}>
      <div className={styles.mainImageContainer}>
        <img
          src={selectedImage}
          alt={title}
          className={styles.mainImage}
          onClick={() => handleImageClick(selectedImage)}
          onError={handleImageError}
        />
        {hasMultipleImages && (
          <div className={styles.imageCounter}>
            {getCurrentImageIndex() + 1} / {allImages.length}
          </div>
        )}
      </div>

      {hasMultipleImages && (
        <div className={styles.thumbnailContainer}>
          <div className={styles.thumbnailGrid}>
            {allImages.map((image, index) => (
              <button
                key={index}
                className={`${styles.thumbnail} ${
                  image === selectedImage ? styles.thumbnailActive : ''
                }`}
                onClick={() => handleThumbnailClick(image)}
              >
                <img
                  src={image}
                  alt={`${title} - Image ${index + 1}`}
                  className={styles.thumbnailImage}
                  onError={handleImageError}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modal} onClick={handleModalClose}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.modalClose}
              onClick={handleModalClose}
              aria-label="Close modal"
            >
              <svg className={styles.closeIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <img
              src={selectedImage}
              alt={title}
              className={styles.modalImage}
              onError={handleImageError}
            />

            {hasMultipleImages && (
              <>
                <button
                  className={`${styles.modalNav} ${styles.modalPrev}`}
                  onClick={handlePrevious}
                  aria-label="Previous image"
                >
                  <svg className={styles.navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  className={`${styles.modalNav} ${styles.modalNext}`}
                  onClick={handleNext}
                  aria-label="Next image"
                >
                  <svg className={styles.navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            <div className={styles.modalCounter}>
              {getCurrentImageIndex() + 1} / {allImages.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}