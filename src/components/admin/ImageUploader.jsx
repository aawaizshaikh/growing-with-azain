import { useRef, useState } from "react";

export default function ImageUploader({
  label = "Cover Image",
  onImageSelect,
}) {
  const inputRef = useRef(null);

  const [preview, setPreview] = useState(null);

  function handleImage(e) {
    const file = e.target.files[0];

    if (!file) return;

    setPreview(URL.createObjectURL(file));

    if (onImageSelect) {
      onImageSelect(file);
    }
  }

  return (
    <div className="mt-8">

      <label className="block mb-3 font-semibold text-lg">
        {label}
      </label>

      <div
        onClick={() => inputRef.current.click()}
        className="border-2 border-dashed border-[#8FAE7A] rounded-3xl p-8 cursor-pointer hover:bg-[#F9F7F2] transition"
      >
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="mx-auto rounded-2xl max-h-72 object-cover"
          />
        ) : (
          <div className="text-center">

            <div className="text-6xl mb-3">
                📷
            </div>

            <h3 className="text-xl font-semibold">
              Click to upload
            </h3>

            <p className="text-gray-500 mt-2">
              JPG, PNG or WEBP
            </p>

          </div>
        )}

      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleImage}
        className="hidden"
      />

    </div>
  );
}