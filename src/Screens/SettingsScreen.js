
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
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

const SettingsScreen = ({ navigation, onLogout }) => {
  const theme = useTheme();
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
});

export default SettingsScreen;