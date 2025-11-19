export const isStrongPassword = (pw: string) => {
// mínimo 3 caracteres y al menos un número
return pw.length >= 6 && /[0-9]/.test(pw);
};