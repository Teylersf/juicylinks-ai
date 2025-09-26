"use client"

import { useState } from 'react'

export function usePlanSelection() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openPlanSelection = () => setIsModalOpen(true)
  const closePlanSelection = () => setIsModalOpen(false)

  return {
    isModalOpen,
    openPlanSelection,
    closePlanSelection
  }
}
