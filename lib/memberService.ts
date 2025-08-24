// Member service for interacting with the member API
import { get, post, put, del } from './api';

export type Member = {
  id?: string;
  memberCode: string;
  name: string;
  phone: string;
  email?: string;
  points: number;
  totalSpent: number;
  joinDate: Date;
  lastVisit?: Date;
  is_active: boolean;
  branch_id?: string;
};

const MEMBER_API = 'member';

/**
 * Get all members
 * @returns Promise with all members
 */
export const getMembers = () => {
  return get(MEMBER_API);
};

/**
 * Get member by ID
 * @param id - Member ID
 * @returns Promise with the member data
 */
export const getMemberById = (id: string) => {
  return get(`${MEMBER_API}/${id}`);
};

/**
 * Get member by phone number
 * @param phone - Member phone number
 * @returns Promise with the member data
 */
export const getMemberByPhone = (phone: string) => {
  return get(`${MEMBER_API}/phone/${phone}`);
};

/**
 * Create a new member
 * @param member - Member data
 * @returns Promise with the created member
 */
export const createMember = (member: Member) => {
  return post(MEMBER_API, {
    ...member,
    created_at: new Date(),
    updated_at: new Date(),
  });
};

/**
 * Update an existing member
 * @param id - Member ID
 * @param member - Updated member data
 * @returns Promise with the updated member
 */
export const updateMember = (id: string, member: Partial<Member>) => {
  return put(`${MEMBER_API}/${id}`, {
    ...member,
    updated_at: new Date(),
  });
};

/**
 * Delete a member
 * @param id - Member ID
 * @returns Promise with the delete result
 */
export const deleteMember = (id: string) => {
  return del(`${MEMBER_API}/${id}`);
};
