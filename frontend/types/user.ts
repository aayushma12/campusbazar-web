export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: string;
  status?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  profilePicture?: string;
  university?: string;
  campus?: string;
  phoneNumber?: string;
  studentId?: string;
  batch?: string;
  collegeId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function getUserId(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value;

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const id = obj.id ?? obj._id;
    return typeof id === 'string' ? id : '';
  }

  return '';
}

export function normalizeUser(value: unknown): User | null {
  if (!value || typeof value !== 'object') return null;

  const obj = value as Record<string, any>;
  const id = getUserId(obj);
  if (!id) return null;

  return {
    id,
    _id: typeof obj._id === 'string' ? obj._id : undefined,
    name: String(obj.name ?? obj.fullName ?? 'Unknown User'),
    email: String(obj.email ?? ''),
    role: String(obj.role ?? 'user'),
    status: typeof obj.status === 'string' ? obj.status : undefined,
    isDeleted: Boolean(obj.isDeleted ?? obj.deleted ?? false),
    deletedAt: typeof obj.deletedAt === 'string' ? obj.deletedAt : undefined,
    profilePicture: typeof obj.profilePicture === 'string' ? obj.profilePicture : undefined,
    university: typeof obj.university === 'string' ? obj.university : undefined,
    campus: typeof obj.campus === 'string' ? obj.campus : undefined,
    phoneNumber: typeof obj.phoneNumber === 'string' ? obj.phoneNumber : undefined,
    studentId: typeof obj.studentId === 'string' ? obj.studentId : undefined,
    batch: typeof obj.batch === 'string' ? obj.batch : undefined,
    collegeId: typeof obj.collegeId === 'string' ? obj.collegeId : undefined,
    createdAt: typeof obj.createdAt === 'string' ? obj.createdAt : undefined,
    updatedAt: typeof obj.updatedAt === 'string' ? obj.updatedAt : undefined,
  };
}

export function isUserDeleted(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;

  const obj = value as Record<string, unknown>;

  if (obj.isDeleted === true || obj.deleted === true) return true;
  if (typeof obj.deletedAt === 'string' && obj.deletedAt.length > 0) return true;

  const status = typeof obj.status === 'string' ? obj.status.toLowerCase() : '';
  return status === 'deleted' || status === 'removed';
}
