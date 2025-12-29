import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import App from '../App';

describe('CrashModeView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const navigateToCrash = async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText('I am Crashing'));
    return user;
  };

  it('displays the crash mode screen', async () => {
    await navigateToCrash();

    // Should show the exit instruction
    expect(screen.getByText('Tap anywhere to exit')).toBeInTheDocument();
  });

  it('has a black background', async () => {
    await navigateToCrash();

    // Find the crash mode container
    const crashContainer = screen
      .getByText('Tap anywhere to exit')
      .closest('div')?.parentElement;
    expect(crashContainer).toHaveClass('bg-black');
  });

  it('covers the full screen', async () => {
    await navigateToCrash();

    const crashContainer = screen
      .getByText('Tap anywhere to exit')
      .closest('div')?.parentElement;
    expect(crashContainer).toHaveClass('fixed', 'inset-0');
  });

  it('returns to home when clicked', async () => {
    const user = await navigateToCrash();

    // Click on the crash mode screen
    await user.click(screen.getByText('Tap anywhere to exit'));

    // Should be back on home screen
    expect(screen.getByText('Recovery Mode')).toBeInTheDocument();
  });

  it('has subtle visual indicator (moon icon with breathing animation)', async () => {
    await navigateToCrash();

    // The container with the moon should have crash-breathing class for slow, calming animation
    const pulsingElement = screen
      .getByText('Tap anywhere to exit')
      .closest('div');
    expect(pulsingElement).toHaveClass('crash-breathing');
  });
});
