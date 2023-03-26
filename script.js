import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

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
const lightHelper = new THREE.PointLightHelper(pointLight)
scene.add(lightHelper)

const gridHelper = new THREE.GridHelper(200, 50)
scene.add(gridHelper)

// Torus
const torusGeometry = new THREE.TorusGeometry(10, 3, 16, 100)
const torusMaterial = new THREE.MeshStandardMaterial({ color: 0xff6347 })
const torus = new THREE.Mesh(torusGeometry, torusMaterial)
scene.add(torus)

// Stars
const addStar = () => {
  const starGeometry = new THREE.SphereGeometry(0.25, 24, 24)
  const starMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff })
  const star = new THREE.Mesh(starGeometry, starMaterial)

  const [x, y, z] = Array(3)
    .fill()
    .map(() => THREE.MathUtils.randFloatSpread(100))

  star.position.set(x, y, z)
  scene.add(star)
}

Array(200).fill().forEach(addStar)

// Globe
const globe = new THREE.Mesh(
  new THREE.SphereGeometry(3, 32, 32),
  new THREE.MeshStandardMaterial({ color: 'blue' })
)
globe.position.z = 30
globe.position.setX(-10)
scene.add(globe)

// Move camera on scroll
const moveCamera = () => {
  // Calculate scroll from top
  const t = document.body.getBoundingClientRect().top

  globe.rotation.x += 0.05
  globe.rotation.y += 0.075
  globe.rotation.z += 0.05

  camera.position.x = t * -0.01
  camera.position.y = t * -0.0002
  camera.position.z = t * -0.0002
}
document.body.onscroll = moveCamera

// Animation
const animate = () => {
  requestAnimationFrame(animate)

  torus.rotation.x += 0.01
  torus.rotation.y += 0.005
  torus.rotation.z += 0.01

  renderer.render(scene, camera)
}

animate()
