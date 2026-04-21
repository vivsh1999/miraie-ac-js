import { LOGIN_URL, HOMES_URL, DEVICE_DETAILS_URL } from '../constants/api';
import { HTTP_CLIENT_ID } from '../constants/api';
import { type AuthToken } from '../types/auth';

export const login = async (username: string, password: string): Promise<AuthToken> => {
  const isEmail = username.includes('@');
  const data: Record<string, string> = {
    clientId: HTTP_CLIENT_ID,
    password: password,
    scope: "an_14214235325",
  };
  
  if (isEmail) {
    data["email"] = username;
  } else {
    data["mobile"] = username;
  }
  
  const response = await fetch(LOGIN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Authentication failed: ${response.statusText}`);
  }

  const json = await response.json();
  return {
    accessToken: json.accessToken,
    refreshToken: json.refreshToken,
    userId: json.userId,
    expiresIn: json.expiresIn,
  };
};

export const fetchHomes = async (token: string) => {
  const response = await fetch(HOMES_URL, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) throw new Error(`Failed to fetch homes: ${response.statusText}`);
  return response.json();
};

export const fetchDeviceDetails = async (token: string, deviceIds: string) => {
  const response = await fetch(`${DEVICE_DETAILS_URL}/${deviceIds}`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) throw new Error(`Failed to fetch device details: ${response.statusText}`);
  return response.json();
};
