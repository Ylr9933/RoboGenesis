/* RoboGenesis · 3D 机械臂查看器（toon + outline + URDF） */
import * as THREE from "https://esm.sh/three@0.160.0";
import { OrbitControls } from "https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js";
import { ColladaLoader } from "https://esm.sh/three@0.160.0/examples/jsm/loaders/ColladaLoader.js";
import { STLLoader } from "https://esm.sh/three@0.160.0/examples/jsm/loaders/STLLoader.js";
import URDFLoader from "https://esm.sh/urdf-loader@0.12.6?deps=three@0.160.0";

const initViewer = (mount) => {
  const W = mount.clientWidth || 240;
  const H = mount.clientHeight || 320;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H);
  renderer.setClearColor(0x000000, 0);
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, W / H, 0.05, 100);
  camera.position.set(1.5, 1.0, 2.0);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xddd6c4, 1.0));
  const key = new THREE.DirectionalLight(0xffffff, 1.2);
  key.position.set(2, 3, 2);
  scene.add(key);

  const grad = new Uint8Array([220, 220, 220, 255, 250, 250, 250, 255]);
  const gradTex = new THREE.DataTexture(grad, 2, 1, THREE.RGBAFormat);
  gradTex.needsUpdate = true;

  const whiteMat = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: gradTex });
  const goldMat = new THREE.MeshToonMaterial({ color: 0xf5b800, gradientMap: gradTex });
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x0f172a, side: THREE.BackSide });

  const styleMesh = (mesh, isAccent) => {
    if (!mesh.geometry) return;
    if (mesh.userData.__rgOutline) return; // it IS the outline shell, skip
    mesh.material = isAccent ? goldMat : whiteMat;
    if (mesh.userData.__rgOutlined) return;
    mesh.userData.__rgOutlined = true;
    const shell = new THREE.Mesh(mesh.geometry, outlineMat);
    shell.userData.__rgOutline = true;
    shell.scale.multiplyScalar(1.025);
    shell.renderOrder = -1;
    mesh.add(shell);
  };

  const pivot = new THREE.Group();
  pivot.rotation.x = -Math.PI / 2;
  scene.add(pivot);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.minDistance = 0.3;
  controls.maxDistance = 8;
  controls.target.set(0, 0.3, 0);
  if (mount.dataset.controls === "off") controls.enabled = false;

  const autoSpeed = parseFloat(mount.dataset.rotateSpeed || "0.0035");

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
      if (o.isMesh && !o.userData.__rgOutlined) {
        const tag = ((o.parent && o.parent.name) || "") + "/" + (o.name || "");
        const isAccent = /finger|gripper|hand/i.test(tag);
        styleMesh(o, isAccent);
      }
    });
  };

  const onUrdfLoaded = (r) => {
    robot = r;
    pivot.add(robot);
    styleAll();
    let tries = 0;
    const tryFit = () => {
      styleAll();
      const ok = fitCamera();
      if (++tries < 25) setTimeout(tryFit, 250);
    };
    setTimeout(tryFit, 200);
  };

  const makeFallback = () => {
    const grp = new THREE.Group();
    const mkShell = (geom, sc) => {
      const s = new THREE.Mesh(geom, outlineMat);
      s.userData.__rgOutline = true;
      s.scale.multiplyScalar(sc);
      return s;
    };
    const seg = (h, y) => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, h, 18), whiteMat);
      m.position.y = y;
      m.userData.__rgOutlined = true;
      m.add(mkShell(m.geometry, 1.06));
      return m;
    };
    const joint = (r, y) => {
      const j = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), whiteMat);
      j.position.y = y;
      j.userData.__rgOutlined = true;
      j.add(mkShell(j.geometry, 1.07));
      return j;
    };
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.08, 24), goldMat);
    base.position.y = 0.04;
    base.userData.__rgOutlined = true;
    base.add(mkShell(base.geometry, 1.05));
    grp.add(base);
    grp.add(seg(0.25, 0.2));
    grp.add(joint(0.07, 0.34));
    grp.add(seg(0.22, 0.46));
    grp.add(joint(0.06, 0.58));
    grp.add(seg(0.18, 0.68));
    grp.add(joint(0.05, 0.78));
    const gripBase = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.08), goldMat);
    gripBase.position.y = 0.84;
    gripBase.userData.__rgOutlined = true;
    gripBase.add(mkShell(gripBase.geometry, 1.05));
    grp.add(gripBase);
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
    const ext = path.split("?")[0].split(".").pop().toLowerCase();
    if (ext === "dae") {
      daeLoader.load(
        path,
        (col) => {
          col.scene.traverse((o) => { if (o.isMesh) styleMesh(o, false); });
          done(col.scene);
        },
        undefined,
        (e) => { console.warn("[rg3d] dae fail", path, e); done(null, e); }
      );
    } else if (ext === "stl") {
      stlLoader.load(
        path,
        (geom) => {
          const m = new THREE.Mesh(geom, whiteMat);
          styleMesh(m, false);
          done(m);
        },
        undefined,
        (e) => done(null, e)
      );
    } else {
      done(null, new Error("unsupported: " + ext));
    }
  };

  const loadFromAttrs = () => {
    while (pivot.children.length) pivot.remove(pivot.children[0]);
    robot = null;
    const u = mount.dataset.urdf || "";
    const absU = u ? new URL(u, baseHref).href : "";
    urdfLoader.packages = resolvePkg(mount.dataset.packages);
    console.log("[rg3d] load", absU, urdfLoader.packages);
    if (absU) {
      urdfLoader.load(
        absU,
        (r) => onUrdfLoaded(r),
        undefined,
        (err) => {
          console.warn("[rg3d] URDF load failed → fallback", err);
          onUrdfLoaded(makeFallback());
        }
      );
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
    if (robot) pivot.rotation.z += autoSpeed;
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
    try { initViewer(el); } catch (e) { console.error("[rg3d] init failed", e); }
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
      if (typeof stage._rg3dReload === "function") stage._rg3dReload();
    });
  });
};

if (document.readyState !== "loading") boot();
else document.addEventListener("DOMContentLoaded", boot);
if (window.document$) {
  try { window.document$.subscribe(() => boot()); } catch (_) {}
}
