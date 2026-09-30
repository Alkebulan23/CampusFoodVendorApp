import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
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
