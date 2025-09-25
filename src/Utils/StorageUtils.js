import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
export const STORAGE_KEYS = {
  DOCTOR_ID: 'doctor_id',
  USER_DATA: 'user_data',
  AUTH_TOKEN: 'auth_token',
};

// Doctor ID management
export const setDoctorId = async (doctorId) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.DOCTOR_ID, doctorId);
    console.log('✅ Doctor ID saved to storage:', doctorId);
    return true;
  } catch (error) {
    console.error('❌ Error saving doctor ID:', error);
    return false;
  }
};

export const getDoctorId = async () => {
  try {
    const doctorId = await AsyncStorage.getItem(STORAGE_KEYS.DOCTOR_ID);
    console.log('🔍 Doctor ID retrieved from storage:', doctorId);
    return doctorId;
  } catch (error) {
    console.error('❌ Error retrieving doctor ID:', error);
    return null;
  }
};

export const removeDoctorId = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.DOCTOR_ID);
    console.log('🗑️ Doctor ID removed from storage');
    return true;
  } catch (error) {
    console.error('❌ Error removing doctor ID:', error);
    return false;
  }
};

// Generic storage functions
export const setStorageItem = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    console.log(`✅ ${key} saved to storage:`, value);
    return true;
  } catch (error) {
    console.error(`❌ Error saving ${key}:`, error);
    return false;
  }
};

export const getStorageItem = async (key) => {
  try {
    const item = await AsyncStorage.getItem(key);
    const parsedItem = item ? JSON.parse(item) : null;
    console.log(`🔍 ${key} retrieved from storage:`, parsedItem);
    return parsedItem;
  } catch (error) {
    console.error(`❌ Error retrieving ${key}:`, error);
    return null;
  }
};

export const clearStorage = async () => {
  try {
    await AsyncStorage.clear();
    console.log('🗑️ All storage cleared');
    return true;
  } catch (error) {
    console.error('❌ Error clearing storage:', error);
    return false;
  }
};

// Logout function - clears all user data and login status
export const performLogout = async () => {
  try {
    console.log('🚪 Starting logout process...');
    
    // Clear all storage
    await AsyncStorage.clear();
    
    console.log('✅ Logout completed successfully');
    console.log('🗑️ All user data cleared from storage');
    
    return {
      success: true,
      message: 'Logout completed successfully'
    };
  } catch (error) {
    console.error('❌ Error during logout:', error);
    return {
      success: false,
      message: error.message || 'Failed to logout'
    };
  }
};
