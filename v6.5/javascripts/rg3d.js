/* RoboGenesis · 流畅优化版 · 无卡顿 无回弹 */
import * as THREE from "https://esm.sh/three@0.160.0";
import { OrbitControls } from "https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js";
import { ColladaLoader } from "https://esm.sh/three@0.160.0/examples/jsm/loaders/ColladaLoader.js";
import { STLLoader } from "https://esm.sh/three@0.160.0/examples/jsm/loaders/STLLoader.js";
import URDFLoader from "https://esm.sh/urdf-loader@0.12.6?deps=three@0.160.0";

const initViewer = (mount) => {
  const W = mount.clientWidth || 240;
  const H = mount.clientHeight || 320;

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25)); /* ← 降像素比，大幅提升流畅度 */
  renderer.setSize(W, H);
  renderer.setClearColor(0x000000, 0);
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, W / H, 0.05, 100);
  camera.position.set(1.5, 1.0, 2.0);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xddd6c4, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 0.8);
  key.position.set(2, 3, 2);
  scene.add(key);

  /* 极简单材质，不卡！ */
  const standardMat = new THREE.MeshLambertMaterial({ color: 0xeeeeee });
  const accentMat = new THREE.MeshLambertMaterial({ color: 0xf5b800 });

  const styleMesh = (mesh, isAccent) => {
    if (!mesh.isMesh) return;
    mesh.material = isAccent ? accentMat : standardMat;
  };

  const pivot = new THREE.Group();
  pivot.rotation.x = -Math.PI / 2;
  scene.add(pivot);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = false; /* ← 关闭阻尼 → 不回弹、不卡顿 */
  controls.minDistance = 0.3;
  controls.maxDistance = 8;
  controls.target.set(0, 0.3, 0);
  if (mount.dataset.controls === "off") controls.enabled = false;

  const autoSpeed = 0; /* ← 关闭自动旋转 → 不打架 */

  let robot = null;

  const fitCamera = () => {
    if (!robot) return false;
    const box = new THREE.Box3().setFromObject(robot);
    if (box.isEmpty() || !isFinite(box.min.x)) return false;
    const size = box.getSize(new THREE.Vector3());
    const c = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const dist = (maxDim / Math.tan((camera.fov * Math.PI) / 180 / 2)) * 0.95;
    camera.position.set(c.x + dist * 0.7, c.y + dist * 0.6, c.z + dist * 0.9);
    camera.near = Math.max(dist * 0.01, 0.01);
    camera.far = dist * 100;
    camera.updateProjectionMatrix();
    controls.target.copy(c);
    controls.update();
    return true;
  };

  const styleAll = () => {
    if (!robot) return;
    robot.traverse((o) => {
      if (o.isMesh) {
        const isAccent = /finger|gripper|hand/i.test(o.parent?.name || "" + "/" + o.name);
        styleMesh(o, isAccent);
      }
    });
  };

  const onUrdfLoaded = (r) => {
    robot = r;
    pivot.add(robot);
    styleAll();
    setTimeout(() => fitCamera(), 200);
  };

  const makeFallback = () => {
    const grp = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.08, 12), accentMat);
    base.position.y = 0.04;
    grp.add(base);
    return grp;
  };

  const url = mount.dataset.urdf || "";
  const baseHref = document.baseURI || (location.origin + location.pathname);

  const resolvePkg = (raw) => {
    let pm = "";
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
  urdfLoader.loadMeshCb = (path, manager, done) => {
    const ext = path.split(".").pop().toLowerCase();
    if (ext === "stl") {
      stlLoader.load(path, (geom) => {
        const m = new THREE.Mesh(geom, standardMat);
        done(m);
      }, undefined, () => done(null));
    } else if (ext === "dae") {
      daeLoader.load(path, (col) => {
        col.scene.traverse((o) => { if (o.isMesh) o.material = standardMat; });
        done(col.scene);
      }, undefined, () => done(null));
    } else {
      done(null);
    }
  };

  const loadFromAttrs = () => {
    while (pivot.children.length) pivot.remove(pivot.children[0]);
    robot = null;
    const u = mount.dataset.urdf || "";
    const absU = u ? new URL(u, baseHref).href : "";
    urdfLoader.packages = resolvePkg(mount.dataset.packages);
    if (absU) {
      urdfLoader.load(absU, onUrdfLoaded, undefined, () => onUrdfLoaded(makeFallback()));
    } else {
      onUrdfLoaded(makeFallback());
    }
  };
  mount._rg3dReload = loadFromAttrs;
  loadFromAttrs();

  const ro = new ResizeObserver(() => {
    const w = mount.clientWidth || W;
    const h = mount.clientHeight || H;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  });
  ro.observe(mount);

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