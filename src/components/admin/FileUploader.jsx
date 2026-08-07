import { useEffect, useRef, useState } from "react";

export default function FileUploader({
  label = "Upload",
  multiple = false,
  accept = "image/*",
  onChange,

  // NEW
  existingFiles = [],
}) {
  const inputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [existing, setExisting] = useState([]);

  useEffect(() => {
    if (multiple) {
      setExisting(existingFiles || []);
    } else {
      setExisting(
        existingFiles && existingFiles.length
          ? [existingFiles[0]]
          : []
      );
    }
  }, [existingFiles, multiple]);

  function handleSelect(e) {
    const selected = Array.from(e.target.files);

    if (!selected.length) return;

    const previews = selected.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    if (multiple) {
      const updated = [...files, ...previews];

      setFiles(updated);

      onChange?.(updated.map((f) => f.file));
    } else {
      setFiles(previews);

      onChange?.(selected[0]);
    }
  }

  function removeNewImage(index) {
    const updated = files.filter((_, i) => i !== index);

    setFiles(updated);

    if (multiple) {
      onChange?.(updated.map((f) => f.file));
    } else {
      onChange?.(null);
    }
  }

  function removeExistingImage(index) {
    const updated = existing.filter((_, i) => i !== index);

    setExisting(updated);
  }

  return (
    <div className="mt-8">

      <label className="block text-lg font-semibold mb-3">
        {label}
      </label>

      <div
        onClick={() => inputRef.current.click()}
        className="border-2 border-dashed border-[#8FAE7A] rounded-3xl p-8 cursor-pointer hover:bg-[#F9F7F2] transition"
      >
        <div className="text-center">

          <div className="text-6xl mb-3">
            📷
          </div>

          <h3 className="text-xl font-semibold">
            Click to Upload
          </h3>

          <p className="text-gray-500 mt-2">
            JPG • PNG • WEBP
          </p>

        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleSelect}
        className="hidden"
      />

      {/* Existing Images */}

      {existing.length > 0 && (
        <>
          <h4 className="mt-6 mb-3 font-semibold">
            Existing Images
          </h4>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            {existing.map((image, index) => (

              <div
                key={index}
                className="relative"
              >

                <img
                  src={image}
                  className="rounded-xl h-36 w-full object-cover"
                />

                <button
                  type="button"
                  onClick={() =>
                    removeExistingImage(index)
                  }
                  className="absolute top-2 right-2 bg-red-500 text-white w-7 h-7 rounded-full"
                >
                  ×
                </button>

              </div>

            ))}

          </div>
        </>
      )}

      {/* New Images */}

      {files.length > 0 && (
        <>
          <h4 className="mt-6 mb-3 font-semibold">
            New Images
          </h4>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            {files.map((item, index) => (

              <div
                key={index}
                className="relative"
              >

                <img
                  src={item.preview}
                  className="rounded-xl h-36 w-full object-cover"
                />

                <button
                  type="button"
                  onClick={() =>
                    removeNewImage(index)
                  }
                  className="absolute top-2 right-2 bg-red-500 text-white w-7 h-7 rounded-full"
                >
                  ×
                </button>

              </div>

            ))}

          </div>
        </>
      )}

    </div>
  );
}