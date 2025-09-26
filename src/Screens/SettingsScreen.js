
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { PoppinsFonts } from '../Config/Fonts';
import { performLogout } from '../Utils/StorageUtils';
import { useTheme } from '../Context/ThemeContext';
import { ApiService } from '../Utils/ApiService';

const SettingsScreen = ({ navigation, onLogout }) => {
  const theme = useTheme();
  const [isAvailable, setIsAvailable] = useState(true);
  const [showUnavailableModal, setShowUnavailableModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [showReasonDropdown, setShowReasonDropdown] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const unavailabilityReasons = [
    'Personal Emergency',
    'Medical Conference',
    'Vacation',
    'Sick Leave',
    'Equipment Maintenance',
    'Other'
  ];

  // Load availability status on component mount
  useEffect(() => {
    loadAvailabilityStatus();
  }, []);

  const loadAvailabilityStatus = async () => {
    try {
      const availability = await AsyncStorage.getItem('doctor_availability');
      if (availability !== null) {
        setIsAvailable(JSON.parse(availability));
      }
    } catch (error) {
      console.error('❌ Error loading availability status:', error);
    }
  };

  const toggleAvailability = async () => {
    if (isAvailable) {
      // If currently available, show modal to select reason for unavailability
      setShowUnavailableModal(true);
    } else {
      // If currently unavailable, make available
      await updateAvailability(true, '');
    }
  };

  const updateAvailability = async (available, reason) => {
    try {
      setIsAvailable(available);
      await AsyncStorage.setItem('doctor_availability', JSON.stringify(available));
      if (!available && reason) {
        await AsyncStorage.setItem('unavailability_reason', reason);
      }
      console.log('✅ Availability status updated:', available ? 'Available' : 'Unavailable');
      if (!available) {
        console.log('📝 Unavailability reason:', reason);
      }
    } catch (error) {
      console.error('❌ Error saving availability status:', error);
    }
  };

  const handleSubmitUnavailability = async () => {
    const reason = selectedReason === 'Other' ? customReason : selectedReason;
    if (!reason.trim()) {
      Alert.alert('Error', 'Please select or enter a reason for unavailability');
      return;
    }
    if (!startDate) {
      Alert.alert('Error', 'Please enter a start date (YYYY-MM-DD)');
      return;
    }
    if (!endDate) {
      Alert.alert('Error', 'Please enter an end date (YYYY-MM-DD)');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      Alert.alert('Error', 'End date must be after start date');
      return;
    }
    
    try {
      // Get doctor ID from AsyncStorage
      const userLoginData = await AsyncStorage.getItem('userLoginData');
      if (!userLoginData) {
        Alert.alert('Error', 'Doctor ID not found. Please login again.');
        return;
      }

      const parsedData = JSON.parse(userLoginData);
      const doctorId = parsedData.userData?.data?.id;
      
      if (!doctorId) {
        Alert.alert('Error', 'Doctor ID not found in login data');
        return;
      }

      // Convert formatted dates (YYYY/MM/DD) to API format (YYYY-MM-DD)
      const apiStartDate = startDate.replace(/\//g, '-');
      const apiEndDate = endDate.replace(/\//g, '-');

      console.log('🔍 Calling doctor-inactive API with:', {
        doctor_id: doctorId,
        start_date: apiStartDate,
        end_date: apiEndDate,
        content: reason,
        clinic_id: 1
      });

      // Call doctor-inactive API
      const response = await ApiService.markDoctorInactive(
        doctorId,
        apiStartDate,
        apiEndDate,
        reason,
        1 // clinic_id
      );

      if (response.success) {
        console.log('✅ Doctor marked as inactive successfully');
        
        // Update local availability status
        const unavailabilityData = {
          reason,
          startDate,
          endDate
        };
        
        updateAvailability(false, JSON.stringify(unavailabilityData));
        setShowUnavailableModal(false);
        setSelectedReason('');
        setCustomReason('');
        setStartDate('');
        setEndDate('');
        
        Alert.alert('Success', 'You have been marked as unavailable for the selected period.');
      } else {
        console.error('❌ Failed to mark doctor as inactive:', response.error);
        Alert.alert('Error', `Failed to update availability: ${response.error}`);
      }
    } catch (error) {
      console.error('❌ Error calling doctor-inactive API:', error);
      Alert.alert('Error', 'An error occurred while updating availability. Please try again.');
    }
  };

  const handleCloseModal = () => {
    setShowUnavailableModal(false);
    setSelectedReason('');
    setCustomReason('');
    setStartDate('');
    setEndDate('');
    setShowReasonDropdown(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Manual date/time input handlers with automatic formatting
  const formatDateInput = (value) => {
    // Remove all non-numeric characters
    const numericValue = value.replace(/\D/g, '');
    
    // Limit to 8 digits (YYYYMMDD)
    const limitedValue = numericValue.slice(0, 8);
    
    // Format as YYYY/MM/DD
    if (limitedValue.length <= 4) {
      return limitedValue;
    } else if (limitedValue.length <= 6) {
      return `${limitedValue.slice(0, 4)}/${limitedValue.slice(4)}`;
    } else {
      return `${limitedValue.slice(0, 4)}/${limitedValue.slice(4, 6)}/${limitedValue.slice(6)}`;
    }
  };

  const handleManualDateInput = (type, value) => {
    const formattedValue = formatDateInput(value);
    
    if (type === 'start') {
      setStartDate(formattedValue);
    } else {
      setEndDate(formattedValue);
    }
  };
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? This will clear all your data and you will need to login again.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🚪 User initiated logout...');
              
              // Show loading state
              Alert.alert('Logging out...', 'Please wait while we log you out.');
              
              // Perform logout
              const logoutResult = await performLogout();
              
              if (logoutResult.success) {
                console.log('✅ Logout successful, navigating to welcome screen');
                
                // Call the parent logout handler to update app state
                if (onLogout) {
                  onLogout();
                }
                
                // Show success message
                Alert.alert(
                  'Logged Out',
                  'You have been successfully logged out.',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        // Navigation will be handled by the parent component
                        console.log('✅ Logout process completed');
                      }
                    }
                  ]
                );
              } else {
                console.error('❌ Logout failed:', logoutResult.message);
                Alert.alert('Error', 'Failed to logout. Please try again.');
              }
            } catch (error) {
              console.error('❌ Error during logout:', error);
              Alert.alert('Error', 'An unexpected error occurred during logout.');
            }
          },
        },
      ]
    );
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          id: 'profile',
          title: 'Profile Information',
          icon: 'user',
          onPress: () => navigation.navigate('Profile'),
        },
        {
          id: 'availability',
          title: 'Availability Status',
          icon: 'clock',
          onPress: toggleAvailability,
          rightComponent: (
            <View style={[styles.availabilityToggle, { backgroundColor: isAvailable ? theme.colors.statusCompleted : theme.colors.statusPending }]}>
              <View style={[styles.availabilityToggleThumb, { 
                backgroundColor: theme.colors.surface,
                transform: [{ translateX: isAvailable ? 20 : 0 }]
              }]} />
            </View>
          ),
        },
      ],
    },
    {
      title: 'Appearance',
      items: [
        {
          id: 'theme',
          title: 'Dark Mode',
          icon: 'moon',
          onPress: theme.toggleTheme,
          rightComponent: (
            <View style={[styles.themeToggle, { backgroundColor: theme.isDarkMode ? theme.colors.primary : theme.colors.border }]}>
              <View style={[styles.themeToggleThumb, { 
                backgroundColor: theme.colors.surface,
                transform: [{ translateX: theme.isDarkMode ? 20 : 0 }]
              }]} />
            </View>
          ),
        },
      ],
    },
    {
      title: 'Appointments',
      items: [
        {
          id: 'history',
          title: 'Appointment History\'s',
          icon: 'calendar-alt',
          onPress: () => console.log('Appointment History'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'help',
          title: 'Help Centre',
          icon: 'headphones',
          onPress: () => console.log('Help Centre'),
        },
        {
          id: 'faq',
          title: 'FAQs',
          icon: 'question-circle',
          onPress: () => console.log('FAQs'),
        },
        {
          id: 'contact',
          title: 'Contact Support',
          icon: 'phone',
          onPress: () => console.log('Contact Support'),
        },
      ],
    },
    {
      title: 'Legal',
      items: [
        {
          id: 'terms',
          title: 'Terms & Condition',
          icon: 'file-alt',
          onPress: () => console.log('Terms & Condition'),
        },
        {
          id: 'privacy',
          title: 'Privacy Policy',
          icon: 'shield-alt',
          onPress: () => console.log('Privacy Policy'),
        },
        {
          id: 'contact-legal',
          title: 'Contact Support',
          icon: 'phone',
          onPress: () => console.log('Contact Support'),
        },
      ],
    },
    {
      title: 'Logout',
      items: [
        {
          id: 'logout',
          title: 'Logout',
          icon: 'sign-out-alt',
          onPress: handleLogout,
        },
      ],
    },
  ];

  const renderSettingItem = (item, isLast = false) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.settingItem, 
        !isLast && styles.settingItemBorder,
        { borderBottomColor: theme.colors.border }
      ]}
      onPress={item.onPress}
    >
      <View style={styles.settingItemLeft}>
        <Icon 
          name={item.icon} 
          size={20} 
          color={item.id === 'logout' ? '#FF6B6B' : theme.colors.text} 
          style={styles.settingIcon} 
        />
        <Text style={[
          styles.settingText,
          { color: theme.colors.text },
          item.id === 'logout' && styles.logoutText
        ]}>
          {item.title}
        </Text>
      </View>
          {item.rightComponent ? item.rightComponent : <Icon name="chevron-right" size={16} color={theme.colors.textSecondary} />}
    </TouchableOpacity>
  );

  const renderSection = (section) => (
    <View key={section.title} style={[
      styles.section,
      section.title === 'Logout' && styles.logoutSection
    ]}>
      <View style={[
        styles.sectionCard,
        { backgroundColor: theme.colors.cardBackground },
        section.title === 'Logout' && styles.logoutCard
      ]}>
        <Text style={[
          styles.sectionTitle, 
          { 
            color: theme.colors.text,
            borderBottomColor: theme.colors.border
          }
        ]}>{section.title}</Text>
        {section.items.map((item, index) => 
          renderSettingItem(item, index === section.items.length - 1)
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'left', 'right']}>
      <StatusBar 
        barStyle={theme.isDarkMode ? "light-content" : "dark-content"} 
        backgroundColor={theme.colors.primary} 
      />
      
      {/* Header */}
      <LinearGradient
        colors={['#1A83FF', '#003784']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </LinearGradient>

      {/* Content */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {settingsSections.map(renderSection)}
      </ScrollView>

      {/* Unavailability Reason Modal */}
      <Modal
        visible={showUnavailableModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.primary }]}>
                Mark Yourself Unavailable
              </Text>
              <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                <Icon name="times" size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalDescription, { color: theme.colors.textSecondary }]}>
              Let patients know why you're currently not available for appointments.
            </Text>

            <View style={styles.reasonSection}>
              <Text style={[styles.reasonLabel, { color: theme.colors.text }]}>Select Reason</Text>
              <TouchableOpacity
                style={[styles.reasonDropdown, { 
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.inputBorder 
                }]}
                onPress={() => setShowReasonDropdown(!showReasonDropdown)}
              >
                <Text style={[styles.reasonDropdownText, { color: selectedReason ? theme.colors.text : theme.colors.textTertiary }]}>
                  {selectedReason || 'Select a reason'}
                </Text>
                <Icon name="chevron-down" size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>

              {showReasonDropdown && (
                <View style={[styles.reasonOptions, { backgroundColor: theme.colors.cardBackground }]}>
                  {unavailabilityReasons.map((reason, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.reasonOption}
                      onPress={() => {
                        setSelectedReason(reason);
                        setShowReasonDropdown(false);
                      }}
                    >
                      <Text style={[styles.reasonOptionText, { color: theme.colors.text }]}>
                        {reason}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {selectedReason === 'Other' && (
              <View style={styles.customReasonSection}>
                <Text style={[styles.customReasonLabel, { color: theme.colors.text }]}>
                  Other (enter manually)
                </Text>
                <TextInput
                  style={[styles.customReasonInput, { 
                    backgroundColor: theme.colors.inputBackground,
                    borderColor: theme.colors.inputBorder,
                    color: theme.colors.text
                  }]}
                  placeholder="Enter your reason here..."
                  placeholderTextColor={theme.colors.textTertiary}
                  value={customReason}
                  onChangeText={setCustomReason}
                  multiline
                  numberOfLines={3}
                />
              </View>
            )}

            <View style={styles.dateSection}>
              <Text style={[styles.dateLabel, { color: theme.colors.text }]}>Unavailability Period</Text>
              
              <View style={styles.dateRow}>
                <View style={styles.dateField}>
                  <Text style={[styles.dateFieldLabel, { color: theme.colors.text }]}>Start Date</Text>
                  <TextInput
                    style={[styles.dateInput, { 
                      backgroundColor: theme.colors.inputBackground,
                      borderColor: theme.colors.inputBorder,
                      color: theme.colors.text
                    }]}
                    placeholder="YYYY/MM/DD"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={startDate}
                    onChangeText={(value) => handleManualDateInput('start', value)}
                  />
                </View>

                <View style={styles.dateField}>
                  <Text style={[styles.dateFieldLabel, { color: theme.colors.text }]}>End Date</Text>
                  <TextInput
                    style={[styles.dateInput, { 
                      backgroundColor: theme.colors.inputBackground,
                      borderColor: theme.colors.inputBorder,
                      color: theme.colors.text
                    }]}
                    placeholder="YYYY/MM/DD"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={endDate}
                    onChangeText={(value) => handleManualDateInput('end', value)}
                  />
                </View>
              </View>
            </View>


            <TouchableOpacity
              style={[styles.submitButton, { borderColor: theme.colors.primary }]}
              onPress={handleSubmitUnavailability}
            >
              <Text style={[styles.submitButtonText, { color: theme.colors.primary }]}>
                Submit
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* No native date pickers; manual entry only */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: hp('2%'),
    paddingBottom: hp('3%'),
    paddingHorizontal: wp('5%'),
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: wp('4%'),
    padding: wp('2%'),
  },
  headerTitle: {
    fontSize: wp('6%'),
    fontFamily: PoppinsFonts.Bold,
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: wp('5%'),
    paddingTop: hp('2%'),
    paddingBottom: hp('25%'), // Increased padding to ensure logout button is completely visible above bottom tab
  },
  section: {
    marginBottom: hp('2%'),
  },
  sectionTitle: {
    fontSize: wp('4.5%'),
    fontFamily: PoppinsFonts.Bold,
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('4%'),
    borderBottomWidth: 1,
  },
  sectionCard: {
    borderRadius: wp('3%'),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('4%'),
  },
  settingItemBorder: {
    borderBottomWidth: 1,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: wp('4%'),
    width: wp('5%'),
    textAlign: 'center',
  },
  settingText: {
    fontSize: wp('4%'),
    flex: 1,
  },
  logoutSection: {
    marginBottom: hp('20%'), // Extra margin for logout section to ensure visibility
  },
  logoutCard: {
    borderColor: '#FF6B6B', // Red border for logout card
    borderWidth: 1,
  },
  logoutText: {
    color: '#FF6B6B', // Red text color for logout
    fontFamily: PoppinsFonts.Bold,
  },
  themeToggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  themeToggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  availabilityToggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  availabilityToggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp('5%'),
  },
  modalContent: {
    width: '100%',
    borderRadius: wp('4%'),
    padding: wp('5%'),
    maxHeight: hp('70%'),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  modalTitle: {
    fontSize: wp('5%'),
    fontFamily: PoppinsFonts.Bold,
    flex: 1,
  },
  closeButton: {
    padding: wp('2%'),
  },
  modalDescription: {
    fontSize: wp('3.5%'),
    fontFamily: PoppinsFonts.Regular,
    marginBottom: hp('3%'),
    lineHeight: wp('4.5%'),
  },
  reasonSection: {
    marginBottom: hp('3%'),
  },
  reasonLabel: {
    fontSize: wp('4%'),
    fontFamily: PoppinsFonts.Medium,
    marginBottom: hp('1%'),
  },
  reasonDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    borderRadius: wp('2%'),
    borderWidth: 1,
  },
  reasonDropdownText: {
    fontSize: wp('3.8%'),
    fontFamily: PoppinsFonts.Regular,
    flex: 1,
  },
  reasonOptions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderRadius: wp('2%'),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    zIndex: 1000,
    marginTop: hp('0.5%'),
  },
  reasonOption: {
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  reasonOptionText: {
    fontSize: wp('3.8%'),
    fontFamily: PoppinsFonts.Regular,
  },
  customReasonSection: {
    marginBottom: hp('3%'),
  },
  customReasonLabel: {
    fontSize: wp('4%'),
    fontFamily: PoppinsFonts.Medium,
    marginBottom: hp('1%'),
  },
  customReasonInput: {
    borderWidth: 1,
    borderRadius: wp('2%'),
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    textAlignVertical: 'top',
    fontSize: wp('3.8%'),
    fontFamily: PoppinsFonts.Regular,
  },
  submitButton: {
    borderWidth: 2,
    borderRadius: wp('2%'),
    paddingVertical: hp('1.5%'),
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  submitButtonText: {
    fontSize: wp('4%'),
    fontFamily: PoppinsFonts.Bold,
  },
  // Date picker styles
  dateSection: {
    marginBottom: hp('3%'),
  },
  dateLabel: {
    fontSize: wp('4%'),
    fontFamily: PoppinsFonts.Medium,
    marginBottom: hp('2%'),
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: wp('3%'),
  },
  dateField: {
    flex: 1,
  },
  dateFieldLabel: {
    fontSize: wp('3.5%'),
    fontFamily: PoppinsFonts.Medium,
    marginBottom: hp('1%'),
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('1.5%'),
    borderRadius: wp('2%'),
    borderWidth: 1,
  },
  datePickerText: {
    fontSize: wp('3.5%'),
    fontFamily: PoppinsFonts.Regular,
    flex: 1,
  },
  dateInput: {
    marginTop: hp('1%'),
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('1%'),
    borderRadius: wp('2%'),
    borderWidth: 1,
    fontSize: wp('3.2%'),
    fontFamily: PoppinsFonts.Regular,
  },
});

export default SettingsScreen;