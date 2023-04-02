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
const scrollBreakPoints = [-500, -2500, -4500, -5350, -5900]
let scrollPosition = 0
let isRotated = false
let hexSelection = ''
let isArcs = false
let isAltitude = false

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
      Globe.hexPolygonsData(countries.features).polygonsData([])
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
      Globe.hexPolygonsData([])
        .polygonsData(countries.features)
        .polygonSideColor(() => 'rgba(255, 255, 255, 0.04)')
        .polygonCapColor((e) => {
          if (e.properties?.name === 'France') return 'rgba(224, 43, 137, 0.1)'
          else return 'rgba(255, 255, 255, 0.04)'
        })
        .polygonStrokeColor((e) => {
          if (e.properties?.name === 'France') return '#ff387f'
          else return 'rgba(255, 255, 255, 0.2)'
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
      Globe.polygonCapColor((e) => {
        if (e.properties?.name === 'France') return 'rgba(224, 43, 137, 0.1)'
        else return 'rgba(255, 255, 255, 0.04)'
      }).polygonStrokeColor((e) => {
        if (e.properties?.name === 'France') return '#ff387f'
        else return 'rgba(255, 255, 255, 0.2)'
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
      Globe.polygonCapColor((e) => {
        if (e.properties?.continent === 'Europe')
          return 'rgba(224, 43, 137, 0.1)'
        else return 'rgba(255, 255, 255, 0.04)'
      }).polygonStrokeColor((e) => {
        if (e.properties?.continent === 'Europe') return '#ff387f'
        else return 'rgba(255, 255, 255, 0.2)'
      })

      hexSelection = 'Europe'
    }
  }

  if (
    newScrollPosition <= scrollBreakPoints[3] &&
    newScrollPosition > scrollBreakPoints[4]
  ) {
    if (isAltitude) {
      Globe.polygonAltitude(0)

      Globe.rotation.x = 0.75
      Globe.rotation.y = -0.5
      Globe.rotation.z = 0.5

      isAltitude = false
    }
  }
}

const animateAfterFifthBreakPoint = (newScrollPosition) => {
  if (newScrollPosition <= scrollBreakPoints[4]) {
    Globe.rotation.x -= 0.005
    Globe.rotation.y += 0.025

    if (!isAltitude) {
      setTimeout(
        () =>
          Globe.polygonsTransitionDuration(100).polygonAltitude((e) => {
            if (e.properties?.continent === 'Europe') return 0.25
            else return 0
          }),
        100
      )

      isAltitude = true
    }

    if (isArcs) {
      Globe.arcsData([])
      isArcs = false
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
  animateAfterFifthBreakPoint(newScrollPosition)

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
