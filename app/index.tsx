import { Redirect } from 'expo-router';

// "/" just forwards to the tabs; the (tabs) layout handles splash and auth.
export default function IndexScreen() {
  return <Redirect href="/home" />;
}
