import { useEffect, useRef } from 'react'; 
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useAuthStore } from '../store/authStore';
import { Colors } from '../constants/colors';
import { View, ActivityIndicator, Text, Platform } from "react-native";
import * as Notifications from 'expo-notifications';

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  const { user, loading, initialize, hasFinishedOnboarding, _hasHydrated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  
  const isNavigating = useRef(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '777496097951-jb7mabvi6ajftdvf5gvckp8qpuea543g.apps.googleusercontent.com', 
      offlineAccess: true,
    });
    const unsubscribe = initialize();

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification Received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const { data } = response.notification.request.content;
      if (data?.url) {
        router.push(data.url);
      }
    });

    return () => { 
      if (unsubscribe) unsubscribe(); 
    
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const [fontsLoaded] = useFonts({
    'Archivo-Black': require('../assets/fonts/Archivo_Black/ArchivoBlack-Regular.ttf'), 
    'Ubuntu-Regular': require('../assets/fonts/Ubuntu/Ubuntu-Regular.ttf'),
    'Ubuntu-Bold': require('../assets/fonts/Ubuntu/Ubuntu-Bold.ttf'),
    'Ubuntu-Medium': require('../assets/fonts/Ubuntu/Ubuntu-Medium.ttf'),
    'Ubuntu-Light': require('../assets/fonts/Ubuntu/Ubuntu-Light.ttf'),
  });

  useEffect(() => {
    if (!fontsLoaded || loading || !_hasHydrated) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';

    if (!user) {
      if (!hasFinishedOnboarding && !inOnboarding) {
        router.replace('/onboarding');
      } else if (hasFinishedOnboarding && !inAuthGroup && !inOnboarding) {
        router.replace('/(auth)/sign-in');
      }
    } else if (user && (inAuthGroup || inOnboarding || segments.length === 0)) {
      router.replace('/(main)'); 
    }

    const hideSplash = async () => {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn("Splash screen error:", e);
      }
    };
    hideSplash();

  }, [user, loading, fontsLoaded, _hasHydrated]); 

  if (!fontsLoaded || loading || !_hasHydrated) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: Colors.primary, 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={{ color: '#fff', marginTop: 10, fontFamily: fontsLoaded ? 'Ubuntu-Medium' : 'System' }}>
          Loading Brain Buzz...
        </Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" backgroundColor={Colors.primary} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.white } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(main)" options={{ gestureEnabled: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="(profile)" options={{ animation: 'fade' }} />
      </Stack>
    </>
  );
}