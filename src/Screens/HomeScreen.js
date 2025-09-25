import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { getDoctorId, setDoctorId } from '../Utils/StorageUtils';
import { useTheme } from '../Context/ThemeContext';
import { PoppinsFonts } from '../Config/Fonts';

const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  
  // State management for dashboard data
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // API Base URL - Update this with your actual API base URL
  const API_BASE_URL = 'https://spiderdesk.asia/healto/api'; // Your actual API URL
  
  // Always use API calls - no mock data
  const ENABLE_API_CALLS = true;
  
  // Fallback data when API is not available
  const FALLBACK_DATA = {
    total_patients_today: 0,
    pending_patients: 0,
    appointments: []
  };
  

  // Function to fetch appointments data
  const fetchAppointmentsData = async (doctorId) => {
    try {
      console.log('📅 Fetching appointments data...');
      
      const requestData = {
        doctor_id: doctorId
      };
      
      console.log('📤 Appointments API Request Data:', requestData);
      console.log('🌐 Appointments API URL:', `${API_BASE_URL}/doctor-appointments`);

      const response = await axios.get(`${API_BASE_URL}/doctor-appointments`, {
        params: requestData
      });

      console.log('📥 Appointments API Response:', response);
      console.log('📊 Appointments Response Status:', response.status);
      console.log('💾 Appointments Response Data:', response.data);

      if (response.data && response.data.status) {
        console.log('✅ Appointments API Response Status:', response.data.status);
        console.log('📝 Appointments API Message:', response.data.message);
        console.log('📅 Appointments Data:', response.data.data);
        
        // Extract appointments array from the response
        const allAppointments = response.data.data?.appointments || [];
        console.log('📋 All Appointments:', allAppointments);
        
        // Filter only scheduled appointments (not completed)
        const scheduledAppointments = allAppointments.filter(appointment => 
          appointment.status === 'scheduled'
        );
        console.log('📅 Scheduled Appointments Only:', scheduledAppointments);
        
        // Sort appointments by time (earliest first)
        const sortedAppointments = scheduledAppointments.sort((a, b) => {
          const timeA = a.appointment_time || '00:00';
          const timeB = b.appointment_time || '00:00';
          return timeA.localeCompare(timeB);
        });
        console.log('⏰ Sorted Appointments by Time:', sortedAppointments);
        
        return sortedAppointments;
      } else {
        console.log('⚠️ Invalid appointments API response format');
        return [];
      }
    } catch (err) {
      console.error('❌ Error fetching appointments data:', err);
      console.error('❌ Appointments Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      return [];
    }
  };

  // Function to fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      
      // Get doctor_id from AsyncStorage using utility function
      let doctorId = await getDoctorId();
      console.log('🔍 Doctor ID from AsyncStorage:', doctorId);
      
      if (!doctorId) {
        console.log('⚠️ Doctor ID not found, trying to load doctor info first...');
        await loadDoctorInfo();
        
        // Try to get doctor ID again
        doctorId = await getDoctorId();
        console.log('🔍 Retry Doctor ID from AsyncStorage:', doctorId);
        
        if (!doctorId) {
          throw new Error('Doctor ID not found in local storage after retry');
        }
      }

      // Prepare API request data
      const requestData = {
        doctor_id: doctorId
      };
      
      console.log('📤 API Request Data:', requestData);
      console.log('🌐 API URL:', `${API_BASE_URL}/doctor-dashboard`);

      // Make API call to doctor-dashboard endpoint
      const response = await axios.get(`${API_BASE_URL}/doctor-dashboard`, {
        params: requestData
      });

      console.log('📥 Full API Response:', response);
      console.log('📊 Response Status:', response.status);
      console.log('📋 Response Headers:', response.headers);
      console.log('💾 Response Data:', response.data);

      if (response.data && response.data.status) {
        console.log('✅ API Response Status:', response.data.status);
        console.log('📝 API Message:', response.data.message);
        console.log('📊 API Data:', response.data.data);
        
        if (response.data.data) {
          // Fetch appointments data in parallel
          const appointmentsData = await fetchAppointmentsData(doctorId);
          
          // Map API response to our expected format
          const mappedData = {
            total_patients_today: response.data.data.total_patients_today || 0,
            pending_patients: response.data.data.total_pending_patients_today || 0,
            appointments: appointmentsData
          };
          
          console.log('🔄 Mapped Data:', mappedData);
          setDashboardData(mappedData);
        } else {
          console.log('⚠️ No data object in API response');
        }
      } else {
        console.log('⚠️ Invalid API response format');
        throw new Error('Invalid API response format');
      }
    } catch (err) {
      console.error('❌ Error fetching dashboard data:', err);
      console.error('❌ Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      
      // Check if it's a network error (API not available)
      if (err.message === 'Network Error' || err.code === 'NETWORK_ERROR') {
        console.log('🌐 Network Error - API not available, using fallback data');
        console.log('📊 Using Fallback Data:', FALLBACK_DATA);
        setDashboardData(FALLBACK_DATA);
        setError('API not available - showing empty dashboard');
      } else {
        setError(err.message || 'Failed to fetch dashboard data');
        Alert.alert('Error', 'Failed to load dashboard data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Navigation function for appointment details
  const navigateToAppointmentDetails = (appointment) => {
    console.log('📱 Navigating to appointment details:', appointment);
    navigation.navigate('AppointmentDetails', { appointment });
  };

  // Fetch data on component mount
  useEffect(() => {
    const initializeData = async () => {
      // Load doctor info first
      await loadDoctorInfo();
      // Then fetch dashboard data
      await fetchDashboardData();
    };
    
    initializeData();
  }, []);

  // Function to load doctor information from stored user data
  const loadDoctorInfo = async () => {
    try {
      console.log('🔍 Loading Doctor Information from User Data...');
      
      // Get user login data
      const userLoginData = await AsyncStorage.getItem('userLoginData');
      console.log('👤 User Login Data:', userLoginData);
      
      if (userLoginData) {
        const parsedData = JSON.parse(userLoginData);
        console.log('📊 Parsed User Login Data:', parsedData);
        
        if (parsedData.userData && parsedData.userData.data) {
          const doctorData = parsedData.userData.data;
          console.log('🩺 Doctor Data:', doctorData);
          
          // Extract doctor information
          const doctorInfo = {
            id: doctorData.id,
            name: doctorData.name,
            email: doctorData.email,
            phone: doctorData.phone,
            profile_image: doctorData.profile_image,
            specialization: doctorData.specialization_id,
            experience_years: doctorData.experience_years,
            qualification: doctorData.qualification,
            rating: doctorData.rating,
            info: doctorData.info,
            gender: doctorData.gender,
            blood_group: doctorData.blood_group,
            address: doctorData.address,
            dob: doctorData.dob,
            reviews: doctorData.reviews,
            clinic_id: doctorData.clinic_id,
            created_at: doctorData.created_at,
            updated_at: doctorData.updated_at
          };
          
          console.log('✅ Extracted Doctor Info:', doctorInfo);
          console.log('👨‍⚕️ Doctor Name:', doctorInfo.name);
          console.log('🎓 Qualification:', doctorInfo.qualification);
          console.log('⏰ Experience:', doctorInfo.experience_years, 'years');
          console.log('⭐ Rating:', doctorInfo.rating);
          console.log('📧 Email:', doctorInfo.email);
          console.log('📱 Phone:', doctorInfo.phone);
          console.log('🏥 Specialization ID:', doctorInfo.specialization);
          console.log('📍 Address:', doctorInfo.address);
          console.log('🖼️ Profile Image:', doctorInfo.profile_image);
          console.log('🖼️ Full Image URL:', `${API_BASE_URL.replace('/api', '')}/${doctorInfo.profile_image}`);
          setDoctorInfo(doctorInfo);
          
          // Save doctor ID for API calls
          await setDoctorId(doctorData.id.toString());
          console.log('💾 Doctor ID saved:', doctorData.id.toString());
          
        } else {
          console.log('⚠️ No user data found in userLoginData');
        }
      } else {
        console.log('⚠️ No userLoginData found in storage');
      }
      
    } catch (error) {
      console.error('❌ Error loading doctor info:', error);
    }
  };

  // Pull to refresh function
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      console.log('🔄 Refreshing data...');
      await Promise.all([
        fetchDashboardData(),
        fetchAppointmentsData()
      ]);
      console.log('✅ Data refreshed successfully');
    } catch (error) {
      console.error('❌ Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Log dashboard data whenever it changes
  useEffect(() => {
    if (dashboardData) {
      console.log('📊 Dashboard Data Updated:', dashboardData);
      console.log('📊 Dashboard Data Structure:', JSON.stringify(dashboardData, null, 2));
      console.log('📈 Total Patients Today:', dashboardData.total_patients_today);
      console.log('⏳ Pending Patients:', dashboardData.pending_patients);
      console.log('📅 Appointments Count:', dashboardData.appointments?.length || 0);
      
      if (dashboardData.appointments && dashboardData.appointments.length > 0) {
        console.log('📅 Appointments Details:', dashboardData.appointments);
        // Log each appointment individually
        dashboardData.appointments.forEach((appointment, index) => {
          console.log(`👤 Appointment ${index + 1}:`, {
            name: appointment.patient_name,
            age: appointment.age,
            symptoms: appointment.symptoms,
            time: appointment.appointment_time
          });
        });
      }
    }
  }, [dashboardData]);

  // Loading component
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar 
          barStyle={theme.isDarkMode ? "light-content" : "dark-content"} 
          backgroundColor={theme.colors.background} 
        />
        <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error component
  if (error) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={60} color="#FF6B8A" />
          <Text style={styles.errorText}>Failed to load dashboard</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchDashboardData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar 
        barStyle={theme.isDarkMode ? "light-content" : "dark-content"} 
        backgroundColor={theme.colors.background} 
      />
      <ScrollView 
        style={[styles.scrollView, { paddingTop: insets.top }]} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        
        {/* Header with Profile */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              {doctorInfo?.profile_image ? (
                <Image 
                  source={{ 
                    uri: `${API_BASE_URL.replace('/api', '')}/${doctorInfo.profile_image}`,
                    headers: {
                      'Accept': 'image/*',
                    }
                  }} 
                  style={styles.profileImage}
                  defaultSource={require('../Assets/Images/phone2.png')}
                  onError={(error) => {
                    console.log('❌ Profile image failed to load:', error.nativeEvent.error);
                    console.log('🖼️ Attempted URL:', `${API_BASE_URL.replace('/api', '')}/${doctorInfo.profile_image}`);
                    console.log('🔄 Trying alternative URL formats...');
                  }}
                  onLoad={() => {
                    console.log('✅ Profile image loaded successfully');
                    console.log('🖼️ Image URL:', `${API_BASE_URL.replace('/api', '')}/${doctorInfo.profile_image}`);
                  }}
                />
              ) : (
              <View style={[styles.profileImage, styles.profilePlaceholder]}>
                <Icon name="person" size={40} color="#4A90E2" />
              </View>
              )}
            </View>
            <View style={styles.greetingSection}>
              <Text style={[styles.greetingText, { color: theme.colors.text }]}>Hello,</Text>
              <Text style={[styles.doctorName, { color: theme.colors.primary }]}>
                Dr. {doctorInfo?.name || 'Doctor'}
              </Text>
              {doctorInfo?.qualification && (
                <Text style={[styles.doctorQualification, { color: theme.colors.textSecondary }]}>
                  {doctorInfo.qualification} • {doctorInfo.experience_years} years exp
                </Text>
              )}
              {doctorInfo?.rating && (
                <View style={styles.ratingContainer}>
                  <Icon name="star" size={12} color="#FFD700" />
                  <Text style={styles.ratingText}>
                    {doctorInfo.rating}/5
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>



        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statCardInner, styles.totalPatientsCard]}>
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>
                {dashboardData?.total_patients_today || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Total Patients Today</Text>
            </View>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.statCardInner, styles.pendingPatientsCard]}>
              <Text style={[styles.pendingNumber, { color: theme.colors.text }]}>
                {dashboardData?.pending_patients || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Pending Patients</Text>
            </View>
          </View>
        </View>

        {/* Today Appointments Section */}
        <View style={styles.appointmentsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Today Appointments</Text>
           
          </View>

          {/* Appointment Cards */}
          {dashboardData?.appointments && dashboardData.appointments.length > 0 ? (
            dashboardData.appointments.map((appointment, index) => (
              <TouchableOpacity 
                key={appointment.id || index} 
                style={[styles.appointmentCard, { backgroundColor: theme.colors.cardBackground }]}
                onPress={() => navigateToAppointmentDetails(appointment)}
                activeOpacity={0.7}
              >
            <View style={styles.appointmentContent}>
              <View style={styles.patientImageContainer}>
                <Image 
                  source={{ 
                    uri: appointment.patient?.profile_image && appointment.patient.profile_image !== null 
                      ? `${API_BASE_URL.replace('/api', '')}/${appointment.patient.profile_image}`
                      : 'https://spiderdesk.asia/healto/profile_images/1757571656_stylish-handsome-indian-man-tshirt-pastel-wall 1.jpg',
                    headers: {
                      'Accept': 'image/*',
                    }
                  }} 
                  style={[styles.patientImage, styles.patientImageActual]}
                  defaultSource={require('../Assets/Images/phone2.png')}
                  onError={(error) => {
                    console.log('❌ Patient profile image failed to load for:', appointment.patient?.name);
                  }}
                  onLoad={() => {
                    console.log('✅ Patient profile image loaded for:', appointment.patient?.name);
                  }}
                />
              </View>
              <View style={styles.patientInfo}>
                <View style={styles.tokenTimeRow}>
                  <Text style={[styles.tokenNumber, { color: theme.colors.primary }]}>
                    {appointment.details?.token || appointment.token || 'N/A'}
                  </Text>
                  <Text style={[styles.patientDetail, { color: theme.colors.textSecondary }]}>
                    Time : {appointment.appointment_time || 'N/A'}
                  </Text>
                </View>
              
              {/* Sub-patient details */}
                    {appointment.sub_patient && (
                      <>
                      
                        <Text style={[styles.patientDetail, { color: theme.colors.textSecondary }]}>
                          Name : {appointment.sub_patient.name}
                        </Text>
                        <Text style={[styles.patientDetail, { color: theme.colors.textSecondary }]}>
                          Age : {appointment.sub_patient.age || 'N/A'}
                        </Text>
                        
                      </>
                    )}
                    
                    {/* Details description */}
                    {appointment.details?.description && (
                      <Text style={[styles.patientDetail, { color: theme.colors.textSecondary }]}>
                        Description : {appointment.details.description}
                      </Text>
                    )}
                  </View>
                  <View style={styles.appointmentStatusContainer}>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: appointment.status === 'completed' ? theme.colors.statusCompleted : 
                                       appointment.status === 'scheduled' ? theme.colors.statusScheduled : theme.colors.statusPending }
                    ]}>
                      <Text style={styles.statusText}>{appointment.status}</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#4A90E2" />
            </View>
          </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.noAppointmentsContainer}>
              <Icon name="calendar-outline" size={40} color="#CCCCCC" />
              <Text style={styles.noAppointmentsText}>No appointments for today</Text>
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: wp('5%'),
  },
  header: {
    paddingTop: hp('1.2%'),
    paddingBottom: hp('2.5%'),
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    marginRight: wp('4%'),
  },
  profileImage: {
    width: wp('25%'),
    height: wp('25%'),
    borderRadius: wp('12.5%'),
    borderWidth: 3,
    borderColor: '#E8F4FD',
  },
  greetingSection: {
    flex: 1,
  },
  greetingText: {
    fontSize: wp('7%'),
    fontFamily: PoppinsFonts.Bold,
    color: '#000000',
    marginBottom: hp('0.6%'),
  },
  doctorName: {
    fontSize: wp('7%'),
    fontFamily: PoppinsFonts.Bold,
    color: '#4A90E2',
  },
  doctorQualification: {
    fontSize: wp('3%'),
    color: '#666666',
    marginTop: hp('0.3%'),
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('0.3%'),
  },
  ratingText: {
    fontSize: wp('2.8%'),
    color: '#FFD700',
    marginLeft: wp('1%'),
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp('3.7%'),
  },
  statCard: {
    flex: 1,
    marginHorizontal: wp('1.2%'),
  },
  statCardInner: {
    padding: wp('5%'),
    borderRadius: wp('3.7%'),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  totalPatientsCard: {
    backgroundColor: '#4A90E2',
  },
  pendingPatientsCard: {
    backgroundColor: '#FF6B8A',
  },
  statNumber: {
    fontSize: wp('10%'),
    fontFamily: PoppinsFonts.Bold,
    color: '#FFFFFF',
    marginBottom: hp('0.6%'),
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  pendingNumber: {
    fontSize: wp('10%'),
    fontFamily: PoppinsFonts.Bold,
    color: '#FFFFFF',
    marginBottom: hp('0.6%'),
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  statLabel: {
    fontSize: wp('3.8%'),
    fontFamily: PoppinsFonts.SemiBold,
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  appointmentsSection: {
    marginBottom: hp('12.3%'),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('2.5%'),
  },
  sectionTitle: {
    fontSize: wp('4.5%'),
    fontFamily: PoppinsFonts.Bold,
    color: '#000000',
  },
  seeAllText: {
    fontSize: wp('3.5%'),
    color: '#000000',
    fontWeight: '500',
  },
  appointmentCard: {
    backgroundColor: '#ffffff',
    borderRadius: wp('3.7%'),
    padding: wp('3.7%'),
    marginBottom: hp('1.8%'),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  appointmentContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appointmentStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: wp('2%'),
  },
  statusBadge: {
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.5%'),
    borderRadius: wp('2%'),
    marginRight: wp('2%'),
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: wp('2.5%'),
    fontFamily: PoppinsFonts.Bold,
    textTransform: 'capitalize',
  },
  patientImageContainer: {
    marginRight: wp('3.7%'),
  },
  patientImage: {
    width: wp('19%'),
    height: wp('26%'),
    borderRadius: wp('2%'),
  },
  patientImageActual: {
    borderWidth: 2,
    borderColor: '#E8F4FD',
  },
  patientInfo: {
    flex: 1,
  },
  patientNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('0.5%'),
  },
  patientName: {
    fontSize: wp('4%'),
    fontFamily: PoppinsFonts.Bold,
    flex: 1,
  },
  tokenNumber: {
    fontSize: wp('4%'),
    fontFamily: PoppinsFonts.Bold,
    backgroundColor: '#E3F2FD',
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.3%'),
    borderRadius: wp('2%'),
    textAlign: 'center',
    minWidth: wp('8%'),
  },
  tokenTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: hp('0.5%'),
    marginBottom: hp('0.5%'),
  },
  subPatientTitle: {
    fontSize: wp('3.2%'),
    fontFamily: PoppinsFonts.Bold,
    marginTop: hp('0.8%'),
    marginBottom: hp('0.3%'),
  },
  patientDetail: {
    fontSize: wp('3.5%'),
    fontFamily: PoppinsFonts.Medium,
    color: '#000000',
    marginBottom: hp('0.25%'),
  },
  patientInitials: {
    fontSize: wp('4%'),
    fontFamily: PoppinsFonts.Bold,
    color: '#4A90E2',
  },
  patientPlaceholder: {
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp('5%'),
  },
  loadingText: {
    fontSize: wp('4%'),
    color: '#4A90E2',
    marginTop: hp('2%'),
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp('5%'),
  },
  errorText: {
    fontSize: wp('4%'),
    color: '#FF6B8A',
    marginTop: hp('2%'),
    marginBottom: hp('3%'),
    textAlign: 'center',
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: wp('8%'),
    paddingVertical: hp('1.5%'),
    borderRadius: wp('2%'),
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: wp('4%'),
    fontFamily: PoppinsFonts.Bold,
  },
  noAppointmentsContainer: {
    alignItems: 'center',
    paddingVertical: hp('4%'),
  },
  noAppointmentsText: {
    fontSize: wp('3.5%'),
    color: '#CCCCCC',
    marginTop: hp('1%'),
    fontWeight: '500',
  },
  dataSourceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('0.5%'),
  },
  dataSourceText: {
    fontSize: wp('2.5%'),
    color: '#4A90E2',
    marginLeft: wp('1%'),
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    padding: wp('2%'),
    marginRight: wp('2%'),
    borderRadius: wp('2%'),
    backgroundColor: '#F0F8FF',
  },
  storageButton: {
    padding: wp('2%'),
    marginRight: wp('2%'),
    borderRadius: wp('2%'),
    backgroundColor: '#F0F8FF',
  },
  testButton: {
    padding: wp('2%'),
    marginRight: wp('2%'),
    borderRadius: wp('2%'),
    backgroundColor: '#F0F8FF',
  },
  realDataButton: {
    padding: wp('2%'),
    marginRight: wp('3%'),
    borderRadius: wp('2%'),
    backgroundColor: '#F0F8FF',
  },
  debugPanel: {
    backgroundColor: '#F8F9FA',
    padding: wp('3%'),
    marginBottom: hp('2%'),
    borderRadius: wp('2%'),
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  debugTitle: {
    fontSize: wp('3.5%'),
    fontFamily: PoppinsFonts.Bold,
    color: '#495057',
    marginBottom: hp('1%'),
  },
  debugText: {
    fontSize: wp('3%'),
    color: '#6C757D',
    marginBottom: hp('0.5%'),
  },
});

export default HomeScreen;
