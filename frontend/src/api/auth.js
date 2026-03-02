// api/auth.js — Authentication API calls

import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || '';

/**
 * POST /api/auth/login
 * Returns { access_token, token_type, username, role, display_name }
 * Throws an axios error with response.data.detail on 401.
 */
export async function loginRequest(username, password) {
  const response = await axios.post(
    `${BASE_URL}/api/auth/login`,
    { username, password },
    { headers: { 'Content-Type': 'application/json' }, timeout: 10000 },
  );
  return response.data;
}
