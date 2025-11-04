import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NotificationProvider, useNotifications } from '../NotificationSystem';

// Test component that uses the notification system
const TestComponent: React.FC = () => {
  const { notifications, addNotification, removeNotification, clearAll } = useNotifications();

  return (
    <div>
      <div data-testid="notification-count">{notifications.length}</div>
      
      <button
        onClick={() => addNotification({
          type: 'success',
          title: 'Success',
          message: 'Operation completed successfully'
        })}
      >
        Add Success
      </button>
      
      <button
        onClick={() => addNotification({
          type: 'error',
          title: 'Error',
          message: 'Something went wrong',
          persistent: true
        })}
      >
        Add Error
      </button>
      
      <button
        onClick={() => addNotification({
          type: 'warning',
          title: 'Warning',
          duration: 1000
        })}
      >
        Add Warning
      </button>
      
      <button
        onClick={() => addNotification({
          type: 'info',
          title: 'Info'
        })}
      >
        Add Info
      </button>
      
      <button onClick={() => removeNotification(notifications[0]?.id || '')}>
        Remove First
      </button>
      
      <button onClick={clearAll}>
        Clear All
      </button>
    </div>
  );
};

describe('NotificationSystem', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('NotificationProvider', () => {
    it('provides notification context to children', () => {
      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      expect(screen.getByTestId('notification-count')).toHaveTextContent('0');
      expect(screen.getByText('Add Success')).toBeInTheDocument();
    });

    it('throws error when useNotifications is used outside provider', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(<TestComponent />);
      }).toThrow('useNotifications must be used within a NotificationProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('Adding Notifications', () => {
    it('adds success notification', async () => {
      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByText('Add Success'));

      await waitFor(() => {
        expect(screen.getByTestId('notification-count')).toHaveTextContent('1');
        expect(screen.getByText('Success')).toBeInTheDocument();
        expect(screen.getByText('Operation completed successfully')).toBeInTheDocument();
      });
    });

    it('adds error notification', async () => {
      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByText('Add Error'));

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      });
    });

    it('adds warning notification', async () => {
      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByText('Add Warning'));

      await waitFor(() => {
        expect(screen.getByText('Warning')).toBeInTheDocument();
      });
    });

    it('adds info notification', async () => {
      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByText('Add Info'));

      await waitFor(() => {
        expect(screen.getByText('Info')).toBeInTheDocument();
      });
    });

    it('generates unique IDs for notifications', async () => {
      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByText('Add Success'));
      fireEvent.click(screen.getByText('Add Error'));

      await waitFor(() => {
        expect(screen.getByTestId('notification-count')).toHaveTextContent('2');
      });
    });
  });

  describe('Auto-removal', () => {
    it('automatically removes non-persistent notifications after duration', async () => {
      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByText('Add Warning')); // 1000ms duration

      await waitFor(() => {
        expect(screen.getByText('Warning')).toBeInTheDocument();
      });

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.queryByText('Warning')).not.toBeInTheDocument();
      });
    });

    it('does not auto-remove persistent notifications', async () => {
      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByText('Add Error')); // persistent: true

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
      });

      act(() => {
        vi.advanceTimersByTime(10000); // Wait much longer than default duration
      });

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument(); // Still there
      });
    });

    it('uses default duration when not specified', async () => {
      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByText('Add Success')); // Uses default 5000ms

      await waitFor(() => {
        expect(screen.getByText('Success')).toBeInTheDocument();
      });

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(screen.queryByText('Success')).not.toBeInTheDocument();
      });
    });
  });

  describe('Manual Removal', () => {
    it('removes notification when remove button is clicked', async () => {
      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByText('Add Success'));

      await waitFor(() => {
        expect(screen.getByText('Success')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Remove First'));

      await waitFor(() => {
        expect(screen.queryByText('Success')).not.toBeInTheDocument();
      });
    });

    it('removes notification when X button is clicked', async () => {
      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByText('Add Success'));

      await waitFor(() => {
        expect(screen.getByText('Success')).toBeInTheDocument();
      });

      const dismissButton = screen.getByLabelText('Dismiss notification');
      fireEvent.click(dismissButton);

      // Wait for animation to complete
      act(() => {
        vi.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.queryByText('Success')).not.toBeInTheDocument();
      });
    });

    it('clears all notifications', async () => {
      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByText('Add Success'));
      fireEvent.click(screen.getByText('Add Error'));
      fireEvent.click(screen.getByText('Add Warning'));

      await waitFor(() => {
        expect(screen.getByTestId('notification-count')).toHaveTextContent('3');
      });

      fireEvent.click(screen.getByText('Clear All'));

      await waitFor(() => {
        expect(screen.getByTestId('notification-count')).toHaveTextContent('0');
      });
    });
  });

  describe('Maximum Notifications', () => {
    it('limits number of notifications to maxNotifications', async () => {
      render(
        <NotificationProvider maxNotifications={2}>
          <TestComponent />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByText('Add Success'));
      fireEvent.click(screen.getByText('Add Error'));
      fireEvent.click(screen.getByText('Add Warning'));

      await waitFor(() => {
        expect(screen.getByTestId('notification-count')).toHaveTextContent('2');
      });

      // Should show the two most recent notifications
      expect(screen.getByText('Warning')).toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.queryByText('Success')).not.toBeInTheDocument();
    });

    it('uses default maxNotifications when not specified', async () => {
      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      // Add 6 notifications (default max is 5)
      for (let i = 0; i < 6; i++) {
        fireEvent.click(screen.getByText('Add Success'));
      }

      await waitFor(() => {
        expect(screen.getByTestId('notification-count')).toHaveTextContent('5');
      });
    });
  });

  describe('Notification Styling', () => {
    it('applies correct styling for success notifications', async () => {
      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByText('Add Success'));

      await waitFor(() => {
        const notification = screen.getByRole('alert');
        expect(notification).toHaveClass('bg-green-50', 'border-green-200');
      });
    });

    it('applies correct styling for error notifications', async () => {
      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByText('Add Error'));

      await waitFor(() => {
        const notification = screen.getByRole('alert');
        expect(notification).toHaveClass('bg-red-50', 'border-red-200');
      });
    });

    it('applies correct styling for warning notifications', async () => {
      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByText('Add Warning'));

      await waitFor(() => {
        const notification = screen.getByRole('alert');
        expect(notification).toHaveClass('bg-yellow-50', 'border-yellow-200');
      });
    });

    it('applies correct styling for info notifications', async () => {
      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByText('Add Info'));

      await waitFor(() => {
        const notification = screen.getByRole('alert');
        expect(notification).toHaveClass('bg-blue-50', 'border-blue-200');
      });
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA attributes', async () => {
      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByText('Add Success'));

      await waitFor(() => {
        const notification = screen.getByRole('alert');
        expect(notification).toHaveAttribute('aria-live', 'polite');
      });
    });

    it('provides accessible dismiss button', async () => {
      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByText('Add Success'));

      await waitFor(() => {
        const dismissButton = screen.getByLabelText('Dismiss notification');
        expect(dismissButton).toBeInTheDocument();
        expect(dismissButton).toHaveClass('focus:outline-none', 'focus:ring-2');
      });
    });
  });

  describe('Animation', () => {
    it('shows notification with animation', async () => {
      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByText('Add Success'));

      await waitFor(() => {
        const notification = screen.getByRole('alert');
        expect(notification).toHaveClass('transition-all', 'duration-300');
      });
    });

    it('handles animation timing for removal', async () => {
      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByText('Add Success'));

      await waitFor(() => {
        expect(screen.getByText('Success')).toBeInTheDocument();
      });

      const dismissButton = screen.getByLabelText('Dismiss notification');
      fireEvent.click(dismissButton);

      // Should still be visible during animation
      expect(screen.getByText('Success')).toBeInTheDocument();

      // Should be removed after animation completes
      act(() => {
        vi.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.queryByText('Success')).not.toBeInTheDocument();
      });
    });
  });
});