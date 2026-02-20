export function extractErrorMessage(err, fallback = "Something went wrong.") {
  const res = err?.response;

  // Laravel validation: { message, errors: { field: [msg] } }
  const errors = res?.data?.errors;
  if (errors && typeof errors === "object") {
    const firstKey = Object.keys(errors)[0];
    const firstMsg = Array.isArray(errors[firstKey]) ? errors[firstKey][0] : null;
    if (firstMsg) return firstMsg;
  }

  return res?.data?.message || err?.message || fallback;
}

export function extractFieldErrors(err) {
  const errors = err?.response?.data?.errors;
  return errors && typeof errors === "object" ? errors : {};
}