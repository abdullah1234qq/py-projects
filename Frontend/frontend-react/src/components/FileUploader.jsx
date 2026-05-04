import { useRef, useState } from "react";

import { UploadIcon } from "./Icons.jsx";

export function FileUploader({ accept, label, helper, onFile }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  function selectFile(file) {
    if (file) {
      onFile(file);
    }
  }

  return (
    <div
      className={`file-uploader ${dragging ? "is-dragging" : ""}`}
      onClick={() => inputRef.current?.click()}
      onDragEnter={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        selectFile(event.dataTransfer.files?.[0]);
      }}
      role="button"
      tabIndex={0}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(event) => selectFile(event.target.files?.[0])}
      />
      <UploadIcon />
      <strong>{label}</strong>
      <span>{helper}</span>
    </div>
  );
}
