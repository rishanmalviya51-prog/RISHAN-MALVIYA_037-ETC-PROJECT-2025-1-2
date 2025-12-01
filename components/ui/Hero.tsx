import React, { useRef, useEffect } from 'react';

interface HeroProps {
  trustBadge?: {
    text: string;
    icons?: string[];
  };
  headline: {
    line1: string;
    line2: string;
  };
  subtitle: string;
  buttons?: {
    primary?: {
      text: string;
      onClick?: () => void;
    };
  };
  className?: string;
}

const useShaderBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const rendererRef = useRef<any>(null);
  const pointersRef = useRef<any>(null);

  const defaultShaderSource = `#version 300 es
    precision highp float;
    out vec4 O;
    uniform vec2 resolution;
    uniform float time;
    #define FC gl_FragCoord.xy
    #define T time
    #define R resolution
    #define MN min(R.x,R.y)
    float rnd(vec2 p) {
      p=fract(p*vec2(12.9898,78.233));
      p+=dot(p,p+34.56);
      return fract(p.x*p.y);
    }
    float noise(in vec2 p) {
      vec2 i=floor(p), f=fract(p), u=f*f*(3.-2.*f);
      float
      a=rnd(i),
      b=rnd(i+vec2(1,0)),
      c=rnd(i+vec2(0,1)),
      d=rnd(i+1.);
      return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
    }
    float fbm(vec2 p) {
      float t=.0, a=1.; mat2 m=mat2(1.,-.5,.2,1.2);
      for (int i=0; i<5; i++) {
        t+=a*noise(p);
        p*=2.*m;
        a*=.5;
      }
      return t;
    }
    float clouds(vec2 p) {
      float d=1., t=.0;
      for (float i=.0; i<3.; i++) {
        float a=d*fbm(i*10.+p.x*.2+.2*(1.+i)*p.y+d+i*i+p);
        t=mix(t,d,a);
        d=a;
        p*=2./(i+1.);
      }
      return t;
    }
    void main(void) {
      vec2 uv=(FC-.5*R)/MN,st=uv*vec2(2,1);
      vec3 col=vec3(0);
      // Main color adjustments for Indigo/Cyan vibe
      float bg=clouds(vec2(st.x+T*.5,-st.y));
      uv*=1.-.3*(sin(T*.2)*.5+.5);
      for (float i=1.; i<12.; i++) {
        uv+=.1*cos(i*vec2(.1+.01*i, .8)+i*i+T*.5+.1*uv.x);
        vec2 p=uv;
        float d=length(p);
        // Vibrant Indigo/Cyan mix
        col+=.00125/d*(cos(sin(i)*vec3(0.2, 0.5, 1.0))+1.); 
        float b=noise(i+p+bg*1.731);
        col+=.002*b/length(max(p,vec2(b*p.x*.02,p.y)));
        col=mix(col,vec3(bg*.05,bg*.05,bg*.2),d);
      }
      O=vec4(col,1);
    }`;

  class WebGLRenderer {
    canvas: HTMLCanvasElement;
    gl: WebGL2RenderingContext;
    program: WebGLProgram | null = null;
    vs: WebGLShader | null = null;
    fs: WebGLShader | null = null;
    buffer: WebGLBuffer | null = null;
    scale: number;
    shaderSource: string;
    mouseMove = [0, 0];
    mouseCoords = [0, 0];
    pointerCoords = [0, 0];
    nbrOfPointers = 0;

    private vertexSrc = `#version 300 es
    precision highp float;
    in vec4 position;
    void main(){gl_Position=position;}`;

    private vertices = [-1, 1, -1, -1, 1, 1, 1, -1];

    constructor(canvas: HTMLCanvasElement, scale: number) {
      this.canvas = canvas;
      this.scale = scale;
      this.gl = canvas.getContext('webgl2')!;
      this.gl.viewport(0, 0, canvas.width * scale, canvas.height * scale);
      this.shaderSource = defaultShaderSource;
    }

    updateShader(source: string) {
      this.reset();
      this.shaderSource = source;
      this.setup();
      this.init();
    }

    updateMove(deltas: number[]) { this.mouseMove = deltas; }
    updateMouse(coords: number[]) { this.mouseCoords = coords; }
    updatePointerCoords(coords: number[]) { this.pointerCoords = coords; }
    updatePointerCount(nbr: number) { this.nbrOfPointers = nbr; }
    updateScale(scale: number) {
      this.scale = scale;
      this.gl.viewport(0, 0, this.canvas.width * scale, this.canvas.height * scale);
    }

    compile(shader: WebGLShader, source: string) {
      const gl = this.gl;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
      }
    }

    test(source: string) {
      let result = null;
      const gl = this.gl;
      const shader = gl.createShader(gl.FRAGMENT_SHADER)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        result = gl.getShaderInfoLog(shader);
      }
      gl.deleteShader(shader);
      return result;
    }

    reset() {
      const gl = this.gl;
      if (this.program && !gl.getProgramParameter(this.program, gl.DELETE_STATUS)) {
        if (this.vs) { gl.detachShader(this.program, this.vs); gl.deleteShader(this.vs); }
        if (this.fs) { gl.detachShader(this.program, this.fs); gl.deleteShader(this.fs); }
        gl.deleteProgram(this.program);
      }
    }

    setup() {
      const gl = this.gl;
      this.vs = gl.createShader(gl.VERTEX_SHADER)!;
      this.fs = gl.createShader(gl.FRAGMENT_SHADER)!;
      this.compile(this.vs, this.vertexSrc);
      this.compile(this.fs, this.shaderSource);
      this.program = gl.createProgram()!;
      gl.attachShader(this.program, this.vs);
      gl.attachShader(this.program, this.fs);
      gl.linkProgram(this.program);
      if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(this.program));
      }
    }

    init() {
      const gl = this.gl;
      const program = this.program!;
      this.buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, 'position');
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      (program as any).resolution = gl.getUniformLocation(program, 'resolution');
      (program as any).time = gl.getUniformLocation(program, 'time');
      (program as any).move = gl.getUniformLocation(program, 'move');
      (program as any).touch = gl.getUniformLocation(program, 'touch');
      (program as any).pointerCount = gl.getUniformLocation(program, 'pointerCount');
      (program as any).pointers = gl.getUniformLocation(program, 'pointers');
    }

    render(now = 0) {
      const gl = this.gl;
      const program = this.program;
      if (!program || gl.getProgramParameter(program, gl.DELETE_STATUS)) return;
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      gl.uniform2f((program as any).resolution, this.canvas.width, this.canvas.height);
      gl.uniform1f((program as any).time, now * 1e-3);
      gl.uniform2f((program as any).move, this.mouseMove[0], this.mouseMove[1]);
      gl.uniform2f((program as any).touch, this.mouseCoords[0], this.mouseCoords[1]);
      gl.uniform1i((program as any).pointerCount, this.nbrOfPointers);
      gl.uniform2fv((program as any).pointers, this.pointerCoords);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  }

  class PointerHandler {
    scale: number;
    active = false;
    pointers = new Map<number, number[]>();
    lastCoords = [0, 0];
    moves = [0, 0];

    constructor(element: HTMLCanvasElement, scale: number) {
      this.scale = scale;
      const map = (element: HTMLCanvasElement, scale: number, x: number, y: number) => 
        [x * scale, element.height - y * scale];
      element.addEventListener('pointerdown', (e) => {
        this.active = true;
        this.pointers.set(e.pointerId, map(element, this.getScale(), e.clientX, e.clientY));
      });
      element.addEventListener('pointerup', (e) => {
        if (this.count === 1) this.lastCoords = this.first;
        this.pointers.delete(e.pointerId);
        this.active = this.pointers.size > 0;
      });
      element.addEventListener('pointerleave', (e) => {
        if (this.count === 1) this.lastCoords = this.first;
        this.pointers.delete(e.pointerId);
        this.active = this.pointers.size > 0;
      });
      element.addEventListener('pointermove', (e) => {
        if (!this.active) return;
        this.lastCoords = [e.clientX, e.clientY];
        this.pointers.set(e.pointerId, map(element, this.getScale(), e.clientX, e.clientY));
        this.moves = [this.moves[0] + e.movementX, this.moves[1] + e.movementY];
      });
    }
    getScale() { return this.scale; }
    updateScale(scale: number) { this.scale = scale; }
    get count() { return this.pointers.size; }
    get move() { return this.moves; }
    get coords() { return this.pointers.size > 0 ? Array.from(this.pointers.values()).flat() : [0, 0]; }
    get first() { return this.pointers.values().next().value || this.lastCoords; }
  }

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const dpr = Math.max(1, 0.5 * window.devicePixelRatio);
    rendererRef.current = new WebGLRenderer(canvas, dpr);
    pointersRef.current = new PointerHandler(canvas, dpr);
    rendererRef.current.setup();
    rendererRef.current.init();
    
    const resize = () => {
      if (!canvasRef.current) return;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      if (rendererRef.current) rendererRef.current.updateScale(dpr);
    };
    resize();

    const loop = (now: number) => {
      if (!rendererRef.current || !pointersRef.current) return;
      rendererRef.current.updateMouse(pointersRef.current.first);
      rendererRef.current.updatePointerCount(pointersRef.current.count);
      rendererRef.current.updatePointerCoords(pointersRef.current.coords);
      rendererRef.current.updateMove(pointersRef.current.move);
      rendererRef.current.render(now);
      animationFrameRef.current = requestAnimationFrame(loop);
    };
    loop(0);
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (rendererRef.current) rendererRef.current.reset();
    };
  }, []);

  return canvasRef;
};

