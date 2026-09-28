import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, ImageBackground, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function App() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* HIGH QUALITY BACKGROUND IMAGE FEATURING CAMPUS STUDENTS */}
      <ImageBackground 
        source={{ uri: 'https://unsplash.com' }} 
        style={styles.backgroundImage}
      >
        {/* PREMIUM TRANSPARENT DEEP BLUE GRADIENT OVERLAY */}
        <View style={styles.overlay}>
          
          {/* FULLY FUNCTIONAL OFFICIAL TUT EMBLEM LINK */}
          <Image 
            source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtem1uQCS6XOlDYo-GatM4fp8ROf7LUyJaXuDzpR9ZLA&s' }} 
            style={styles.logo} 
            resizeMode="contain"
          />

          {/* TUT SLOGAN IN ALL CAPITAL LETTERS */}
          <Text style={styles.tutSlogan}>We empower people</Text>

          {/* APP TEXT HEADERS IN ALL CAPITAL LETTERS */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>WELCOME!</Text>
            <Text style={styles.appSlogan}>Campus Hunger Is A Thing Of The Past</Text>
          </View>

          {/* ENHANCED ATTRACTIVE INPUT CARD LAYOUT */}
          <View style={styles.formContainer}>
            
            {/* USERNAME INPUT WITH CAPITALIZED PLACEHOLDER */}
            <Text style={styles.inputLabel}>STUDENT NUMBER / USERNAME</Text>
            <TextInput 
              style={styles.input} 
              placeholder="ENTER YOUR STUDENT NO." 
              placeholderTextColor="#A0AEC0"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />

            {/* PASSWORD INPUT WITH CAPITALIZED PLACEHOLDER */}
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

            {/* HIGH-CONTRAST ATTRACTIVE ACTION BUTTON IN ALL CAPS */}
            <TouchableOpacity style={styles.button}
            >
              <Text style={styles.buttonText}>LOG IN</Text>
            </TouchableOpacity>

            {/* ADDITIONAL REGISTER ACTION LINK FOR BETTER APP FLOW */}
            <TouchableOpacity style={styles.registerLinkContainer}
             onPress={() => router.push('/register')}
              activeOpacity={0.7}  >
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
    fontSize: 13,
    fontWeight: '700',
    fontStyle: 'italic',
    letterSpacing: 2,
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
    fontSize: 13,
    color: '#E2E8F0',
    textAlign: 'center',
    fontWeight: '600',
    fontStyle: 'italic',
    letterSpacing: 1.2,
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
    boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.3)',
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
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', 
  },
  button: {
    width: '100%',
    height: 54,
    backgroundColor: '#FFCC00', 
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    boxShadow: '0px 6px 12px rgba(255, 204, 0, 0.3)',
  },
  buttonText: {
    color: '#0B2977', 
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  registerLinkContainer: {
   marginTop: 22,
    paddingVertical: 10, // Makes the clickable area bigger
    alignItems: 'center',
    width: '100%',
    zIndex: 99,    
  },
  registerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textDecorationLine: 'underline',
  },
});
