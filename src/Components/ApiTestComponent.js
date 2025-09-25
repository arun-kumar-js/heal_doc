import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { setDoctorId, getDoctorId, clearStorage } from '../Utils/StorageUtils';

const ApiTestComponent = () => {
  const [currentDoctorId, setCurrentDoctorId] = useState(null);

  const testSetDoctorId = async () => {
    const testId = 'test_doctor_123';
    const success = await setDoctorId(testId);
    if (success) {
      Alert.alert('Success', `Doctor ID set to: ${testId}`);
      setCurrentDoctorId(testId);
    } else {
      Alert.alert('Error', 'Failed to set Doctor ID');
    }
  };

  const testGetDoctorId = async () => {
    const doctorId = await getDoctorId();
    setCurrentDoctorId(doctorId);
    Alert.alert('Current Doctor ID', doctorId || 'No Doctor ID found');
  };

  const testClearStorage = async () => {
    const success = await clearStorage();
    if (success) {
      Alert.alert('Success', 'Storage cleared');
      setCurrentDoctorId(null);
    } else {
      Alert.alert('Error', 'Failed to clear storage');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>API Test Component</Text>
      <Text style={styles.currentId}>
        Current Doctor ID: {currentDoctorId || 'None'}
      </Text>
      
      <TouchableOpacity style={styles.button} onPress={testSetDoctorId}>
        <Text style={styles.buttonText}>Set Test Doctor ID</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={testGetDoctorId}>
        <Text style={styles.buttonText}>Get Doctor ID</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={testClearStorage}>
        <Text style={styles.buttonText}>Clear Storage</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    margin: 10,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  currentId: {
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
    color: '#666',
  },
  button: {
    backgroundColor: '#4A90E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  clearButton: {
    backgroundColor: '#FF6B8A',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default ApiTestComponent;
