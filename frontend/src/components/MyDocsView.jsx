import { useEffect, useState } from "react";
import { Status } from "./Status";
import { getDocumentFileURL } from "../api/documents";
import { ReviewerPicker } from "./ReviewerPicker";

export function MyDocsView({ myDocs, loading, error, session, onSession, users }) {
  const [docs, setDocs] = useState([]);
  const [previewURL, setPreviewURL] = useState(null);
  const [previewMime, setPreviewMime] = useState("");
  const [previewName, setPreviewName] = useState("");

  useEffect(() => { setDocs(myDocs); }, [myDocs]);

  const handlePreview = async (doc) => {
    try {
      const url = await getDocumentFileURL(doc.id, session, onSession);
      setPreviewURL(url);
      setPreviewMime(doc.mime_type);
      setPreviewName(doc.title || doc.filename);
    } catch {
      alert("Could not load file preview.");
    }
  };

  const handleDocUpdated = (updatedDoc) => {
    setDocs((prev) => prev.map((d) => d.id === updatedDoc.id ? updatedDoc : d));
  };

  if (loading) return <div className="py-12 px-6 text-center text-[#64748b]">Loading your documents...</div>;
  if (error)   return <div className="py-12 px-6 text-center text-[#64748b]">{error}</div>;
  if (!docs.length) return (
    <div className="py-12 px-6 text-center text-[#64748b]">
      <p>You haven't uploaded any documents yet.</p>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2>My Documents</h2>
          <p>Documents you have uploaded. Assign a reviewer to start the approval process.</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-4">
        {docs.map((doc) => (
          <div key={doc.id} className="bg-[#1c1f26] border border-[#2e3340] rounded-[10px] px-4 py-3.5 flex items-center justify-between gap-4">
            {/* Doc info */}
            <div className="flex items-center gap-3 min-w-0">
              {/* doc-icon kept in CSS — glass bg */}
              <span className="doc-icon">
                {doc.mime_type === "application/pdf" ? "▤" : "›_"}
              </span>

              <div className="flex flex-col gap-0.5">
                <b className="text-[0.9rem] text-[#e2e8f0]">{doc.title || doc.filename}</b>
                <small className="text-xs text-[#64748b]">
                  {doc.filename} · {doc.mime_type}
                </small>
                {doc.tags && doc.tags.length > 0 && (
                  <span className="flex flex-wrap gap-[5px] mt-0.5">
                    {doc.tags.map((tag) => (
                      <span key={tag.id} className="doc-tag-chip">#{tag.name}</span>
                    ))}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Status label={doc.status} />
              <button className="secondary-action" onClick={() => handlePreview(doc)}>
                View
              </button>
              {(doc.status === "draft" || doc.status === "rejected" || doc.status === "in_review") && (
                <ReviewerPicker
                  doc={doc}
                  users={users}
                  session={session}
                  onSession={onSession}
                  onUpdated={handleDocUpdated}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* File preview modal */}
      {previewURL && (
        <div
          className="fixed inset-0 bg-black/70 z-[9000] flex items-center justify-center"
          onClick={() => setPreviewURL(null)}
        >
          <div
            className="bg-[#1c1f26] border border-[#2e3340] rounded-xl w-[80vw] h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2e3340] text-[0.9rem] text-[#e2e8f0]">
              <span>{previewName}</span>
              <div className="flex gap-2">
                <a className="secondary-action" href={previewURL} download={previewName}>
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

            {previewMime === "application/pdf" ? (
              <iframe src={previewURL} title={previewName} className="flex-1 w-full border-0 bg-white" />
            ) : (
              <MarkdownPreview url={previewURL} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MarkdownPreview({ url }) {
  const [text, setText] = useState("");

  useEffect(() => {
    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load file");
        return response.text();
      })
      .then(setText)
      .catch(() => setText("Could not load file."));
  }, [url]);

  return (
    <pre className="flex-1 p-6 overflow-auto text-[0.9rem] text-[#94a3b8] whitespace-pre-wrap break-words">
      {text}
    </pre>
  );
}