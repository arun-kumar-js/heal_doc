import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

const IconTest = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Icon Test:</Text>
      <Icon name="user" size={30} color="blue" />
      <Icon name="phone" size={30} color="green" />
      <Icon name="envelope" size={30} color="red" />
      <Icon name="heart" size={30} color="pink" />
      <Icon name="star" size={30} color="yellow" />
      <Icon name="home" size={30} color="orange" />
    </View>
  );
};

export default IconTest;
