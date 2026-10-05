import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { supabase } from '../../supabaseClient'; // ⚠️ Double-check this path matches where your supabase client is initialized

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    // Listen for authentication state changes (sign-in, token refresh, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // Force a live network check against the database instead of trusting the local token
        const { data, error } = await supabase.auth.getUser();
        
        // If the user was deleted from the database, nuke their local storage session
        if (error || !data.user) {
          await supabase.auth.signOut();
          router.replace('/'); // Redirects back to index.tsx (Login view)
        }
      }
    });

    // Hide the splash screen once the listener is up and running
    SplashScreen.hideAsync();

    // Clean up the subscription when the layout unmounts
    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* The home screen defaults to index.tsx (Login view) */}
        <Stack.Screen name="index" />
        <Stack.Screen name="register" />
        <Stack.Screen name="student" />
        <Stack.Screen name="vendor" />
        <Stack.Screen name="explore" />
      </Stack>
    </ThemeProvider>
  );
}
