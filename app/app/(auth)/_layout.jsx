import { Stack } from 'expo-router';
import { Colors } from '../../constants/colors';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.white },
        animation: 'slide_from_right',
        animationDuration: 250,
      }}
    >
      <Stack.Screen 
        name="sign-up" 
        options={{
          animation: 'fade',
        }} 
      />
      <Stack.Screen name="sign-in" />
      <Stack.Screen 
        name="verify-email" 
        options={{
          gestureEnabled: false, 
        }}
      />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}