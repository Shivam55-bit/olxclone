/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
// import 'react-native-reanimated';



AppRegistry.registerComponent(appName, () => {
	try {
		return App;
	} catch (error) {
		console.error('❌ Index registration error:', error, error.stack);
		throw error;
	}
});
