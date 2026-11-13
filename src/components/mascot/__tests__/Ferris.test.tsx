import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Ferris, FerrisMood } from '../Ferris';

describe('Ferris Mascot Component (src/components/mascot/Ferris.tsx)', () => {
  const allMoods: FerrisMood[] = [
    'happy',
    'confused',
    'safety',
    'panic',
    'detective',
    'speed',
    'wizard',
  ];

  it('renders all 7 moods with proper accessibility attributes and data-testids', () => {
    allMoods.forEach((mood) => {
      const { unmount } = render(<Ferris mood={mood} />);
      const svg = screen.getByRole('img', { name: `Ferris the Crab (${mood})` });
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('data-testid', `ferris-mascot-${mood}`);
      unmount();
    });
  });

  describe('Mood-Specific Visual Accessories & Expressions', () => {
    it('renders happy mood with standard claws and happy eyes', () => {
      render(<Ferris mood="happy" />);
      expect(screen.getByTestId('standard-claws')).toBeInTheDocument();
      expect(screen.getByTestId('happy-eyes')).toBeInTheDocument();
    });

    it('renders confused mood with asymmetric eyes, tilted claws, and question mark', () => {
      render(<Ferris mood="confused" />);
      expect(screen.getByTestId('confused-eyes')).toBeInTheDocument();
      expect(screen.getByTestId('confused-claws')).toBeInTheDocument();
    });

    it('renders safety mood with protective helmet and shield emblem', () => {
      render(<Ferris mood="safety" />);
      expect(screen.getByTestId('safety-accessories')).toBeInTheDocument();
      expect(screen.getByTestId('standard-claws')).toBeInTheDocument();
    });

    it('renders panic mood with wide startled eyes and raised panic claws', () => {
      render(<Ferris mood="panic" />);
      expect(screen.getByTestId('panic-eyes')).toBeInTheDocument();
      expect(screen.getByTestId('panic-claws')).toBeInTheDocument();
    });

    it('renders detective mood with deerstalker hat and magnifying glass', () => {
      render(<Ferris mood="detective" />);
      expect(screen.getByTestId('detective-accessories')).toBeInTheDocument();
      expect(screen.getByTestId('standard-claws')).toBeInTheDocument();
    });

    it('renders speed mood with concurrency speed streak lines', () => {
      render(<Ferris mood="speed" />);
      expect(screen.getByTestId('speed-accessories')).toBeInTheDocument();
    });

    it('renders wizard mood with pointy wizard hat and golden star', () => {
      render(<Ferris mood="wizard" />);
      expect(screen.getByTestId('wizard-accessories')).toBeInTheDocument();
    });
  });

  describe('Props & Fallbacks', () => {
    it('applies custom size and className props', () => {
      render(<Ferris mood="happy" size={128} className="custom-crab-class" />);
      const svg = screen.getByRole('img', { name: /Ferris the Crab \(happy\)/i });
      expect(svg).toHaveAttribute('width', '128');
      expect(svg).toHaveAttribute('height', '128');
      expect(svg).toHaveClass('custom-crab-class');
    });

    it('gracefully falls back to happy mood when an invalid mood is supplied', () => {
      // @ts-expect-error Testing runtime invalid prop
      render(<Ferris mood="completely_invalid_mood" />);
      const svg = screen.getByRole('img', { name: 'Ferris the Crab (happy)' });
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('data-testid', 'ferris-mascot-happy');
    });
  });
});
