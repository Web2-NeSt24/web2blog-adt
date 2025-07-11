import React from 'react';
import { ApiImage, type ApiImageProps } from './ApiImage';

const ProfilePicture: React.FC<ApiImageProps> = (props) => {
  props = {
    ...{
      fallback: "/ProfilePicturePlaceholder.png",
      alt: "Profile Picture",
      width: 180,
      height: 180,
    },
    ...props
  }

  return <ApiImage {...props} />;
};

export default ProfilePicture;
