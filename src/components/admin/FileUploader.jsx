import { useEffect, useRef, useState } from "react";
import { isVideoMedia } from "../../utils/mediaHelpers";
import { getCardImageUrl } from "../../utils/supabaseImageUrl";

export default function FileUploader({
  label = "Upload",
  multiple = false,
  accept = "image/*",
  onChange,

  // Existing uploaded files
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
      isVideo: file.type.startsWith("video/"),
    }));

    if (multiple) {
      const updated = [...files, ...previews];

      setFiles(updated);

      onChange?.(
        updated.map((item) => item.file)
      );
    } else {
      setFiles(previews);

      onChange?.(selected[0]);
    }

    /*
    Allow selecting the same file again later.
    */
    e.target.value = "";
  }

  function removeNewImage(index) {
    const item = files[index];

    if (item?.preview) {
      URL.revokeObjectURL(item.preview);
    }

    const updated = files.filter(
      (_, i) => i !== index
    );

    setFiles(updated);

    if (multiple) {
      onChange?.(
        updated.map((item) => item.file)
      );
    } else {
      onChange?.(null);
    }
  }

  function removeExistingImage(index) {
    const updated = existing.filter(
      (_, i) => i !== index
    );

    setExisting(updated);
  }

  return (
    <div className="mt-8">

      <label className="block text-lg font-semibold mb-3">
        {label}
      </label>

      <div
        onClick={() =>
          inputRef.current?.click()
        }
        className="border-2 border-dashed border-[#8FAE7A] rounded-3xl p-8 cursor-pointer hover:bg-[#F9F7F2] transition"
      >
        <div className="text-center">

          <div className="text-6xl mb-3">
            {accept.includes("video")
              ? "📷 🎥"
              : "📷"}
          </div>

          <h3 className="text-xl font-semibold">
            Click to Upload
          </h3>

          <p className="text-gray-500 mt-2">
            {accept.includes("video")
              ? "JPG • PNG • WEBP • MP4 • MOV • WEBM"
              : "JPG • PNG • WEBP"}
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

      {/* Existing Files */}

      {existing.length > 0 && (
        <>
          <h4 className="mt-6 mb-3 font-semibold">
            Existing Files
          </h4>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            {existing.map(
              (file, index) => (
                <div
                  key={index}
                  className="relative"
                >

                  {isVideoMedia(file) ? (
                    <video
                      src={file}
                      className="rounded-xl h-36 w-full object-cover"
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={getCardImageUrl(file)}
                      alt=""
                      className="rounded-xl h-36 w-full object-cover"
                    />
                  )}

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
              )
            )}

          </div>
        </>
      )}

      {/* New Files */}

      {files.length > 0 && (
        <>
          <h4 className="mt-6 mb-3 font-semibold">
            New Files
          </h4>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            {files.map(
              (item, index) => (
                <div
                  key={index}
                  className="relative"
                >

                  {item.isVideo ? (
                    <video
                      src={item.preview}
                      className="rounded-xl h-36 w-full object-cover"
                      muted
                      playsInline
                      controls
                    />
                  ) : (
                    <img
                      src={item.preview}
                      alt=""
                      className="rounded-xl h-36 w-full object-cover"
                    />
                  )}

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
              )
            )}

          </div>
        </>
      )}

    </div>
  );
}