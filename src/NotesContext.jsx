
import { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";

const API_URL = "http://localhost:3001/notes";

const NotesContext = createContext();

export function NotesProvider({ children }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(API_URL);
      setNotes(response.data);
    } catch (err) {
      setError("Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, []);

  const createNote = async (note) => {
    setLoading(true);
    setError(null);

    try {
      const now = new Date().toISOString();

      const response = await axios.post(API_URL, {
        ...note,
        tags: note.tags || [],
        archived: false,
        stock: note.stock ?? 0,
        createdAt: now,
        updatedAt: now
      });

      setNotes((prev) => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      setError("Failed to create note");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateNote = async (id, updates) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.patch(`${API_URL}/${id}`, {
        ...updates,
        updatedAt: new Date().toISOString()
      });

      setNotes((prev) =>
        prev.map((note) =>
          String(note.id) === String(id)
            ? response.data
            : note
        )
      );

      return response.data;
    } catch (err) {
      setError("Failed to update note");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id) => {
    setLoading(true);
    setError(null);

    try {
      await axios.delete(`${API_URL}/${id}`);

      setNotes((prev) =>
        prev.filter((note) => String(note.id) !== String(id))
      );
    } catch (err) {
      setError("Failed to delete note");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleArchive = async (id) => {
    const note = notes.find(
      (item) => String(item.id) === String(id)
    );

    if (!note) return;

    await updateNote(id, {
      archived: !note.archived
    });
  };

  const searchNotes = (query) => {
    const normalizedQuery = query.toLowerCase().trim();

    return notes.filter((note) =>
      `${note.title || ""} ${note.content || ""}`
        .toLowerCase()
        .includes(normalizedQuery)
    );
  };

  return (
    <NotesContext.Provider
      value={{
        notes,
        loading,
        error,
        createNote,
        updateNote,
        deleteNote,
        toggleArchive,
        searchNotes,
        fetchNotes
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  return useContext(NotesContext);
}