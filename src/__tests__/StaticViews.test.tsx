import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import App from '../App';

describe('FuelView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const navigateToFuel = async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText('Fuel'));
    return user;
  };

  it('displays the System Fuel header', async () => {
    await navigateToFuel();
    expect(screen.getByText('System Fuel')).toBeInTheDocument();
  });

  it('displays hydration section', async () => {
    await navigateToFuel();
    expect(screen.getByText('Hydraulic Fluid')).toBeInTheDocument();
    expect(
      screen.getByText('Your brain needs blood volume. Water is not enough.'),
    ).toBeInTheDocument();
  });

  it('displays electrolyte advice', async () => {
    await navigateToFuel();
    expect(screen.getByText('Drink Electrolytes.')).toBeInTheDocument();
    expect(
      screen.getByText('Salty water, Gatorade, LMNT, or Broth.'),
    ).toBeInTheDocument();
  });

  it('displays low effort protein section', async () => {
    await navigateToFuel();
    expect(screen.getByText('Low Effort Protein')).toBeInTheDocument();
  });

  it('lists protein options', async () => {
    await navigateToFuel();
    expect(screen.getByText(/peanut butter/i)).toBeInTheDocument();
    expect(screen.getByText(/String cheese/i)).toBeInTheDocument();
    expect(screen.getByText(/Protein shake/i)).toBeInTheDocument();
    expect(screen.getByText(/almonds/i)).toBeInTheDocument();
  });
});

describe('PacingView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const navigateToPacing = async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText('Pacing Check'));
    return user;
  };

  it('displays The 50% Rule header', async () => {
    await navigateToPacing();
    expect(screen.getByText('The 50% Rule')).toBeInTheDocument();
  });

  it('displays STOP message prominently', async () => {
    await navigateToPacing();
    expect(screen.getByText('STOP.')).toBeInTheDocument();
  });

  it('displays the 50% rule explanation', async () => {
    await navigateToPacing();
    expect(
      screen.getByText('Whatever you think you can do right now...'),
    ).toBeInTheDocument();
    expect(screen.getByText('Do half.')).toBeInTheDocument();
  });

  it('displays pacing example for dishes', async () => {
    await navigateToPacing();
    expect(screen.getByText('Washing dishes?')).toBeInTheDocument();
    expect(screen.getByText('Wash 2. Leave the rest.')).toBeInTheDocument();
  });

  it('displays pacing example for shower', async () => {
    await navigateToPacing();
    expect(screen.getByText('Shower?')).toBeInTheDocument();
    expect(screen.getByText('Sit down. Use cool water.')).toBeInTheDocument();
  });

  it('displays pacing example for brain fog', async () => {
    await navigateToPacing();
    expect(screen.getByText('Brain Fog?')).toBeInTheDocument();
    expect(screen.getByText('Lie down. No phone.')).toBeInTheDocument();
  });
});
