import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Admin credentials (in production, this would be server-side validated)
const ADMIN_EMAIL = 'admin@prepbridge.com';
const ADMIN_PASSWORD = 'admin123';

const useAdminStore = create(
  persist(
    (set, get) => ({
      isAdmin: false,
      adminUser: null,

      loginAdmin: (email, password) => {
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
          set({ 
            isAdmin: true, 
            adminUser: { email, name: 'Admin', role: 'admin' } 
          });
          return { success: true };
        }
        return { success: false, error: 'Invalid admin credentials' };
      },

      logoutAdmin: () => {
        set({ isAdmin: false, adminUser: null });
      },
    }),
    {
      name: 'prepbridge-admin',
    }
  )
);

export default useAdminStore;
