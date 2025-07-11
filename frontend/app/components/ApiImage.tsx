export interface ApiImageProps {
  id?: number | null;
  fallback?: string,
  alt?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function getImageSrc(image_id?: number | null): string | null {
  if (image_id) {
    return `/api/image/${image_id}`
  } else {
    return null
  }
}

export const ApiImage: React.FC<ApiImageProps> = ({
  id,
  fallback,
  alt,
  width,
  height,
  className = "",
  style = {},
  onClick,
}) => {
  return (
    <img
      src={getImageSrc(id) || fallback}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={{
        objectFit: 'cover',
        ...style
      }}
      onClick={onClick}
    />
  );
};
