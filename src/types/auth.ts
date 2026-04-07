export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
  profileId?: string;
  schoolId?: string;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};
