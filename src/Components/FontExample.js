import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Fonts, FontSizes, FontStyles } from '../Config/Fonts';

const FontExample = () => {
  return (
    <View style={styles.container}>
      <Text style={FontStyles.heading}>Heading Text</Text>
      <Text style={FontStyles.subheading}>Subheading Text</Text>
      <Text style={FontStyles.body}>Body Text</Text>
      <Text style={FontStyles.caption}>Caption Text</Text>
      <Text style={FontStyles.button}>Button Text</Text>
      
      {/* Custom font usage */}
      <Text style={[styles.customText, { fontFamily: Fonts.PoppinsBold }]}>
        Custom Bold Text
      </Text>
      <Text style={[styles.customText, { fontFamily: Fonts.PoppinsLight }]}>
        Custom Light Text
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  customText: {
    fontSize: FontSizes.md,
    marginVertical: 5,
  },
});

export default FontExample;
