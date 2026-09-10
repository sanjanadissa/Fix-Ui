import { useState } from "react";
import { assignReviewer, removeReviewer } from "../api/documents";

export function ReviewerPicker({ doc, users, session, onSession, onUpdated }) {
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const currentReviewer = users.find((u) => u.id === doc.reviewer_id);

  const handleAssign = async (userId) => {
    setLoading(true);
    setError("");
    try {
      await assignReviewer(doc.id, userId, session, onSession);
      setOpen(false);
      onUpdated({ ...doc, reviewer_id: userId, status: "in_review" });
    } catch (e) {
      setError(e.message || "Could not assign reviewer.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    setError("");
    try {
      await removeReviewer(doc.id, session, onSession);
      setOpen(false);
      onUpdated({ ...doc, reviewer_id: "", status: "draft" });
    } catch (e) {
      setError(e.message || "Could not remove reviewer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Show current reviewer or assign button */}
      {currentReviewer ? (
        <div className="flex items-center gap-2 bg-[#1c2a1c] border border-[#3a5a3a] rounded-full py-1 px-2.5 pl-1">
          <UserAvatar user={currentReviewer} size={28} />
          <span className="text-[0.82rem] text-[#e2e8f0] max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap">
            {currentReviewer.name || currentReviewer.email}
          </span>
          <button
            className="bg-transparent border-0 text-[#6fcf6f] text-[0.78rem] cursor-pointer p-0"
            onClick={() => setOpen((o) => !o)}
            disabled={loading}
          >
            Change
          </button>
        </div>
      ) : (
        <button
          className="primary-action"
          onClick={() => setOpen((o) => !o)}
          disabled={loading}
        >
          Assign reviewer
        </button>
      )}

      {/* Dropdown picker — keeps reviewer-dropdown CSS for shadow */}
      {open && (
        <div className="reviewer-dropdown">
          <div className="flex justify-between items-center px-4 py-3 border-b border-[#2e3340] text-[0.82rem] font-semibold text-[#94a3b8]">
            <span>Select reviewer</span>
            <button
              className="bg-transparent border-0 text-[#4a5568] text-[1.1rem] cursor-pointer leading-none p-0 flex-shrink-0 transition-colors hover:text-[#94a3b8]"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto p-2 flex flex-col gap-1">
            {users.map((user) => (
              <button
                key={user.id}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg border-0 cursor-pointer w-full text-left transition-colors duration-150 disabled:opacity-50 ${
                  user.id === doc.reviewer_id
                    ? "bg-[#1c2a1c] cursor-default"
                    : "bg-transparent hover:bg-[#2e3340]"
                }`}
                onClick={() => handleAssign(user.id)}
                disabled={loading || user.id === doc.reviewer_id}
              >
                <UserAvatar user={user} size={32} />
                <div className="flex flex-col gap-px min-w-0">
                  <span className="text-[0.85rem] text-[#e2e8f0] font-medium">
                    {user.name || "Unknown"}
                  </span>
                  <span className="text-xs text-[#64748b] overflow-hidden text-ellipsis whitespace-nowrap">
                    {user.email}
                  </span>
                </div>
                {user.id === doc.reviewer_id && (
                  <span className="ml-auto text-[0.7rem] text-[#6fcf6f] border border-[#3a5a3a] rounded-[10px] px-1.5 py-px flex-shrink-0">
                    Current
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Remove reviewer option */}
          {doc.reviewer_id && (
            <button
              className="w-full px-4 py-2.5 bg-transparent border-0 border-t border-[#2e3340] text-[#ef4444] text-[0.82rem] cursor-pointer text-left transition-colors hover:bg-[#2a1c1c]"
              onClick={handleRemove}
              disabled={loading}
            >
              Remove reviewer
            </button>
          )}

          {error && <div className="error-message">{error}</div>}
        </div>
      )}
    </div>
  );
}

// UserAvatar shows picture if available, initials otherwise
export function UserAvatar({ user, size = 32 }) {
  const initials = (user.name || user.email || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return user.picture_url ? (
    <img
      src={user.picture_url}
      alt={user.name}
      className="object-cover flex-shrink-0"
      style={{ width: size, height: size, borderRadius: "50%" }}
      onError={(e) => { e.target.style.display = "none"; }}
    />
  ) : (
    <div
      className="rounded-full bg-[#2e3340] text-[#94a3b8] flex items-center justify-center font-semibold flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}