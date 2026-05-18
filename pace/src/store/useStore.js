import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { saveDemoParticipant } from '../lib/demoSync'

const today = () => new Date().toISOString().split('T')[0]

export const useStore = create(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => {
        set({ user })
        saveDemoParticipant(user, get().logs)
      },
      updateUser: (fields) => set((s) => ({ user: { ...s.user, ...fields } })),

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
    }
  )
)
