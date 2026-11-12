/**
 * অথেনটিকেশন ও এক্সেস কন্ট্রোল টাইপ ডেফিনিশন (Authentication Types)
 * Denim Laser Automation & Control System (Denim LACS)
 */

export interface RoleSummary {
  id: string;
  name: string;
  display_name: string;
}

export interface UserSummary {
  id: string;
  username: string;
  email: string;
  full_name: string;
  employee_badge_id?: string | null;
  role: RoleSummary;
  permissions: string[];
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: UserSummary;
}

export interface LoginCredentials {
  username_or_email: string;
  password: string;
}

export interface QuickPinCredentials {
  pin: string;
  badge_id_or_username?: string;
}

export interface PydanticValidationErrorDetail {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface PydanticValidationErrorResponse {
  detail: PydanticValidationErrorDetail[];
}

export interface AuthState {
  user: UserSummary | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
