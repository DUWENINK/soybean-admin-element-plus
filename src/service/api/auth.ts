import { request } from '../request';

/**
 * Login with JWT
 *
 * @param username User name
 * @param password Password
 * @param rememberMe Remember me option
 */
export function fetchLogin(username: string, password: string, rememberMe = false) {
  return request<Api.Auth.LoginToken>({
    url: '/api/Account/LoginJwt',
    method: 'post',
    data: {
      username,
      password,
      rememberMe
    }
  });
}

/** Get user info */
export function fetchGetUserInfo() {
  return request<Api.Auth.UserInfo>({
    url: '/api/Account/CheckUserInfo',
    method: 'post'
  });
}

/**
 * Refresh token
 *
 * @param refreshToken Refresh token
 */
export function fetchRefreshToken(refreshToken: string) {
  return request<Api.Auth.LoginToken>({
    url: '/api/Account/RefreshToken',
    method: 'get',
    params: {
      refreshToken
    }
  });
}

/**
 * Logout
 */
export function fetchLogout() {
  return request({
    url: '/api/Account/Logout',
    method: 'post'
  });
}

export function fetchCustomBackendError(code: string, message: string) {
  return request<void>({
    url: '/api/Account/CustomBackendError',
    method: 'post',
    data: {
      code,
      message
    }
  });
}
