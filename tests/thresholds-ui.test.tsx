import { render, screen, fireEvent } from '@testing-library/react';
import { ThresholdsForm } from '../src/thresholds-ui';
import { VpdStage } from '../src/types';
import { getActiveVpdThresholds, setVpdThresholds, resetVpdThresholds } from '../src/thresholds';

describe('ThresholdsForm', () => {
  beforeEach(() => {
    resetVpdThresholds();
  });

  test('displays current thresholds', () => {
    render(<ThresholdsForm />);
    
    Object.values(VpdStage).forEach((stage) => {
      const thresholds = getActiveVpdThresholds(stage);
      expect(screen.getByDisplayValue(thresholds.low)).toBeInTheDocument();
      expect(screen.getByDisplayValue(thresholds.high)).toBeInTheDocument();
    });
  });

  test('updates thresholds on save', () => {
    render(<ThresholdsForm />);
    
    const vegLowInput = screen.getAllByLabelText('Low Threshold (kPa):')[1];
    fireEvent.change(vegLowInput, { target: { value: '1.2' } });
    fireEvent.click(screen.getAllByText('Save')[1]);

    expect(getActiveVpdThresholds(VpdStage.Veg).low).toBe(1.2);
  });

  test('resets thresholds to default', () => {
    setVpdThresholds(VpdStage.Flower, { low: 1.5, high: 2.0 });
    render(<ThresholdsForm />);
    
    fireEvent.click(screen.getAllByText('Reset to Default')[2]);
    expect(getActiveVpdThresholds(VpdStage.Flower).low).toBe(1.2);
    expect(getActiveVpdThresholds(VpdStage.Flower).high).toBe(1.8);
  });
});