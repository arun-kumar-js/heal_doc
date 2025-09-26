import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useTheme } from '../Context/ThemeContext';
import { PoppinsFonts } from '../Config/Fonts';

const AppointmentsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'https://spiderdesk.asia/healto/api';

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, selectedFilter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      console.log('📅 Fetching appointments data...');
      
      const doctorId = await AsyncStorage.getItem('doctor_id');
      if (!doctorId) {
        console.log('❌ Doctor ID not found');
        setError('Doctor ID not found');
        return;
      }

      const requestData = {
        doctor_id: doctorId
      };
      
      console.log('📤 API Request Data:', requestData);
      console.log('🌐 API URL:', `${API_BASE_URL}/doctor-dashboard`);

      const response = await axios.get(`${API_BASE_URL}/doctor-dashboard`, {
        params: requestData
      });

      console.log('📥 API Response:', response);
      console.log('📊 Response Status:', response.status);
      console.log('💾 Response Data:', response.data);

      if (response.data && response.data.status) {
        console.log('✅ API Response Status:', response.data.status);
        console.log('📝 API Message:', response.data.message);
        console.log('📅 Appointments Data:', response.data.data);
        
        // Get appointments from doctor-dashboard response
        const allAppointments = response.data.data?.appointments || [];
        console.log('📋 All Appointments:', allAppointments);
        
        // Sort appointments by time (earliest first)
        const sortedAppointments = allAppointments.sort((a, b) => {
          const timeA = a.appointment_time || '00:00';
          const timeB = b.appointment_time || '00:00';
          return timeA.localeCompare(timeB);
        });
        console.log('⏰ Sorted Appointments by Time:', sortedAppointments);
        
        setAppointments(sortedAppointments);
        setError(null);
      } else {
        console.log('⚠️ Invalid API response format');
        setError('Invalid response format');
      }
    } catch (err) {
      console.error('❌ Error fetching appointments data:', err);
      console.error('❌ Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      setError('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = appointments;
    
    switch (selectedFilter) {
      case 'Scheduled':
        filtered = appointments.filter(appointment => appointment.status === 'scheduled');
        break;
      case 'Completed':
        filtered = appointments.filter(appointment => appointment.status === 'completed');
        break;
      case 'All':
      default:
        filtered = appointments;
        break;
    }
    
    setFilteredAppointments(filtered);
  };

  const navigateToAppointmentDetails = (appointment) => {
    navigation.navigate('AppointmentDetails', { appointment });
  };

  const renderFilterButton = (filter) => (
    <TouchableOpacity
      key={filter}
      style={[
        styles.filterButton,
        { 
          backgroundColor: selectedFilter === filter ? theme.colors.primary : theme.colors.cardBackground,
          borderColor: theme.colors.primary
        }
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text style={[
        styles.filterButtonText,
        { color: selectedFilter === filter ? '#FFFFFF' : theme.colors.primary }
      ]}>
        {filter}
      </Text>
    </TouchableOpacity>
  );

  const renderAppointmentCard = (appointment, index) => (
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
            style={styles.patientImage}
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
          <View style={styles.nameTokenRow}>
            <Text style={[styles.patientName, { color: theme.colors.primary }]}>
              {appointment.patient?.name || appointment.sub_patient?.name || 'Unknown Patient'}
            </Text>
            <Text style={[styles.tokenNumber, { color: theme.colors.primary }]}>
              #{appointment.details?.token || appointment.token || 'N/A'}
            </Text>
          </View>
          
          <Text style={[styles.patientDetail, { color: theme.colors.text }]}>
            Age : <Text style={[styles.patientDetailBold, { color: theme.colors.text }]}>{appointment.patient?.age || appointment.sub_patient?.age || 'N/A'}</Text>
          </Text>
          
          <Text style={[styles.patientDetail, { color: theme.colors.text }]}>
            Symptoms : <Text style={[styles.patientDetailBold, { color: theme.colors.text }]}>{appointment.details?.description || 'General Consultation'}</Text>
          </Text>
          
          <Text style={[styles.patientDetail, { color: theme.colors.text }]}>
            On : <Text style={[styles.patientDetailBold, { color: theme.colors.text }]}>{appointment.appointment_time || 'N/A'}</Text>
          </Text>
          
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusBadge,
              { backgroundColor: appointment.status === 'completed' ? theme.colors.statusCompleted : 
                               appointment.status === 'scheduled' ? theme.colors.statusScheduled : theme.colors.statusPending }
            ]}>
              <Text style={styles.statusText}>{appointment.status}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.arrowContainer}>
          <Icon name="chevron-right" size={20} color={theme.colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Header */}
        <LinearGradient
          colors={['#1A83FF', '#003784']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Appointments</Text>
          <TouchableOpacity style={styles.menuButton}>
            <Icon name="ellipsis-v" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          {['All', 'Scheduled', 'Completed'].map(renderFilterButton)}
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>
              Loading appointments...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Icon name="exclamation-circle" size={40} color="#FF6B6B" />
            <Text style={[styles.errorText, { color: theme.colors.text }]}>
              {error}
            </Text>
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
              onPress={fetchAppointments}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredAppointments.length > 0 ? (
          <ScrollView 
            style={styles.appointmentsList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.appointmentsListContent}
          >
            {filteredAppointments.map(renderAppointmentCard)}
          </ScrollView>
        ) : (
          <View style={styles.noAppointmentsContainer}>
            <Icon name="calendar-alt" size={40} color="#CCCCCC" />
            <Text style={[styles.noAppointmentsText, { color: theme.colors.text }]}>
              No {selectedFilter.toLowerCase()} appointments found
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: hp('1%'),
    paddingBottom: hp('2%'),
    paddingHorizontal: wp('4%'),
    marginBottom: hp('2%'),
    borderRadius: wp('2%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: wp('2%'),
  },
  title: {
    fontSize: wp('6%'),
    fontFamily: PoppinsFonts.Bold,
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  menuButton: {
    padding: wp('2%'),
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: hp('2%'),
    paddingHorizontal: wp('2%'),
  },
  filterButton: {
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('1.2%'),
    borderRadius: wp('6%'),
    borderWidth: 1,
    minWidth: wp('20%'),
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: wp('3.5%'),
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: hp('2%'),
    fontSize: wp('4%'),
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp('10%'),
  },
  errorText: {
    fontSize: wp('4%'),
    textAlign: 'center',
    marginVertical: hp('2%'),
  },
  retryButton: {
    paddingHorizontal: wp('8%'),
    paddingVertical: hp('1.5%'),
    borderRadius: wp('6%'),
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: wp('4%'),
    fontWeight: '600',
  },
  appointmentsList: {
    flex: 1,
  },
  appointmentsListContent: {
    paddingBottom: hp('2%'),
  },
  appointmentCard: {
    marginHorizontal: wp('4%'),
    marginBottom: hp('2%'),
    borderRadius: wp('3%'),
    padding: wp('4%'),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appointmentContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientImageContainer: {
    marginRight: wp('4%'),
  },
  patientImage: {
    width: wp('25%'),
    height: wp('30%'),
    borderRadius: wp('2%'),
  },
  patientInfo: {
    flex: 1,
   // paddingVertical: hp('0.5%'),
  },
  nameTokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp('1%'),
  },
  patientName: {
    fontSize: wp('4.2%'),
    fontFamily: PoppinsFonts.Bold,
    flex: 1,
  },
  patientDetail: {
    fontSize: wp('3.5%'),
    fontFamily: PoppinsFonts.Regular,
    marginBottom: hp('0.8%'),
    lineHeight: wp('4.5%'),
  },
  patientDetailBold: {
    fontFamily: PoppinsFonts.Bold,
  },
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: wp('2%'),
  },
  statusContainer: {
    marginTop: hp('1%'),
    alignItems: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.5%'),
    borderRadius: wp('2%'),
  },
  statusText: {
    fontSize: wp('3%'),
    fontFamily: PoppinsFonts.Bold,
    color: '#FFFFFF',
    textTransform: 'capitalize',
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
  patientDetail: {
    fontSize: wp('3.5%'),
    fontFamily: PoppinsFonts.Medium,
    marginBottom: hp('0.25%'),
  },
  subPatientTitle: {
    fontSize: wp('3.2%'),
    fontFamily: PoppinsFonts.Bold,
    marginTop: hp('0.8%'),
    marginBottom: hp('0.3%'),
  },
  appointmentStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: wp('2%'),
  },
  statusBadge: {
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.5%'),
    borderRadius: wp('3%'),
    marginRight: wp('2%'),
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: wp('2.8%'),
    fontFamily: PoppinsFonts.SemiBold,
    textTransform: 'capitalize',
  },
  noAppointmentsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp('10%'),
  },
  noAppointmentsText: {
    fontSize: wp('4%'),
    textAlign: 'center',
    marginTop: hp('2%'),
  },
});

export default AppointmentsScreen;
