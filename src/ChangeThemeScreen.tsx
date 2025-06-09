import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, StatusBar } from 'react-native';

const ChangeThemeScreen = ({ navigation }: { navigation: any }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light'); // Default theme is 'light'

  // Use useEffect to apply theme-specific styles globally when the theme changes
  useEffect(() => {
    if (theme === 'dark') {
      StatusBar.setBarStyle('light-content'); // Change StatusBar for dark mode
    } else {
      StatusBar.setBarStyle('dark-content'); // Set for light mode
    }
  }, [theme]);

  return (
    <View style={[styles.container, theme === 'dark' ? styles.dark : styles.light]}>
      <Text style={theme === 'dark' ? styles.darkText : styles.lightText}>
        Current Theme: {theme}
      </Text>
      <Button title="Switch to Light Theme" onPress={() => setTheme('light')} />
      <Button title="Switch to Dark Theme" onPress={() => setTheme('dark')} />

      {/* Back Button */}
      <Button title="Go Back" onPress={() => navigation.goBack()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  light: {
    backgroundColor: '#FFFFFF',
  },
  dark: {
    backgroundColor: '#121212',
  },
  lightText: {
    color: '#000000',
  },
  darkText: {
    color: '#FFFFFF',
  },
});

export default ChangeThemeScreen;
