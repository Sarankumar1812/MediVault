// lib/types/index.ts
export interface User {
  mv_ut_id: number;
  mv_ut_email: string | null;
  mv_ut_phone: string | null;
  mv_ut_password_hash: string | null;
  mv_ut_account_status: 'pending' | 'active' | 'suspended' | 'deactivated';
  mv_ut_is_email_verified: boolean;
  mv_ut_is_phone_verified: boolean;
  mv_ut_failed_attempts: number;
  mv_ut_locked_until: string | null;
  mv_ut_created_at: string;
  mv_ut_updated_at: string;
  mv_ut_deleted_at: string | null;
}

export interface Individual {
  mv_id_id: number;
  mv_id_user_id: number;
  mv_id_first_name: string;
  mv_id_last_name: string;
  mv_id_date_of_birth: string | null;
  mv_id_gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  mv_id_blood_group: string | null;
  mv_id_emergency_contact_name: string | null;
  mv_id_emergency_contact_phone: string | null;
  mv_id_profile_picture_url: string | null;
  mv_id_is_complete: boolean;
  mv_id_created_at: string;
  mv_id_updated_at: string;
}

export interface OTPVerification {
  mv_otp_id: number;
  mv_otp_user_id: number | null;
  mv_otp_contact_type: 'email' | 'phone';
  mv_otp_contact_value: string;
  mv_otp_code_hash: string;
  mv_otp_purpose: 'registration' | 'login' | 'password_reset' | 'email_verification' | 'phone_verification';
  mv_otp_is_used: boolean;
  mv_otp_expires_at: string;
  mv_otp_created_at: string;
}

export interface Session {
  mv_sm_id: number;
  mv_sm_user_id: number;
  mv_sm_token_hash: string;
  mv_sm_device_info: string | null;
  mv_sm_ip_address: string | null;
  mv_sm_expires_at: string;
  mv_sm_revoked_at: string | null;
  mv_sm_created_at: string;
}

export interface RegistrationAttempt {
  mv_ra_id: number;
  mv_ra_email: string | null;
  mv_ra_phone: string | null;
  mv_ra_country_code: string | null;
  mv_ra_ip_address: string | null;
  mv_ra_user_agent: string | null;
  mv_ra_status: 'in_progress' | 'completed' | 'abandoned' | 'blocked';
  mv_ra_verification_sent: boolean;
  mv_ra_verification_method: string | null;
  mv_ra_created_at: string;
  mv_ra_completed_at: string | null;
}