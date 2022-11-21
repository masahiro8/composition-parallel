<template>
  <div>
    <div id="three_dimensions" />
  </div>
</template>
<script>
import { SceneDimensions } from "./three/scene_dimensions";

export default {
  name: "Triangles",
  data: () => {
    return {
      scene: null,
      GenLines: null,
    };
  },
  props: {
    scroll: {
      type: Number,
    },
    width: {
      type: Number,
      default: () => {
        return window.innerWidth;
      },
    },
    height: {
      type: Number,
      default: () => {
        return window.innerHeight;
      },
    },
  },
  async mounted() {
    const s = SceneDimensions();
    await s.init({
      canvasId: "three_dimensions",
      width: this.width,
      height: this.height,
    });
    // s.setOrbitCont();

    let index = 0;
    const max = 30;
    new Array(max).fill().map(() => {
      const center = {
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
        z: Math.random() * 100 - 50,
      };
      s.initDimension({
        index,
        max,
        r: 20,
        center,
        color: 0x000000,
        lineColor: 0x000000,
      });
      s.addLine({
        point: { x: 0, y: 500, z: 500 },
        dir: (index * 360) / max,
        length: 2000,
        center: { x: 0, y: 0, z: 0 },
        color: 0x888888,
        max,
      });
      index++;
    });

    s.drawDimension(1);
    s.drawLine(1);

    this.scene = s;

    this.$watch(
      () => this.scroll,
      (val) => {
        console.log(val);
        s.clear();
        s.drawDimension(val * 0.2);
        s.drawLine(1 + val * 0.01);
      }
    );
  },
  methods: {
    scrollOnAnimation({ scroll, diff }) {
      const onPlay = () => {};
      onPlay();
    },
  },
};
</script>
<style lang="scss" scoped>
#three_lines {
  position: relative;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
}
</style>