// FocusCabin Audio Engine using Web Audio API
// 100% Client-side synthesis: Zero external audio files required, zero latency, offline capable.

class SoundEngine {
  constructor() {
    this.ctx = null
    this.masterGain = null
    this.channels = {}
    this.isMuted = false
    this.masterVolume = 0.8
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      this.ctx = new AudioContext()

      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime)
      this.masterGain.connect(this.ctx.destination)
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  createWhiteNoiseBuffer(seconds = 5) {
    const bufferSize = this.ctx.sampleRate * seconds
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }
    return buffer
  }

  createBrownNoiseBuffer(seconds = 6) {
    const bufferSize = this.ctx.sampleRate * seconds
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let lastOut = 0.0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      data[i] = (lastOut + (0.02 * white)) / 1.02
      lastOut = data[i]
      data[i] *= 3.5
    }
    return buffer
  }

  createPinkNoiseBuffer(seconds = 6) {
    const bufferSize = this.ctx.sampleRate * seconds
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      b0 = 0.99886 * b0 + white * 0.0555179
      b1 = 0.99332 * b1 + white * 0.0750759
      b2 = 0.96900 * b2 + white * 0.1538520
      b3 = 0.86650 * b3 + white * 0.3104856
      b4 = 0.55000 * b4 + white * 0.5329522
      b5 = -0.7616 * b5 - white * 0.0168980
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
      b6 = white * 0.115926
    }
    return buffer
  }

  // 1. Rain
  playRain(channelGain) {
    const noise = this.ctx.createBufferSource()
    noise.buffer = this.createPinkNoiseBuffer(6)
    noise.loop = true

    const lowpass = this.ctx.createBiquadFilter()
    lowpass.type = 'lowpass'
    lowpass.frequency.value = 1100

    const highpass = this.ctx.createBiquadFilter()
    highpass.type = 'highpass'
    highpass.frequency.value = 280

    noise.connect(highpass)
    highpass.connect(lowpass)
    lowpass.connect(channelGain)
    noise.start()

    return {
      stop: () => {
        try { noise.stop() } catch (_) {}
      }
    }
  }

  // 2. Campfire
  playCampfire(channelGain) {
    const noise = this.ctx.createBufferSource()
    noise.buffer = this.createBrownNoiseBuffer(5)
    noise.loop = true

    const filter = this.ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 260

    noise.connect(filter)
    filter.connect(channelGain)
    noise.start()

    let isRunning = true
    let timeoutId = null

    const triggerCrackle = () => {
      if (!isRunning || !this.ctx) return

      const popOsc = this.ctx.createOscillator()
      const popGain = this.ctx.createGain()
      const popFilter = this.ctx.createBiquadFilter()

      popFilter.type = 'bandpass'
      popFilter.frequency.value = 1200 + Math.random() * 2400
      popFilter.Q.value = 4

      popOsc.type = 'sawtooth'
      popOsc.frequency.value = 80 + Math.random() * 200

      const now = this.ctx.currentTime
      const burstLen = 0.01 + Math.random() * 0.03
      popGain.gain.setValueAtTime(0, now)
      popGain.gain.linearRampToValueAtTime(0.35 + Math.random() * 0.4, now + 0.002)
      popGain.gain.exponentialRampToValueAtTime(0.001, now + burstLen)

      popOsc.connect(popFilter)
      popFilter.connect(popGain)
      popGain.connect(channelGain)

      popOsc.start(now)
      popOsc.stop(now + burstLen + 0.01)

      const nextDelay = 80 + Math.random() * 320
      timeoutId = setTimeout(triggerCrackle, nextDelay)
    }

    triggerCrackle()

    return {
      stop: () => {
        isRunning = false
        if (timeoutId) clearTimeout(timeoutId)
        try { noise.stop() } catch (_) {}
      }
    }
  }

  // 3. Forest Wind
  playWind(channelGain) {
    const noise = this.ctx.createBufferSource()
    noise.buffer = this.createPinkNoiseBuffer(6)
    noise.loop = true

    const filter = this.ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 400
    filter.Q.value = 3

    const lfo = this.ctx.createOscillator()
    lfo.frequency.value = 0.15
    const lfoGain = this.ctx.createGain()
    lfoGain.gain.value = 250
    lfo.connect(lfoGain)
    lfoGain.connect(filter.frequency)

    noise.connect(filter)
    filter.connect(channelGain)

    noise.start()
    lfo.start()

    return {
      stop: () => {
        try { noise.stop(); lfo.stop() } catch (_) {}
      }
    }
  }

  // 4. Coffee Shop
  playCoffee(channelGain) {
    const noise = this.ctx.createBufferSource()
    noise.buffer = this.createPinkNoiseBuffer(6)
    noise.loop = true

    const filter = this.ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 550
    filter.Q.value = 1.2

    noise.connect(filter)
    filter.connect(channelGain)
    noise.start()

    return {
      stop: () => {
        try { noise.stop() } catch (_) {}
      }
    }
  }

  // 5. Brown Noise
  playBrownNoise(channelGain) {
    const noise = this.ctx.createBufferSource()
    noise.buffer = this.createBrownNoiseBuffer(6)
    noise.loop = true

    const filter = this.ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 650

    noise.connect(filter)
    filter.connect(channelGain)
    noise.start()

    return {
      stop: () => {
        try { noise.stop() } catch (_) {}
      }
    }
  }

  // 6. Zen Drone
  playZenDrone(channelGain) {
    const freqs = [108, 216, 324]
    const oscs = freqs.map((f, idx) => {
      const osc = this.ctx.createOscillator()
      const g = this.ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = f + (idx * 0.3)
      g.gain.value = 0.25 / (idx + 1)
      osc.connect(g)
      g.connect(channelGain)
      osc.start()
      return osc
    })

    return {
      stop: () => {
        oscs.forEach(osc => {
          try { osc.stop() } catch (_) {}
        })
      }
    }
  }

  // 7. Ocean Waves (NEW)
  playWaves(channelGain) {
    const noise = this.ctx.createBufferSource()
    noise.buffer = this.createBrownNoiseBuffer(8)
    noise.loop = true

    const filter = this.ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 400
    filter.Q.value = 2.5

    const waveGain = this.ctx.createGain()
    waveGain.gain.value = 0.3

    // Slow rhythmic ebb and flow LFO (~11s wave cycle)
    const lfo = this.ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = 0.09

    // Modulate filter cutoff (swells from 200Hz to 850Hz)
    const filterMod = this.ctx.createGain()
    filterMod.gain.value = 320
    lfo.connect(filterMod)
    filterMod.connect(filter.frequency)

    // Modulate volume wave
    const gainMod = this.ctx.createGain()
    gainMod.gain.value = 0.28
    lfo.connect(gainMod)
    gainMod.connect(waveGain.gain)

    noise.connect(filter)
    filter.connect(waveGain)
    waveGain.connect(channelGain)

    noise.start()
    lfo.start()

    return {
      stop: () => {
        try { noise.stop(); lfo.stop() } catch (_) {}
      }
    }
  }

  // 8. Summer Night Crickets (NEW)
  playNight(channelGain) {
    let isRunning = true
    let timeoutId = null

    // Background low forest air
    const airNoise = this.ctx.createBufferSource()
    airNoise.buffer = this.createPinkNoiseBuffer(6)
    airNoise.loop = true
    const airFilter = this.ctx.createBiquadFilter()
    airFilter.type = 'bandpass'
    airFilter.frequency.value = 350
    airFilter.Q.value = 1
    const airGain = this.ctx.createGain()
    airGain.gain.value = 0.12
    airNoise.connect(airFilter)
    airFilter.connect(airGain)
    airGain.connect(channelGain)
    airNoise.start()

    // Chirp generator
    const chirp = () => {
      if (!isRunning || !this.ctx) return

      const now = this.ctx.currentTime
      const chirpCount = 3 + Math.floor(Math.random() * 3)

      for (let i = 0; i < chirpCount; i++) {
        const osc = this.ctx.createOscillator()
        const g = this.ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = 4600 + Math.random() * 400

        const t = now + i * 0.08
        g.gain.setValueAtTime(0, t)
        g.gain.linearRampToValueAtTime(0.08, t + 0.02)
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06)

        osc.connect(g)
        g.connect(channelGain)
        osc.start(t)
        osc.stop(t + 0.07)
      }

      const nextInterval = 900 + Math.random() * 1600
      timeoutId = setTimeout(chirp, nextInterval)
    }

    chirp()

    return {
      stop: () => {
        isRunning = false
        if (timeoutId) clearTimeout(timeoutId)
        try { airNoise.stop() } catch (_) {}
      }
    }
  }

  // 9. Distant Thunder (NEW)
  playThunder(channelGain) {
    let isRunning = true
    let timeoutId = null

    const triggerThunder = () => {
      if (!isRunning || !this.ctx) return

      const now = this.ctx.currentTime
      const duration = 4.5 + Math.random() * 2.5

      const noise = this.ctx.createBufferSource()
      noise.buffer = this.createBrownNoiseBuffer(6)

      const filter = this.ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(60, now)
      filter.frequency.linearRampToValueAtTime(140, now + 0.8)
      filter.frequency.exponentialRampToValueAtTime(50, now + duration)

      const gain = this.ctx.createGain()
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.7, now + 0.6)
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

      noise.connect(filter)
      filter.connect(gain)
      gain.connect(channelGain)

      noise.start(now)
      noise.stop(now + duration + 0.1)

      const nextDelay = 12000 + Math.random() * 18000
      timeoutId = setTimeout(triggerThunder, nextDelay)
    }

    // Trigger initial thunder after slight delay
    timeoutId = setTimeout(triggerThunder, 1500)

    return {
      stop: () => {
        isRunning = false
        if (timeoutId) clearTimeout(timeoutId)
      }
    }
  }

  // 10. Mountain Stream (NEW)
  playStream(channelGain) {
    const noise = this.ctx.createBufferSource()
    noise.buffer = this.createPinkNoiseBuffer(6)
    noise.loop = true

    const bp1 = this.ctx.createBiquadFilter()
    bp1.type = 'bandpass'
    bp1.frequency.value = 680
    bp1.Q.value = 2.2

    const bp2 = this.ctx.createBiquadFilter()
    bp2.type = 'bandpass'
    bp2.frequency.value = 1650
    bp2.Q.value = 3.0

    const lfo = this.ctx.createOscillator()
    lfo.frequency.value = 0.6
    const lfoG = this.ctx.createGain()
    lfoG.gain.value = 180
    lfo.connect(lfoG)
    lfoG.connect(bp1.frequency)

    noise.connect(bp1)
    noise.connect(bp2)
    bp1.connect(channelGain)
    bp2.connect(channelGain)

    noise.start()
    lfo.start()

    return {
      stop: () => {
        try { noise.stop(); lfo.stop() } catch (_) {}
      }
    }
  }

  // 11. Mechanical Keyboard (NEW)
  playKeyboard(channelGain) {
    let isRunning = true
    let timeoutId = null

    const typeKey = () => {
      if (!isRunning || !this.ctx) return

      const now = this.ctx.currentTime
      const burstCount = 1 + Math.floor(Math.random() * 5)

      for (let i = 0; i < burstCount; i++) {
        const clickNoise = this.ctx.createBufferSource()
        clickNoise.buffer = this.createWhiteNoiseBuffer(1)

        const filter = this.ctx.createBiquadFilter()
        filter.type = 'bandpass'
        filter.frequency.value = 1800 + Math.random() * 1200
        filter.Q.value = 5

        const thockOsc = this.ctx.createOscillator()
        thockOsc.type = 'sine'
        thockOsc.frequency.value = 320 + Math.random() * 120

        const clickGain = this.ctx.createGain()
        const t = now + i * (0.09 + Math.random() * 0.06)

        clickGain.gain.setValueAtTime(0, t)
        clickGain.gain.linearRampToValueAtTime(0.25, t + 0.002)
        clickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035)

        clickNoise.connect(filter)
        filter.connect(clickGain)
        thockOsc.connect(clickGain)
        clickGain.connect(channelGain)

        clickNoise.start(t)
        clickNoise.stop(t + 0.04)
        thockOsc.start(t)
        thockOsc.stop(t + 0.04)
      }

      const nextDelay = 350 + Math.random() * 1800
      timeoutId = setTimeout(typeKey, nextDelay)
    }

    typeKey()

    return {
      stop: () => {
        isRunning = false
        if (timeoutId) clearTimeout(timeoutId)
      }
    }
  }

  // 12. Night Train (NEW)
  playTrain(channelGain) {
    let isRunning = true
    let timeoutId = null

    // Background low rolling hum
    const humNoise = this.ctx.createBufferSource()
    humNoise.buffer = this.createBrownNoiseBuffer(6)
    humNoise.loop = true
    const humFilter = this.ctx.createBiquadFilter()
    humFilter.type = 'lowpass'
    humFilter.frequency.value = 140
    humNoise.connect(humFilter)
    humFilter.connect(channelGain)
    humNoise.start()

    // Rhythmic rail clacks ("clack-clack... clack-clack")
    const triggerClack = () => {
      if (!isRunning || !this.ctx) return

      const now = this.ctx.currentTime
      const clackOffsets = [0, 0.12]

      clackOffsets.forEach(dt => {
        const t = now + dt
        const osc = this.ctx.createOscillator()
        const g = this.ctx.createGain()
        const f = this.ctx.createBiquadFilter()

        osc.type = 'triangle'
        osc.frequency.value = 110 + Math.random() * 20

        f.type = 'lowpass'
        f.frequency.value = 350

        g.gain.setValueAtTime(0, t)
        g.gain.linearRampToValueAtTime(0.28, t + 0.01)
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.07)

        osc.connect(f)
        f.connect(g)
        g.connect(channelGain)

        osc.start(t)
        osc.stop(t + 0.08)
      })

      const cycleDuration = 1200
      timeoutId = setTimeout(triggerClack, cycleDuration)
    }

    triggerClack()

    return {
      stop: () => {
        isRunning = false
        if (timeoutId) clearTimeout(timeoutId)
        try { humNoise.stop() } catch (_) {}
      }
    }
  }

  // Tibetan Singing Bowl Chime for timer finish
  playChime() {
    this.init()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const partials = [
      { freq: 528, gain: 0.6, decay: 3.5 },
      { freq: 1056, gain: 0.25, decay: 2.2 },
      { freq: 1584, gain: 0.12, decay: 1.5 }
    ]

    partials.forEach(p => {
      const osc = this.ctx.createOscillator()
      const gainNode = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(p.freq, now)

      gainNode.gain.setValueAtTime(0, now)
      gainNode.gain.linearRampToValueAtTime(p.gain, now + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + p.decay)

      osc.connect(gainNode)
      gainNode.connect(this.masterGain)

      osc.start(now)
      osc.stop(now + p.decay + 0.1)
    })
  }

  setChannel(soundId, volume, active) {
    this.init()

    if (!this.channels[soundId]) {
      const gain = this.ctx.createGain()
      gain.gain.setValueAtTime(0, this.ctx.currentTime)
      gain.connect(this.masterGain)
      this.channels[soundId] = {
        gain,
        instance: null,
        active: false,
        volume: volume || 0.5
      }
    }

    const ch = this.channels[soundId]
    ch.volume = volume

    const now = this.ctx.currentTime

    if (active && !ch.active) {
      ch.active = true
      switch (soundId) {
        case 'rain': ch.instance = this.playRain(ch.gain); break
        case 'campfire': ch.instance = this.playCampfire(ch.gain); break
        case 'wind': ch.instance = this.playWind(ch.gain); break
        case 'coffee': ch.instance = this.playCoffee(ch.gain); break
        case 'brown': ch.instance = this.playBrownNoise(ch.gain); break
        case 'zen': ch.instance = this.playZenDrone(ch.gain); break
        case 'waves': ch.instance = this.playWaves(ch.gain); break
        case 'night': ch.instance = this.playNight(ch.gain); break
        case 'thunder': ch.instance = this.playThunder(ch.gain); break
        case 'stream': ch.instance = this.playStream(ch.gain); break
        case 'keyboard': ch.instance = this.playKeyboard(ch.gain); break
        case 'train': ch.instance = this.playTrain(ch.gain); break
        default: break
      }
      ch.gain.gain.cancelScheduledValues(now)
      ch.gain.gain.setValueAtTime(0, now)
      ch.gain.gain.linearRampToValueAtTime(volume, now + 0.5)
    } else if (!active && ch.active) {
      ch.active = false
      ch.gain.gain.cancelScheduledValues(now)
      ch.gain.gain.setValueAtTime(ch.gain.gain.value, now)
      ch.gain.gain.linearRampToValueAtTime(0, now + 0.4)
      setTimeout(() => {
        if (!ch.active && ch.instance) {
          ch.instance.stop()
          ch.instance = null
        }
      }, 450)
    } else if (active && ch.active) {
      ch.gain.gain.cancelScheduledValues(now)
      ch.gain.gain.linearRampToValueAtTime(volume, now + 0.1)
    }
  }

  setMasterVolume(val) {
    this.masterVolume = val
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime)
      this.masterGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : val, this.ctx.currentTime + 0.1)
    }
  }

  toggleMasterMute() {
    this.isMuted = !this.isMuted
    if (this.masterGain && this.ctx) {
      const target = this.isMuted ? 0 : this.masterVolume
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime)
      this.masterGain.gain.linearRampToValueAtTime(target, this.ctx.currentTime + 0.1)
    }
    return this.isMuted
  }

  stopAll() {
    Object.keys(this.channels).forEach(soundId => {
      this.setChannel(soundId, this.channels[soundId].volume, false)
    })
  }
}

export const soundEngine = new SoundEngine()
