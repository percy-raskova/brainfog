import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import App from '../App';

describe('Privacy', () => {
  // Store original implementations for restoration
  let originalFetch: typeof global.fetch;
  let originalXMLHttpRequest: typeof XMLHttpRequest;
  let originalSendBeacon: typeof navigator.sendBeacon;
  let originalImage: typeof Image;

  // Spies and mocks
  let fetchSpy: ReturnType<typeof vi.fn>;
  let xhrOpenSpy: ReturnType<typeof vi.fn>;
  let sendBeaconSpy: ReturnType<typeof vi.fn>;
  let imageSpy: ReturnType<typeof vi.fn>;
  let createElementSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(localStorage.getItem).mockReturnValue(null);

    // Mock fetch
    originalFetch = global.fetch;
    fetchSpy = vi.fn();
    global.fetch = fetchSpy;

    // Mock XMLHttpRequest
    originalXMLHttpRequest = global.XMLHttpRequest;
    xhrOpenSpy = vi.fn();
    const MockXHR = vi.fn().mockImplementation(() => ({
      open: xhrOpenSpy,
      send: vi.fn(),
      setRequestHeader: vi.fn(),
      readyState: 4,
      status: 200,
      response: '',
      onreadystatechange: null,
      addEventListener: vi.fn(),
    }));
    global.XMLHttpRequest = MockXHR as unknown as typeof XMLHttpRequest;

    // Mock navigator.sendBeacon
    originalSendBeacon = navigator.sendBeacon;
    sendBeaconSpy = vi.fn();
    Object.defineProperty(navigator, 'sendBeacon', {
      value: sendBeaconSpy,
      writable: true,
      configurable: true,
    });

    // Mock Image constructor (for tracking pixels)
    originalImage = global.Image;
    imageSpy = vi.fn().mockImplementation(() => ({
      src: '',
      onload: null,
      onerror: null,
    }));
    global.Image = imageSpy as unknown as typeof Image;

    // Spy on document.createElement
    createElementSpy = vi.spyOn(document, 'createElement');
  });

  afterEach(() => {
    // Restore all mocks
    global.fetch = originalFetch;
    global.XMLHttpRequest = originalXMLHttpRequest;
    Object.defineProperty(navigator, 'sendBeacon', {
      value: originalSendBeacon,
      writable: true,
      configurable: true,
    });
    global.Image = originalImage;
    createElementSpy.mockRestore();
  });

  describe('No Network Calls', () => {
    it('does not call fetch when rendering the home screen', () => {
      render(<App />);

      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('does not call fetch when navigating to all views', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Navigate to Crash Mode and back
      await user.click(screen.getByText('I am Crashing'));
      await user.click(screen.getByText('Tap anywhere to exit'));

      // Navigate to Rest view
      await user.click(screen.getByText('Rest'));
      const restBackButton = screen
        .getAllByRole('button')
        .find((btn) => btn.className.includes('-ml-2'));
      await user.click(restBackButton!);

      // Navigate to Fuel view
      await user.click(screen.getByText('Fuel'));
      const fuelBackButton = screen
        .getAllByRole('button')
        .find((btn) => btn.className.includes('-ml-2'));
      await user.click(fuelBackButton!);

      // Navigate to Animals view
      await user.click(screen.getByText('Fuzzy Logic'));
      await user.click(screen.getByText('Tell me another'));
      const animalsBackButton = screen
        .getAllByRole('button')
        .find((btn) => btn.className.includes('-ml-2'));
      await user.click(animalsBackButton!);

      // Navigate to Pacing view
      await user.click(screen.getByText('Pacing Check'));
      const pacingBackButton = screen
        .getAllByRole('button')
        .find((btn) => btn.className.includes('-ml-2'));
      await user.click(pacingBackButton!);

      // Navigate to Notes view
      await user.click(screen.getByText('Unload Brain'));

      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('does not call XMLHttpRequest.open when using the app', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByText('Rest'));
      const backButton = screen
        .getAllByRole('button')
        .find((btn) => btn.className.includes('-ml-2'));
      await user.click(backButton!);

      await user.click(screen.getByText('Unload Brain'));
      const textarea = screen.getByPlaceholderText(
        "Don't hold it in your head...",
      );
      await user.type(textarea, 'Test note');
      await user.click(screen.getByText('Save'));

      expect(xhrOpenSpy).not.toHaveBeenCalled();
    });

    it('does not call fetch when adding and deleting notes', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByText('Unload Brain'));

      // Add a note
      const textarea = screen.getByPlaceholderText(
        "Don't hold it in your head...",
      );
      await user.type(textarea, 'Private note');
      await user.click(screen.getByText('Save'));

      // Delete the note
      const deleteButtons = screen
        .getAllByRole('button')
        .filter((btn) => btn.className.includes('hover:text-red'));
      await user.click(deleteButtons[0]);

      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('does not call fetch when using the timer', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByText('Rest'));

      const buttons = screen.getAllByRole('button');
      const timerButton = buttons.find(
        (btn) =>
          btn.className.includes('h-20') && btn.className.includes('w-20'),
      );
      await user.click(timerButton!);

      await waitFor(
        () => {
          expect(screen.getByText('Recharging...')).toBeInTheDocument();
        },
        { timeout: 100 },
      );

      await user.click(timerButton!);

      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  describe('localStorage Isolation', () => {
    it('only writes to recovery_notes key when saving notes', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByText('Unload Brain'));

      const textarea = screen.getByPlaceholderText(
        "Don't hold it in your head...",
      );
      await user.type(textarea, 'My private thought');
      await user.click(screen.getByText('Save'));

      const setItemCalls = vi.mocked(localStorage.setItem).mock.calls;
      const keysUsed = setItemCalls.map((call) => call[0]);

      expect(keysUsed.every((key) => key === 'recovery_notes')).toBe(true);
    });

    it('does not write to localStorage when viewing static pages', async () => {
      vi.mocked(localStorage.setItem).mockClear();

      const user = userEvent.setup();
      render(<App />);

      // Navigate to views that should not write to localStorage
      await user.click(screen.getByText('I am Crashing'));
      await user.click(screen.getByText('Tap anywhere to exit'));

      await user.click(screen.getByText('Fuel'));
      const fuelBackButton = screen
        .getAllByRole('button')
        .find((btn) => btn.className.includes('-ml-2'));
      await user.click(fuelBackButton!);

      await user.click(screen.getByText('Pacing Check'));
      const pacingBackButton = screen
        .getAllByRole('button')
        .find((btn) => btn.className.includes('-ml-2'));
      await user.click(pacingBackButton!);

      await user.click(screen.getByText('Rest'));

      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('does not store sensitive metadata beyond id and text', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByText('Unload Brain'));

      const textarea = screen.getByPlaceholderText(
        "Don't hold it in your head...",
      );
      await user.type(textarea, 'Test note');
      await user.click(screen.getByText('Save'));

      const setItemCalls = vi.mocked(localStorage.setItem).mock.calls;
      // Get the LAST call to recovery_notes (after note was added)
      const notesCall = setItemCalls
        .filter((call) => call[0] === 'recovery_notes')
        .pop();
      expect(notesCall).toBeDefined();

      const storedNotes = JSON.parse(notesCall![1]);
      expect(Array.isArray(storedNotes)).toBe(true);
      expect(storedNotes.length).toBe(1);

      const noteKeys = Object.keys(storedNotes[0]);
      expect(noteKeys).toContain('id');
      expect(noteKeys).toContain('text');
      expect(noteKeys.length).toBe(2);
    });
  });

  describe('No Dynamic Script Injection', () => {
    it('does not create script elements when rendering the app', () => {
      render(<App />);

      const createElementCalls = createElementSpy.mock.calls;
      const scriptCreations = createElementCalls.filter(
        (call) => call[0] === 'script',
      );

      expect(scriptCreations.length).toBe(0);
    });

    it('does not create script elements when navigating through all views', async () => {
      const user = userEvent.setup();
      render(<App />);

      createElementSpy.mockClear();

      await user.click(screen.getByText('I am Crashing'));
      await user.click(screen.getByText('Tap anywhere to exit'));

      await user.click(screen.getByText('Rest'));
      const restBackButton = screen
        .getAllByRole('button')
        .find((btn) => btn.className.includes('-ml-2'));
      await user.click(restBackButton!);

      await user.click(screen.getByText('Fuel'));
      const fuelBackButton = screen
        .getAllByRole('button')
        .find((btn) => btn.className.includes('-ml-2'));
      await user.click(fuelBackButton!);

      await user.click(screen.getByText('Fuzzy Logic'));
      await user.click(screen.getByText('Tell me another'));
      const animalsBackButton = screen
        .getAllByRole('button')
        .find((btn) => btn.className.includes('-ml-2'));
      await user.click(animalsBackButton!);

      await user.click(screen.getByText('Pacing Check'));
      const pacingBackButton = screen
        .getAllByRole('button')
        .find((btn) => btn.className.includes('-ml-2'));
      await user.click(pacingBackButton!);

      await user.click(screen.getByText('Unload Brain'));

      const createElementCalls = createElementSpy.mock.calls;
      const scriptCreations = createElementCalls.filter(
        (call) => call[0] === 'script',
      );

      expect(scriptCreations.length).toBe(0);
    });
  });

  describe('No Tracking Beacons', () => {
    it('does not call navigator.sendBeacon', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByText('I am Crashing'));
      await user.click(screen.getByText('Tap anywhere to exit'));

      await user.click(screen.getByText('Unload Brain'));
      const textarea = screen.getByPlaceholderText(
        "Don't hold it in your head...",
      );
      await user.type(textarea, 'Private thought');
      await user.click(screen.getByText('Save'));

      expect(sendBeaconSpy).not.toHaveBeenCalled();
    });

    it('does not create Image objects for tracking pixels', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByText('Fuzzy Logic'));
      await user.click(screen.getByText('Tell me another'));
      await user.click(screen.getByText('Tell me another'));

      const imageInstances = imageSpy.mock.results;
      const trackingCalls = imageInstances.filter((result) => {
        if (result.type === 'return' && result.value) {
          const src = result.value.src;
          return (
            src &&
            (src.includes('analytics') ||
              src.includes('tracking') ||
              src.includes('pixel') ||
              src.includes('beacon'))
          );
        }
        return false;
      });

      expect(trackingCalls.length).toBe(0);
    });
  });

  describe('Data Structure Validation', () => {
    it('note objects contain only id and text properties', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByText('Unload Brain'));

      const textarea = screen.getByPlaceholderText(
        "Don't hold it in your head...",
      );
      await user.type(textarea, 'First note');
      await user.click(screen.getByText('Save'));

      await user.type(textarea, 'Second note');
      await user.click(screen.getByText('Save'));

      const setItemCalls = vi.mocked(localStorage.setItem).mock.calls;
      const lastNotesCall = setItemCalls
        .filter((call) => call[0] === 'recovery_notes')
        .pop();
      expect(lastNotesCall).toBeDefined();

      const storedNotes = JSON.parse(lastNotesCall![1]);

      storedNotes.forEach((note: Record<string, unknown>) => {
        const keys = Object.keys(note);
        expect(keys).toHaveLength(2);
        expect(keys).toContain('id');
        expect(keys).toContain('text');
        expect(typeof note.id).toBe('number');
        expect(typeof note.text).toBe('string');
      });
    });

    it('notes do not contain timestamps', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByText('Unload Brain'));

      const textarea = screen.getByPlaceholderText(
        "Don't hold it in your head...",
      );
      await user.type(textarea, 'Test note');
      await user.click(screen.getByText('Save'));

      const setItemCalls = vi.mocked(localStorage.setItem).mock.calls;
      const notesCall = setItemCalls.find(
        (call) => call[0] === 'recovery_notes',
      );
      const storedNotes = JSON.parse(notesCall![1]);

      storedNotes.forEach((note: Record<string, unknown>) => {
        expect(note).not.toHaveProperty('timestamp');
        expect(note).not.toHaveProperty('createdAt');
        expect(note).not.toHaveProperty('updatedAt');
        expect(note).not.toHaveProperty('date');
        expect(note).not.toHaveProperty('time');
      });
    });

    it('notes do not contain device or user information', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByText('Unload Brain'));

      const textarea = screen.getByPlaceholderText(
        "Don't hold it in your head...",
      );
      await user.type(textarea, 'Test note');
      await user.click(screen.getByText('Save'));

      const setItemCalls = vi.mocked(localStorage.setItem).mock.calls;
      const notesCall = setItemCalls.find(
        (call) => call[0] === 'recovery_notes',
      );
      const storedNotes = JSON.parse(notesCall![1]);

      storedNotes.forEach((note: Record<string, unknown>) => {
        expect(note).not.toHaveProperty('deviceId');
        expect(note).not.toHaveProperty('userId');
        expect(note).not.toHaveProperty('userAgent');
        expect(note).not.toHaveProperty('ip');
        expect(note).not.toHaveProperty('location');
        expect(note).not.toHaveProperty('metadata');
      });
    });

    it('id field uses simple numeric timestamp', async () => {
      const user = userEvent.setup();
      const beforeTimestamp = Date.now();

      render(<App />);

      await user.click(screen.getByText('Unload Brain'));

      const textarea = screen.getByPlaceholderText(
        "Don't hold it in your head...",
      );
      await user.type(textarea, 'Test note');
      await user.click(screen.getByText('Save'));

      const afterTimestamp = Date.now();

      const setItemCalls = vi.mocked(localStorage.setItem).mock.calls;
      // Get the LAST call to recovery_notes (after note was added)
      const notesCall = setItemCalls
        .filter((call) => call[0] === 'recovery_notes')
        .pop();
      const storedNotes = JSON.parse(notesCall![1]);

      const noteId = storedNotes[0].id;
      expect(noteId).toBeGreaterThanOrEqual(beforeTimestamp);
      expect(noteId).toBeLessThanOrEqual(afterTimestamp);
    });
  });

  describe('Privacy Notice Visibility', () => {
    it('displays privacy notice on home screen', () => {
      render(<App />);

      expect(
        screen.getByText('100% private. All data stays on your device.'),
      ).toBeInTheDocument();
    });

    it('privacy notice is visible to users', () => {
      render(<App />);

      const privacyNotice = screen.getByText(
        '100% private. All data stays on your device.',
      );

      expect(privacyNotice).toBeVisible();
    });

    it('privacy notice appears on initial app load', () => {
      const { container } = render(<App />);

      expect(
        container.textContent?.includes(
          '100% private. All data stays on your device.',
        ),
      ).toBe(true);
    });
  });

  describe('SpeechRecognition Privacy', () => {
    it('does not make network calls when speech recognition is unavailable', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByText('Unload Brain'));

      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      await user.click(screen.getByText('Dictate'));

      expect(alertSpy).toHaveBeenCalledWith(
        'Dictation not supported in this browser',
      );
      expect(fetchSpy).not.toHaveBeenCalled();

      alertSpy.mockRestore();
    });
  });

  describe('No Analytics or Telemetry', () => {
    it('does not define Google Analytics functions', () => {
      expect((window as unknown as Record<string, unknown>).ga).toBeUndefined();
      expect(
        (window as unknown as Record<string, unknown>).gtag,
      ).toBeUndefined();

      render(<App />);

      expect((window as unknown as Record<string, unknown>).ga).toBeUndefined();
      expect(
        (window as unknown as Record<string, unknown>).gtag,
      ).toBeUndefined();
    });

    it('does not define tracking arrays', () => {
      expect(
        (window as unknown as Record<string, unknown>)._paq,
      ).toBeUndefined();
      expect(
        (window as unknown as Record<string, unknown>).dataLayer,
      ).toBeUndefined();

      render(<App />);

      expect(
        (window as unknown as Record<string, unknown>)._paq,
      ).toBeUndefined();
      expect(
        (window as unknown as Record<string, unknown>).dataLayer,
      ).toBeUndefined();
    });
  });
});
