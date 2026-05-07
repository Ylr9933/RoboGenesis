/* RoboGenesis 静默后台加载 · 不阻塞 · 极速版 */
import * as THREE from "https://esm.sh/three@0.160.0";
import { OrbitControls } from "https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js";
import { ColladaLoader } from "https://esm.sh/three@0.160.0/examples/jsm/loaders/ColladaLoader.js";
import { STLLoader } from "https://esm.sh/three@0.160.0/examples/jsm/loaders/STLLoader.js";
import URDFLoader from "https://esm.sh/urdf-loader@0.12.6?deps=three@0.160.0";
import { SimplifyModifier } from "https://esm.sh/three@0.160.0/examples/jsm/modifiers/SimplifyModifier.js";

const initViewer = (mount) => {
  const W = mount.clientWidth || 240;
  const H = mount.clientHeight || 320;

  // 降级渲染配置，极致性能
  const renderer = new THREE.WebGLRenderer({ 
    antialias: false, 
    alpha: true,
    powerPreference: "low-power"
  });
  renderer.setPixelRatio(1.0);
  renderer.setSize(W, H, false);
  renderer.setClearColor(0x000000, 0);
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, W / H, 0.1, 200);
  camera.position.set(1.5, 1.0, 2.0);

  // 极简灯光，减少计算
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  // 极简材质，不做光影计算
  const baseMat = new THREE.MeshBasicMaterial({ color: 0xeeeeee });
  const accentMat = new THREE.MeshBasicMaterial({ color: 0xf5b800 });

  const pivot = new THREE.Group();
  pivot.rotation.x = -Math.PI / 2;
  scene.add(pivot);

  // 控制器彻底防回弹、防卡顿
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = false;
  controls.autoRotate = false;
  controls.minDistance = 0.3;
  controls.maxDistance = 8;
  controls.target.set(0, 0.3, 0);
  if (mount.dataset.controls === "off") controls.enabled = false;

  let robot = null;
  const simplifyModifier = new SimplifyModifier();

  // 几何体自动简化，静默减面
  const simplifyGeo = (geo) => {
    const count = geo.attributes.position.count;
    const reduce = Math.floor(count * 0.6); // 砍掉60%面数
    return simplifyModifier.modify(geo, reduce);
  };

  const styleMesh = (mesh, isAccent) => {
    if (!mesh.isMesh) return;
    mesh.material = isAccent ? accentMat : baseMat;
  };

  const fitCamera = () => {
    if (!robot) return false;
    const box = new THREE.Box3().setFromObject(robot);
    if (box.isEmpty() || !isFinite(box.min.x)) return false;
    const size = box.getSize(new THREE.Vector3());
    const c = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const dist = (maxDim / Math.tan((camera.fov * Math.PI) / 180 / 2)) * 0.95;
    camera.position.set(c.x + dist * 0.7, c.y + dist * 0.6, c.z + dist * 0.9);
    camera.near = 0.1;
    camera.far = 200;
    camera.updateProjectionMatrix();
    controls.target.copy(c);
    controls.update();
    return true;
  };

  // 静默后台加载完成回调
  const onUrdfLoaded = (r) => {
    // 先清空旧模型
    while (pivot.children.length) pivot.remove(pivot.children[0]);
    robot = r;
    pivot.add(robot);

    // 统一样式
    robot.traverse((o) => {
      if (o.isMesh) {
        const isAccent = /finger|gripper|hand/i.test(o.parent?.name || o.name);
        styleMesh(o, isAccent);
      }
    });

    // 延迟适配相机，无感
    setTimeout(() => fitCamera(), 100);
  };

  // 占位默认模型（加载期间显示，不空白）
  const makeFallback = () => {
    const grp = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.08, 12), baseMat);
    base.position.y = 0.04;
    grp.add(base);
    return grp;
  };

  // 初始化先放占位模型，立刻可操作
  onUrdfLoaded(makeFallback());

  const baseHref = document.baseURI || (location.origin + location.pathname);
  const resolvePkg = (raw) => {
    let pm = {};
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          pm = {};
          for (const k of Object.keys(parsed)) pm[k] = new URL(parsed[k], baseHref).href;
        }
      } catch (_) {}
    }
    return pm;
  };

  const stlLoader = new STLLoader();
  const daeLoader = new ColladaLoader();
  const urdfLoader = new URDFLoader();

  // 自定义加载：后台解析 + 自动简化
  urdfLoader.loadMeshCb = (path, manager, done) => {
    const ext = path.split(".").pop().toLowerCase();
    if (ext === "stl") {
      stlLoader.load(path, (rawGeo) => {
        // 静默简化几何体
        const simpleGeo = simplifyGeo(rawGeo);
        const m = new THREE.Mesh(simpleGeo, baseMat);
        done(m);
      }, undefined, () => done(null));
    } else if (ext === "dae") {
      daeLoader.load(path, (col) => {
        col.scene.traverse((o) => {
          if (o.isMesh) o.material = baseMat;
        });
        done(col.scene);
      }, undefined, () => done(null));
    } else {
      done(null);
    }
  };

  // 【核心】静默后台加载，不阻塞UI
  const loadFromAttrs = () => {
    const u = mount.dataset.urdf || "";
    const absU = u ? new URL(u, baseHref).href : "";
    urdfLoader.packages = resolvePkg(mount.dataset.packages);

    if (!absU) return;

    // 丢到宏任务，后台静默加载，不阻塞主线程
    setTimeout(() => {
      urdfLoader.load(
        absU,
        (r) => onUrdfLoaded(r),
        undefined,
        () => {}
      );
    }, 50);
  };

  mount._rg3dReload = loadFromAttrs;
  // 页面初始化就后台静默加载
  loadFromAttrs();

  // 自适应不卡顿
  const ro = new ResizeObserver(() => {
    const w = mount.clientWidth || W;
    const h = mount.clientHeight || H;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  });
  ro.observe(mount);

  // 渲染循环极简，无多余计算
  const tick = () => {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  };
  tick();
};

const boot = () => {
  document.querySelectorAll(".rg-robot-3d").forEach((el) => {
    if (el.dataset.rg3dInit === "1") return;
    el.dataset.rg3dInit = "1";
    try { initViewer(el); } catch (e) {}
  });
  document.querySelectorAll(".rg-robot-chip").forEach((chip) => {
    if (chip.dataset.rgChipInit === "1") return;
    chip.dataset.rgChipInit = "1";
    chip.addEventListener("click", () => {
      const stage = document.getElementById("rg-stage");
      if (!stage) return;
      const urdf = chip.dataset.urdf || "";
      const pkg = chip.dataset.packages || "";
      stage.dataset.urdf = urdf;
      if (pkg) stage.dataset.packages = pkg; else delete stage.dataset.packages;
      document.querySelectorAll(".rg-robot-chip").forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      const nameEl = document.querySelector(".rg-stage-name");
      const specEl = document.querySelector(".rg-stage-spec");
      if (nameEl && chip.dataset.name) nameEl.textContent = chip.dataset.name;
      if (specEl && chip.dataset.spec) specEl.dataset.spec = chip.dataset.spec;
      if (stage._rg3dReload) stage._rg3dReload();
    });
  });
};

document.readyState !== "loading" ? boot() : document.addEventListener("DOMContentLoaded", boot);