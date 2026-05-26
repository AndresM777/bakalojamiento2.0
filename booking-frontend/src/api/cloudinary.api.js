export const cloudinaryApi = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'alojamiento_unsigned');

    const response = await fetch('https://api.cloudinary.com/v1_1/dfyvvcvw3/image/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Error al subir imagen a Cloudinary');
    }

    const data = await response.json();
    return data.secure_url;
  }
};
