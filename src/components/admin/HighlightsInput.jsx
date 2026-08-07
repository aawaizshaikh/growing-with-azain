import { useState } from "react";

export default function HighlightsInput({ onChange }) {
  const [input, setInput] = useState("");
  const [highlights, setHighlights] = useState([]);

  function addHighlight() {
    const value = input.trim();

    if (!value) return;

    const updated = [...highlights, value];

    setHighlights(updated);
    onChange(updated);

    setInput("");
  }

  function removeHighlight(index) {
    const updated = highlights.filter((_, i) => i !== index);

    setHighlights(updated);
    onChange(updated);
  }

  return (
    <div className="mt-8">

      <label className="block text-lg font-semibold mb-3">
        Highlights
      </label>

      <div className="flex gap-3">

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border rounded-xl px-4 py-3"
          placeholder="Add Highlight..."
        />

        <button
          type="button"
          onClick={addHighlight}
          className="bg-[#8FAE7A] text-white px-6 rounded-xl"
        >
          Add
        </button>

      </div>

      <div className="mt-5 flex flex-wrap gap-3">

        {highlights.map((item, index) => (

          <div
            key={index}
            className="bg-[#EEF7E8] rounded-full px-5 py-2 flex items-center gap-3"
          >
            <span>{item}</span>

            <button
              type="button"
              onClick={() => removeHighlight(index)}
              className="text-red-500 font-bold"
            >
              ×
            </button>

          </div>

        ))}

      </div>

    </div>
  );
}