import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import App from '../App';

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Home Screen', () => {
    it('renders the home screen with title', () => {
      render(<App />);
      expect(screen.getByText('Recovery Mode')).toBeInTheDocument();
      expect(
        screen.getByText('Brain fog protocol active.'),
      ).toBeInTheDocument();
    });

    it('displays all navigation buttons', () => {
      render(<App />);
      expect(screen.getByText('I am Crashing')).toBeInTheDocument();
      expect(screen.getByText('Rest')).toBeInTheDocument();
      expect(screen.getByText('Fuel')).toBeInTheDocument();
      expect(screen.getByText('Fuzzy Logic')).toBeInTheDocument();
      expect(screen.getByText('Pacing Check')).toBeInTheDocument();
      expect(screen.getByText('Unload Brain')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('navigates to Crash Mode when clicking "I am Crashing"', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByText('I am Crashing'));

      expect(screen.getByText('Tap anywhere to exit')).toBeInTheDocument();
    });

    it('navigates to Rest view when clicking "Rest"', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByText('Rest'));

      expect(screen.getByText('Aggressive Rest')).toBeInTheDocument();
      expect(screen.getByText('15:00')).toBeInTheDocument();
    });

    it('navigates to Fuel view when clicking "Fuel"', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByText('Fuel'));

      expect(screen.getByText('System Fuel')).toBeInTheDocument();
      expect(screen.getByText('Drink Electrolytes.')).toBeInTheDocument();
    });

    it('navigates to Animal Facts view when clicking "Fuzzy Logic"', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByText('Fuzzy Logic'));

      expect(
        screen.getByText('Fuzzy Logic', { selector: 'h1' }),
      ).toBeInTheDocument();
      expect(screen.getByText('Tell me another')).toBeInTheDocument();
    });

    it('navigates to Pacing view when clicking "Pacing Check"', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByText('Pacing Check'));

      expect(screen.getByText('The 50% Rule')).toBeInTheDocument();
      expect(screen.getByText('STOP.')).toBeInTheDocument();
    });

    it('navigates to Notes view when clicking "Unload Brain"', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByText('Unload Brain'));

      expect(screen.getByText('External Brain')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Don't hold it in your head..."),
      ).toBeInTheDocument();
    });
  });

  describe('Back Navigation', () => {
    it('returns to home from Rest view', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByText('Rest'));
      expect(screen.getByText('Aggressive Rest')).toBeInTheDocument();

      // Find the back button by looking for the button with -ml-2 class (back button offset)
      const buttons = screen.getAllByRole('button');
      const backButton = buttons.find((btn) => btn.className.includes('-ml-2'));
      await user.click(backButton!);

      expect(screen.getByText('Recovery Mode')).toBeInTheDocument();
    });

    it('returns to home from Crash Mode by clicking anywhere', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByText('I am Crashing'));
      expect(screen.getByText('Tap anywhere to exit')).toBeInTheDocument();

      await user.click(screen.getByText('Tap anywhere to exit'));

      expect(screen.getByText('Recovery Mode')).toBeInTheDocument();
    });

    it('returns to home from Fuel view', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByText('Fuel'));
      expect(screen.getByText('System Fuel')).toBeInTheDocument();

      // Find the back button by looking for the button with -ml-2 class
      const buttons = screen.getAllByRole('button');
      const backButton = buttons.find((btn) => btn.className.includes('-ml-2'));
      await user.click(backButton!);

      expect(screen.getByText('Recovery Mode')).toBeInTheDocument();
    });
  });
});
