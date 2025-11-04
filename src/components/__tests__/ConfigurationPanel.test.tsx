import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfigurationPanel } from '../ConfigurationPanel';
import type { SimulationConfig } from '../../types/simulation';

describe('ConfigurationPanel', () => {
  const defaultConfig: SimulationConfig = {
    bufferSize: 5,
    producerCount: 2,
    consumerCount: 2,
    animationSpeed: 1.0
  };

  const defaultProps = {
    config: defaultConfig,
    onConfigChange: vi.fn(),
    onStartSimulation: vi.fn(),
    onResetSimulation: vi.fn(),
    isSimulationRunning: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders all input fields with correct labels', () => {
      render(<ConfigurationPanel {...defaultProps} />);
      
      expect(screen.getByLabelText(/buffer size/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/producer count/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/consumer count/i)).toBeInTheDocument();
    });

    it('renders start and reset buttons', () => {
      render(<ConfigurationPanel {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /start simulation/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    });

    it('displays current config values in inputs', () => {
      render(<ConfigurationPanel {...defaultProps} />);
      
      expect(screen.getByDisplayValue('5')).toBeInTheDocument(); // buffer size
      expect(screen.getAllByDisplayValue('2')).toHaveLength(2); // producer and consumer count
    });
  });

  describe('Input Validation', () => {
    it('shows error for buffer size below minimum', async () => {
      render(<ConfigurationPanel {...defaultProps} />);
      
      const bufferInput = screen.getByLabelText(/buffer size/i);
      fireEvent.change(bufferInput, { target: { value: '0' } });
      
      await waitFor(() => {
        expect(screen.getByText(/buffer size must be between 1 and 10/i)).toBeInTheDocument();
      });
    });

    it('shows error for buffer size above maximum', async () => {
      render(<ConfigurationPanel {...defaultProps} />);
      
      const bufferInput = screen.getByLabelText(/buffer size/i);
      fireEvent.change(bufferInput, { target: { value: '11' } });
      
      await waitFor(() => {
        expect(screen.getByText(/buffer size must be between 1 and 10/i)).toBeInTheDocument();
      });
    });

    it('shows error for producer count below minimum', async () => {
      render(<ConfigurationPanel {...defaultProps} />);
      
      const producerInput = screen.getByLabelText(/producer count/i);
      fireEvent.change(producerInput, { target: { value: '0' } });
      
      await waitFor(() => {
        expect(screen.getByText(/producer count must be between 1 and 5/i)).toBeInTheDocument();
      });
    });

    it('shows error for producer count above maximum', async () => {
      render(<ConfigurationPanel {...defaultProps} />);
      
      const producerInput = screen.getByLabelText(/producer count/i);
      fireEvent.change(producerInput, { target: { value: '6' } });
      
      await waitFor(() => {
        expect(screen.getByText(/producer count must be between 1 and 5/i)).toBeInTheDocument();
      });
    });

    it('shows error for consumer count below minimum', async () => {
      render(<ConfigurationPanel {...defaultProps} />);
      
      const consumerInput = screen.getByLabelText(/consumer count/i);
      fireEvent.change(consumerInput, { target: { value: '0' } });
      
      await waitFor(() => {
        expect(screen.getByText(/consumer count must be between 1 and 5/i)).toBeInTheDocument();
      });
    });

    it('shows error for consumer count above maximum', async () => {
      render(<ConfigurationPanel {...defaultProps} />);
      
      const consumerInput = screen.getByLabelText(/consumer count/i);
      fireEvent.change(consumerInput, { target: { value: '6' } });
      
      await waitFor(() => {
        expect(screen.getByText(/consumer count must be between 1 and 5/i)).toBeInTheDocument();
      });
    });

    it('shows error for invalid non-numeric input', async () => {
      render(<ConfigurationPanel {...defaultProps} />);
      
      const bufferInput = screen.getByLabelText(/buffer size/i);
      fireEvent.change(bufferInput, { target: { value: 'abc' } });
      
      await waitFor(() => {
        expect(screen.getByText(/bufferSize must be a valid number/i)).toBeInTheDocument();
      });
    });

    it('clears error when valid value is entered', async () => {
      render(<ConfigurationPanel {...defaultProps} />);
      
      const bufferInput = screen.getByLabelText(/buffer size/i);
      
      // Enter invalid value
      fireEvent.change(bufferInput, { target: { value: '0' } });
      
      await waitFor(() => {
        expect(screen.getByText(/buffer size must be between 1 and 10/i)).toBeInTheDocument();
      });
      
      // Enter valid value
      fireEvent.change(bufferInput, { target: { value: '8' } });
      
      await waitFor(() => {
        expect(screen.queryByText(/buffer size must be between 1 and 10/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    it('calls onConfigChange when valid buffer size is entered', async () => {
      const onConfigChange = vi.fn();
      render(<ConfigurationPanel {...defaultProps} onConfigChange={onConfigChange} />);
      
      const bufferInput = screen.getByLabelText(/buffer size/i);
      fireEvent.change(bufferInput, { target: { value: '8' } });
      
      await waitFor(() => {
        expect(onConfigChange).toHaveBeenLastCalledWith({
          ...defaultConfig,
          bufferSize: 8
        });
      });
    });

    it('calls onConfigChange when valid producer count is entered', async () => {
      const onConfigChange = vi.fn();
      render(<ConfigurationPanel {...defaultProps} onConfigChange={onConfigChange} />);
      
      const producerInput = screen.getByLabelText(/producer count/i);
      fireEvent.change(producerInput, { target: { value: '3' } });
      
      await waitFor(() => {
        expect(onConfigChange).toHaveBeenLastCalledWith({
          ...defaultConfig,
          producerCount: 3
        });
      });
    });

    it('calls onConfigChange when valid consumer count is entered', async () => {
      const onConfigChange = vi.fn();
      render(<ConfigurationPanel {...defaultProps} onConfigChange={onConfigChange} />);
      
      const consumerInput = screen.getByLabelText(/consumer count/i);
      fireEvent.change(consumerInput, { target: { value: '4' } });
      
      await waitFor(() => {
        expect(onConfigChange).toHaveBeenLastCalledWith({
          ...defaultConfig,
          consumerCount: 4
        });
      });
    });

    it('calls onConfigChange even when invalid value is entered but shows validation error', async () => {
      const onConfigChange = vi.fn();
      render(<ConfigurationPanel {...defaultProps} onConfigChange={onConfigChange} />);
      
      const bufferInput = screen.getByLabelText(/buffer size/i);
      fireEvent.change(bufferInput, { target: { value: '0' } });
      
      // Should call onConfigChange with the invalid value
      await waitFor(() => {
        expect(onConfigChange).toHaveBeenLastCalledWith({
          ...defaultConfig,
          bufferSize: 0
        });
      });
      
      // But should also show validation error
      expect(screen.getByText(/buffer size must be between 1 and 10/i)).toBeInTheDocument();
    });

    it('calls onStartSimulation when start button is clicked', async () => {
      const onStartSimulation = vi.fn();
      render(<ConfigurationPanel {...defaultProps} onStartSimulation={onStartSimulation} />);
      
      const startButton = screen.getByRole('button', { name: /start simulation/i });
      fireEvent.click(startButton);
      
      expect(onStartSimulation).toHaveBeenCalledTimes(1);
    });

    it('calls onResetSimulation when reset button is clicked', async () => {
      const onResetSimulation = vi.fn();
      render(<ConfigurationPanel {...defaultProps} onResetSimulation={onResetSimulation} />);
      
      const resetButton = screen.getByRole('button', { name: /reset/i });
      fireEvent.click(resetButton);
      
      expect(onResetSimulation).toHaveBeenCalledTimes(1);
    });
  });

  describe('Button States', () => {
    it('disables start button when simulation is running', () => {
      render(<ConfigurationPanel {...defaultProps} isSimulationRunning={true} />);
      
      const startButton = screen.getByRole('button', { name: /start simulation with current configuration/i });
      expect(startButton).toBeDisabled();
      expect(startButton).toHaveTextContent('Running...');
    });

    it('disables start button when configuration is invalid', async () => {
      render(<ConfigurationPanel {...defaultProps} />);
      
      const bufferInput = screen.getByLabelText(/buffer size/i);
      fireEvent.change(bufferInput, { target: { value: '0' } });
      
      await waitFor(() => {
        const startButton = screen.getByRole('button', { name: /start simulation/i });
        expect(startButton).toBeDisabled();
      });
    });

    it('enables start button when configuration is valid', () => {
      render(<ConfigurationPanel {...defaultProps} />);
      
      const startButton = screen.getByRole('button', { name: /start simulation/i });
      expect(startButton).not.toBeDisabled();
    });

    it('disables input fields when simulation is running', () => {
      render(<ConfigurationPanel {...defaultProps} isSimulationRunning={true} />);
      
      expect(screen.getByLabelText(/buffer size/i)).toBeDisabled();
      expect(screen.getByLabelText(/producer count/i)).toBeDisabled();
      expect(screen.getByLabelText(/consumer count/i)).toBeDisabled();
    });

    it('enables input fields when simulation is not running', () => {
      render(<ConfigurationPanel {...defaultProps} isSimulationRunning={false} />);
      
      expect(screen.getByLabelText(/buffer size/i)).not.toBeDisabled();
      expect(screen.getByLabelText(/producer count/i)).not.toBeDisabled();
      expect(screen.getByLabelText(/consumer count/i)).not.toBeDisabled();
    });
  });

  describe('Visual Feedback', () => {
    it('shows warning message when configuration is invalid', async () => {
      render(<ConfigurationPanel {...defaultProps} />);
      
      const bufferInput = screen.getByLabelText(/buffer size/i);
      fireEvent.change(bufferInput, { target: { value: '0' } });
      
      await waitFor(() => {
        expect(screen.getByText(/please ensure all parameters are within valid ranges/i)).toBeInTheDocument();
      });
    });

    it('does not show warning message when configuration is valid', () => {
      render(<ConfigurationPanel {...defaultProps} />);
      
      expect(screen.queryByText(/please ensure all parameters are within valid ranges/i)).not.toBeInTheDocument();
    });

    it('applies error styling to input with validation error', async () => {
      render(<ConfigurationPanel {...defaultProps} />);
      
      const bufferInput = screen.getByLabelText(/buffer size/i);
      fireEvent.change(bufferInput, { target: { value: '0' } });
      
      await waitFor(() => {
        expect(bufferInput).toHaveClass('border-red-500');
      });
    });

    it('applies normal styling to input without validation error', () => {
      render(<ConfigurationPanel {...defaultProps} />);
      
      const bufferInput = screen.getByLabelText(/buffer size/i);
      expect(bufferInput).toHaveClass('border-gray-300');
      expect(bufferInput).not.toHaveClass('border-red-500');
    });
  });

  describe('Accessibility', () => {
    it('associates error messages with inputs using aria-describedby', async () => {
      render(<ConfigurationPanel {...defaultProps} />);
      
      const bufferInput = screen.getByLabelText(/buffer size/i);
      fireEvent.change(bufferInput, { target: { value: '0' } });
      
      await waitFor(() => {
        expect(bufferInput).toHaveAttribute('aria-describedby', 'buffer-size-error');
        expect(screen.getByRole('alert')).toHaveAttribute('id', 'buffer-size-error');
      });
    });

    it('provides proper aria-labels for buttons', () => {
      render(<ConfigurationPanel {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /start simulation with current configuration/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset simulation to initial state/i })).toBeInTheDocument();
    });

    it('marks error messages with role="alert"', async () => {
      render(<ConfigurationPanel {...defaultProps} />);
      
      const bufferInput = screen.getByLabelText(/buffer size/i);
      fireEvent.change(bufferInput, { target: { value: '0' } });
      
      await waitFor(() => {
        const errorMessage = screen.getByText(/buffer size must be between 1 and 10/i);
        expect(errorMessage).toHaveAttribute('role', 'alert');
      });
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive classes for mobile and desktop layouts', () => {
      render(<ConfigurationPanel {...defaultProps} />);
      
      const container = screen.getByRole('heading', { name: /configuration/i }).parentElement;
      expect(container).toHaveClass('p-4', 'sm:p-6', 'max-w-md');
      
      const buttonContainer = screen.getByRole('button', { name: /start simulation/i }).parentElement;
      expect(buttonContainer).toHaveClass('flex-col', 'sm:flex-row');
    });
  });
});