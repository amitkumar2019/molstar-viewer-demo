import { useState, useRef, useCallback } from "react";
import MolstarViewer from "./components/MolstarViewer";
import "./App.css";
import 'react-toastify/dist/ReactToastify.css';



function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export default function App() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [saveEnabled, setSaveEnabled] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = useCallback((file) => {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (ext === "pdb" || ext === "cif") {
      setUploadedFile(file);
    } else {
      alert("Please upload a .pdb or .cif file.");
    }
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };
  const handleChange = (e) => handleFile(e.target.files[0]);

  const reset = () => {
    setUploadedFile(null);
    setShowViewer(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="app-shell">
      {!showViewer ? (
        <div className="upload-card">
          <div className="upload-header">
            <h1>Open structure file</h1>
            <p>Visualise molecular structures from PDB or CIF files</p>
          </div>

          <div
            className={`drop-zone${dragging ? " dragging" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !uploadedFile && fileInputRef.current?.click()}
          >
            {!uploadedFile ? (
              <>
                <div className="dz-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 15V4M12 4L8.5 7.5M12 4L15.5 7.5"
                      stroke="#6b6860"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4 17V19C4 19.55 4.45 20 5 20H19C19.55 20 20 19.55 20 19V17"
                      stroke="#b0ada6"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="dz-text">
                  <p>{dragging ? "Drop to load" : "Drag file here"}</p>
                  <span>
                    or{" "}
                    <em onClick={() => fileInputRef.current?.click()}>
                      browse
                    </em>{" "}
                    from your computer
                  </span>
                </div>
                <div className="dz-formats">
                  <span>.pdb</span>
                  <span>.cif</span>
                </div>
              </>
            ) : (
              <div className="file-row" style={{ width: "100%", margin: 0 }}>
                <div className="file-row-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 12L11 14L15 10"
                      stroke="#2d7a4f"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="#2d7a4f"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
                <div className="file-row-info">
                  <div className="file-row-name">{uploadedFile.name}</div>
                  <div className="file-row-meta">
                    {formatBytes(uploadedFile.size)} ·{" "}
                    {uploadedFile.name.split(".").pop().toUpperCase()}
                  </div>
                </div>
                <button
                  className="file-row-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    reset();
                  }}
                  title="Remove"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M18 6L6 18M6 6L18 18"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {uploadedFile && (
            <button className="open-btn" onClick={() => setShowViewer(true)}>
              Open in viewer
            </button>
          )}
        </div>
      ) : (
        <MolstarViewer
          uploadedFile={uploadedFile}
          handleSaveButton={(enabled) => setSaveEnabled(enabled)}
        />
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdb,.cif"
        onChange={handleChange}
      />
    </div>
  );
}
