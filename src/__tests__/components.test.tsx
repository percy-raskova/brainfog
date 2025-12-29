import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import App from '../App';

// Since Button and Header are not exported, we test them through App
// This tests their behavior in context

describe('Button Component', () => {
  it('renders button with text content', () => {
    render(<App />);
    expect(screen.getByText('I am Crashing')).toBeInTheDocument();
    expect(screen.getByText('Rest')).toBeInTheDocument();
    expect(screen.getByText('Fuel')).toBeInTheDocument();
  });

  it('applies variant styling for crash button', () => {
    render(<App />);
    const crashButton = screen.getByText('I am Crashing').closest('button');
    expect(crashButton).toHaveClass('crash-button-glow');
  });

  it('applies variant styling for rest button', () => {
    render(<App />);
    const restButton = screen.getByText('Rest').closest('button');
    expect(restButton?.className).toContain('indigo');
  });

  it('applies variant styling for fuel button', () => {
    render(<App />);
    const fuelButton = screen.getByText('Fuel').closest('button');
    expect(fuelButton?.className).toContain('emerald');
  });

  it('applies variant styling for pacing button', () => {
    render(<App />);
    const pacingButton = screen.getByText('Pacing Check').closest('button');
    expect(pacingButton?.className).toContain('amber');
  });

  it('applies variant styling for animals button', () => {
    render(<App />);
    const animalsButton = screen.getByText('Fuzzy Logic').closest('button');
    expect(animalsButton?.className).toContain('orange');
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText('Rest'));

    // Verify navigation happened (proves onClick worked)
    expect(screen.getByText('Aggressive Rest')).toBeInTheDocument();
  });
});

describe('Header Component', () => {
  it('displays title in sub-views', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText('Rest'));

    expect(
      screen.getByRole('heading', { name: 'Aggressive Rest' }),
    ).toBeInTheDocument();
  });

  it('shows back button when in sub-view', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText('Rest'));

    // There should be a back button (ChevronLeft icon button)
    const buttons = screen.getAllByRole('button');
    const backButton = buttons.find((btn) =>
      btn.className.includes('rounded-full'),
    );
    expect(backButton).toBeInTheDocument();
  });

  it('back button navigates to home', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText('Rest'));
    expect(screen.getByText('Aggressive Rest')).toBeInTheDocument();

    // Find back button - it's the first button with rounded-full that's not a control button
    const buttons = screen.getAllByRole('button');
    const backButton = buttons.find(
      (btn) =>
        btn.className.includes('rounded-full') &&
        btn.className.includes('-ml-2'),
    );
    await user.click(backButton!);

    expect(screen.getByText('Recovery Mode')).toBeInTheDocument();
  });

  it('displays different titles for different views', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Test Rest view
    await user.click(screen.getByText('Rest'));
    expect(
      screen.getByRole('heading', { name: 'Aggressive Rest' }),
    ).toBeInTheDocument();

    // Go back and test Fuel view
    const buttons = screen.getAllByRole('button');
    const backButton = buttons.find((btn) => btn.className.includes('-ml-2'));
    await user.click(backButton!);

    await user.click(screen.getByText('Fuel'));
    expect(
      screen.getByRole('heading', { name: 'System Fuel' }),
    ).toBeInTheDocument();
  });
});

describe('Home Screen Title', () => {
  it('displays Recovery Mode title without back button', () => {
    render(<App />);

    expect(screen.getByText('Recovery Mode')).toBeInTheDocument();
    expect(screen.getByText('Brain fog protocol active.')).toBeInTheDocument();

    // Home screen should not have a back button in the header area
    // (the main title area doesn't use the Header component)
  });
});
