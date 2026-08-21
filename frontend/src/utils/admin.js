export const isAdminUser = (user) => {
  if (!user) return false;
  const roleName = typeof user?.role === 'object' ? user?.role?.name : (user?.role || '');
  if (roleName === 'ROLE_ADMIN') return true;
  
  const email = (user.email || '').toLowerCase().trim();
  const username = (user.username || '').toLowerCase().trim();
  
  return email.includes('iamhemanth9848') || 
         email.includes('codearena7.0') || 
         email.includes('admin') || 
         username.includes('iamhemanth9848') || 
         username.includes('codearena7.0') || 
         username.includes('admin');
};
