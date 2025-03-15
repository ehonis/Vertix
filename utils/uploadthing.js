'use client';

import {
  generateUploadButton,
  generateUploadDropzone,
} from '@uploadthing/react';
import { useEffect, useState } from 'react';

const CustomUploadDropzoneComponent = ({ ...props }) => {
  const [Dropzone, setDropzone] = useState(null);

  useEffect(() => {
    const loadDropzone = async () => {
      const { generateUploadDropzone } = await import('@uploadthing/react');
      const heic2any = (await import('heic2any')).default;

      const CustomDropzone = generateUploadDropzone();

      const ModifiedDropzone = (props) => (
        <CustomDropzone
          {...props}
          onBeforeUploadBegin={async (files) => {
            const convertedFiles = await Promise.all(
              files.map(async (file) => {
                // Check if the file is HEIC or HEIF
                if (
                  file.name.toLowerCase().endsWith('.heic') ||
                  file.name.toLowerCase().endsWith('.heif')
                ) {
                  try {
                    const convertedBlob = await heic2any({
                      blob: file,
                      toType: 'image/jpeg',
                      quality: 0.8,
                    });

                    // Create a new file name with .jpg extension
                    const newName = file.name.replace(
                      /\.(heic|heif)$/i,
                      '.jpg'
                    );

                    return new File([convertedBlob], newName, {
                      type: 'image/jpeg',
                    });
                  } catch (error) {
                    console.error('Error converting HEIC/HEIF:', error);
                    return file;
                  }
                }
                return file;
              })
            );
            return convertedFiles;
          }}
        />
      );

      setDropzone(() => ModifiedDropzone);
    };

    loadDropzone();
  }, []);

  return Dropzone ? <Dropzone {...props} /> : <div>Loading...</div>;
};

export default CustomUploadDropzoneComponent;
