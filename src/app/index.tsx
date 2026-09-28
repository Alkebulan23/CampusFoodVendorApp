import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, ImageBackground, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function App() {
  const router = useRouter(); // THE CORE NAVIGATION ENGINE
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* CAMPUS STUDENTS BACKGROUND IMAGE */}
      <ImageBackground 
        source={{ uri: 'https://unsplash.com' }} 
        style={styles.backgroundImage}
      >
        <View style={styles.overlay}>
          
          {/* TUT LOGO EMBLEM */}
          <Image 
            source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtem1uQCS6XOlDYo-GatM4fp8ROf7LUyJaXuDzpR9ZLA&s' }} 
            style={styles.logo} 
            resizeMode="contain"
          />

          <Text style={styles.tutSlogan}>We Empower People</Text>

          <View style={styles.headerContainer}>
            <Text style={styles.title}>WELCOME!</Text>
            <Text style={styles.appSlogan}>Campus Hunger Is A Thing Of The Past</Text>
          </View>

          {/* ATTRACTIVE LOG IN FORM BOX */}
          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>STUDENT NUMBER / USERNAME</Text>
            <TextInput 
              style={styles.input} 
              placeholder="ENTER YOUR STUDENT NO." 
              placeholderTextColor="#A0AEC0"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>SECURITY PASSWORD</Text>
            <TextInput 
              style={styles.input} 
              placeholder="ENTER YOUR PASSWORD" 
              placeholderTextColor="#A0AEC0"
              secureTextEntry={true} 
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />

            {/* LOG IN TOUCH ACTION BUTTON */}
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => alert(`ATTEMPTING LOGIN FOR STUDENT: ${username || "GUEST"}`)}
            >
              <Text style={styles.buttonText}>LOG IN</Text>
            </TouchableOpacity>

            {/* CREATE ACCOUNT LINK - ELEVATED WITH MAX Z-INDEX FOR WEB CLICKABILITY */}
            <TouchableOpacity 
              style={styles.registerLinkContainer}
              onPress={() => router.push('/register')}
              activeOpacity={0.7}
            >
              <Text style={styles.registerText}>NEW STUDENT? CREATE ACCOUNT</Text>
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
    backgroundColor: '#0B2977',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 41, 119, 0.88)', 
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    width: 200,
    height: 100,
    marginBottom: 6,
  },
  tutSlogan: {
    color: '#FFCC00', 
    fontSize: 14,
    fontWeight: '700',
    fontStyle: 'italic',
    letterSpacing: 1.5,
    marginBottom: 45,
    textAlign: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 35,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 1.5,
  },
  appSlogan: {
    fontSize: 14,
    color: '#E2E8F0',
    textAlign: 'center',
    fontWeight: '600',
    fontStyle: 'italic',
    letterSpacing: 1,
    paddingHorizontal: 10,
  },
  formContainer: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    // STANDARDIZED WEB COMPATIBLE SHADOW CODES
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  inputLabel: {
    color: '#FFCC00',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 1,
    marginLeft: 4,
  },
  input: {
    width: '100%',
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    marginBottom: 18,
    color: '#1A202C',
    fontWeight: '600',
  },
  button: {
    width: '100%',
    height: 54,
    backgroundColor: '#FFCC00', 
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#0B2977', 
    fontSize: 16,
    fontWeight: '900', // THE STRAY 'npo' CORRUPTION CHARACTER IS FIXED HERE!
    letterSpacing: 1.5,
  },
    registerLinkContainer: {
    marginTop: 22,
    paddingVertical: 12,    // 1️⃣ EXPANDS THE MOUSE HITBOX AREA SO IT IS EASIER TO CLICK
    alignItems: 'center',
    width: '100%',
    position: 'relative',   // 2️⃣ EXPLICITLY SEPARATES IT FROM NEIGHBORING CONTAINERS
    zIndex: 999,            // 3️⃣ FORCES THE LINK TO FLOAT ABOVE ALL INVISIBLE COLLIDING BOXES
  },

  registerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textDecorationLine: 'underline',
  },
});
