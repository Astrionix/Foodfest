import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage } from '@react-three/drei'
import styles from './ARPreviewPage.module.css'

function PlaceholderDish() {
  return (
    <mesh>
      <cylinderGeometry args={[1.3, 1.4, 0.35, 32]} />
      <meshStandardMaterial color="#ff5a1f" emissive="#6b1800" emissiveIntensity={0.2} />
    </mesh>
  )
}

function ARPreviewPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>AR Dish Preview</h1>
        <p>Place Andhra delicacies on your table. Pinch, rotate, and inspect before the plate arrives.</p>
      </header>

      <section className={styles.previewArea}>
        <Canvas shadows camera={{ position: [3, 3, 4], fov: 45 }}>
          <color attach="background" args={[0.05, 0.02, 0.01]} />
          <ambientLight intensity={0.6} />
          <directionalLight castShadow intensity={0.9} position={[5, 8, 4]} />
          <Suspense fallback={null}>
            <Stage environment="sunset" intensity={1}>
              <PlaceholderDish />
            </Stage>
          </Suspense>
          <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} />
        </Canvas>
      </section>

      <section className={styles.instructions}>
        <h2>Bring the dish to life</h2>
        <ol>
          <li>Scan the QR on the table to launch AR mode on your phone.</li>
          <li>Point the camera where you want the dish to appear, tap to anchor.</li>
          <li>Use pinch gestures to scale, drag to reposition, and tilt for parallax.</li>
        </ol>
      </section>
    </div>
  )
}

export default ARPreviewPage
