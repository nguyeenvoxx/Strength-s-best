import { Redirect } from 'expo-router';

export default function IndexPage() {
  // Redirect to splash screen
  return <Redirect href="/(auth)/splash" />;
}
