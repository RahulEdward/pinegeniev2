/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserProfileSection, { UserProfile, UserSettings } from '../UserProfileSection';
import { useClaudeLayoutStore } from '../../stores/claude-layout-store';

// Mock the store
jest.mock('../../stores/claude-layout-store');

const mockUseClaudeLayoutStore = useClaudeLayoutStore as jest.MockedFunction<typeof useClaudeLayoutStore>;

// Mock user data
const mockUser: UserProfile = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  initials: 'JD'
};

const mockUserWithAvatar: UserProfile = {
  ...mockUser,
  avatar: 'https://example.com/avatar.jpg'
};

const mockSettings: UserSettings = {
  theme: 'dark',
  fontSize: 14,
  autoOpenCodePanel: true,
  sidebarCollapsed: false,
  notifications: true,
  autoSave: true,
  language: 'en'
};

describe('UserProfileSection', () => {
  const mockOnUpdateSettings = jest.fn();
  const mockOnSignOut = jest.fn();
  const mockToggleTheme = jest.fn();
  const mockSetFontSize = jest.fn();
  const mockSetAutoOpenCodePanel = jest.fn();

  const defaultProps = {
    user: mockUser,
    settings: mockSettings,
    onUpdateSettings: mockOnUpdateSettings,
    onSignOut: mockOnSignOut
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseClaudeLayoutStore.mockReturnValue({
      sidebarCollapsed: false,
      toggleTheme: mockToggleTheme,
      setFontSize: mockSetFontSize,
      setAutoOpenCodePanel: mockSetAutoOpenCodePanel,
    } as any);
  });

  describe('Expanded State', () => {
    it('should render the user profile section in expanded state', () => {
      render(<UserProfileSection {...defaultProps} />);
      
      expect(screen.getByTestId('user-profile-section')).toBeInTheDocument();
      expect(screen.getByTestId('user-profile-section')).toHaveClass('expanded');
    });

    it('should display user information', () => {
      render(<UserProfileSection {...defaultProps} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    });

    it('should display user initials when no avatar is provided', () => {
      render(<UserProfileSection {...defaultProps} />);
      
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should display avatar image when provided', () => {
      render(<UserProfileSection {...defaultProps} user={mockUserWithAvatar} />);
      
      const avatarImage = screen.getByAltText('John Doe');
      expect(avatarImage).toBeInTheDocument();
      expect(avatarImage).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });

    it('should render settings and profile toggle buttons', () => {
      render(<UserProfileSection {...defaultProps} />);
      
      expect(screen.getByTestId('settings-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('profile-toggle')).toBeInTheDocument();
    });
  });

  describe('Collapsed State', () => {
    beforeEach(() => {
      mockUseClaudeLayoutStore.mockReturnValue({
        sidebarCollapsed: true,
        toggleTheme: mockToggleTheme,
        setFontSize: mockSetFontSize,
        setAutoOpenCodePanel: mockSetAutoOpenCodePanel,
      } as any);
    });

    it('should render in collapsed state', () => {
      render(<UserProfileSection {...defaultProps} />);
      
      expect(screen.getByTestId('user-profile-section')).toHaveClass('collapsed');
    });

    it('should show only icon buttons in collapsed state', () => {
      render(<UserProfileSection {...defaultProps} />);
      
      expect(screen.getByTestId('settings-button')).toBeInTheDocument();
      expect(screen.getByTestId('profile-button')).toBeInTheDocument();
      
      // User details should not be visible
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      expect(screen.queryByText('john.doe@example.com')).not.toBeInTheDocument();
    });
  });

  describe('Settings Panel', () => {
    it('should toggle settings panel when settings button is clicked', async () => {
      render(<UserProfileSection {...defaultProps} />);
      
      const settingsToggle = screen.getByTestId('settings-toggle');
      
      // Settings panel should not be visible initially
      expect(screen.queryByTestId('settings-panel')).not.toBeInTheDocument();
      
      // Click to open settings panel
      fireEvent.click(settingsToggle);
      
      await waitFor(() => {
        expect(screen.getByTestId('settings-panel')).toBeInTheDocument();
      });
      
      // Click to close settings panel
      fireEvent.click(settingsToggle);
      
      await waitFor(() => {
        expect(screen.queryByTestId('settings-panel')).not.toBeInTheDocument();
      });
    });

    it('should display all settings controls', async () => {
      render(<UserProfileSection {...defaultProps} />);
      
      const settingsToggle = screen.getByTestId('settings-toggle');
      fireEvent.click(settingsToggle);
      
      await waitFor(() => {
        expect(screen.getByTestId('theme-select')).toBeInTheDocument();
        expect(screen.getByTestId('font-size-range')).toBeInTheDocument();
        expect(screen.getByTestId('auto-open-code-panel-checkbox')).toBeInTheDocument();
        expect(screen.getByTestId('notifications-checkbox')).toBeInTheDocument();
        expect(screen.getByTestId('auto-save-checkbox')).toBeInTheDocument();
      });
    });

    it('should call onUpdateSettings when theme is changed', async () => {
      render(<UserProfileSection {...defaultProps} />);
      
      const settingsToggle = screen.getByTestId('settings-toggle');
      fireEvent.click(settingsToggle);
      
      await waitFor(() => {
        const themeSelect = screen.getByTestId('theme-select');
        fireEvent.change(themeSelect, { target: { value: 'light' } });
        
        expect(mockOnUpdateSettings).toHaveBeenCalledWith({ theme: 'light' });
      });
    });

    it('should call onUpdateSettings when font size is changed', async () => {
      render(<UserProfileSection {...defaultProps} />);
      
      const settingsToggle = screen.getByTestId('settings-toggle');
      fireEvent.click(settingsToggle);
      
      await waitFor(() => {
        const fontSizeRange = screen.getByTestId('font-size-range');
        fireEvent.change(fontSizeRange, { target: { value: '16' } });
        
        expect(mockOnUpdateSettings).toHaveBeenCalledWith({ fontSize: 16 });
        expect(mockSetFontSize).toHaveBeenCalledWith(16);
      });
    });

    it('should call onUpdateSettings when checkbox settings are changed', async () => {
      render(<UserProfileSection {...defaultProps} />);
      
      const settingsToggle = screen.getByTestId('settings-toggle');
      fireEvent.click(settingsToggle);
      
      await waitFor(() => {
        const autoOpenCheckbox = screen.getByTestId('auto-open-code-panel-checkbox');
        fireEvent.click(autoOpenCheckbox);
        
        expect(mockOnUpdateSettings).toHaveBeenCalledWith({ autoOpenCodePanel: false });
        expect(mockSetAutoOpenCodePanel).toHaveBeenCalledWith(false);
      });
    });

    it('should display current settings values', async () => {
      render(<UserProfileSection {...defaultProps} />);
      
      const settingsToggle = screen.getByTestId('settings-toggle');
      fireEvent.click(settingsToggle);
      
      await waitFor(() => {
        const themeSelect = screen.getByTestId('theme-select') as HTMLSelectElement;
        const fontSizeRange = screen.getByTestId('font-size-range') as HTMLInputElement;
        const autoOpenCheckbox = screen.getByTestId('auto-open-code-panel-checkbox') as HTMLInputElement;
        
        expect(themeSelect.value).toBe('dark');
        expect(fontSizeRange.value).toBe('14');
        expect(autoOpenCheckbox.checked).toBe(true);
      });
    });
  });

  describe('Profile Panel', () => {
    it('should toggle profile panel when profile button is clicked', async () => {
      render(<UserProfileSection {...defaultProps} />);
      
      const profileToggle = screen.getByTestId('profile-toggle');
      
      // Profile panel should not be visible initially
      expect(screen.queryByTestId('profile-panel')).not.toBeInTheDocument();
      
      // Click to open profile panel
      fireEvent.click(profileToggle);
      
      await waitFor(() => {
        expect(screen.getByTestId('profile-panel')).toBeInTheDocument();
      });
      
      // Click to close profile panel
      fireEvent.click(profileToggle);
      
      await waitFor(() => {
        expect(screen.queryByTestId('profile-panel')).not.toBeInTheDocument();
      });
    });

    it('should display all profile action buttons', async () => {
      render(<UserProfileSection {...defaultProps} />);
      
      const profileToggle = screen.getByTestId('profile-toggle');
      fireEvent.click(profileToggle);
      
      await waitFor(() => {
        expect(screen.getByTestId('edit-profile-button')).toBeInTheDocument();
        expect(screen.getByTestId('account-settings-button')).toBeInTheDocument();
        expect(screen.getByTestId('help-button')).toBeInTheDocument();
        expect(screen.getByTestId('sign-out-button')).toBeInTheDocument();
      });
    });

    it('should call onSignOut when sign out button is clicked and confirmed', async () => {
      // Mock window.confirm to return true
      const originalConfirm = window.confirm;
      window.confirm = jest.fn(() => true);

      render(<UserProfileSection {...defaultProps} />);
      
      const profileToggle = screen.getByTestId('profile-toggle');
      fireEvent.click(profileToggle);
      
      await waitFor(() => {
        const signOutButton = screen.getByTestId('sign-out-button');
        fireEvent.click(signOutButton);
        
        expect(mockOnSignOut).toHaveBeenCalled();
      });

      // Restore original confirm
      window.confirm = originalConfirm;
    });

    it('should not call onSignOut when sign out is cancelled', async () => {
      // Mock window.confirm to return false
      const originalConfirm = window.confirm;
      window.confirm = jest.fn(() => false);

      render(<UserProfileSection {...defaultProps} />);
      
      const profileToggle = screen.getByTestId('profile-toggle');
      fireEvent.click(profileToggle);
      
      await waitFor(() => {
        const signOutButton = screen.getByTestId('sign-out-button');
        fireEvent.click(signOutButton);
        
        expect(mockOnSignOut).not.toHaveBeenCalled();
      });

      // Restore original confirm
      window.confirm = originalConfirm;
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<UserProfileSection {...defaultProps} />);
      
      const settingsToggle = screen.getByTestId('settings-toggle');
      const profileToggle = screen.getByTestId('profile-toggle');
      
      expect(settingsToggle).toHaveAttribute('aria-expanded', 'false');
      expect(profileToggle).toHaveAttribute('aria-expanded', 'false');
    });

    it('should update ARIA attributes when panels are opened', async () => {
      render(<UserProfileSection {...defaultProps} />);
      
      const settingsToggle = screen.getByTestId('settings-toggle');
      fireEvent.click(settingsToggle);
      
      await waitFor(() => {
        expect(settingsToggle).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('should have proper labels for form controls', async () => {
      render(<UserProfileSection {...defaultProps} />);
      
      const settingsToggle = screen.getByTestId('settings-toggle');
      fireEvent.click(settingsToggle);
      
      await waitFor(() => {
        const themeSelect = screen.getByTestId('theme-select');
        const fontSizeRange = screen.getByTestId('font-size-range');
        
        expect(themeSelect).toHaveAttribute('id', 'theme-select');
        expect(fontSizeRange).toHaveAttribute('id', 'font-size-range');
        
        expect(screen.getByLabelText('Theme')).toBeInTheDocument();
        expect(screen.getByLabelText(/Font Size:/)).toBeInTheDocument();
      });
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      render(<UserProfileSection {...defaultProps} className="custom-class" />);
      
      const section = screen.getByTestId('user-profile-section');
      expect(section).toHaveClass('custom-class');
    });
  });
});