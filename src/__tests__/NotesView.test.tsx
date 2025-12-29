import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import App from '../App';

describe('NotesView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(localStorage.getItem).mockReturnValue(null);
  });

  const navigateToNotes = async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText('Unload Brain'));
    return user;
  };

  it('renders the notes view with header', async () => {
    await navigateToNotes();
    expect(screen.getByText('External Brain')).toBeInTheDocument();
  });

  it('displays textarea with placeholder', async () => {
    await navigateToNotes();
    expect(
      screen.getByPlaceholderText("Don't hold it in your head..."),
    ).toBeInTheDocument();
  });

  it('displays Dictate and Save buttons', async () => {
    await navigateToNotes();
    expect(screen.getByText('Dictate')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('can type in the textarea', async () => {
    const user = await navigateToNotes();

    const textarea = screen.getByPlaceholderText(
      "Don't hold it in your head...",
    );
    await user.type(textarea, 'Remember to rest');

    expect(textarea).toHaveValue('Remember to rest');
  });

  it('adds a note when Save is clicked with text', async () => {
    const user = await navigateToNotes();

    const textarea = screen.getByPlaceholderText(
      "Don't hold it in your head...",
    );
    await user.type(textarea, 'Drink water');
    await user.click(screen.getByText('Save'));

    expect(screen.getByText('Drink water')).toBeInTheDocument();
    expect(textarea).toHaveValue('');
  });

  it('does not add empty notes', async () => {
    const user = await navigateToNotes();

    const notesBefore = screen
      .queryAllByRole('button', { name: '' })
      .filter((btn) => btn.className.includes('hover:text-red'));

    await user.click(screen.getByText('Save'));

    const notesAfter = screen
      .queryAllByRole('button', { name: '' })
      .filter((btn) => btn.className.includes('hover:text-red'));

    expect(notesAfter.length).toBe(notesBefore.length);
  });

  it('deletes a note when delete button is clicked', async () => {
    const user = await navigateToNotes();

    // Add a note first
    const textarea = screen.getByPlaceholderText(
      "Don't hold it in your head...",
    );
    await user.type(textarea, 'Test note to delete');
    await user.click(screen.getByText('Save'));

    expect(screen.getByText('Test note to delete')).toBeInTheDocument();

    // Find and click delete button (the trash icon button)
    const deleteButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.className.includes('hover:text-red'));
    await user.click(deleteButtons[0]);

    expect(screen.queryByText('Test note to delete')).not.toBeInTheDocument();
  });

  it('persists notes to localStorage', async () => {
    const user = await navigateToNotes();

    const textarea = screen.getByPlaceholderText(
      "Don't hold it in your head...",
    );
    await user.type(textarea, 'Persistent note');
    await user.click(screen.getByText('Save'));

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'recovery_notes',
      expect.stringContaining('Persistent note'),
    );
  });

  it('loads notes from localStorage on mount', async () => {
    const savedNotes = JSON.stringify([
      { id: 1, text: 'Previously saved note' },
    ]);
    vi.mocked(localStorage.getItem).mockReturnValue(savedNotes);

    await navigateToNotes();

    expect(screen.getByText('Previously saved note')).toBeInTheDocument();
  });

  it('shows alert when Dictate is clicked and speech recognition is not supported', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const user = await navigateToNotes();

    await user.click(screen.getByText('Dictate'));

    expect(alertSpy).toHaveBeenCalledWith(
      'Dictation not supported in this browser',
    );
    alertSpy.mockRestore();
  });
});
