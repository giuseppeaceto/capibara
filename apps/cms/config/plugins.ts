export default ({ env }) => {
  // Usa Cloudinary solo se tutte le variabili d'ambiente sono configurate
  const useCloudinary = 
    env('CLOUDINARY_NAME') && 
    env('CLOUDINARY_KEY') && 
    env('CLOUDINARY_SECRET');

  return {
    upload: {
      config: {
        provider: useCloudinary ? 'cloudinary' : 'local',
        providerOptions: useCloudinary ? {
          cloud_name: env('CLOUDINARY_NAME'),
          api_key: env('CLOUDINARY_KEY'),
          api_secret: env('CLOUDINARY_SECRET'),
        } : {},
        actionOptions: {
          upload: {},
          uploadStream: {},
          delete: {},
        },
      },
    },
  };
};

