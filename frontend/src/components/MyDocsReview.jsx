import { useState } from "react";
import { approveDocument, rejectDocument, getDocumentFileURL } from "../api/documents";
import { Status } from "./Status";

export function ReviewView({ reviewDocs, loading, error, session, onSession, onDocActioned }) {
  const [processing, setProcessing] = useState(null);
  const [actionError, setActionError] = useState("");
  const [previewURL, setPreviewURL]   = useState(null);
  const [previewName, setPreviewName] = useState("");
  const [previewMime, setPreviewMime] = useState("");
  const [rejectNote, setRejectNote]   = useState("");
  const [rejectingDoc, setRejectingDoc] = useState(null);

  const handlePreview = async (doc) => {
    try {
      const url = await getDocumentFileURL(doc.id, session, onSession);
      setPreviewURL(url);
      setPreviewName(doc.title || doc.filename);
      setPreviewMime(doc.mime_type);
    } catch {
      setActionError("Could not load file preview.");
    }
  };

  const handleApprove = async (docId) => {
    setProcessing(docId);
    setActionError("");
    try {
      await approveDocument(docId, session, onSession);
      onDocActioned(docId);
    } catch (e) {
      setActionError(e.message || "Could not approve document.");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (docId) => {
    setProcessing(docId);
    setActionError("");
    try {
      await rejectDocument(docId, session, onSession);
      onDocActioned(docId);
      setRejectingDoc(null);
      setRejectNote("");
    } catch (e) {
      setActionError(e.message || "Could not reject document.");
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return <div className="py-12 px-6 text-center text-[#64748b]">Loading review queue...</div>;
  if (error)   return <div className="py-12 px-6 text-center text-[#64748b]">{error}</div>;
  if (!reviewDocs.length) return (
    <div className="py-12 px-6 text-center text-[#64748b]">
      <p>No documents assigned to you for review.</p>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2>Review Queue</h2>
          <p>Documents assigned to you. Review and approve or reject each one.</p>
        </div>
      </div>

      {actionError && <div className="error-message">{actionError}</div>}

      <div className="flex flex-col gap-3 mt-4">
        {reviewDocs.map((doc) => (
          <div key={doc.id} className="bg-[#1c1f26] border border-[#2e3340] rounded-[10px] px-4 py-3.5 flex items-center justify-between gap-4">

            <div className="flex items-center gap-3 min-w-0">
              <span className="doc-icon">
                {doc.mime_type === "application/pdf" ? "▤" : "›_"}
              </span>
              <div className="flex flex-col gap-0.5">
                <b className="text-[0.9rem] text-[#e2e8f0]">{doc.title || doc.filename}</b>
                <small className="text-xs text-[#64748b]">
                  {doc.filename} · uploaded by {doc.uploaded_by}
                </small>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Status label={doc.status} />
              <button className="secondary-action" onClick={() => handlePreview(doc)}>View</button>
              {/* approve-btn / reject-btn kept in CSS — semantic dark colors */}
              <button
                className="approve-btn"
                onClick={() => handleApprove(doc.id)}
                disabled={processing === doc.id}
              >
                {processing === doc.id ? "..." : "✓ Approve"}
              </button>
              <button
                className="reject-btn"
                onClick={() => setRejectingDoc(doc.id)}
                disabled={processing === doc.id}
              >
                ✕ Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reject confirmation dialog */}
      {rejectingDoc && (
        <div
          className="fixed inset-0 bg-black/70 z-[9000] flex items-center justify-center"
          onClick={() => setRejectingDoc(null)}
        >
          <div
            className="bg-[#1c1f26] border border-[#2e3340] rounded-xl p-6 w-[400px] flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[#e2e8f0] m-0">Reject document?</h3>
            <p className="text-[#94a3b8] text-[0.88rem] m-0">
              The document will be sent back to the uploader as rejected. The file is kept.
            </p>
            <textarea
              className="bg-[#0f1117] border border-[#2e3340] rounded-lg text-[#e2e8f0] p-2.5 text-[0.88rem] resize-y w-full box-border"
              placeholder="Reason for rejection (optional)"
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button className="secondary-action" onClick={() => setRejectingDoc(null)}>Cancel</button>
              <button
                className="reject-btn"
                onClick={() => handleReject(rejectingDoc)}
                disabled={processing === rejectingDoc}
              >
                {processing === rejectingDoc ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

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
                <a className="secondary-action" href={previewURL} download={previewName}>Download</a>
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
  const [text, setText] = useState("Loading...");
  useState(() => {
    fetch(url).then((r) => r.text()).then(setText).catch(() => setText("Could not load."));
  }, [url]);
  return (
    <pre className="flex-1 p-6 overflow-auto text-[0.9rem] text-[#94a3b8] whitespace-pre-wrap break-words">
      {text}
    </pre>
  );
}