import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Send, LogOut } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function PlanChat() {
  const { planId } = useParams()
  const navigate = useNavigate()
  const user = useStore((s) => s.user)
  const plans = useStore((s) => s.plans)
  const chats = useStore((s) => s.chats)
  const addMessage = useStore((s) => s.addMessage)
  const updatePlan = useStore((s) => s.updatePlan)

  const plan = plans.find((p) => p.id === planId)
  const messages = chats[planId] || []

  const [input, setInput] = useState('')
  const [confirmLeave, setConfirmLeave] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = () => {
    if (!input.trim()) return
    addMessage(planId, {
      id: `m_${Date.now()}`,
      sender: user.firstName,
      text: input.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    })
    setInput('')
  }

  const leaveChat = () => {
    updatePlan(planId, { status: 'declined' })
    navigate('/plans')
  }

  if (!plan) {
    return (
      <div className="flex flex-col h-full bg-pace-bg items-center justify-center">
        <p className="text-pace-muted">Plan not found.</p>
        <button onClick={() => navigate('/plans')} className="mt-4 text-pace-green text-sm">
          Back to Plans
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-pace-bg">
      {/* Header */}
      <div className="bg-pace-card border-b border-pace-border px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/plans')} className="w-8 h-8 flex items-center justify-center">
          <ChevronLeft size={22} className="text-pace-text" />
        </button>
        <div className="flex-1">
          <h2 className="text-pace-text font-semibold text-sm leading-tight">{plan.title}</h2>
          <p className="text-pace-muted text-xs">{plan.participantNames.join(', ')}, you</p>
        </div>
        {!confirmLeave ? (
          <button
            onClick={() => setConfirmLeave(true)}
            className="w-8 h-8 flex items-center justify-center rounded-xl active:bg-pace-bg transition-colors"
          >
            <LogOut size={16} className="text-pace-muted" />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setConfirmLeave(false)}
              className="px-3 py-1.5 text-xs text-pace-secondary border border-pace-border rounded-lg"
            >
              Stay
            </button>
            <button
              onClick={leaveChat}
              className="px-3 py-1.5 text-xs text-white bg-pace-rose rounded-lg"
            >
              Leave
            </button>
          </div>
        )}
      </div>

      {/* Plan info banner */}
      <div className="mx-4 mt-4 mb-2 px-4 py-3 bg-pace-green-light rounded-xl flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-pace-green flex-shrink-0" />
        <p className="text-pace-green text-xs font-medium">
          {plan.suggestedTime} — {plan.location}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-hide phone-scroll px-4 py-4 flex flex-col gap-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
            {!msg.isMe && (
              <span className="text-pace-muted text-[11px] mb-1 ml-1">{msg.sender}</span>
            )}
            <div
              className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.isMe
                  ? 'bg-pace-green text-white rounded-br-md'
                  : 'bg-pace-card text-pace-text shadow-card rounded-bl-md'
              }`}
            >
              {msg.text}
            </div>
            <span className="text-pace-muted text-[10px] mt-1 mx-1">{msg.time}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-pace-card border-t border-pace-border flex gap-3 items-center">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Message the group..."
          className="flex-1 px-4 py-2.5 bg-pace-bg rounded-xl text-sm text-pace-text placeholder-pace-muted outline-none border border-pace-border focus:border-pace-green transition-colors"
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          className="w-10 h-10 bg-pace-green rounded-xl flex items-center justify-center disabled:opacity-40 transition-opacity active:scale-95"
        >
          <Send size={16} className="text-white" />
        </button>
      </div>
    </div>
  )
}
