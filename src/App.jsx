
import { useEffect, useState } from "react";
import { useNotes } from "./NotesContext.jsx";

function App() {
  const {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    toggleArchive,
    searchNotes,
    fetchNotes,
  } = useNotes();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState("bg-yellow-100");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [showArchive, setShowArchive] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (content.trim() === "") {
      alert("Please write something");
      return;
    }

    try {
      if (editId !== null) {
        await updateNote(editId, {
          title,
          content,
          color,
        });
      } else {
        await createNote({
          title,
          content,
          color,
        });
      }

      cancelEdit();
    } catch (err) {
      alert("Unable to save note. Please try again.");
    }
  }

  function editNote(note) {
    setTitle(note.title);
    setContent(note.content);
    setColor(note.color);
    setEditId(note.id);
  }

  async function handleDelete(id) {
    try {
      await deleteNote(id);
    } catch (err) {
      alert("Unable to delete note. Please try again.");
    }
  }

  async function handleArchive(id) {
    try {
      await toggleArchive(id);
    } catch (err) {
      alert("Unable to archive note. Please try again.");
    }
  }

  function cancelEdit() {
    setEditId(null);
    setTitle("");
    setContent("");
    setColor("bg-yellow-100");
  }

  let displayedNotes = searchNotes(search).filter(
    (note) => Boolean(note.archived) === showArchive
  );

  if (sort === "oldest") {
    displayedNotes = [...displayedNotes].reverse();
  }

  return (
    <div className="min-h-screen bg-gray-100 p-5">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-5">
          Notes App
        </h1>

        {error && (
          <p className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white p-5 rounded-lg"
        >
          <input
            type="text"
            placeholder="Title"
            value={title}
            maxLength={100}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full border p-2 rounded"
          />

          <textarea
            placeholder="Write your note..."
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="w-full border p-2 rounded mt-3 h-28"
          />

          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={() => setColor("bg-yellow-100")}
              className="w-7 h-7 rounded-full bg-yellow-100 border"
            />

            <button
              type="button"
              onClick={() => setColor("bg-pink-100")}
              className="w-7 h-7 rounded-full bg-pink-100 border"
            />

            <button
              type="button"
              onClick={() => setColor("bg-blue-100")}
              className="w-7 h-7 rounded-full bg-blue-100 border"
            />

            <button
              type="button"
              onClick={() => setColor("bg-green-100")}
              className="w-7 h-7 rounded-full bg-green-100 border"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded mt-4 disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : editId !== null
                ? "Update"
                : "Add Note"}
          </button>

          {editId !== null && (
            <button
              type="button"
              onClick={cancelEdit}
              className="bg-gray-400 text-white px-4 py-2 rounded mt-4 ml-2"
            >
              Cancel
            </button>
          )}
        </form>

        <input
          type="text"
          placeholder="Search notes..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full border p-2 rounded mt-5"
        />

        <div className="flex gap-3 mt-3">
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="border p-2 rounded"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>

          <button
            type="button"
            onClick={() => setShowArchive(!showArchive)}
            className="bg-gray-700 text-white px-4 py-2 rounded"
          >
            {showArchive ? "View Notes" : "View Archive"}
          </button>
        </div>

        {loading && notes.length === 0 && (
          <p className="text-center mt-5">Loading notes...</p>
        )}

        {!loading && displayedNotes.length === 0 && (
          <p className="text-gray-500 mt-5">
            No notes found.
          </p>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {displayedNotes.map((note) => (
            <div
              key={note.id}
              className={`p-5 rounded-lg ${note.color}`}
            >
              <h2 className="text-xl font-bold">
                {note.title || "Untitled"}
              </h2>

              <p className="mt-2">{note.content}</p>

              <p className="text-sm text-gray-500 mt-3">
                Created:{" "}
                {note.createdAt
                  ? new Date(note.createdAt).toLocaleDateString()
                  : "Unknown"}
              </p>

              <div className="flex gap-2 mt-4 flex-wrap">
                <button
                  type="button"
                  onClick={() => editNote(note)}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleArchive(note.id)}
                  className="bg-gray-700 text-white px-3 py-1 rounded"
                >
                  {note.archived ? "Unarchive" : "Archive"}
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(note.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;