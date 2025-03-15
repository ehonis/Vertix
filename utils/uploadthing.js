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
                if (file.name.toLowerCase().endsWith('.heic')) {
                  try {
                    const convertedBlob = await heic2any({
                      blob: file,
                      toType: 'image/jpeg',
                      quality: 0.8,
                    });

                    return new File(
                      [convertedBlob],
                      file.name.replace('.heic', '.jpg'),
                      { type: 'image/jpeg' }
                    );
                  } catch (error) {
                    console.error('Error converting HEIC:', error);
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
