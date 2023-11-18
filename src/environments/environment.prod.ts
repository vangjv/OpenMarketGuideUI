export const environment = {
  production: true,
  apiUrl: 'https://openmarketguideapi.azurewebsites.net/api/',
  redirectUri: 'https://openmarket.guide',
  msalConfig: {
    auth: {
      clientId: "cad2a42c-2653-414c-a3e5-93d5cf033f08",
    }
  },
  apiConfig: {
    scopes: ["https://openmarketguide.onmicrosoft.com/api-access/api-access"],
    uri: "https://openmarketguideapi.azurewebsites.net"
  },
  b2cPolicies: {
    names: {
      signUpSignIn: "b2c_1_susi",
      resetPassword: "b2c_1_reset",
      editProfile: "b2c_1_edit_profile"
    },
    authorities: {
      signUpSignIn: {
        authority: "https://openmarketguide.b2clogin.com/openmarketguide.onmicrosoft.com/b2c_1_susi"
      },
      resetPassword: {
        authority: "https://openmarketguide.b2clogin.com/openmarketguide.onmicrosoft.com/b2c_1_reset"
      },
      editProfile: {
        authority: "https://openmarketguide.b2clogin.com/openmarketguide.onmicrosoft.com/b2c_1_edit_profile"
      }
    },
    authorityDomain: "openmarketguide.b2clogin.com"
  }
};
