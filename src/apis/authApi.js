// authApi.js (FULL UPDATED)

import AsyncStorage from "@react-native-async-storage/async-storage";
// ✅ FIXED: Import BASE_URL from api.js for consistency
import { BASE_URL } from "./api";

// ================= REGISTER API ==================

export const registerUser = async ({
  username,
  email,
  full_name,
  phone_number,
  password,
}) => {
  try {
    // ✅ FIXED: Use the correct endpoint from API documentation
    const url = `${BASE_URL}/auth/register`;

    console.log("➡️ Registering user at:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        full_name,     // required
        phone_number,  // required
        password,
      }),
    });

    // read raw response as text (safe)
    const rawResponseText = await response.text();
    console.log("📦 RAW RESPONSE:", rawResponseText);

    // try JSON parse
    try {
      const json = JSON.parse(rawResponseText);

      // If response is JSON and HTTP is ok, return success
      if (response.ok) {
        console.log("✅ Registration successful");
        return json;
      } else {
        // If not ok but JSON, throw error message
        const errMessage =
          json.message ||
          json.detail ||
          JSON.stringify(json);
        throw new Error(errMessage);
      }
    } catch (parseError) {
      // If parse fails, throw with raw response
      console.warn(`❌ JSON parse failed:`, parseError.message);
      throw new Error(`Server returned invalid response: ${rawResponseText}`);
    }

  } catch (error) {
    console.error("❌ Registration error:", error.message);
    throw error;
  }
};

// ================= LOGIN API ==================

export const loginUser = async ({ username, password }) => {
  try {
    // ✅ FIXED: Use the correct endpoint from API documentation
    const url = `${BASE_URL}/auth/login`;

    console.log("➡️ Logging in user at:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const rawResponseText = await response.text();
    console.log("📦 RAW LOGIN RESPONSE:", rawResponseText);

    try {
      const json = JSON.parse(rawResponseText);

      if (response.ok) {
        console.log("✅ Login successful");
        
        // Store tokens in AsyncStorage
        if (json.access_token) {
          await AsyncStorage.setItem("access_token", json.access_token);
        }
        if (json.refresh_token) {
          await AsyncStorage.setItem("refresh_token", json.refresh_token);
        }
        if (json.token_type) {
          await AsyncStorage.setItem("token_type", json.token_type);
        }

        return json;
      } else {
        const errMessage =
          json.message ||
          json.detail ||
          JSON.stringify(json);
        throw new Error(errMessage);
      }
    } catch (parseError) {
      console.warn(`❌ JSON parse failed:`, parseError.message);
      throw new Error(`Server returned invalid response: ${rawResponseText}`);
    }

  } catch (error) {
    console.error("❌ Login error:", error.message);
    throw error;
  }
};

// ================= TOKEN REFRESH API ==================

export const refreshToken = async () => {
  try {
    const refresh_token = await AsyncStorage.getItem("refresh_token");
    
    if (!refresh_token) {
      throw new Error("No refresh token available");
    }

    // ✅ FIXED: Use the correct endpoint from API documentation
    const url = `${BASE_URL}/auth/token/refresh`;

    console.log("➡️ Refreshing token at:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        refresh_token,
      }),
    });

    const rawResponseText = await response.text();
    console.log("📦 RAW REFRESH RESPONSE:", rawResponseText);

    try {
      const json = JSON.parse(rawResponseText);

      if (response.ok) {
        console.log("✅ Token refresh successful");
        
        // Update tokens in AsyncStorage
        if (json.access_token) {
          await AsyncStorage.setItem("access_token", json.access_token);
        }
        if (json.refresh_token) {
          await AsyncStorage.setItem("refresh_token", json.refresh_token);
        }
        
        return json;
      } else {
        const errMessage =
          json.message ||
          json.detail ||
          JSON.stringify(json);
        throw new Error(errMessage);
      }
    } catch (parseError) {
      console.warn(`❌ JSON parse failed:`, parseError.message);
      throw new Error(`Server returned invalid response: ${rawResponseText}`);
    }

  } catch (error) {
    console.error("❌ Token refresh error:", error.message);
    throw error;
  }
};

// ================= UTILITY FUNCTIONS ==================

export const getAccessToken = async () => {
  try {
    return await AsyncStorage.getItem("access_token");
  } catch (error) {
    console.error("❌ Failed to get access token:", error.message);
    return null;
  }
};

export const getTokenType = async () => {
  try {
    return await AsyncStorage.getItem("token_type") || "Bearer";
  } catch (error) {
    console.error("❌ Failed to get token type:", error.message);
    return "Bearer";
  }
};

export const logout = async () => {
  try {
    await AsyncStorage.multiRemove([
      "access_token",
      "refresh_token", 
      "token_type",
      "user_data"
    ]);
    console.log("✅ Logout successful - tokens cleared");
  } catch (error) {
    console.error("❌ Logout error:", error.message);
    throw error;
  }
};

// ================= EXPORT ALIASES FOR COMPATIBILITY ==================

// Export login function with expected name for compatibility
export const login = loginUser;
export const register = registerUser;
