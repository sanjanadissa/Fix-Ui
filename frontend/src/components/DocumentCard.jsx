import { useEffect, useState } from "react";
import { Status } from "./Status";
import { getDocumentFileURL } from "../api/documents";

// DocumentCard renders a single document row in the search results list.
export function DocumentCard({ doc, onClick, session, onSession }) {
  const title = doc.title || doc.filename || "Untitled document";
  const type = doc.type || getDocumentType(doc.mime_type);
  const status = formatStatus(doc.status);
  const project = doc.project || doc.project_id || "Unassigned";
  const meta = doc.meta || formatUpdatedAt(doc.updated_at);
  const excerpt = doc.excerpt || doc.filename || "No description available.";
  const [previewURL, setPreviewURL] = useState(null);
  const [previewError, setPreviewError] = useState("");

  const handlePreview = async () => {
    setPreviewError("");
    try {
      const url = await getDocumentFileURL(doc.id, session, onSession);
      setPreviewURL(url);
    } catch {
      setPreviewError("Could not load file preview.");
    }
  };

  useEffect(() => {
    return () => {
      if (previewURL) URL.revokeObjectURL(previewURL);
    };
  }, [previewURL]);

  return (
    <>
      {/* document-card kept in CSS — glassmorphism + hover transform */}
      <div
        className="document-card"
        onClick={(event) => { event.stopPropagation(); handlePreview(); }}
        role="button"
        tabIndex={0}
      >
        {/* doc-icon kept in CSS — glass bg + border */}
        <span className="doc-icon">{doc.icon || getDocumentIcon(doc.mime_type)}</span>

        <span className="flex flex-1 min-w-0 flex-col gap-[5px]">
          <span className="flex items-center gap-[9px] flex-wrap">
            <b>{title}</b>
            <Status label={status} />
          </span>
          {/* doc-excerpt kept in CSS — -webkit-line-clamp */}
          <span className="doc-excerpt">{excerpt}</span>
          {doc.tags && doc.tags.length > 0 && (
            <span className="flex flex-wrap gap-[5px] mt-0.5">
              {doc.tags.map((tag) => (
                // doc-tag-chip kept in CSS — complex rgba + hover
                <span key={tag.id} className="doc-tag-chip">#{tag.name}</span>
              ))}
            </span>
          )}
          {/* doc-meta kept in CSS — DM Mono font */}
          <span className="doc-meta">
            {type} · {project} · {meta}
          </span>
        </span>

        {/* secondary-action kept in CSS — glass button style */}
        <button
          className="secondary-action"
          onClick={(event) => { event.stopPropagation(); handlePreview(); }}
        >
          View
        </button>
      </div>

      {previewError && (
        <div className="py-12 px-6 text-center text-[#64748b]">{previewError}</div>
      )}

      {previewURL && (
        <div
          className="fixed inset-0 bg-black/70 z-[9000] flex items-center justify-center"
          onClick={() => setPreviewURL(null)}
        >
          <div
            className="bg-[#1c1f26] border border-[#2e3340] rounded-xl w-[80vw] h-[85vh] flex flex-col overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2e3340] text-[0.9rem] text-[#e2e8f0]">
              <span>{title}</span>
              <div className="flex gap-2">
                <a className="secondary-action" href={previewURL} download={title}>
                  Download
                </a>
                <button
                  className="bg-transparent border-0 text-[#4a5568] text-[1.1rem] cursor-pointer leading-none p-0 flex-shrink-0 transition-colors hover:text-[#94a3b8]"
                  onClick={() => setPreviewURL(null)}
                >
                  ×
                </button>
              </div>
            </div>

            {doc.mime_type === "application/pdf" ? (
              <iframe
                src={previewURL}
                title={title}
                className="flex-1 w-full border-0 bg-white"
              />
            ) : (
              <MarkdownPreview url={previewURL} />
            )}
          </div>
        </div>
      )}
    </>
  );
}

function MarkdownPreview({ url }) {
  const [text, setText] = useState("");

  useEffect(() => {
    let active = true;
    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load file");
        return response.text();
      })
      .then((content) => { if (active) setText(content); })
      .catch(() => { if (active) setText("Could not load file."); });

    return () => { active = false; };
  }, [url]);

  return (
    <pre className="flex-1 p-6 overflow-auto text-[0.9rem] text-[#94a3b8] whitespace-pre-wrap break-words">
      {text}
    </pre>
  );
}

function getDocumentType(mimeType) {
  if (mimeType === "application/pdf") return "PDF";
  if (mimeType === "text/markdown") return "Markdown";
  return "Document";
}

function getDocumentIcon(mimeType) {
  return mimeType === "application/pdf" ? "▤" : "›_";
}

function formatStatus(status) {
  if (!status) return "Unknown";
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatUpdatedAt(updatedAt) {
  if (!updatedAt) return "No update date";
  return `updated ${new Date(updatedAt).toLocaleDateString()}`;
}
