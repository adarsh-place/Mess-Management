export function loadGoogleScript(callback) {
  const existingScript = document.getElementById('google-client-script');
  
  // 1. If script exists and window.google is ready
  if (existingScript && window.google) {
    if (callback) callback();
    return;
  }
  
  
  // 2. If script exists but window.google isn't ready yet (it's still loading)
  if (existingScript) {
    existingScript.addEventListener('load', () => {
      if (callback) callback();
    });
    return;
  }
  
  // 3. Create and inject the script for the first time
  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  script.id = 'google-client-script';
  
  if (callback) {
    script.onload = () => callback();
  }
  
  document.body.appendChild(script);
}