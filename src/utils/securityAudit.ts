export type SuspiciousRiskLevel = 'none' | 'new_device' | 'new_ip' | 'suspicious' | 'high_risk';

export interface SessionFootprint {
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt?: number | string | Date;
}

export interface SuspiciousLoginAnalysis {
  isSuspicious: boolean;
  riskLevel: SuspiciousRiskLevel;
  reasons: string[];
}

export function detectSuspiciousLogin(
  current: SessionFootprint,
  previous: readonly SessionFootprint[] = [],
): SuspiciousLoginAnalysis {
  if (previous.length === 0) {
    return {
      isSuspicious: false,
      riskLevel: 'none',
      reasons: [],
    };
  }

  const knownIps = new Set(
    previous.map((s) => s.ipAddress?.trim()).filter((ip): ip is string => Boolean(ip)),
  );
  const knownAgents = new Set(
    previous.map((s) => s.userAgent?.trim()).filter((ua): ua is string => Boolean(ua)),
  );

  const currentIp = current.ipAddress?.trim();
  const currentAgent = current.userAgent?.trim();

  const isNewIp = Boolean(currentIp && !knownIps.has(currentIp));
  const isNewAgent = Boolean(currentAgent && !knownAgents.has(currentAgent));

  const reasons: string[] = [];
  if (isNewIp) reasons.push('unrecognized_ip_address');
  if (isNewAgent) reasons.push('unrecognized_device_user_agent');

  if (isNewIp && isNewAgent) {
    return {
      isSuspicious: true,
      riskLevel: 'high_risk',
      reasons,
    };
  }

  if (isNewIp) {
    return {
      isSuspicious: true,
      riskLevel: 'new_ip',
      reasons,
    };
  }

  if (isNewAgent) {
    return {
      isSuspicious: false,
      riskLevel: 'new_device',
      reasons,
    };
  }

  return {
    isSuspicious: false,
    riskLevel: 'none',
    reasons: [],
  };
}

const SENSITIVE_KEY_PATTERN = /^(password|currentpassword|newpassword|confirmpassword|token|accesstoken|refreshtoken|idtoken|secret|authorization|cookie|creditcard|cardnumber|cvv|cvc|apikey)$/i;

export function sanitizeSensitiveData<T>(input: T): T {
  if (input === null || typeof input !== 'object') {
    return input;
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeSensitiveData(item)) as unknown as T;
  }

  const copy = {} as Record<string, unknown>;
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    const cleanKey = key.replace(/[-_]/g, '').toLowerCase();
    if (SENSITIVE_KEY_PATTERN.test(cleanKey)) {
      copy[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      copy[key] = sanitizeSensitiveData(value);
    } else {
      copy[key] = value;
    }
  }
  return copy as T;
}

export interface AgeEligibilityResult {
  eligible: boolean;
  age?: number;
  error?: 'underage' | 'invalid_date';
}

export function validateAgeEligibility(
  birthDateOrAge: string | number | Date,
  minAge = 13,
  referenceDate = new Date(),
): AgeEligibilityResult {
  if (typeof birthDateOrAge === 'number') {
    if (Number.isNaN(birthDateOrAge) || birthDateOrAge < 0 || birthDateOrAge > 130) {
      return { eligible: false, error: 'invalid_date' };
    }
    if (birthDateOrAge < minAge) {
      return { eligible: false, age: birthDateOrAge, error: 'underage' };
    }
    return { eligible: true, age: birthDateOrAge };
  }

  const date = typeof birthDateOrAge === 'string' ? new Date(birthDateOrAge) : birthDateOrAge;
  if (Number.isNaN(date.getTime())) {
    return { eligible: false, error: 'invalid_date' };
  }

  const now = referenceDate;
  let age = now.getFullYear() - date.getFullYear();
  const monthDiff = now.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < date.getDate())) {
    age -= 1;
  }

  if (age < minAge) {
    return { eligible: false, age, error: 'underage' };
  }

  return { eligible: true, age };
}

export interface UserDataExport<T = Record<string, unknown>> {
  schemaVersion: '1.0';
  exportedAt: string;
  dataSubjectId: string;
  data: T;
}

export function buildUserDataExport<T extends Record<string, unknown>>(
  userId: string,
  data: T,
  now = new Date(),
): UserDataExport<T> {
  return {
    schemaVersion: '1.0',
    exportedAt: now.toISOString(),
    dataSubjectId: userId,
    data: sanitizeSensitiveData(data),
  };
}
