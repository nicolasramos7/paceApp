import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { saveDemoParticipant } from '../lib/demoSync'

const today = () => new Date().toISOString().split('T')[0]

export const useStore = create(
  persist(
    (set, get) => ({
      user: null,
      registeredUser: null,

      register: (userData) => {
        const newUser = { ...userData, id: `user_${Date.now()}` }
        set({ user: newUser, registeredUser: newUser })
        saveDemoParticipant(newUser, get().logs)
      },
      login: (email, password) => {
        const { registeredUser } = get()
        if (registeredUser && registeredUser.email === email && registeredUser.password === password) {
          set({ user: registeredUser })
          return true
        }
        return false
      },
      signOut: () => set({ user: null }),
      resetPassword: (email, newPassword) => {
        const { registeredUser } = get()
        if (!registeredUser || registeredUser.email !== email) return false
        set({ registeredUser: { ...registeredUser, password: newPassword } })
        return true
      },

      setUser: (user) => {
        set({ user, registeredUser: user })
        saveDemoParticipant(user, get().logs)
      },
      updateUser: (fields) =>
        set((s) => ({
          user: { ...s.user, ...fields },
          registeredUser: s.registeredUser ? { ...s.registeredUser, ...fields } : s.registeredUser,
        })),

      logs: {},
      getLog: (date) => get().logs[date] || {},
      updateLog: (date, fields) => {
        let nextLogs = {}
        set((s) => {
          nextLogs = {
            ...s.logs,
            [date]: { ...s.logs[date], ...fields },
          }
          return { logs: nextLogs }
        })
        saveDemoParticipant(get().user, nextLogs)
      },
      removeWish: (wish) => {
        set((s) => {
          const nextLogs = {}
          for (const [date, log] of Object.entries(s.logs)) {
            nextLogs[date] = {
              ...log,
              wouldveLiked: (log.wouldveLiked || []).filter((w) => w !== wish),
            }
          }
          return { logs: nextLogs }
        })
      },

      selectedDate: today(),
      setSelectedDate: (date) => set({ selectedDate: date }),

      plans: [],
      setPlans: (plans) => set({ plans }),
      updatePlan: (id, fields) =>
        set((s) => ({
          plans: s.plans.map((p) => (p.id === id ? { ...p, ...fields } : p)),
        })),
      addPlan: (plan) => set((s) => ({ plans: [plan, ...s.plans] })),

      chats: {},
      addMessage: (planId, message) =>
        set((s) => ({
          chats: {
            ...s.chats,
            [planId]: [...(s.chats[planId] || []), message],
          },
        })),
      initChat: (planId, messages) =>
        set((s) => ({
          chats: {
            ...s.chats,
            [planId]: s.chats[planId] || messages,
          },
        })),
    }),
    {
      name: 'pace-storage',
      onRehydrateStorage: () => (state) => {
        if (state?.user && !state?.registeredUser) {
          state.registeredUser = state.user
        }
      },
    }
  )
)
