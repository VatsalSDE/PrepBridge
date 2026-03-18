import { create } from 'zustand';
import roadmapService from '@/services/roadmapService';

const computeFoundationProgress = (sections = []) => {
  const totals = sections.reduce(
    (acc, section) => {
      const topics = section.topics || [];
      acc.total += topics.length;
      acc.completed += topics.filter((topic) => topic.completed).length;
      return acc;
    },
    { total: 0, completed: 0 }
  );

  return totals.total ? Math.round((totals.completed / totals.total) * 100) : 0;
};

const computeOverallProgress = (roadmap) => {
  if (!roadmap) return 0;
  const keys = ['dsa', 'coreCS', 'aptitude', 'systemDesign'];
  const sum = keys.reduce((acc, key) => acc + (roadmap[key]?.overallProgress || 0), 0);
  return Math.round(sum / keys.length);
};

const toggleFoundationLocally = (roadmap, sectionKey, sectionName, topicName) => {
  if (!roadmap?.[sectionKey]) return roadmap;

  const nextSections = (roadmap[sectionKey].sections || []).map((section) => {
    if (section.name !== sectionName) return section;

    return {
      ...section,
      topics: (section.topics || []).map((topic) =>
        topic.name === topicName
          ? {
              ...topic,
              completed: !topic.completed,
              completedAt: !topic.completed ? new Date().toISOString() : null,
            }
          : topic
      ),
    };
  });

  const nextRoadmap = {
    ...roadmap,
    [sectionKey]: {
      ...roadmap[sectionKey],
      sections: nextSections,
      overallProgress: computeFoundationProgress(nextSections),
    },
  };

  return {
    ...nextRoadmap,
    totalProgress: computeOverallProgress(nextRoadmap),
  };
};

const toggleDomainLocally = (roadmap, roleId, skillName) => {
  if (!roadmap?.domainRoles) return roadmap;

  const nextDomainRoles = roadmap.domainRoles.map((role) => {
    if (role.roleId !== roleId) return role;

    const nextSkills = (role.skills || []).map((skill) =>
      skill.name === skillName
        ? {
            ...skill,
            completed: !skill.completed,
            completedAt: !skill.completed ? new Date().toISOString() : null,
          }
        : skill
    );

    const completed = nextSkills.filter((skill) => skill.completed).length;
    const progress = nextSkills.length ? Math.round((completed / nextSkills.length) * 100) : 0;

    return {
      ...role,
      skills: nextSkills,
      progress,
    };
  });

  return {
    ...roadmap,
    domainRoles: nextDomainRoles,
  };
};

const useRoadmapStore = create((set, get) => ({
  roadmap: null,
  isLoading: false,
  isMutating: false,
  error: null,

  fetchRoadmap: async ({ silent = false } = {}) => {
    if (!silent) {
      set({ isLoading: true, error: null });
    }
    try {
      const response = await roadmapService.getRoadmap();
      set({ roadmap: response?.data || null, isLoading: false, error: null });
      return response?.data || null;
    } catch (error) {
      set({ isLoading: false, error: error.message || 'Failed to fetch roadmap' });
      throw error;
    }
  },

  toggleFoundationTopic: async (section, sectionName, topicName) => {
    const previousRoadmap = get().roadmap;
    set({ isMutating: true, error: null });

    if (previousRoadmap) {
      set({ roadmap: toggleFoundationLocally(previousRoadmap, section, sectionName, topicName) });
    }

    try {
      const response = await roadmapService.toggleFoundation(section, sectionName, topicName);
      if (response?.data) {
        set({ roadmap: response.data });
      }
      set({ isMutating: false, error: null });
    } catch (error) {
      if (previousRoadmap) {
        set({ roadmap: previousRoadmap });
      }
      set({ isMutating: false, error: error.message || 'Failed to update roadmap topic' });
      throw error;
    }
  },

  toggleDomainSkill: async (roleId, skillName) => {
    const previousRoadmap = get().roadmap;
    set({ isMutating: true, error: null });

    if (previousRoadmap) {
      set({ roadmap: toggleDomainLocally(previousRoadmap, roleId, skillName) });
    }

    try {
      const response = await roadmapService.toggleDomain(roleId, skillName);
      if (response?.data) {
        set({ roadmap: response.data });
      }
      set({ isMutating: false, error: null });
    } catch (error) {
      if (previousRoadmap) {
        set({ roadmap: previousRoadmap });
      }
      set({ isMutating: false, error: error.message || 'Failed to update domain skill' });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useRoadmapStore;