// // const config = {
// //   development: {
// //     API_BASE_URL:
// //       import.meta.env.REACT_APP_API_URL || "http://194.233.84.108:9004",
// //     APP_ENV: "development",
// //   },
// //   production: {
// //     API_BASE_URL:
// //       import.meta.env.REACT_APP_API_URL || "http://194.233.84.108:9004",
// //     APP_ENV: "production",
// //   },
// //   staging: {
// //     API_BASE_URL:
// //       import.meta.env.REACT_APP_API_URL || "https://staging-api.com",
// //     APP_ENV: "staging",
// //   },
// // };

// // const environment = process.env.NODE_ENV || "development";
// // const currentConfig = config[environment];

// // export default currentConfig;
// // export const API_BASE_URL = currentConfig.API_BASE_URL;
// // export const APP_ENV = currentConfig.APP_ENV;

// // Get current environment from .env
// const currentEnv = import.meta.env.VITE_CURRENT_ENV || "development";

// const config = {
//   development: {
//     API_BASE_URL: import.meta.env.VITE_API_BASE_URL_DEV,
//     APP_ENV: import.meta.env.VITE_APP_ENV_DEV || "development",
//   },
//   production: {
//     API_BASE_URL: import.meta.env.VITE_API_BASE_URL_PROD,
//     APP_ENV: import.meta.env.VITE_APP_ENV_PROD || "production",
//   },
//   staging: {
//     API_BASE_URL: import.meta.env.VITE_API_BASE_URL_STAGING,
//     APP_ENV: import.meta.env.VITE_APP_ENV_STAGING || "staging",
//   },
// };

// // Use the current environment setting
// const currentConfig = config[currentEnv];

// // Validation
// if (!currentConfig) {
//   console.error(`Invalid environment: ${currentEnv}`);
// }

// console.log(
//   `Running in ${currentEnv} mode with API: ${currentConfig.API_BASE_URL}`
// );

// export default currentConfig;
// export const API_BASE_URL = currentConfig.API_BASE_URL;
// export const APP_ENV = currentConfig.APP_ENV;

//***** */
// Get current environment from .env
// const currentEnv = import.meta.env.VITE_CURRENT_ENV || "development";

// const config = {
//   development: {
//     API_BASE_URL: import.meta.env.VITE_API_BASE_URL_DEV,
//     APP_ENV: import.meta.env.VITE_APP_ENV_DEV || "development",
//   },
//   production: {
//     API_BASE_URL: import.meta.env.VITE_API_BASE_URL_PROD,
//     APP_ENV: import.meta.env.VITE_APP_ENV_PROD || "production",
//   },
//   staging: {
//     API_BASE_URL: import.meta.env.VITE_API_BASE_URL_STAGING,
//     APP_ENV: import.meta.env.VITE_APP_ENV_STAGING || "staging",
//   },
// };

// // Use the current environment setting
// const currentConfig = config[currentEnv];

// // Validation
// if (!currentConfig || !currentConfig.API_BASE_URL) {
//   console.error(
//     `❌ Invalid environment or missing API_BASE_URL: ${currentEnv}`
//   );
//   console.error("Available environments:", Object.keys(config));
// }

// console.log(
//   `🚀 Running in ${currentEnv} mode with API: ${currentConfig?.API_BASE_URL}`
// );

// export default currentConfig;
// export const API_BASE_URL = currentConfig?.API_BASE_URL || "";
// export const APP_ENV = currentConfig?.APP_ENV || "development";

// config/config.jsx
const currentEnv = import.meta.env.VITE_CURRENT_ENV || "development";

const config = {
  development: {
    API_BASE_URL:
      import.meta.env.VITE_API_BASE_URL_DEV || "http://localhost:8080",
    APP_ENV: "development",
  },
  production: {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL_PROD,
    APP_ENV: "production",
  },
  staging: {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL_STAGING || "",
    APP_ENV: "staging",
  },
};

const currentConfig = config[currentEnv] || config.development;

// Enhanced validation
if (!currentConfig.API_BASE_URL) {
  console.error(`❌ API_BASE_URL is missing for environment: ${currentEnv}`);
  console.error("Available environments:", Object.keys(config));
  console.error("Environment variables loaded:", {
    VITE_CURRENT_ENV: import.meta.env.VITE_CURRENT_ENV,
    VITE_API_BASE_URL_DEV: import.meta.env.VITE_API_BASE_URL_DEV,
    VITE_API_BASE_URL_PROD: import.meta.env.VITE_API_BASE_URL_PROD,
  });
} else {
  console.log(`🚀 Running in ${currentEnv} mode`);
  console.log(`📡 API Base URL: ${currentConfig.API_BASE_URL}`);
}

// Named exports
export const API_BASE_URL = currentConfig.API_BASE_URL;
export const APP_ENV = currentConfig.APP_ENV;

// Default export
export default currentConfig;
