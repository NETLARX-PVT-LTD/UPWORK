// environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://localhost:7221/api', // Your production API URL
  features: {
    dataDeletion: true,
    analytics: true,
    userInteractionTracking: true
  }
};