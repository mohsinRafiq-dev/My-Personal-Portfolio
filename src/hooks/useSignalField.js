import { useEffect } from 'react'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Owns the whole "Signal Field": the 16k-particle Three.js scene that morphs
 * shape per section, the GSAP preloader/scroll choreography, and the desktop
 * cursor/tilt interactions. Ported ~1:1 from the original inline script —
 * runs once after the DOM (loader, nav, sections, cards) has mounted.
 */
export default function useSignalField() {
  useEffect(() => {
    const cleanups = []
    const on = (target, type, fn, opts) => {
      target.addEventListener(type, fn, opts)
      cleanups.push(() => target.removeEventListener(type, fn, opts))
    }

    const isTouch = matchMedia('(pointer:coarse)').matches || innerWidth < 769
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

    /* ═══════════════════════════════════════════════════════
       THE SIGNAL FIELD — one particle system, four meanings
       0 hero    → sphere        (chaos resolved into a world)
       1 about   → DNA helix     (code in my DNA)
       2 work    → data city     (structures I've built)
       3 contact → ring          (the connection loop)
       ═══════════════════════════════════════════════════════ */
    const N = isTouch ? 8000 : 16000
    const canvas = document.getElementById('gl')
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true })
    renderer.setPixelRatio(Math.min(devicePixelRatio, isTouch ? 1.8 : 2))
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100)
    camera.position.set(0, 0, 7.5)

    const shapes = []
    function mk(fn) {
      const a = new Float32Array(N * 3)
      for (let i = 0; i < N; i++) {
        const p = fn(i, N)
        a[i * 3] = p[0]; a[i * 3 + 1] = p[1]; a[i * 3 + 2] = p[2]
      }
      shapes.push(a)
    }
    const rnd = (seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647)(1337)

    /* 0 — sphere (fibonacci, slightly fuzzy) */
    mk(i => {
      const t = i / N, ga = Math.PI * (3 - Math.sqrt(5))
      const y = 1 - 2 * t, r = Math.sqrt(Math.max(0, 1 - y * y)), th = ga * i
      const R = 2.15 + (rnd() - 0.5) * 0.28
      return [Math.cos(th) * r * R, y * R, Math.sin(th) * r * R]
    })
    /* 1 — DNA double helix with rungs */
    mk(i => {
      const kind = i % 10, t = i / N
      const y = (t - 0.5) * 5.4, a = t * Math.PI * 9
      if (kind < 4) { const j = (rnd() - 0.5) * 0.16; return [Math.cos(a) * 1.15 + j, y, Math.sin(a) * 1.15 + j] }
      if (kind < 8) { const j = (rnd() - 0.5) * 0.16; return [Math.cos(a + Math.PI) * 1.15 + j, y, Math.sin(a + Math.PI) * 1.15 + j] }
      const s = rnd(); return [Math.cos(a) * 1.15 * (s * 2 - 1), y, Math.sin(a) * 1.15 * (s * 2 - 1)]
    })
    /* 2 — data city: grid of glowing columns */
    const G = 17, colH = []
    for (let c = 0; c < G * G; c++) colH.push(0.35 + rnd() * rnd() * 2.6)
    mk(i => {
      const c = i % (G * G), cx = c % G, cz = (c / G) | 0
      const x = (cx / (G - 1) - 0.5) * 5.4, z = (cz / (G - 1) - 0.5) * 5.4
      const h = colH[c], y = rnd() * h - 1.55
      return [x + (rnd() - 0.5) * 0.1, y, z + (rnd() - 0.5) * 0.1]
    })
    /* 3 — connection ring (torus) */
    mk(() => {
      const u = rnd() * Math.PI * 2, v = rnd() * Math.PI * 2, R = 2.05, r = 0.42 + rnd() * 0.16
      return [(R + r * Math.cos(v)) * Math.cos(u), r * Math.sin(v) * 1.15, (R + r * Math.cos(v)) * Math.sin(u)]
    })

    /* live buffers */
    const posArr = new Float32Array(N * 3)
    /* start as pure chaos — the loader resolves it into the sphere */
    for (let i = 0; i < N * 3; i++) posArr[i] = (rnd() - 0.5) * 16
    const seeds = new Float32Array(N); for (let i = 0; i < N; i++) seeds[i] = rnd()
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3))
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))

    const U = {
      uTime: { value: 0 }, uSize: { value: isTouch ? 26 : 30 },
      uMouse: { value: new THREE.Vector3(99, 99, 0) },
      uBoost: { value: 0 },
      uA: { value: new THREE.Color('#7A2BFF') },
      uB: { value: new THREE.Color('#4DF2C2') },
      uC: { value: new THREE.Color('#EDDFFF') },
    }
    const mat = new THREE.ShaderMaterial({
      uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `
        attribute float aSeed;
        uniform float uTime,uSize,uBoost; uniform vec3 uMouse;
        varying float vSeed; varying float vFade;
        void main(){
          vSeed=aSeed;
          vec3 p=position;
          float w=.05+uBoost*.25;
          p+=vec3(sin(uTime*1.2+aSeed*40.),cos(uTime*1.05+aSeed*70.),sin(uTime*.9+aSeed*90.))*w;
          float d=distance(p,uMouse);
          p+=normalize(p-uMouse+.0001)*smoothstep(1.5,0.,d)*.7;
          vec4 mv=modelViewMatrix*vec4(p,1.);
          gl_PointSize=uSize*(.4+aSeed)*(1./-mv.z);
          vFade=smoothstep(13.,5.,-mv.z);
          gl_Position=projectionMatrix*mv;
        }`,
      fragmentShader: `
        uniform vec3 uA,uB,uC;
        varying float vSeed; varying float vFade;
        void main(){
          float d=length(gl_PointCoord-.5);
          float a=smoothstep(.5,.08,d)*vFade;
          vec3 col=mix(uA,uB,smoothstep(.25,.85,vSeed));
          col=mix(col,uC,step(.94,vSeed));
          gl_FragColor=vec4(col,a*.9);
        }`,
    })
    const cloud = new THREE.Points(geo, mat)
    scene.add(cloud)

    /* a faint wire sphere anchoring the field */
    const halo = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.55, 2),
      new THREE.MeshBasicMaterial({ color: 0x7a2bff, wireframe: true, transparent: true, opacity: 0.06 })
    )
    scene.add(halo)

    /* a slim orbit ring circling the whole field */
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(3.15, 0.012, 6, 140),
      new THREE.MeshBasicMaterial({ color: 0x4df2c2, wireframe: true, transparent: true, opacity: 0.09 })
    )
    ring.rotation.x = Math.PI / 2.35

    /* placement per soul */
    const grp = new THREE.Group(); scene.add(grp)
    grp.add(cloud); grp.add(halo); grp.add(ring)
    let baseScale = 1
    function place() {
      renderer.setSize(innerWidth, innerHeight)
      camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix()
      if (isTouch) { grp.position.set(0, 0.9, -1.2); baseScale = 0.8 }
      else { grp.position.set(2.2, 0, 0); baseScale = 1 }
      grp.scale.setScalar(baseScale)
    }
    place()
    on(window, 'resize', place)

    /* pointer → world-space (desktop) / gyro sway + touch surge (mobile) */
    const aim = { x: 0, y: 0 }
    if (!isTouch) {
      on(window, 'mousemove', e => {
        aim.x = (e.clientX / innerWidth) * 2 - 1; aim.y = -((e.clientY / innerHeight) * 2 - 1)
        const halfH = Math.tan((camera.fov * Math.PI / 180) / 2) * camera.position.z
        const halfW = halfH * camera.aspect
        U.uMouse.value.set(aim.x * halfW - grp.position.x, aim.y * halfH - grp.position.y, 0)
      })
    } else {
      on(window, 'deviceorientation', e => {
        if (e.gamma != null) {
          aim.x = Math.max(-1, Math.min(1, e.gamma / 32)); aim.y = Math.max(-1, Math.min(1, (e.beta - 45) / 32))
        }
      })
      on(window, 'touchstart', () => gsap.to(U.uBoost, { value: 1, duration: 0.35, ease: 'power2.out' }))
      on(window, 'touchend', () => gsap.to(U.uBoost, { value: 0, duration: 1.3, ease: 'elastic.out(1,.35)' }))
    }

    /* morphing: lerp live positions toward the active shape */
    let target = 0
    const morphSpeed = 0.035
    /* each section gets its own aurora palette */
    const palettes = [
      ['#7A2BFF', '#4DF2C2', '#EDDFFF'], /* hero    — ultraviolet / mint  */
      ['#FF4DD8', '#A688FF', '#FFD9F4'], /* about   — magenta / violet    */
      ['#37D5FF', '#4DF2C2', '#DAFFF4'], /* work    — ice blue / mint     */
      ['#FFB454', '#FF6EC7', '#FFEBCE'], /* contact — amber / pink        */
    ]
    const shapeNames = ['SPHERE', 'DNA HELIX', 'DATA CITY', 'RING']
    const hudTxt = document.getElementById('hudTxt')
    function updateHud(idx) { if (hudTxt) hudTxt.textContent = `FIELD · ${shapeNames[idx]} · ${(N / 1000) | 0}K PTS` }
    updateHud(0)
    function setShape(idx) {
      if (idx !== target) {
        target = idx
        updateHud(idx)
        const p = palettes[idx]
        ;[U.uA, U.uB, U.uC].forEach((u, i) => {
          const c = new THREE.Color(p[i])
          gsap.to(u.value, { r: c.r, g: c.g, b: c.b, duration: 1.4, ease: 'power2.inOut' })
        })
        const hc = new THREE.Color(p[0])
        gsap.to(halo.material.color, { r: hc.r, g: hc.g, b: hc.b, duration: 1.4, ease: 'power2.inOut' })
        gsap.fromTo(U.uBoost, { value: 0.9 }, { value: 0, duration: 1.6, ease: 'power3.out' })
      }
    }

    let sp = 0
    on(window, 'scroll', () => { sp = scrollY / Math.max(1, document.body.scrollHeight - innerHeight) }, { passive: true })

    const clock = new THREE.Clock()
    let rafId = null
    function tick() {
      const t = clock.getElapsedTime()
      U.uTime.value = t
      const tgt = shapes[target], pa = geo.attributes.position.array
      for (let i = 0; i < N * 3; i++) pa[i] += (tgt[i] - pa[i]) * morphSpeed
      geo.attributes.position.needsUpdate = true
      grp.rotation.y = t * 0.08 + sp * Math.PI * 1.6 + aim.x * 0.18
      grp.rotation.x = Math.sin(t * 0.11) * 0.06 + aim.y * 0.12
      grp.scale.setScalar(baseScale * (1 + Math.sin(t * 0.7) * 0.02))
      halo.rotation.y = -t * 0.05; halo.rotation.z = t * 0.03
      ring.rotation.z = -t * 0.14; ring.rotation.y = Math.sin(t * 0.2) * 0.25
      camera.position.x += (aim.x * 0.45 - camera.position.x) * 0.045
      camera.position.y += (aim.y * 0.3 - camera.position.y) * 0.045
      camera.position.z += (7.5 - sp * 1.35 - camera.position.z) * 0.05
      camera.lookAt(isTouch ? 0 : 0.5, isTouch ? 0.4 : 0, 0)
      renderer.render(scene, camera)
      rafId = requestAnimationFrame(tick)
    }
    if (!reduced) tick()
    else { for (let i = 0; i < N * 3; i++) posArr[i] = shapes[0][i]; geo.attributes.position.needsUpdate = true; renderer.render(scene, camera) }
    cleanups.push(() => { if (rafId != null) cancelAnimationFrame(rafId) })

    /* section → shape */
    const shapeObservers = []
    document.querySelectorAll('section[data-shape]').forEach(sec => {
      const io = new IntersectionObserver(
        es => es.forEach(e => { if (e.isIntersecting) setShape(+sec.dataset.shape) }),
        { threshold: 0.35 }
      )
      io.observe(sec)
      shapeObservers.push(io)
    })
    cleanups.push(() => shapeObservers.forEach(io => io.disconnect()))

    /* ═════════ Preloader — chaos resolves on-screen ═════════ */
    const loader = document.getElementById('loader')
    let removeLoaderTimeout = null
    if (loader) {
      const num = loader.querySelector('.num'), bar = loader.querySelector('.line i')
      const o = { v: 0 }
      gsap.timeline()
        .to(loader.querySelector('.word span'), { y: 0, duration: 0.8, ease: 'power4.out', delay: 0.1 })
        .to(o, {
          v: 100, duration: reduced ? 0.01 : 1.6, ease: 'power2.inOut',
          onUpdate: () => {
            if (num) num.textContent = String(Math.round(o.v)).padStart(2, '0') + ' — assembling particles'
            if (bar) bar.style.width = o.v + '%'
          },
        }, '<')
        .to(loader.querySelector('.curtain'), { y: '-101%', duration: 0.7, ease: 'power4.inOut' })
        .to(loader, { yPercent: -100, duration: 0.8, ease: 'power4.inOut' }, '-=.55')
        .add(() => {
          gsap.to('h1 .row>span', { y: 0, duration: 1.15, stagger: 0.11, ease: 'power4.out' })
          gsap.from('.hero-top,.hero-bottom', { opacity: 0, y: 26, duration: 1, stagger: 0.14, delay: 0.5, ease: 'power3.out' })
          removeLoaderTimeout = setTimeout(() => loader.remove(), 900)
        }, '-=.4')
    }
    cleanups.push(() => { if (removeLoaderTimeout) clearTimeout(removeLoaderTimeout) })

    /* ═════════ Desktop soul: cursor + tilt + glare ═════════ */
    if (!isTouch) {
      const cur = document.querySelector('.cur')
      if (cur) {
        const cx = gsap.quickTo(cur, 'x', { duration: 0.22, ease: 'power3' })
        const cy = gsap.quickTo(cur, 'y', { duration: 0.22, ease: 'power3' })
        on(window, 'mousemove', e => { cx(e.clientX); cy(e.clientY) })

        document.querySelectorAll('a:not(.pcard),button').forEach(el => {
          const enter = () => cur.classList.add('grow')
          const leave = () => cur.classList.remove('grow')
          on(el, 'mouseenter', enter); on(el, 'mouseleave', leave)
        })
        document.querySelectorAll('.pcard').forEach(card => {
          const enter = () => cur.classList.add('view')
          const leave = () => {
            cur.classList.remove('view')
            gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.9, ease: 'elastic.out(1,.4)' })
          }
          const move = e => {
            const r = card.getBoundingClientRect()
            const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height
            gsap.to(card, { rotateY: (px - 0.5) * 7, rotateX: (0.5 - py) * 7, transformPerspective: 1100, duration: 0.5 })
            card.style.setProperty('--gx', px * 100 + '%'); card.style.setProperty('--gy', py * 100 + '%')
          }
          on(card, 'mouseenter', enter); on(card, 'mouseleave', leave); on(card, 'mousemove', move)
        })
        /* magnetic mail button */
        const mb = document.getElementById('mailbtn')
        if (mb) {
          on(mb, 'mousemove', e => {
            const r = mb.getBoundingClientRect()
            gsap.to(mb, { x: (e.clientX - r.left - r.width / 2) * 0.3, y: (e.clientY - r.top - r.height / 2) * 0.4, duration: 0.4 })
          })
          on(mb, 'mouseleave', () => gsap.to(mb, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1,.35)' }))
        }
        /* click anywhere → energy burst through the field */
        on(window, 'pointerdown', e => {
          if (e.target.closest('a,button,input,textarea')) return
          gsap.fromTo(U.uBoost, { value: 1 }, { value: 0, duration: 1.3, ease: 'expo.out' })
          gsap.fromTo(halo.material, { opacity: 0.22 }, { opacity: 0.06, duration: 1.1, ease: 'power2.out' })
        })
        /* magnetic nav links */
        document.querySelectorAll('nav .links a').forEach(a => {
          on(a, 'mousemove', e => {
            const r = a.getBoundingClientRect()
            gsap.to(a, { x: (e.clientX - r.left - r.width / 2) * 0.28, y: (e.clientY - r.top - r.height / 2) * 0.4, duration: 0.3 })
          })
          on(a, 'mouseleave', () => gsap.to(a, { x: 0, y: 0, duration: 0.55, ease: 'elastic.out(1,.4)' }))
        })
        /* hovering the stack marquee energises the particles */
        document.querySelectorAll('.skill-marquee').forEach(mq => {
          on(mq, 'mouseenter', () => gsap.to(U.uBoost, { value: 0.5, duration: 0.4, ease: 'power2.out' }))
          on(mq, 'mouseleave', () => gsap.to(U.uBoost, { value: 0, duration: 1.1, ease: 'power2.out' }))
        })
      }
    }

    /* ═════════ Scroll choreography ═════════ */
    const pbar = document.getElementById('pbar')
    const navEl = document.querySelector('nav')
    on(window, 'scroll', () => {
      if (pbar) pbar.style.transform = `scaleX(${scrollY / Math.max(1, document.body.scrollHeight - innerHeight)})`
      if (navEl) navEl.classList.toggle('glass', scrollY > 60)
    }, { passive: true })

    let scrambleInterval = null, scrambleTimeout = null

    if (!reduced) {
      document.querySelectorAll('.rv').forEach(el => {
        gsap.to(el, { opacity: 1, y: 0, duration: 1.05, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } })
      })
      /* section titles: line-mask reveal */
      document.querySelectorAll('.sec-title').forEach(tt => {
        gsap.to(tt.querySelectorAll('.lw>span'), { y: 0, duration: 1, stagger: 0.12, ease: 'power4.out', scrollTrigger: { trigger: tt, start: 'top 86%' } })
      })
      /* contact heading */
      gsap.to('#contact h2 .row>span', { y: 0, duration: 1.1, stagger: 0.14, ease: 'power4.out', scrollTrigger: { trigger: '#contact', start: 'top 65%' } })
      /* word-by-word manifesto */
      const bc = document.getElementById('bigcopy')
      if (bc) {
        bc.innerHTML = bc.innerHTML.split(/(<em>.*?<\/em>|\s+)/g).map(t => {
          if (!t.trim()) return t
          if (t.startsWith('<em>')) return t.replace('<em>', '<em class="w">')
          return `<span class="w">${t}</span>`
        }).join('')
        const ws = bc.querySelectorAll('.w')
        ScrollTrigger.create({
          trigger: bc, start: 'top 80%', end: 'bottom 48%', scrub: 0.4,
          onUpdate: s => { const n = Math.floor(s.progress * ws.length); ws.forEach((w, i) => w.classList.toggle('on', i <= n)) },
        })
      }
      /* facts slide in */
      document.querySelectorAll('.fact b').forEach(el => {
        gsap.from(el, { opacity: 0, x: 30, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%' } })
      })
      /* facts count up from zero */
      document.querySelectorAll('.fact b').forEach(b => {
        const tn = b.firstChild
        if (!tn || tn.nodeType !== 3) return
        const final = tn.textContent.trim(), num = parseInt(final, 10)
        if (isNaN(num)) return
        const pad = final.length, o = { v: 0 }
        ScrollTrigger.create({
          trigger: b, start: 'top 90%', once: true, onEnter: () => {
            gsap.to(o, { v: num, duration: 1.7, ease: 'power2.out', onUpdate: () => { tn.textContent = String(Math.round(o.v)).padStart(pad, '0') } })
          },
        })
      })
      /* the word "chaos" periodically dissolves into glyphs and re-resolves */
      const scrEl = document.querySelector('h1 .serif')
      if (scrEl) {
        const word = scrEl.textContent, glyphs = '!<>-_\\/[]{}—=+*^?#·'
        const scramble = () => {
          let f = 0; const total = 20
          const iv = setInterval(() => {
            f++
            scrEl.textContent = [...word].map((ch, i) => i < (f / total) * word.length ? ch : glyphs[(Math.random() * glyphs.length) | 0]).join('')
            if (f >= total) { clearInterval(iv); scrEl.textContent = word }
          }, 42)
        }
        scrambleTimeout = setTimeout(scramble, 2800)
        scrambleInterval = setInterval(scramble, 8000)
      }
      /* project art parallax */
      document.querySelectorAll('.pcard .grad').forEach(g => {
        gsap.fromTo(g, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: g.closest('.pcard'), start: 'top bottom', end: 'bottom top', scrub: 0.6 } })
      })
      /* skill marquees scrub with scroll + drift */
      document.querySelectorAll('.skill-marquee').forEach(mq => {
        const dir = +mq.dataset.dir, strk = mq.querySelector('.strk')
        strk.innerHTML += strk.innerHTML
        gsap.to(strk, { xPercent: -50 * dir, duration: 30, repeat: -1, ease: 'none' })
        gsap.to(strk, { x: () => dir * -160, ease: 'none', scrollTrigger: { trigger: mq, start: 'top bottom', end: 'bottom top', scrub: 0.5 } })
      })
    } else {
      document.querySelectorAll('.rv').forEach(el => { el.style.opacity = 1; el.style.transform = 'none' })
      document.querySelectorAll('.skill-marquee .strk').forEach(s => { s.innerHTML += s.innerHTML })
    }
    cleanups.push(() => {
      if (scrambleTimeout) clearTimeout(scrambleTimeout)
      if (scrambleInterval) clearInterval(scrambleInterval)
      ScrollTrigger.getAll().forEach(st => st.kill())
    })

    /* dock active state — center-line scrollspy: the section crossing the viewport's
       vertical center is active. Accurate regardless of section height (a per-section
       threshold fails on sections taller than the viewport, e.g. #work on mobile). */
    const dockObservers = []
    if (isTouch) {
      const links = [...document.querySelectorAll('.dock a')]
      const map = {}; links.forEach(a => { map[a.getAttribute('href').slice(1)] = a })
      const setActive = id => {
        const link = map[id]
        if (!link || link.classList.contains('active')) return
        links.forEach(a => a.classList.remove('active'))
        link.classList.add('active')
      }
      const io = new IntersectionObserver(
        es => es.forEach(e => { if (e.isIntersecting) setActive(e.target.id) }),
        { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
      )
      ;['hero', 'about', 'work', 'skills', 'contact'].forEach(id => {
        const el = document.getElementById(id); if (el) io.observe(el)
      })
      dockObservers.push(io)
    }
    cleanups.push(() => dockObservers.forEach(io => io.disconnect()))

    /* live local time in footer */
    const ck = document.getElementById('clock')
    let clockInterval = null
    if (ck) {
      clockInterval = setInterval(() => { ck.textContent = new Date().toLocaleTimeString([], { hour12: false }) }, 1000)
    }
    cleanups.push(() => { if (clockInterval) clearInterval(clockInterval) })

    /* WebGL teardown */
    cleanups.push(() => {
      geo.dispose(); mat.dispose()
      halo.geometry.dispose(); halo.material.dispose()
      ring.geometry.dispose(); ring.material.dispose()
      renderer.dispose()
    })

    return () => cleanups.forEach(fn => fn())
  }, [])
}
