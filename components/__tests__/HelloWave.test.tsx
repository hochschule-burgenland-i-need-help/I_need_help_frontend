// HelloWave.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { HelloWave } from '../HelloWave'; // Pfad anpassen

describe('HelloWave Component', () => {
  it('rendert korrekt und zeigt das Wellen-Emoji an', () => {
    const { getByText } = render(<HelloWave />);
    const waveEmoji = getByText('👋');
    expect(waveEmoji).toBeTruthy();
  });
});