const Hero: React.FC<HeroProps> = ({ trustBadge, headline, subtitle, buttons, className = "" }) => {
  const canvasRef = useShaderBackground();

  return (
    <div className={`relative w-full h-screen overflow-hidden bg-black ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-contain touch-none" />
      
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white bg-black/20 pointer-events-none">
        <div className="pointer-events-auto flex flex-col items-center">
          {trustBadge && (
            <div className="mb-8 animate-fade-in-down opacity-0" style={{animationDelay: '0ms', animationFillMode: 'forwards'}}>
              <div className="flex items-center gap-2 px-6 py-2 bg-slate-900/40 backdrop-blur-md border border-indigo-500/30 rounded-full text-sm">
                <span className="text-indigo-200 tracking-widest uppercase text-xs font-bold font-mono">{trustBadge.text}</span>
              </div>
            </div>
          )}

          <div className="text-center space-y-4 max-w-5xl mx-auto px-4">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-display bg-gradient-to-br from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent drop-shadow-2xl opacity-0 animate-fade-in-up" style={{animationDelay: '200ms', animationFillMode: 'forwards'}}>
              {headline.line1}
            </h1>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-display bg-gradient-to-r from-indigo-300 via-cyan-300 to-white bg-clip-text text-transparent drop-shadow-2xl opacity-0 animate-fade-in-up" style={{animationDelay: '400ms', animationFillMode: 'forwards'}}>
              {headline.line2}
            </h1>
            
            <div className="max-w-2xl mx-auto opacity-0 animate-fade-in-up" style={{animationDelay: '600ms', animationFillMode: 'forwards'}}>
              <p className="text-lg md:text-xl text-indigo-100/80 font-light leading-relaxed font-sans mt-6">
                {subtitle}
              </p>
            </div>
            
            {buttons?.primary && (
              <div className="mt-12 opacity-0 animate-fade-in-up" style={{animationDelay: '800ms', animationFillMode: 'forwards'}}>
                <button 
                  onClick={buttons.primary.onClick}
                  className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-full transition-all duration-300 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-cyan-600 opacity-80 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute inset-0 blur-xl bg-indigo-500/50 group-hover:bg-indigo-400/60 transition-colors"></div>
                  <span className="relative text-white font-semibold text-lg tracking-wide flex items-center gap-2">
                    {buttons.primary.text}
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 1s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-fade-in-down { animation: fade-in-down 1s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

export default Hero;