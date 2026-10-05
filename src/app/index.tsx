import { useRouter } from 'expo-router'; // UTILITY ENGINE LINKED FOR FILE NAVIGATION
import { useState } from 'react';
import { Image, ImageBackground, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../supabaseClient';

export default function RegisterScreen() {
  const router = useRouter(); // ROUTER OBJECT CALL ENGINE

  // DYNAMIC APP VIEW STATE: CONTROLS WHETHER CARD IS 'LOGIN' OR 'REGISTER' MODE
  const [isRegisterMode, setIsRegisterMode] = useState(false);


  // FORM ATTRIBUTE BINDINGS STATE
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userRole, setUserRole] = useState('STUDENT'); // DEFAULT

    // DYNAMIC REAL-TIME SUPABASE SIGN-UP & EMAIL DISPATCH TRIGGER
  const handleRegisterNowClick = async () => {
    if (!fullName || !regEmail || !regPassword || !userRole || !confirmPassword) {
      alert("ERROR: ALL REGISTRATION FIELDS ARE MANDATORY.");
      return;
    }

    const emailLower = regEmail.toLowerCase().trim();

    // ==========================================
    // NEW: HORIZONTAL SWITCH VALIDATION GATES
    // ==========================================
    if (userRole === 'STUDENT' && !emailLower.endsWith('@tut4life.ac.za')) {
      alert("ROLE MISMATCH: Students must use a @tut4life.ac.za institutional email address.");
      return;
    }

    if (userRole === 'VENDOR' && !emailLower.endsWith('@tut.ac.za')) {
      alert("ROLE MISMATCH: Vendors must use a @tut.ac.za staff/vendor email address.");
      return;
    }
    // ==========================================

    const isTutEmail = emailLower.endsWith('@tut4life.ac.za') || emailLower.endsWith('@tut.ac.za');
    if (!isTutEmail) {
      alert("INVALID EMAIL: YOU MUST PROVIDE A VERIFIABLE TUT EMAIL ADDRESS (@tut4life.ac.za or @tut.ac.za).");
      return;
    }

    // MATCH VALID PASSWORDS (AT LEAST 6 CHARACTERS, 1 LETTER, 1 NUMBER)
    const strongPasswordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!strongPasswordRegex.test(regPassword)) {
      alert("WEAK PASSWORD: MUST BE AT LEAST 6 CHARACTERS LONG AND CONTAIN BOTH LETTERS AND NUMBERS.");
      return;
    }

    if (regPassword !== confirmPassword) {
      alert("MISMATCH ERROR: SECURITY PASSWORD CODES DO NOT MATCH.");
      return;
    }

   // EXECUTE LIVE DISPATCH UP TO THE SUPABASE AUTH REALM
    try {
      const { data, error } = await supabase.auth.signUp({
        email: emailLower,
        password: regPassword,
        options: {
          emailRedirectTo: 'http://localhost:8081', // RETURNS USER BACK TO RUNTIME PREVIEWS POST CLICK
          data: {
            full_name: fullName,
            role: userRole, // STORES STUDENT OR VENDOR CATEGORIES IN DATABASE METADATA
          }
        }
      });

      if (error) {
        alert(`SUPABASE REGISTRATION ERROR: ${error.message.toUpperCase()}`);
        return;
      }

      alert(`SUCCESS! ACCOUNT SECURED.\n\nA real verification email link has been sent by Supabase to: ${emailLower}\n\nPlease click the link to confirm before logging in.`);
      setIsRegisterMode(false); // FLIPS THEM CLEANLY BACK TO THE LOGIN INTERFACE VIEW
      
    } catch (err) {
      alert("SERVER ERROR: Could not talk to the cloud database registry.");
    }
  };


    const handleLoginSubmission = async () => {

    if (!regEmail || !regPassword) {
      alert("PLEASE ENTER BOTH YOUR TUT EMAIL AND PASSWORD.");
      return;
    }

    const emailLower = regEmail.toLowerCase().trim();

    // 1. Fixed with @ symbols
    if (!emailLower.endsWith('@tut.ac.za') && !emailLower.endsWith('@tut4life.ac.za')) {
      alert("ACCESS DENIED: Enter a valid institutional email address ending with @tut.ac.za or @tut4life.ac.za");
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailLower,
        password: regPassword,
      });

      if (error) {
        alert(`LOGIN REJECTED: ${error.message.toUpperCase()}`);
        return;
      }

      if (!data.user?.email_confirmed_at) {
        alert("ACCESS DENIED: YOUR TUT EMAIL ADDRESS IS NOT VERIFIED.");
        await supabase.auth.signOut();
        return;
      }

      const registeredMetadataRole = data.user.user_metadata?.role?.toUpperCase();

      // FIXED ROUTING LAYER WITH NO TRAILING SLASH TARGETING LOOSE FILES DIRECTLY
      if (emailLower.endsWith('@tut.ac.za') && registeredMetadataRole === 'VENDOR') {
        router.push('/vendor' as any);
      } else if (emailLower.endsWith('@tut4life.ac.za') && registeredMetadataRole === 'STUDENT') {
        router.push('/student'as any);
      } else {
        alert("PROFILE MISMATCH ERROR:\n\nYour institutional email address domain configuration layout does not correspond to the assigned account role settings.");
        await supabase.auth.signOut();
      }


    } catch (err) {
      alert("SERVER TIMEOUT: Connection breakdown.");
    }
  };



   return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ImageBackground 
        source={{ uri: 'https://unsplash.com' }} 
        style={styles.backgroundImage}
      >
        <View style={styles.overlay}>
          
          <Image 
            source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtem1uQCS6XOlDYo-GatM4fp8ROf7LUyJaXuDzpR9ZLA&s' }} 
            style={styles.logo} 
            resizeMode="contain"
          />

          <Text style={styles.tutSlogan}>We Empower People</Text>

           <View style={styles.headerContainer}>
            <Text style={styles.title}>{isRegisterMode ? "SIGN UP" : "WELCOME!"}</Text>
            <Text style={styles.appSlogan}>Campus Hunger Is A Thing Of The Past</Text>
          </View>

          <View style={styles.formContainer}>
            
            {/* 1. ONLY SHOW ROLE SELECTION & FULL NAME WHEN REGISTERING */}
            {isRegisterMode && (
              <View style={{ width: '100%' }}>
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
              </View>
            )}

            {/* 2. ALWAYS SHOW EMAIL AND PASSWORD FIELDS (BOTH LOGIN & REGISTER) */}
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

            {/* 3. ONLY SHOW CONFIRM PASSWORD WHEN REGISTERING */}
            {isRegisterMode && (
              <View style={{ width: '100%' }}>
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
              </View>
            )}

            <TouchableOpacity 
              style={styles.button} 
              onPress={isRegisterMode ? handleRegisterNowClick : handleLoginSubmission}
            >
              <Text style={styles.buttonText}>{isRegisterMode ? "REGISTER NOW" : "LOG IN"}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={{ marginTop: 20 }}
              onPress={() => setIsRegisterMode(!isRegisterMode)}
            >
              <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>
                {isRegisterMode ? "ALREADY HAVE AN ACCOUNT? LOG IN" : "NEED AN ACCOUNT? SIGN UP"}
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </ImageBackground>
    </View>
  );
}


// FIXED COMPATIBLE WEB DESIGN RULES
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B2977' },
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  overlay: { flex: 1, backgroundColor: 'rgba(11, 41, 119, 0.88)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  logo: { width: 200, height: 90, marginBottom: 4 },
  tutSlogan: { color: '#FFCC00', fontSize: 14, fontWeight: '700', fontStyle: 'italic', letterSpacing: 1.5, marginBottom: 25, textAlign: 'center' },
  headerContainer: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 38, fontWeight: '900', color: '#FFFFFF', marginBottom: 6, letterSpacing: 1.5 },
  appSlogan: { fontSize: 14, color: '#E2E8F0', textAlign: 'center', fontWeight: '600', letterSpacing: 1, paddingHorizontal: 10 },
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
    justifyContent: 'center', // 👈 REMOVED STRAY 'justifyRules' FROM THIS LINE
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
    
  },
  registerText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700', letterSpacing: 1, textDecorationLine: 'underline' }
});
