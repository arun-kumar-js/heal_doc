import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import FeatherIcon from 'react-native-vector-icons/Feather';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';

const VectorIconsExample = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Vector Icons Examples</Text>
      
      {/* Ionicons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ionicons</Text>
        <View style={styles.iconRow}>
          <Icon name="home" size={30} color="#4A90E2" />
          <Icon name="heart" size={30} color="#E74C3C" />
          <Icon name="star" size={30} color="#F39C12" />
          <Icon name="settings" size={30} color="#95A5A6" />
        </View>
      </View>

      {/* Material Icons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Material Icons</Text>
        <View style={styles.iconRow}>
          <MaterialIcon name="home" size={30} color="#4A90E2" />
          <MaterialIcon name="favorite" size={30} color="#E74C3C" />
          <MaterialIcon name="star" size={30} color="#F39C12" />
          <MaterialIcon name="settings" size={30} color="#95A5A6" />
        </View>
      </View>

      {/* Material Community Icons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Material Community Icons</Text>
        <View style={styles.iconRow}>
          <MaterialCommunityIcon name="home" size={30} color="#4A90E2" />
          <MaterialCommunityIcon name="heart" size={30} color="#E74C3C" />
          <MaterialCommunityIcon name="star" size={30} color="#F39C12" />
          <MaterialCommunityIcon name="cog" size={30} color="#95A5A6" />
        </View>
      </View>

      {/* Font Awesome */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Font Awesome</Text>
        <View style={styles.iconRow}>
          <FontAwesomeIcon name="home" size={30} color="#4A90E2" />
          <FontAwesomeIcon name="heart" size={30} color="#E74C3C" />
          <FontAwesomeIcon name="star" size={30} color="#F39C12" />
          <FontAwesomeIcon name="cog" size={30} color="#95A5A6" />
        </View>
      </View>

      {/* Font Awesome 5 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Font Awesome 5</Text>
        <View style={styles.iconRow}>
          <FontAwesome5Icon name="home" size={30} color="#4A90E2" />
          <FontAwesome5Icon name="heart" size={30} color="#E74C3C" />
          <FontAwesome5Icon name="star" size={30} color="#F39C12" />
          <FontAwesome5Icon name="cog" size={30} color="#95A5A6" />
        </View>
      </View>

      {/* Feather Icons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Feather Icons</Text>
        <View style={styles.iconRow}>
          <FeatherIcon name="home" size={30} color="#4A90E2" />
          <FeatherIcon name="heart" size={30} color="#E74C3C" />
          <FeatherIcon name="star" size={30} color="#F39C12" />
          <FeatherIcon name="settings" size={30} color="#95A5A6" />
        </View>
      </View>

      {/* Entypo Icons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Entypo Icons</Text>
        <View style={styles.iconRow}>
          <EntypoIcon name="home" size={30} color="#4A90E2" />
          <EntypoIcon name="heart" size={30} color="#E74C3C" />
          <EntypoIcon name="star" size={30} color="#F39C12" />
          <EntypoIcon name="cog" size={30} color="#95A5A6" />
        </View>
      </View>

      {/* Ant Design Icons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ant Design Icons</Text>
        <View style={styles.iconRow}>
          <AntDesignIcon name="home" size={30} color="#4A90E2" />
          <AntDesignIcon name="heart" size={30} color="#E74C3C" />
          <AntDesignIcon name="star" size={30} color="#F39C12" />
          <AntDesignIcon name="setting" size={30} color="#95A5A6" />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    marginBottom: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});

export default VectorIconsExample;
