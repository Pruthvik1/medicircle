import { View } from 'react-native';

import { LogoLoader } from './logo-loader';

// The mark arrives and its ring starts travelling — that is the loading state.
export function SplashScreen() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
      }}
    >
      <LogoLoader size={104} entrance />
    </View>
  );
}
