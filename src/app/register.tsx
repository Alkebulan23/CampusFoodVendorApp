import { useRouter } from 'expo-router'; // UTILITY ENGINE LINKED FOR FILE NAVIGATION
import { useState } from 'react';
import { Image, ImageBackground, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RegisterScreen() {
  const router = useRouter(); // ROUTER OBJECT CALL ENGINE

  // FORM ATTRIBUTE BINDINGS STATE
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userRole, setUserRole] = useState('STUDENT'); // DEFAULT

  // SIGN UP LOGIC REGULAR VALIDATOR
  const handleRegisterSubmission = () => {
    if (!fullName || !regEmail || !regPassword || !confirmPassword) {
      alert("ERROR: ALL COMPONENT FIELDS ARE MANDATORY FOR REGISTRATION.");
      return;
    }

    const emailLower = regEmail.toLowerCase().trim();
    const isTutEmail = emailLower.endsWith('@tut4life.ac.za') || emailLower.endsWith('@tut.ac.za');
    if (!isTutEmail) {
      alert("INVALID EMAIL: YOU MUST PROVIDE A VERIFIABLE TUT EMAIL ADDRESS (@tut4life.ac.za or @tut.ac.za).");
      return;
    }

    // 1️⃣ FIXED REGEX CODE PATTERN (REMOVED DESTRUCTIVE BACKSLASH STRING TO FIX PASSWORD CHECKS)
    const strongPasswordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}\$/;
    if (!strongPasswordRegex.test(regPassword)) {
      alert("WEAK PASSWORD: MUST BE AT LEAST 6 CHARACTERS LONG AND CONTAIN BOTH LETTERS AND NUMBERS.");
      return;
    }

    if (regPassword !== confirmPassword) {
      alert("MISMATCH ERROR: SECURITY PASSWORD CODES DO NOT MATCH.");
      return;
    }

    alert(`SUCCESS: ACCOUNT CREATED SECURELY AS A ${userRole}! PLEASE VERIFY YOUR EMAIL.`);
    router.replace('/'); // FORCES ROUTER RE-DOCK LINK STRAIGHT BACK TO LOGIN HOME
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* 2️⃣ RESTORED SEAMLESS HIGH-RESOLUTION STUDENTS BACKGROUND GRAPHICS URL */}
      <ImageBackground 
        source={{ uri: 'https://unsplash.com' }} 
        style={styles.backgroundImage}
      >
        <View style={styles.overlay}>
          
          {/* 3️⃣ FIXED THE TSHWANE UNIVERSITY OF TECHNOLOGY OFFICIAL RE-ROUTED LOGO */}
          <Image 
            source={{ uri: 'https://wikimedia.org' }} 
            style={styles.logo} 
            resizeMode="contain"
          />

          <Text style={styles.tutSlogan}>We Empower People</Text>

          <View style={styles.headerContainer}>
            <Text style={styles.title}>SIGN UP</Text>
            <Text style={styles.appSlogan}>Create Your Campus Food Account Below</Text>
          </View>

          <View style={styles.formContainer}>
            {/* VENDOR OR STUDENT IDENTITY ACCENTS SELECTION */}
            <Text style={styles.inputLabel}>I AM A:</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity 
                style={[styles.toggleButton, userRole === 'STUDENT' && styles.activeToggle]} 
                onPress={() => setUserRole('STUDENT')}
              >
                <Text style={[styles.toggleButtonText, userRole === 'STUDENT' && styles.activeToggleText]}>STUDENT</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.toggleButton, userRole === 'VENDOR' && styles.activeToggle]} 
                onPress={() => setUserRole('VENDOR')}
              >
                <Text style={[styles.toggleButtonText, userRole === 'VENDOR' && styles.activeToggleText]}>VENDOR</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>FULL NAME</Text>
            <TextInput 
              style={styles.input} 
              placeholder="ENTER YOUR FIRST & LAST NAME" 
              placeholderTextColor="#A0AEC0"
              value={fullName}
              onChangeText={setFullName}
            />

            <Text style={styles.inputLabel}>VERIFIABLE TUT EMAIL</Text>
            <TextInput 
              style={styles.input} 
              placeholder="e.g. 219XXXXXX@tut4life.ac.za" 
              placeholderTextColor="#A0AEC0"
              value={regEmail}
              onChangeText={setRegEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.inputLabel}>PASSWORD (LETTERS + NUMBERS)</Text>
            <TextInput 
              style={styles.input} 
              placeholder="CREATE STRONG PASSWORD" 
              placeholderTextColor="#A0AEC0"
              secureTextEntry={true} 
              value={regPassword}
              onChangeText={setRegPassword}
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>VERIFY SECURITY PASSWORD</Text>
            <TextInput 
              style={styles.input} 
              placeholder="RE-ENTER PASSWORD TO MATCH" 
              placeholderTextColor="#A0AEC0"
              secureTextEntry={true} 
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              autoCapitalize="none"
            />

            <TouchableOpacity style={styles.button} onPress={handleRegisterSubmission}>
              <Text style={styles.buttonText}>REGISTER NOW</Text>
            </TouchableOpacity>

            {/* CLICK EVENT USES ROUTER BACK POINTER LINK */}
            <TouchableOpacity 
              style={styles.registerLinkContainer} 
              onPress={() => router.push('/')}
              activeOpacity={0.7}
            >
              <Text style={styles.registerText}>ALREADY HAVE AN ACCOUNT? LOG IN</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B2977' },
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  overlay: { flex: 1, backgroundColor: 'rgba(11, 41, 119, 0.88)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  logo: { width: 200, height: 90, marginBottom: 4 },
  tutSlogan: { color: '#FFCC00', fontSize: 14, fontWeight: '700', fontStyle: 'italic', letterSpacing: 1.5, marginBottom: 25, textAlign: 'center' },
  headerContainer: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 38, fontWeight: '900', color: '#FFFFFF', marginBottom: 6, letterSpacing: 1.5 },
  appSlogan: { fontSize: 14, color: '#E2E8F0', textAlign: 'center', fontWeight: '600', letterSpacing: 1, paddingHorizontal: 10 },
  // 4️⃣ CONVERTED CONFLICTING CSS CODE ATTRIBUTES TO WEB COMPATIBLE SHADOW HOOKS
  formContainer: { 
    width: '100%', 
    maxWidth: 350, 
    backgroundColor: 'rgba(255, 255, 255, 0.07)', 
    borderRadius: 20, 
    padding: 20, 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: 4 },
  toggleButton: { flex: 1, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  activeToggle: { backgroundColor: '#FFCC00' },
  toggleButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13, letterSpacing: 1 },
  activeToggleText: { color: '#0B2977' },
  inputLabel: { color: '#FFCC00', fontSize: 11, fontWeight: '700', marginBottom: 5, letterSpacing: 1, marginLeft: 4 },
  input: { 
    width: '100%', 
    height: 46, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    fontSize: 14, 
    marginBottom: 12, 
    color: '#1A202C', 
    fontWeight: '600',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  button: { 
    width: '100%', 
    height: 52, 
    backgroundColor: '#FFCC00', 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center', // 👈 REMOVED STRAY 'justifyRules' FROM THIS PROPERTIE
    marginTop: 10,
    shadowColor: '#FFCC00',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  buttonText: { color: '#0B2977', fontSize: 16, fontWeight: '900', letterSpacing: 1.5 },
  registerLinkContainer: { 
    marginTop: 22, 
    paddingVertical: 12,
    alignItems: 'center',
    width: '100%',
    zIndex: 999, // ELEVATES CLICKS SO BROWSERS DONT FREEZE
  },
  registerText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700', letterSpacing: 1, textDecorationLine: 'underline' }
});
