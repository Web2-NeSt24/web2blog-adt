import React from 'react';

interface ProfilePictureProps {
  id?: number | null;
  alt?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  id,
  alt = "Profile Picture",
  width = 180,
  height = 180,
  className = "",
  style = {},
  onClick,
}) => {
  let src = "/ProfilePicturePlaceholder.png";
  if (id != null) {
    src = `/api/image/${id}`;
  }

  return (
    <img
      src={src}
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

export default ProfilePicture;
