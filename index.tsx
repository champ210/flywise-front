import { AppRegistry } from 'react-native';
import App from './App';

// Register the main component
AppRegistry.registerComponent('FlyWise.AI', () => App);

// Start the application
AppRegistry.runApplication('FlyWise.AI', {
  rootTag: document.getElementById('root'),
});


// Register Service Worker for offline capabilities
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}