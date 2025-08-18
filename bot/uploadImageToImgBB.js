// uploadImageToImgBB.js
export const uploadImageToImgBB = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const apiKey = '6e61467d00c5193604e4bfd5aea70c5d';

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData
    });

    const data = await res.json();
    if (data.success) {
        return data.data.url;
    } else {
        throw new Error('Rasm yuklanmadi');
    }
};
