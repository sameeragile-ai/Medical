// Shared form validation/sanitization helpers.

export const NAME_RE = /^[A-Za-z\s.'-]*$/;
export const PHONE_RE = /^[0-9+\-\s()]*$/;
export const CODE_RE = /^[A-Za-z0-9\-\s]*$/;

const PHONE_MIN_DIGITS = 7;
const PHONE_MAX_DIGITS = 15;

// Strips characters that shouldn't be typeable in a given field, live as the user types.
export const sanitizeName = (value) => value.replace(/[^A-Za-z\s.'-]/g, "");
export const sanitizePhone = (value) => value.replace(/[^0-9+\-\s()]/g, "");
export const sanitizeCode = (value) => value.replace(/[^A-Za-z0-9\-\s]/g, "");

export function validateName(value, label, required) {
  const v = (value || "").trim();
  if (!v) return required ? `${label} is required.` : "";
  if (!NAME_RE.test(v)) return `${label} can only contain letters.`;
  return "";
}

export function validatePhone(value, label, required) {
  const v = (value || "").trim();
  if (!v) return required ? `${label} is required.` : "";
  if (!PHONE_RE.test(v)) return `${label} can only contain numbers.`;
  const digits = v.replace(/\D/g, "");
  if (digits.length < PHONE_MIN_DIGITS || digits.length > PHONE_MAX_DIGITS) {
    return `${label} must have between ${PHONE_MIN_DIGITS} and ${PHONE_MAX_DIGITS} digits.`;
  }
  return "";
}

export function validateNumber(value, label, { min = 0, required = false } = {}) {
  const v = String(value ?? "").trim();
  if (!v) return required ? `${label} is required.` : "";
  if (Number.isNaN(Number(v))) return `${label} must be a number.`;
  if (Number(v) < min) return `${label} must be ${min} or more.`;
  return "";
}
