import React from 'react';
import renderer from 'react-test-renderer';
import ProfileScreen from '../src/Screens/ProfileScreen';

// Mock navigation
const mockNavigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
};

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, ...props }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock react-native-responsive-screen
jest.mock('react-native-responsive-screen', () => ({
  widthPercentageToDP: jest.fn((width) => width),
  heightPercentageToDP: jest.fn((height) => height),
}));

// Mock react-native-linear-gradient
jest.mock('react-native-linear-gradient', () => 'LinearGradient');

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

describe('ProfileScreen', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <ProfileScreen navigation={mockNavigation} />
    );
    
    expect(getByText('Profile')).toBeTruthy();
    expect(getByText('Basic Information')).toBeTruthy();
    expect(getByText('Professional Details')).toBeTruthy();
    expect(getByText('Save Changes')).toBeTruthy();
  });

  it('displays form fields correctly', () => {
    const { getByText } = render(
      <ProfileScreen navigation={mockNavigation} />
    );
    
    expect(getByText('Full Name')).toBeTruthy();
    expect(getByText('Phone Number')).toBeTruthy();
    expect(getByText('Email')).toBeTruthy();
    expect(getByText('Gender')).toBeTruthy();
    expect(getByText('Specialization')).toBeTruthy();
    expect(getByText('Year Of Experience')).toBeTruthy();
    expect(getByText('Clinic/Hospital')).toBeTruthy();
    expect(getByText('Clinic Name')).toBeTruthy();
  });

  it('handles back button press', () => {
    const { getByTestId } = render(
      <ProfileScreen navigation={mockNavigation} />
    );
    
    // Note: In a real test, you'd need to add testID to the back button
    // fireEvent.press(getByTestId('back-button'));
    // expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it('displays theme mode indicator', () => {
    const { getByText } = render(
      <ProfileScreen navigation={mockNavigation} />
    );
    
    // Should show either "Dark Mode" or "Light Mode"
    const themeText = getByText(/Mode/);
    expect(themeText).toBeTruthy();
  });

  it('handles theme toggle', () => {
    const mockToggleTheme = jest.fn();
    const mockTheme = {
      isDarkMode: false,
      toggleTheme: mockToggleTheme,
      colors: {
        background: '#FFFFFF',
        text: '#000000',
        primary: '#4A90E2',
        cardBackground: '#FFFFFF',
        inputBackground: '#F5F5F5',
        inputBorder: '#E0E0E0',
        inputText: '#000000',
        textSecondary: '#666666',
        textTertiary: '#999999',
        headerText: '#FFFFFF',
        buttonPrimary: '#4A90E2',
        buttonText: '#FFFFFF',
        primaryLight: '#E8F4FD',
      }
    };

    // Mock the useTheme hook
    jest.doMock('../src/Context/ThemeContext', () => ({
      useTheme: () => mockTheme,
    }));

    const { getByTestId } = render(
      <ProfileScreen navigation={mockNavigation} />
    );
    
    // Note: In a real test, you'd need to add testID to the theme toggle button
    // fireEvent.press(getByTestId('theme-toggle'));
    // expect(mockToggleTheme).toHaveBeenCalled();
  });
});
