import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import App from '../App';

describe('RestView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const navigateToRest = async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText('Rest'));
    return user;
  };

  it('displays the initial time as 15:00', async () => {
    await navigateToRest();
    expect(screen.getByText('15:00')).toBeInTheDocument();
  });

  it('displays sensory deprivation instructions', async () => {
    await navigateToRest();
    expect(screen.getByText('Sensory Deprivation')).toBeInTheDocument();
    expect(
      screen.getByText('Lie down flat. Heart level with head.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Eye mask ON. Room DARK.')).toBeInTheDocument();
    expect(screen.getByText('Silence. No podcasts.')).toBeInTheDocument();
  });

  it('shows "Start 15min Reset" when timer is paused', async () => {
    await navigateToRest();
    expect(screen.getByText('Start 15min Reset')).toBeInTheDocument();
  });

  it('has play/pause and sound toggle buttons', async () => {
    await navigateToRest();

    // Find the timer control buttons
    const buttons = screen.getAllByRole('button');

    // Large round button (play/pause)
    const timerButton = buttons.find(
      (btn) => btn.className.includes('h-20') && btn.className.includes('w-20'),
    );
    expect(timerButton).toBeInTheDocument();

    // Small round button (sound toggle)
    const soundButton = buttons.find(
      (btn) => btn.className.includes('h-12') && btn.className.includes('w-12'),
    );
    expect(soundButton).toBeInTheDocument();
  });

  it('shows "Recharging..." when timer starts', async () => {
    const user = await navigateToRest();

    // Find and click the play button
    const buttons = screen.getAllByRole('button');
    const timerButton = buttons.find(
      (btn) => btn.className.includes('h-20') && btn.className.includes('w-20'),
    );

    await user.click(timerButton!);

    expect(screen.getByText('Recharging...')).toBeInTheDocument();
  });

  it('shows "Start 15min Reset" when timer is paused after starting', async () => {
    const user = await navigateToRest();

    const buttons = screen.getAllByRole('button');
    const timerButton = buttons.find(
      (btn) => btn.className.includes('h-20') && btn.className.includes('w-20'),
    );

    // Start timer
    await user.click(timerButton!);
    expect(screen.getByText('Recharging...')).toBeInTheDocument();

    // Pause timer
    await user.click(timerButton!);
    expect(screen.getByText('Start 15min Reset')).toBeInTheDocument();
  });

  it('displays the header with title', async () => {
    await navigateToRest();
    expect(
      screen.getByRole('heading', { name: 'Aggressive Rest' }),
    ).toBeInTheDocument();
  });

  it('has a back button that returns to home', async () => {
    const user = await navigateToRest();

    // Find and click the back button by looking for -ml-2 class
    const buttons = screen.getAllByRole('button');
    const backButton = buttons.find((btn) => btn.className.includes('-ml-2'));

    await user.click(backButton!);

    expect(screen.getByText('Recovery Mode')).toBeInTheDocument();
  });
});
