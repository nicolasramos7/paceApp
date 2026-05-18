import { motion, AnimatePresence } from 'framer-motion'

export default function Modal({ open, onClose, children, title }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/30 z-40"
            onClick={onClose}
          />
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 bg-pace-card rounded-t-[28px] z-50 px-6 pt-4 pb-10"
          >
            <div className="w-10 h-1 bg-pace-border rounded-full mx-auto mb-5" />
            {title && (
              <h3 className="text-pace-text font-semibold text-lg mb-5">{title}</h3>
            )}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
