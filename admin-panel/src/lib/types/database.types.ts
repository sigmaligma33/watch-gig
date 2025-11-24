export type VerificationStatus = 'pending' | 'verified' | 'denied'

export interface Profile {
  id: string
  role: 'client' | 'provider' | 'admin' | 'help'
  phone_number: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  business_name: string | null
  national_id_number: string | null
  national_id_verified: boolean | null
  national_id_image_url: string | null
  created_at: string
  updated_at: string
  first_name: string | null
  last_name: string | null
}

export interface VerificationRequest {
  id: string
  user_id: string
  front_image_url: string | null
  back_image_url: string | null
  status: VerificationStatus
  created_at: string
  verification_type: string | null
  last_updated: string
  reviewed_at: string | null
  reviewed_by: string | null
  rejection_reason: string | null
}

export interface VerificationRequestWithProfile extends VerificationRequest {
  profile: Profile
}
