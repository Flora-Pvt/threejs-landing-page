import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import ThreeGlobe from 'three-globe'

import countries from './src/globe-data/custom.geo.json'
import arcs from './src/globe-data/arcs.json'

// Scene
const scene = new THREE.Scene()

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
camera.position.setZ(250)

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('.webgl'),
})
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.render(scene, camera)

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement)

// Lights
const pointLight = new THREE.PointLight(0xffffff)
pointLight.position.set(5, 5, 5)
scene.add(pointLight)

const ambientLight = new THREE.AmbientLight(0xffffff)
scene.add(ambientLight)

// Globe
const Globe = new ThreeGlobe({
  waitForGlobeReady: true,
  animateIn: true,
})
  .hexPolygonsData(countries.features)
  .hexPolygonResolution(3)
  .hexPolygonMargin(0.7)

const globeMaterial = Globe.globeMaterial()
globeMaterial.color = new THREE.Color(0x3a228a)
globeMaterial.emissive = new THREE.Color(0x220038)
globeMaterial.emissiveIntensity = 0.1
globeMaterial.shininess = 0.7

Globe.position.x = 125

scene.add(Globe)

// Animate Globe on scroll
const scrollBreakPoints = [-500, -3000, -4500, -5350]
let scrollPosition = 0
let isRotated = false
let hexSelection = ''
let isArcs = false

const animateAfterTop = (newScrollPosition) => {
  if (
    newScrollPosition > scrollBreakPoints[0] &&
    newScrollPosition >= scrollBreakPoints[1]
  ) {
    if (newScrollPosition > scrollPosition) Globe.position.x += 3
    else Globe.position.x -= 3
    Globe.position.z = 0

    Globe.rotation.x += 0.005
    Globe.rotation.y -= 0.01
  }
}

const animateAfterFirstBreakpoint = (newScrollPosition) => {
  if (
    newScrollPosition <= scrollBreakPoints[0] &&
    newScrollPosition > scrollBreakPoints[1]
  ) {
    if (newScrollPosition > scrollPosition) Globe.position.x += 3
    else Globe.position.x -= 3
    Globe.position.z = -200

    Globe.rotation.x += 0.005
    Globe.rotation.y -= 0.01

    if (isRotated) {
      Globe.position.x = -200
      isRotated = false
    }

    if (hexSelection !== '') {
      Globe.hexPolygonColor(() => '#ffffff')
      hexSelection = ''
    }
  }
}

const animateAfterSecondBreakPoint = (newScrollPosition) => {
  if (
    newScrollPosition <= scrollBreakPoints[1] &&
    newScrollPosition > scrollBreakPoints[2]
  ) {
    if (!isRotated) {
      Globe.position.x = 150
      Globe.position.z = 0

      Globe.rotation.x = 0.75
      Globe.rotation.y = -0.5
      Globe.rotation.z = 0.5

      isRotated = true
    }

    if (hexSelection !== 'France') {
      Globe.hexPolygonColor((e) => {
        if (e.properties?.name === 'France') return '#ff387f'
        else return '#ffffff'
      })

      hexSelection = 'France'
    }

    if (isArcs) {
      Globe.arcsData([])
      isArcs = false
    }
  }
}

const animateAfterThirdBreakPoint = (newScrollPosition) => {
  if (newScrollPosition <= scrollBreakPoints[2]) {
    if (hexSelection !== 'France') {
      Globe.hexPolygonColor((e) => {
        if (e.properties?.name === 'France') return '#ff387f'
        else return '#ffffff'
      })

      hexSelection = 'France'
    }

    if (!isArcs) {
      Globe.arcsData(arcs)
        .arcColor(() => '#ff387f')
        .arcAltitude((e) => e.arcAlt)
        .arcDashLength(0.7)
        .arcDashGap(4)
        .arcDashInitialGap((e) => e.order * 1)
        .arcDashAnimateTime(1000)

      isArcs = true
    }
  }
}

const animateAfterFourthBreakPoint = (newScrollPosition) => {
  if (newScrollPosition <= scrollBreakPoints[3]) {
    if (hexSelection !== 'Europe') {
      Globe.hexPolygonColor((e) => {
        if (e.properties?.continent === 'Europe') return '#ff387f'
        else return '#ffffff'
      })

      hexSelection = 'Europe'
    }
  }
}

const animateGlobeOnScroll = () => {
  const newScrollPosition = document.body.getBoundingClientRect().top

  animateAfterTop(newScrollPosition)
  animateAfterFirstBreakpoint(newScrollPosition)
  animateAfterSecondBreakPoint(newScrollPosition)
  animateAfterThirdBreakPoint(newScrollPosition)
  animateAfterFourthBreakPoint(newScrollPosition)

  scrollPosition = newScrollPosition
}
document.body.onscroll = animateGlobeOnScroll

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Animation
const animate = () => {
  requestAnimationFrame(animate)

  renderer.render(scene, camera)
}

animate()
