export function loadGallery(folder) {
  const images = import.meta.glob(
    "../assets/images/**/*.{jpg,jpeg,png,JPG,JPEG,PNG}",
    {
      eager: true,
      import: "default",
    }
  );

  const gallery = Object.entries(images)
    .filter(([path]) => path.includes(`/${folder}/`))
    .sort((a, b) => {
      const getNumber = (path) => {
        const match = path.match(/(\d+)\.(jpg|jpeg|png)$/i);
        return match ? Number(match[1]) : 0;
      };

      return getNumber(a[0]) - getNumber(b[0]);
    })
    .map(([, image]) => image);

  return gallery;
}