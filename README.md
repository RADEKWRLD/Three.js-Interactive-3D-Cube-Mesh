# Three.js Interactive 3D Cube Mesh
### This project showcases an interactive 3D cube grid created using Three.js, featuring highlighting and animation effects.

![145b29e4151c4ca5ecc112498c3ccf3](https://github.com/user-attachments/assets/7b061fdb-b5b8-44f1-804f-1a2e06b3e23b)



## Core Algorithms and Techniques

### 1. Cube Grid Generation

```javascript
function addNewBoxMesh(x, y, z) {
    // Generate color based on position
    const r = Math.floor((x / 3) * 255);
    const g = Math.floor((y / 3) * 255);
    const b = Math.floor((z / 3) * 255);
    const color = (r << 16) + (g << 8) + b;
    
    // Create cube and set position
    const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)
    const material = new THREE.MeshPhongMaterial({ color: color, shininess: 100 })
    const cube = new THREE.Mesh(geometry, material)
    cube.position.set(x, y, z)
    
    // Store original color for later restoration
    cube.userData.originalColor = color;
    
    scene.add(cube)
}
```

This algorithm uses three-dimensional loops to generate a 4×4×4 cube grid, with unique colors assigned to each cube based on its spatial position.

### 2. Raycasting and Mouse Interaction

```javascript
// Mouse movement detection algorithm
const onMouseMove = (event) => {
    // Calculate normalized device coordinates
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1

    // Cast ray from camera position
    raycaster.setFromCamera(pointer, camera)
    const intersects = raycaster.intersectObjects(scene.children)

    // Highlight processing
    if(previousHighlightedObject) {
        previousHighlightedObject.material.color.set(previousHighlightedObject.userData.originalColor)
    }

    if(intersects.length > 0) {
        intersects[0].object.material.color.set(0xff0000);
        previousHighlightedObject = intersects[0].object
    } else {
        previousHighlightedObject = null
    }
}
```

Uses Three.js Raycaster to implement cube highlighting effects when the mouse hovers over them.

### 3. Animation Timeline Control

```javascript
const onMouseClick = (event) => {
    // ...raycasting code...

    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        
        if (animatingCubes.has(clickedObject)) {
            return;
        }
        
        animatingCubes.add(clickedObject);
        
        const originalPosition = clickedObject.position.clone();
        
        // Create animation timeline
        const timeline = gsap.timeline({
            onComplete: function() {
                animatingCubes.delete(clickedObject);
            }
        });
        
        // Calculate camera movement parameters
        const targetPosition = clickedObject.position.clone();
        const cameraOffset = new THREE.Vector3(1, 1, 1);
        const newCameraPosition = targetPosition.clone().add(cameraOffset);
        
        // Animation sequence control
        timeline.to(camera.position, { /* camera movement animation */ });
        timeline.to(clickedObject.position, { /* cube upward animation */ }, ">");
        timeline.to(clickedObject.position, { /* cube return animation */ }, ">");
    }
}
```

Uses GSAP timeline to create complex animation sequences when clicking on cubes, including camera movement and cube bounce effects.

### 4. Dynamic Camera Control

```javascript
function moveCamera(targetObject) {
    const targetPosition = targetObject.position.clone();
    const cameraOffset = new THREE.Vector3(2, 1, 2);
    const newCameraPosition = targetPosition.clone().add(cameraOffset);
    
    gsap.to(camera.position, {
        x: newCameraPosition.x,
        y: newCameraPosition.y,
        z: newCameraPosition.z,
        duration: 1,
        ease: "power2.inOut",
        onUpdate: function() {
            camera.lookAt(targetPosition);
            
            if (controls) {
                controls.target.copy(targetPosition);
                controls.update();
            }
        }
    });
}
```

Implements an algorithm for smoothly moving the camera to a position near a specified target object while keeping the camera always looking at the target.

## Technology Stack

- Three.js: 3D rendering and scene management
- GSAP (GreenSock Animation Platform): High-performance animation control
- Raycaster: Mouse interaction detection with 3D objects
- OrbitControls: Camera orbit control

## Features

- Creates a colorful 3D cube grid
- Highlights cubes on mouse hover
- Triggers animation sequences when clicking on cubes
- Responsive design that adapts to window size changes
