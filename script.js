import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js'
import { gsap } from 'gsap/gsap-core'

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)


const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)



//添加轨道控制器
const controls = new OrbitControls(camera, renderer.domElement)
controls.update()

//添加方块模版
function addNewBoxMesh(x, y, z) {
    const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)
    
    // 基于位置生成颜色 - 这样相邻的立方体会有相似但不同的颜色
    const r = Math.floor((x / 3) * 255);
    const g = Math.floor((y / 3) * 255);
    const b = Math.floor((z / 3) * 255);
    const color = (r << 16) + (g << 8) + b;
    
    const material = new THREE.MeshPhongMaterial({ 
        color: color, 
        shininess: 100 
    })
    
    const cube = new THREE.Mesh(geometry, material)
    cube.position.set(x, y, z)
    
    // 存储原始颜色
    cube.userData.originalColor = color;
    
    scene.add(cube)
}

//添加方块
for (let x = 0; x < 4; x++) {
    for (let y = 0; y < 4; y++) {
        for (let z = 0; z < 4; z++) {
            addNewBoxMesh(x, y, z);
        }
    }
}

//创建raycaster射线追踪器
const pointer = new THREE.Vector2()//指针变量
const raycaster = new THREE.Raycaster()//射线追踪器
let previousHighlightedObject=null//上一个高亮对象


//鼠标移动事件
const onMouseMove=(event)=>{
    pointer.x=(event.clientX/window.innerWidth)*2-1//计算鼠标位置
    pointer.y=-(event.clientY/window.innerHeight)*2+1

    raycaster.setFromCamera(pointer,camera)//从相机位置发射射线
    const intersects = raycaster.intersectObjects(scene.children)//获取射线与场景中的对象相交的点

    if(previousHighlightedObject){
        previousHighlightedObject.material.color.set(previousHighlightedObject.userData.originalColor)//设置上一个高亮对象的颜色
    }

    if(intersects.length > 0) {
        intersects[0].object.material.color.set(0xff0000);//设置当前高亮对象的颜色
        previousHighlightedObject=intersects[0].object//更新上一个高亮对象
    }else{
        previousHighlightedObject=null//没有高亮对象时，设置上一个高亮对象为null
    }
}




//点击事件

const animatingCubes = new Set()//存储正在动画的方块

const onMouseClick = (event) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        
        if (animatingCubes.has(clickedObject)) {
            return;
        }
        
        animatingCubes.add(clickedObject);
        
        const originalPosition = clickedObject.position.clone();
        
        // 创建动画时间轴
        const timeline = gsap.timeline({
            onComplete: function() {
                animatingCubes.delete(clickedObject);
            }
        });
        
        // 计算相机移动参数
        const targetPosition = clickedObject.position.clone();
        const cameraOffset = new THREE.Vector3(1, 1, 1);
        const newCameraPosition = targetPosition.clone().add(cameraOffset);
        
        // 1. 添加相机移动到时间轴
        timeline.to(camera.position, {
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
        
        // 2. 添加方块上移到时间轴（在相机移动后执行）
        timeline.to(clickedObject.position, {
            y: originalPosition.y + 0.4,
            duration: 0.5,
            ease: "power2.inOut"
        }, ">");  // ">"表示在前一个动画完成后立即开始
        
        // 3. 添加方块返回到时间轴
        timeline.to(clickedObject.position, {
            y: originalPosition.y,
            duration: 0.5,
            ease: "power2.inOut"
        }, ">");
    }
};


function moveCamera(targetObject) {
    // 计算当前相机到目标的方向向量
    const targetPosition = targetObject.position.clone();
    
    // 创建目标点 - 在物体附近但不是物体位置
    // 计算从物体到相机的方向向量，并沿此方向移动一定距离
    const cameraOffset = new THREE.Vector3(2, 1, 2);
    const newCameraPosition = targetPosition.clone().add(cameraOffset);
    
    // 使用GSAP动画相机位置
    gsap.to(camera.position, {
        x: newCameraPosition.x,
        y: newCameraPosition.y,
        z: newCameraPosition.z,
        duration: 1,
        ease: "power2.inOut",
        onUpdate: function() {
            // 在每一帧都让相机看向目标
            camera.lookAt(targetPosition);
            
            // 如果使用了OrbitControls，需要更新它的目标
            if (controls) {
                controls.target.copy(targetPosition);
                controls.update();
            }
        }
    });
}

window.addEventListener("mousemove",onMouseMove)
window.addEventListener("click",onMouseClick)

//添加光源
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
directionalLight.position.set(3, 4, 5)
scene.add(ambientLight)
scene.add(directionalLight)



//调整位置
camera.position.z = 5



//渲染动画
function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
}
animate()

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
})
