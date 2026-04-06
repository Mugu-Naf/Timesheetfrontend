export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  username: string;
  role: string;
  token: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department?: string;
  jobTitle?: string;
}

export interface ForgotPasswordRequest {
  username: string;
  newPassword: string;
}

export interface TokenPayload {
  username: string;
  role: string;
  exp: number;
}
