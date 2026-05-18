import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useStore } from '../store/useStore'
import BottomNav from '../components/layout/BottomNav'
import PlanCard from '../components/plans/PlanCard'
import NotInterestedModal from '../components/plans/NotInterestedModal'
import { generatePlans } from '../lib/openai'
import { demoUsers } from '../data/demoUsers'

function matchWishes(plan, wishes) {
  const text = `${plan.title} ${plan.description}`.toLowerCase()
  return wishes.filter((w) =>
    w.toLowerCase().split(/[\s,]+/).some((word) => word.length > 3 && text.includes(word))
  )
}

export default function Plans() {
  const navigate = useNavigate()
  const user = useStore((s) => s.user)
  const plans = useStore((s) => s.plans)
  const setPlans = useStore((s) => s.setPlans)
  const updatePlan = useStore((s) => s.updatePlan)
  const removeWish = useStore((s) => s.removeWish)
  const initChat = useStore((s) => s.initChat)
  const logs = useStore((s) => s.logs)

  const [loading, setLoading] = useState(false)
  const [declineTarget, setDeclineTarget] = useState(null)

  const allWouldveLiked = Object.values(logs)
    .flatMap((l) => l.wouldveLiked || [])
    .filter((v, i, a) => a.indexOf(v) === i)

  useEffect(() => {
    if (plans.length === 0 && allWouldveLiked.length > 0 && !loading) {
      setLoading(true)
      generatePlans(allWouldveLiked, user, demoUsers)
        .then((generated) => {
          const withStatus = (Array.isArray(generated) ? generated : []).map((p) => ({
            ...p,
            status: 'pending',
            relatedWishes: matchWishes(p, allWouldveLiked),
          }))
          setPlans(withStatus)
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [])

  const handleAccept = (planId) => {
    updatePlan(planId, { status: 'accepted' })
    const plan = plans.find((p) => p.id === planId)
    if (plan) {
      initChat(planId, [
        {
          id: 'm1',
          sender: plan.participantNames[0] || 'Sofia',
          text: 'Hey everyone! Excited for this.',
          time: '10:02',
          isMe: false,
        },
        {
          id: 'm2',
          sender: plan.participantNames[1] || 'Marcus',
          text: `${plan.suggestedTime} works great for me.`,
          time: '10:05',
          isMe: false,
        },
      ])
    }
  }

  const handleCancel = (planId) => {
    updatePlan(planId, { status: 'declined' })
  }

  const handleDecline = (planId) => {
    setDeclineTarget(planId)
  }

  const handleDeclineSubmit = (reason, wishToRemove) => {
    if (declineTarget) {
      updatePlan(declineTarget, { status: 'declined', declineReason: reason })
    }
    setDeclineTarget(null)

    if (wishToRemove) {
      removeWish(wishToRemove)
      const updatedWishes = allWouldveLiked.filter((w) => w !== wishToRemove)
      const acceptedPlans = plans.filter((p) => p.status === 'accepted')
      setPlans(acceptedPlans)
      if (updatedWishes.length > 0) {
        setLoading(true)
        generatePlans(updatedWishes, user, demoUsers).then((generated) => {
          const withStatus = generated.map((p) => ({
            ...p,
            status: 'pending',
            relatedWishes: matchWishes(p, updatedWishes),
          }))
          setPlans([...acceptedPlans, ...withStatus])
          setLoading(false)
        })
      }
    }
  }

  const openPlans = plans.filter((p) => p.status === 'pending')
  const acceptedPlans = plans.filter((p) => p.status === 'accepted')

  return (
    <div className="flex flex-col h-full bg-pace-bg">
      <div className="flex-1 overflow-y-auto scrollbar-hide phone-scroll pb-4">
        {/* Header */}
        <div className="px-6 pt-5 pb-4">
          <p className="text-pace-muted text-xs font-medium uppercase tracking-widest mb-1">
            Suggested for you
          </p>
          <h1 className="text-pace-text text-2xl font-bold">Plans</h1>
        </div>

        {loading && (
          <div className="mx-4 mt-4 bg-pace-card rounded-2xl shadow-card px-5 py-8 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-pace-green border-t-transparent rounded-full animate-spin" />
            <p className="text-pace-secondary text-sm">Finding activities that match your interests...</p>
          </div>
        )}

        {!loading && allWouldveLiked.length === 0 && plans.length === 0 && (
          <div className="mx-4 mt-4 bg-pace-card rounded-2xl shadow-card px-5 py-8 text-center">
            <div className="w-12 h-12 bg-pace-green-light rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles size={20} className="text-pace-green" />
            </div>
            <h3 className="text-pace-text font-semibold text-base mb-2">No plans yet</h3>
            <p className="text-pace-muted text-sm leading-relaxed">
              Add some things to your "Would've Liked" section in the Today tab and we'll suggest matching group activities nearby.
            </p>
          </div>
        )}

        {!loading && plans.length > 0 && (
          <div className="px-4 flex flex-col gap-4">
            {openPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                status={plan.status}
                onAccept={() => handleAccept(plan.id)}
                onDecline={() => handleDecline(plan.id)}
              />
            ))}

            {acceptedPlans.length > 0 && (
              <div className="mt-2">
                <h2 className="text-pace-text font-semibold text-sm mb-3">Your accepted plans</h2>
                {acceptedPlans.map((plan) => (
                  <div key={plan.id} className="mb-3">
                    <PlanCard
                      plan={plan}
                      status="accepted"
                      onCancel={() => handleCancel(plan.id)}
                    />
                    <button
                      onClick={() => navigate(`/plans/${plan.id}/chat`)}
                      className="w-full mt-2 py-3 bg-pace-text text-white text-sm font-medium rounded-xl active:opacity-80 transition-opacity"
                    >
                      Open group chat
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                setLoading(true)
                generatePlans(allWouldveLiked.length ? allWouldveLiked : ['coffee', 'walking'], user, demoUsers)
                  .then((generated) => {
                    const wishes = allWouldveLiked.length ? allWouldveLiked : ['coffee', 'walking']
                    const withStatus = (Array.isArray(generated) ? generated : []).map((p) => ({
                      ...p,
                      id: `plan_${Date.now()}_${Math.random()}`,
                      status: 'pending',
                      relatedWishes: matchWishes(p, wishes),
                    }))
                    setPlans([...plans.filter((p) => p.status !== 'pending'), ...withStatus])
                  })
                  .catch(() => {})
                  .finally(() => setLoading(false))
              }}
              className="w-full py-3 border border-pace-border rounded-xl text-pace-secondary text-sm font-medium active:bg-pace-bg transition-colors"
            >
              Refresh suggestions
            </button>
          </div>
        )}
      </div>

      <NotInterestedModal
        open={!!declineTarget}
        onClose={() => setDeclineTarget(null)}
        onSubmit={handleDeclineSubmit}
        plan={plans.find((p) => p.id === declineTarget) || null}
        currentWishes={allWouldveLiked}
      />

      <BottomNav />
    </div>
  )
}
