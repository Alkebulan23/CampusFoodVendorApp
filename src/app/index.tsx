import { useState } from 'react';
import { Image, ImageBackground, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background Image featuring Campus Students */}
      <ImageBackground 
        source={{ uri: 'https://unsplash.com' }} 
        style={styles.backgroundImage}
      >
        {/* Blue color tint overlay to ensure readability */}
        <View style={styles.overlay}>
          
          {/* TUT Logo */}
          <Image 
            source={{ uri: 'https://wikimedia.org' }} 
            style={styles.logo} 
            resizeMode="contain"
          />

          {/* TUT Official Slogan */}
          <Text style={styles.tutSlogan}>We empower people</Text>

          {/* Welcome Text Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Welcome!</Text>
            <Text style={styles.appSlogan}>Campus hunger is a thing of the past</Text>
          </View>

          {/* Input Fields Wrapper */}
          <View style={styles.formContainer}>
            {/* Username Input */}
            <TextInput 
              style={styles.input} 
              placeholder="Username or Student No." 
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />

            {/* Password Input */}
            <TextInput 
              style={styles.input} 
              placeholder="Password" 
              placeholderTextColor="#999"
              secureTextEntry={true} 
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />

            {/* Login Button */}
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Log In</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 41, 119, 0.85)', // Deep TUT Blue with transparency to reveal students
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    width: 160,
    height: 90,
    marginBottom: 4,
  },
  tutSlogan: {
    color: '#FFCC00', // Gold accents to tie into the official emblem
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'italic',
    marginBottom: 40,
    letterSpacing: 0.5,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  appSlogan: {
    fontSize: 16,
    color: '#E0E6ED',
    textAlign: 'center',
    fontWeight: '400',
  },
  formContainer: {
    width: '100%',
    maxWidth: 340,
  },
    input: {
    width: '100%',
    height: 52,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
    color: '#333333',
    // Updated line to fix the warning:
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', 
  },
  button: {
    width: '100%',
    height: 52,
    backgroundColor: '#FFCC00', 
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    // Updated line to fix the warning:
    boxShadow: '0px 4px 5px rgba(0, 0, 0, 0.2)',
  },
  buttonText: {
    color: '#0B2977', // Text matches the main blue brand color
    fontSize: 18,
    fontWeight: '700',
  },
});
