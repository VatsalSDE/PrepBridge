import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import adminService from '@/services/adminService';

const useAdminStore = create(
  persist(
    (set, get) => ({
      isAdmin: false,
      adminUser: null,
      adminToken: null,
      dashboardStats: null,
      users: [],
      usersPagination: { page: 1, limit: 20, total: 0 },
      companies: [],
      communityPosts: [],
      communityPostsPagination: { page: 1, limit: 20, total: 0 },
      communityReports: [],
      roadmapUsers: [],
      roadmapUsersPagination: { page: 1, limit: 20, total: 0 },
      selectedUserRoadmap: null,
      isLoading: false,
      error: null,

      loginAdmin: async (email, password) => {
        set({ isLoading: true, error: null });

        try {
          const response = await adminService.login({ email, password });
          set({
            isAdmin: true,
            adminUser: response.user,
            adminToken: response.token,
            isLoading: false,
            error: null,
          });
          return { success: true };
        } catch (error) {
          set({ isLoading: false, error: error.message });
          return { success: false, error: error.message };
        }
      },

      fetchDashboard: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await adminService.getDashboard();
          set({ dashboardStats: response.data, isLoading: false, error: null });
          return response.data;
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      fetchUsers: async (page = 1, limit = 20) => {
        set({ isLoading: true, error: null });
        try {
          const response = await adminService.getUsers(page, limit);
          set({
            users: response.data || [],
            usersPagination: response.pagination || { page, limit, total: 0 },
            isLoading: false,
            error: null,
          });
          return response;
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      banUser: async (userId) => {
        set({ isLoading: true, error: null });
        try {
          await adminService.banUser(userId);
          set((state) => ({
            users: state.users.map((user) =>
              (user._id || user.id) === userId ? { ...user, status: 'banned' } : user
            ),
            isLoading: false,
            error: null,
          }));
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      unbanUser: async (userId) => {
        set({ isLoading: true, error: null });
        try {
          await adminService.unbanUser(userId);
          set((state) => ({
            users: state.users.map((user) =>
              (user._id || user.id) === userId ? { ...user, status: 'active' } : user
            ),
            isLoading: false,
            error: null,
          }));
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      fetchCompanies: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await adminService.getCompanies();
          set({ companies: response.data || [], isLoading: false, error: null });
          return response.data || [];
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      createCompany: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const response = await adminService.createCompany(payload);
          set((state) => ({
            companies: [response.data, ...state.companies],
            isLoading: false,
            error: null,
          }));
          return response.data;
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      updateCompany: async (companyId, payload) => {
        set({ isLoading: true, error: null });
        try {
          const response = await adminService.updateCompany(companyId, payload);
          set((state) => ({
            companies: state.companies.map((company) =>
              company._id === companyId ? response.data : company
            ),
            isLoading: false,
            error: null,
          }));
          return response.data;
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      deleteCompany: async (companyId) => {
        set({ isLoading: true, error: null });
        try {
          await adminService.deleteCompany(companyId);
          set((state) => ({
            companies: state.companies.filter((company) => company._id !== companyId),
            isLoading: false,
            error: null,
          }));
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      approveCompany: async (companyId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await adminService.approveCompany(companyId);
          set((state) => ({
            companies: state.companies.map((company) =>
              company._id === companyId ? response.data : company
            ),
            isLoading: false,
            error: null,
          }));
          return response.data;
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      generateGuidelines: async (companyId, rawAlumniInput) => {
        set({ isLoading: true, error: null });
        try {
          const response = await adminService.generateGuidelines(companyId, rawAlumniInput);
          set((state) => ({
            companies: state.companies.map((company) =>
              company._id === companyId ? response.data : company
            ),
            isLoading: false,
            error: null,
          }));
          return response.data;
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      fetchCommunityReports: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await adminService.getCommunityReports();
          set({ communityReports: response.data || [], isLoading: false, error: null });
          return response.data || [];
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      fetchCommunityPosts: async ({ page = 1, limit = 20, search = '', onlyReported = false } = {}) => {
        set({ isLoading: true, error: null });
        try {
          const response = await adminService.getCommunityPosts(page, limit, search, onlyReported);
          set({
            communityPosts: response.data || [],
            communityPostsPagination: response.pagination || { page, limit, total: 0 },
            isLoading: false,
            error: null,
          });
          return response;
        } catch (error) {
          // Backward-compatibility fallback: older backend may not expose /admin/community/posts.
          if (error?.status === 404) {
            try {
              const reportsResponse = await adminService.getCommunityReports();
              const reports = reportsResponse.data || [];

              const dedupedPosts = new Map();
              reports.forEach((report) => {
                const post = report.postId;
                if (!post?._id) return;

                const key = post._id;
                const existing = dedupedPosts.get(key) || {
                  ...post,
                  authorName: 'Anonymous User',
                  totalReports: 0,
                  pendingReports: 0,
                  createdAt: report.createdAt,
                };

                existing.totalReports += 1;
                if (report.status === 'pending') existing.pendingReports += 1;
                dedupedPosts.set(key, existing);
              });

              let fallbackData = Array.from(dedupedPosts.values());
              if (search) {
                const q = search.toLowerCase();
                fallbackData = fallbackData.filter((post) =>
                  `${post.title || ''} ${post.content || ''}`.toLowerCase().includes(q)
                );
              }
              if (onlyReported) {
                fallbackData = fallbackData.filter((post) => Number(post.totalReports || 0) > 0);
              }

              set({
                communityPosts: fallbackData,
                communityPostsPagination: { page: 1, limit: fallbackData.length || limit, total: fallbackData.length },
                isLoading: false,
                error: null,
              });

              return { data: fallbackData, pagination: { page: 1, limit: fallbackData.length || limit, total: fallbackData.length } };
            } catch (fallbackError) {
              set({ isLoading: false, error: fallbackError.message });
              throw fallbackError;
            }
          }

          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      deleteCommunityPost: async (postId) => {
        set({ isLoading: true, error: null });
        try {
          await adminService.deleteCommunityPost(postId);
          set((state) => ({
            communityPosts: state.communityPosts.filter((post) => post._id !== postId),
            isLoading: false,
            error: null,
          }));
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      hideCommunityPost: async (postId) => {
        set({ isLoading: true, error: null });
        try {
          await adminService.hidePost(postId);
          await get().fetchCommunityReports();
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      unhideCommunityPost: async (postId) => {
        set({ isLoading: true, error: null });
        try {
          await adminService.unhidePost(postId);
          await get().fetchCommunityReports();
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      resolveReport: async (reportId, actionTaken = 'hidden') => {
        set({ isLoading: true, error: null });
        try {
          await adminService.resolveReport(reportId, actionTaken);
          await get().fetchCommunityReports();
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      dismissReport: async (reportId) => {
        set({ isLoading: true, error: null });
        try {
          await adminService.dismissReport(reportId);
          await get().fetchCommunityReports();
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      fetchRoadmapUsers: async (page = 1, limit = 20, search = '') => {
        set({ isLoading: true, error: null });
        try {
          const response = await adminService.getRoadmapUsers(page, limit, search);
          set({
            roadmapUsers: response.data || [],
            roadmapUsersPagination: response.pagination || { page, limit, total: 0 },
            isLoading: false,
            error: null,
          });
          return response;
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      fetchUserRoadmap: async (userId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await adminService.getUserRoadmap(userId);
          set({ selectedUserRoadmap: response.data, isLoading: false, error: null });
          return response.data;
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      toggleUserFoundationTopic: async (userId, section, sectionName, topicName) => {
        set({ isLoading: true, error: null });
        try {
          const response = await adminService.updateUserRoadmapFoundation(userId, section, sectionName, topicName);
          set((state) => ({
            selectedUserRoadmap: state.selectedUserRoadmap
              ? { ...state.selectedUserRoadmap, roadmap: response.data }
              : null,
            isLoading: false,
            error: null,
          }));
          return response.data;
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      toggleUserDomainSkill: async (userId, roleId, skillName) => {
        set({ isLoading: true, error: null });
        try {
          const response = await adminService.updateUserRoadmapDomain(userId, roleId, skillName);
          set((state) => ({
            selectedUserRoadmap: state.selectedUserRoadmap
              ? { ...state.selectedUserRoadmap, roadmap: response.data }
              : null,
            isLoading: false,
            error: null,
          }));
          return response.data;
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      logoutAdmin: () => {
        set({
          isAdmin: false,
          adminUser: null,
          adminToken: null,
          dashboardStats: null,
          users: [],
          usersPagination: { page: 1, limit: 20, total: 0 },
          companies: [],
          communityPosts: [],
          communityPostsPagination: { page: 1, limit: 20, total: 0 },
          communityReports: [],
          roadmapUsers: [],
          roadmapUsersPagination: { page: 1, limit: 20, total: 0 },
          selectedUserRoadmap: null,
          error: null,
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'prepbridge-admin',
    }
  )
);

export default useAdminStore;
