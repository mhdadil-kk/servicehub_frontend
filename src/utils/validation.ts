// ─────────────────────────────────────────────────────────────────────────────
// Shared Form Validation Utility
// ─────────────────────────────────────────────────────────────────────────────

// ── Image / File Constraints ──────────────────────────────────────────────────
export const FILE_LIMITS = {
  profilePhoto: {
    maxSizeBytes: 2 * 1024 * 1024, // 2 MB
    allowedTypes: ["image/jpeg", "image/jpg", "image/png"],
    allowedExtensions: ".jpg, .jpeg, .png",
    label: "Profile Photo",
  },
  verificationDoc: {
    maxSizeBytes: 5 * 1024 * 1024, // 5 MB
    allowedTypes: ["image/jpeg", "image/jpg", "image/png", "application/pdf"],
    allowedExtensions: ".jpg, .jpeg, .png, .pdf",
    label: "Verification Document",
  },
} as const;

// ── File Validation ───────────────────────────────────────────────────────────
export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFile(
  file: File,
  config: (typeof FILE_LIMITS)[keyof typeof FILE_LIMITS]
): FileValidationResult {
  
  // Strict extension check (since browsers can misreport MIME type)
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  // Convert allowedExtensions (e.g. ".jpg, .jpeg, .png") into an array of raw extensions ["jpg", "jpeg", "png"]
  const validExts = config.allowedExtensions.split(",").map(e => e.trim().replace(".", "").toLowerCase());
  
  // Enforce both extension AND MIME type correctly (prevent empty mime types from passing)
  if (!validExts.includes(ext) || !config.allowedTypes.includes(file.type as any)) {
    return {
      valid: false,
      error: `Only ${config.allowedExtensions} files are accepted.`,
    };
  }

  // Size limit check
  if (file.size > config.maxSizeBytes) {
    const maxMB = config.maxSizeBytes / (1024 * 1024);
    return {
      valid: false,
      error: `${config.label} must be under ${maxMB} MB.`,
    };
  }
  
  return { valid: true };
}

// ── Field Validators ──────────────────────────────────────────────────────────

export function validateName(value: string): string | null {
  if (!value.trim()) return "Full name is required.";
  if (value.trim().length < 2) return "Name must be at least 2 characters.";
  if (value.trim().length > 60) return "Name must be 60 characters or fewer.";
  return null;
}

export function validateEmail(value: string): string | null {
  if (!value.trim()) return "Email address is required.";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value.trim())) return "Please enter a valid email address.";
  return null;
}

export function validatePhone(value: string): string | null {
  if (!value.trim()) return null; // phone is optional on signup
  const phoneRegex = /^[+]?[\d\s\-().]{7,15}$/;
  if (!phoneRegex.test(value.trim())) return "Enter a valid phone number (7–15 digits).";
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return "Password is required.";
  if (value.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(value)) return "Password must contain at least one uppercase letter.";
  if (!/[0-9]/.test(value)) return "Password must contain at least one number.";
  return null;
}

export function validateConfirmPassword(
  password: string,
  confirmPassword: string
): string | null {
  if (!confirmPassword) return "Please confirm your password.";
  if (password !== confirmPassword) return "Passwords do not match.";
  return null;
}

export function validateRequired(value: string, label: string): string | null {
  if (!value || !value.trim()) return `${label} is required.`;
  return null;
}

export function validateHourlyRate(value: string | number): string | null {
  const num = Number(value);
  if (!value && value !== 0) return "Hourly rate is required.";
  if (isNaN(num) || num <= 0) return "Hourly rate must be a positive number.";
  if (num > 10000) return "Hourly rate seems too high. Please double-check.";
  return null;
}

// ── Provider Onboarding Validators ────────────────────────────────────────────

export function validateBio(value: string): string | null {
  if (!value || !value.trim()) return "Bio is required.";
  if (value.trim().length < 20) return "Bio should be at least 20 characters long.";
  if (value.trim().length > 500) return "Bio must be 500 characters or fewer.";
  return null;
}

export function validateBankField(value: string, fieldName: string, minLength: number = 3): string | null {
  if (!value || !value.trim()) return `${fieldName} is required.`;
  if (value.trim().length < minLength) return `${fieldName} must be at least ${minLength} characters.`;
  return null;
}

// ── Password strength indicator (0–4) ────────────────────────────────────────
export function getPasswordStrength(password: string): {
  score: number; // 0–4
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: "Too weak", color: "#ef4444" },
    { label: "Weak", color: "#f97316" },
    { label: "Fair", color: "#eab308" },
    { label: "Strong", color: "#22c55e" },
    { label: "Very strong", color: "#16a34a" },
  ];

  return { score, ...levels[score] };
}
