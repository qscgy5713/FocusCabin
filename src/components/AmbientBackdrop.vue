<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const canvasRef = ref(null)
let animationFrameId = null

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  let width = (canvas.width = window.innerWidth)
  let height = (canvas.height = window.innerHeight)

  const handleResize = () => {
    width = canvas.width = window.innerWidth
    height = canvas.height = window.innerHeight
  }
  window.addEventListener('resize', handleResize)

  // Floating ambient dust / glow particles
  const particles = Array.from({ length: 45 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.8 + 0.6,
    alpha: Math.random() * 0.4 + 0.1,
    speedX: (Math.random() - 0.5) * 0.25,
    speedY: -Math.random() * 0.35 - 0.05
  }))

  const render = () => {
    ctx.clearRect(0, 0, width, height)

    // Draw background subtle radial glow
    const gradient = ctx.createRadialGradient(
      width / 2,
      height / 3,
      50,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.8
    )
    gradient.addColorStop(0, 'rgba(30, 41, 59, 0.35)')
    gradient.addColorStop(0.5, 'rgba(15, 23, 42, 0.6)')
    gradient.addColorStop(1, 'rgba(9, 9, 11, 0.95)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Render particles
    particles.forEach(p => {
      p.x += p.speedX
      p.y += p.speedY

      if (p.y < 0) {
        p.y = height + 10
        p.x = Math.random() * width
      }
      if (p.x < 0) p.x = width
      if (p.x > width) p.x = 0

      ctx.beginPath()
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(186, 230, 253, ${p.alpha})`
      ctx.shadowBlur = 8
      ctx.shadowColor = 'rgba(56, 189, 248, 0.4)'
      ctx.fill()
    })

    animationFrameId = requestAnimationFrame(render)
  }

  render()

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    if (animationFrameId) cancelAnimationFrame(animationFrameId)
  })
})
</script>

<template>
  <canvas
    ref="canvasRef"
    class="fixed inset-0 pointer-events-none -z-10"
  ></canvas>
</template>
