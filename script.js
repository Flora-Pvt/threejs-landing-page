import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import ThreeGlobe from 'three-globe'

// Scene
const scene = new THREE.Scene()

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
camera.position.setZ(30)

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

// Helpers
// const lightHelper = new THREE.PointLightHelper(pointLight)
// scene.add(lightHelper)

// const gridHelper = new THREE.GridHelper(200, 50)
// scene.add(gridHelper)

// Globe
const Globe = new ThreeGlobe({ waitForGlobeReady: true, animateIn: true })
const globeMaterial = Globe.globeMaterial()
globeMaterial.color = new THREE.Color(0x3a228a)
globeMaterial.emissive = new THREE.Color(0x220038)
globeMaterial.emissiveIntensity = 0.1
globeMaterial.shininess = 0.7
Globe.position.x = 125
const globePositionZ = -300
Globe.position.z = globePositionZ
Globe.rotateY(-Math.PI * (5 / 9))
Globe.rotateZ(-Math.PI / 6)
scene.add(Globe)

// Stars
const addStar = () => {
  const starGeometry = new THREE.SphereGeometry(0.05, 24, 24)
  const starMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff })
  const star = new THREE.Mesh(starGeometry, starMaterial)

  const [x, y, z] = Array(3)
    .fill()
    .map(() => THREE.MathUtils.randFloatSpread(100))

  star.position.set(x, y, z)
  scene.add(star)
}

Array(200).fill().forEach(addStar)

// Move camera on scroll
const moveCamera = () => {
  // Calculate scroll from top
  const scrolled = document.body.getBoundingClientRect().top
  const heightBreakPoint = -3200

  if (scrolled > heightBreakPoint) {
    // Globe.position.z = scrolled * globePositionZ * 0.0025
    camera.position.x = scrolled * -0.185
  } else {
    // Globe.position.z =
    // heightBreakPoint * globePositionZ * -0.0025 - heightBreakPoint * globePositionZ * -0.002
    camera.position.x = heightBreakPoint * -0.025 + heightBreakPoint * 0.05
  }
}
document.body.onscroll = moveCamera

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

  // torus.rotation.x += 0.01
  // torus.rotation.y += 0.005
  // torus.rotation.z += 0.01

  renderer.render(scene, camera)
}

animate()
