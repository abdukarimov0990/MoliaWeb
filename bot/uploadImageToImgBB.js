export default function uploadImageToImgBB(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      const base64Image = reader.result.split(',')[1]; // "data:image/png;base64,..."
      const formData = new FormData();
      formData.append("key", process.env.REACT_APP_IMGBB_API_KEY); // .env da REACT_APP_ prefiksi bilan
      formData.append("image", base64Image);

      fetch("https://api.imgbb.com/1/upload", {
        method: "POST",
        body: formData,
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data.url) {
            resolve(data.data.url);
          } else {
            reject(new Error("Upload failed: " + JSON.stringify(data)));
          }
        })
        .catch(err => reject(err));
    };

    reader.onerror = () => reject(new Error("File reading failed"));
    reader.readAsDataURL(file);
  });
}
