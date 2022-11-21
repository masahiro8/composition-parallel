import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const sum = (vec1, vec2) => {
  return {
    x: vec1.x + vec2.x,
    y: vec1.y + vec2.y,
    z: vec1.z + vec2.z
  };
};

export const SceneDimensions = () => {
  let scene;
  let camera;
  let hemiLight;
  let renderer;
  let orbitControls;

  let datas = [];
  let objs = [];
  let linedatas = [];
  let lines = [];
  // let pointsConfig = [];
  // let material = null;

  // const setCameraPosition = (n) => {
  //   const radian = (n * 0.1 * Math.PI) / 180;
  //   const _x = 100 * Math.sin(radian);
  //   const _z = 100 * Math.cos(radian);
  //   camera.position.set(_x, 0, _z);
  //   camera.up.set(0, 0, 0);
  // };

  const init = ({ canvasId, width, height }) => {
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    renderer.setPixelRatio(
      window.devicePixelRatio ? window.devicePixelRatio : 1
    );
    renderer.setClearColor(new THREE.Color(0xeeeeee));
    document.getElementById(canvasId).appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(90, width / height, 0.1, 2000);
    camera.position.set(10, -130, 60);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    hemiLight = new THREE.HemisphereLight(0xff0000, 0xffffff, 1);
    scene.add(hemiLight);
    hemiLight.color.setHSL(0.6, 1, 0.6);
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    hemiLight.position.set(0, 500, 0);

    const axis = new THREE.AxesHelper(100);
    scene.add(axis);
    axis.position.set(0, 0, 0);

    console.log("init");

    // レンダリング
    const nrender = () => {
      requestAnimationFrame(nrender);
      renderer.render(scene, camera);
    };
    nrender();
  };

  const setOrbitCont = () => {
    orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true; // 視点操作のイージングをONにする
    orbitControls.dampingFactor = 0.2; // 視点操作のイージングの値
    orbitControls.rotateSpeed = 0.3; // 視点変更の速さ
    orbitControls.noZoom = true; // ズーム禁止
    orbitControls.enableZoom = true;
    orbitControls.noPan = false; // パン操作禁止
    orbitControls.enablePan = false;
  };

  const initDimension = ({ index, max, r, center, color, lineColor }) => {
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });

    const materialLine = new THREE.LineBasicMaterial({
      color: lineColor,
      linewidth: 1
    });

    const w = Math.random() * 200 - 100;
    const h = Math.random() * 25 + 25;

    const rx = r * Math.cos(((index * 360) / max) * (Math.PI / 180)) + center.x;
    const rz = r * Math.tan(((index * 360) / max) * (Math.PI / 180)) + center.z;

    const a = sum(
      { x: 0, y: 1000, z: 0 },
      { x: rx, y: Math.random() * 100, z: rz }
    );
    const b = sum(
      { x: w, y: -100, z: 0 },
      { x: rx + Math.random() * 100, y: 0, z: rz }
    );
    const c = sum(
      { x: w, y: -100, z: h },
      { x: rx + Math.random() * 100, y: Math.random() * 100, z: rz }
    );
    const d = sum(
      { x: 0, y: 1000, z: h },
      { x: rx, y: Math.random() * 100, z: rz }
    );

    datas.push({
      index,
      r,
      points: { a, b, c, d },
      material,
      materialLine,
      center
    });
  };

  const drawDimension = (_deg) => {
    const deg = _deg;

    // 頂点から3角ポリゴンに変換
    datas.forEach(({ index, r, points, center, material, materialLine }) => {
      const rx = r * Math.cos(deg * (Math.PI / 180)) + center.x;
      const rz = r * Math.tan(deg * (Math.PI / 180)) + center.z;
      const rotate = { x: rx, y: 0, z: rz };
      // console.log("rotate", rotate);

      const { a, b, c, d } = points;
      const _a = sum(a, rotate);
      const _b = sum(b, rotate);
      const _c = sum(c, rotate);
      const _d = sum(d, rotate);

      const pointsConfig = [_a, _b, _c, _a, _c, _d, _a];
      const _points = pointsConfig.map((point) => {
        return new THREE.Vector3(point.x, point.y, point.z);
      });
      const geometry = new THREE.BufferGeometry().setFromPoints(_points);
      geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, 0));

      const obj = new THREE.Mesh(geometry, material);
      objs.push(obj);
      scene.add(obj);

      const lines = new THREE.Line(geometry, materialLine);
      objs.push(lines);
      scene.add(lines);
    });
  };

  const rotationToRadian = (r) => {
    return r * (Math.PI / 180);
  };

  const addLine = ({ point, dir, length, center, color, max }) => {
    const material = new THREE.LineBasicMaterial({
      color
    });
    const nPoints = [
      new THREE.Vector3(point.x, point.y, point.z),
      new THREE.Vector3(point.x, point.y, point.z + length)
    ];
    const _points = nPoints.map((point) => {
      return new THREE.Vector3(point.x, point.y, point.z);
    });
    const geometry = new THREE.BufferGeometry().setFromPoints(_points);
    // 中心設定
    geometry.applyMatrix(
      new THREE.Matrix4().makeTranslation(center.x, center.y, center.z)
    );
    linedatas.push({ geometry, material, max });

    const line = new THREE.Line(geometry, material);

    lines.push(line);
    scene.add(line);

    // 回転
    line.rotation.set(0, rotationToRadian(dir), 0);
  };

  const drawLine = (_deg) => {
    linedatas.forEach(({ geometry, material, max }) => {
      const dir = (_deg * 360) / max;
      const line = new THREE.Line(geometry, material);

      lines.push(line);
      scene.add(line);

      // 回転
      line.rotation.set(0, rotationToRadian(dir), 0);
    });
  };

  /**
   *
   * 中心点を指定し、ランダムな半径で三角形を描画、
   * スクロールで回転する
   */

  const clear = () => {
    objs.forEach((obj) => {
      scene.remove(obj);
      obj.material.dispose();
      obj.geometry.dispose();
    });
    lines.forEach((line) => {
      scene.remove(line);
      line.material.dispose();
      line.geometry.dispose();
    });
  };

  return {
    init,
    setOrbitCont,
    initDimension,
    drawDimension,
    addLine,
    drawLine,
    clear
  };
};
