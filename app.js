import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/controls/OrbitControls.js';
import { VRButton } from 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/webxr/VRButton.js';
import { RoundedBoxGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/geometries/RoundedBoxGeometry.js';

const sceneEl = document.querySelector('#scene');
const loadState = document.querySelector('#loadState');
const viewLabel = document.querySelector('#viewLabel');

// Surface startup failures in the page instead of leaving an unexplained empty viewport.
window.addEventListener('error', (event) => {
  if (loadState) loadState.textContent = '3D ERROR — CHECK CONSOLE';
  console.error('Datamath 3D startup/runtime error:', event.error || event.message);
});
window.addEventListener('unhandledrejection', (event) => {
  if (loadState) loadState.textContent = '3D MODULE ERROR — CHECK CONNECTION';
  console.error('Datamath 3D module error:', event.reason);
});
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(sceneEl.clientWidth, sceneEl.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.xr.enabled = true;
sceneEl.appendChild(renderer.domElement);

const world = new THREE.Scene();
world.background = null;
// Orthographic projection keeps proportions stable for reference-style inspection views.
const viewHeight = 6.4;
const camera = new THREE.OrthographicCamera(-viewHeight * sceneEl.clientWidth / sceneEl.clientHeight / 2, viewHeight * sceneEl.clientWidth / sceneEl.clientHeight / 2, viewHeight / 2, -viewHeight / 2, .1, 100);
// Front-on view: the face normal is +Y and the calculator's top is +Z.
// Keeping the camera on +Y removes the accidental 180-degree/upside-down projection.
const initialCamera = new THREE.Vector3(0, 9.5, 0.15);
camera.up.set(0, 0, 1);
camera.position.copy(initialCamera);
camera.lookAt(0, 0, 0);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.dampingFactor = .06;
// OrthographicCamera zoom is controlled by minZoom/maxZoom, not camera distance.
controls.minZoom = 0.7;
controls.maxZoom = 2.4;
controls.maxPolarAngle = Math.PI; // Permit an exact rear/bottom orthographic inspection view.

const ambientLight = new THREE.HemisphereLight(0xffe4c0, 0x21170f, 2.0); world.add(ambientLight);
const keyLight = new THREE.DirectionalLight(0xffe1b7, 3.0);
keyLight.position.set(-4, 8, 5); keyLight.castShadow = true; keyLight.shadow.mapSize.set(1024, 1024); world.add(keyLight);
const rimLight = new THREE.DirectionalLight(0xff543c, 1.4); rimLight.position.set(4, 5, -5); world.add(rimLight);
const fillLight = new THREE.PointLight(0xb4c5ff, .65, 20); fillLight.position.set(4, 3, 4); world.add(fillLight);

const mat = (color, roughness=.65, metalness=0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
// Fine procedural molded-plastic grain, generated locally without external texture downloads.
function makePlasticGrain(){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
  const ctx=canvas.getContext('2d');
  ctx.fillStyle='#d8d8d8';ctx.fillRect(0,0,256,256);
  for(let i=0;i<6200;i++){
    const v=150+Math.floor(Math.random()*95);
    ctx.fillStyle='rgba('+v+','+v+','+v+','+(Math.random()*.16)+')';
    ctx.fillRect(Math.random()*256,Math.random()*256,1+Math.random()*2,1);
  }
  const texture=new THREE.CanvasTexture(canvas);
  texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
  texture.repeat.set(2.5,3.5);
  texture.colorSpace=THREE.SRGBColorSpace;
  return texture;
}
const plasticGrain=makePlasticGrain();
const bodyMat = new THREE.MeshPhysicalMaterial({ color:'#c6ad83', map:plasticGrain, roughness:.36, metalness:0, bumpMap:plasticGrain, bumpScale:.012, clearcoat:.24, clearcoatRoughness:.42 });
const edgeMat = new THREE.MeshPhysicalMaterial({ color:'#947957', map:plasticGrain, roughness:.39, metalness:0, bumpMap:plasticGrain, bumpScale:.01, clearcoat:.18, clearcoatRoughness:.46 });
const darkMat = new THREE.MeshPhysicalMaterial({ color:'#382a20', roughness:.38, metalness:0, clearcoat:.15, clearcoatRoughness:.4 });
const keyMat = new THREE.MeshPhysicalMaterial({ color:'#5a402b', roughness:.32, metalness:0, clearcoat:.28, clearcoatRoughness:.32 });
const keyTopMat = new THREE.MeshPhysicalMaterial({ color:'#77784f', roughness:.35, metalness:0, clearcoat:.24, clearcoatRoughness:.35 });
const orangeKeyMat = new THREE.MeshPhysicalMaterial({color:'#d76a2c',roughness:.34,clearcoat:.22,clearcoatRoughness:.34});
const inkMat = mat('#38281b', .65);
const ledMat = new THREE.MeshBasicMaterial({ color:'#ff2418',depthTest:false,toneMapped:false });
const ledBaseColor = new THREE.Color('#ff2418');
const ledOffMat = new THREE.MeshBasicMaterial({ color:'#32100e',depthTest:false,toneMapped:false });
const lensMat = new THREE.MeshBasicMaterial({ color:'#160807', depthWrite:true, depthTest:true });
const whiteMat = mat('#e5d3b2', .5);
function makeWoodTexture(){
 const c=document.createElement('canvas');c.width=1024;c.height=1024;const g=c.getContext('2d');
 const base=g.createLinearGradient(0,0,1024,0);base.addColorStop(0,'#28170e');base.addColorStop(.22,'#694125');base.addColorStop(.48,'#3b2415');base.addColorStop(.7,'#765033');base.addColorStop(1,'#321d11');g.fillStyle=base;g.fillRect(0,0,1024,1024);
 for(let i=0;i<150;i++){const y=Math.random()*1024,a=2+Math.random()*12,p=Math.random()*6.28;g.beginPath();g.moveTo(0,y);for(let x=0;x<=1024;x+=32)g.lineTo(x,y+Math.sin(x*.012+p)*a+Math.sin(x*.047+p)*a*.25);g.strokeStyle=i%3===0?'rgba(20,10,5,.34)':i%3===1?'rgba(210,151,91,.15)':'rgba(8,5,3,.18)';g.lineWidth=1+Math.random()*5;g.stroke();}
 const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3,3);t.colorSpace=THREE.SRGBColorSpace;return t;
}
const woodMat = new THREE.MeshStandardMaterial({color:'#b18a61',map:makeWoodTexture(),roughness:.78});
const ground = new THREE.Mesh(new THREE.PlaneGeometry(200,200), woodMat);
// PlaneGeometry starts in XY with a +Z normal. Rotate it so its visible face points up (+Y).
ground.rotation.x = -Math.PI / 2;
// Keep the floor just below the rubber feet so the calculator does not appear to float.
ground.position.y = -.30;
ground.receiveShadow = true;
world.add(ground);
const calculator = new THREE.Group(); world.add(calculator);
const pickables=[];
function roundedBox(w,h,d,r,material,parent,x=0,y=0,z=0){
  // BeveledEdges are represented with small bevels on a BoxGeometry for broad compatibility.
  const radius=Math.max(0.001,Math.min(r, w/2-0.002, h/2-0.002, d/2-0.002));
  const mesh=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,3,radius),material);
  mesh.position.set(x,y,z); mesh.castShadow=true; mesh.receiveShadow=true; parent.add(mesh); return mesh;
}
function cylinder(radius,height,material,parent,x,y,z,segments=24){
  const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,height,segments),material);
  mesh.position.set(x,y,z); mesh.castShadow=true; parent.add(mesh); return mesh;
}
// Rebuilt TI-2500-inspired model from a clean, consistent coordinate layout.
// Face points upward (+Y); the calculator's top is +Z, so the order is:
// wordmark -> red LED window -> keypad. All face parts share the same surface plane.
roundedBox(3.28,.48,4.02,.19,edgeMat,calculator,0,0,0);
roundedBox(3.17,.38,3.91,.16,bodyMat,calculator,0,.19,0);

// Thin raised bezel surrounding the LED window.
roundedBox(2.63,.075,.78,.065,edgeMat,calculator,0,.405,.88);
roundedBox(2.48,.022,.61,.035,mat('#160a08',.24),calculator,0,.449,.88);
roundedBox(2.54,.09,.12,.04,bodyMat,calculator,0,.445,1.20);
roundedBox(.12,.09,.68,.04,bodyMat,calculator,-1.22,.445,.88);
roundedBox(.12,.09,.68,.04,bodyMat,calculator,1.22,.445,.88);

// Seven-segment LED digits. Segments are attached just above the display lens.
const segments={0:['a','b','c','d','e','f'],1:['b','c'],2:['a','b','g','e','d'],3:['a','b','g','c','d'],4:['f','g','b','c'],5:['a','f','g','c','d'],6:['a','f','g','e','c','d'],7:['a','b','c'],8:['a','b','c','d','e','f','g'],9:['a','b','c','d','f','g'],'-':['g'],E:['a','f','g','e','d'],e:['a','b','g','e','d'],r:['g','e'],o:['g','e','c','d']};
const digitGroups=[];
function makeDigit(x){
 const group=new THREE.Group();group.position.set(x,.467,.88);calculator.add(group);
 const specs={a:[0,.12,.145,.026],g:[0,0,.145,.026],d:[0,-.12,.145,.026],f:[.075,.06,.026,.095],b:[-.075,.06,.026,.095],e:[.075,-.06,.026,.095],c:[-.075,-.06,.026,.095],dot:[-.095,-.13,.022,.022]};
 for(const [name,[sx,sz,sw,sh]] of Object.entries(specs)){
   const mesh=new THREE.Mesh(new THREE.BoxGeometry(sw,.008,sh),ledOffMat);
   mesh.position.set(sx,0,sz);mesh.renderOrder=20;group.add(mesh);group.userData[name]=mesh;
 }
 digitGroups.push(group);
}
// Keep the numeral row aligned toward the right, like the live 2D calculator display.
// Camera-right runs opposite world X in this front-facing view, so reverse the digit-group order.
for(let i=0;i<8;i++)makeDigit(.97-i*.26);
// Soft, additive ruby-red halo behind the seven-segment display.
function makeLedGlowTexture(){
 const canvas=document.createElement('canvas');canvas.width=256;canvas.height=128;
 const ctx=canvas.getContext('2d');
 const gradient=ctx.createRadialGradient(128,64,3,128,64,62);
 gradient.addColorStop(0,'rgba(255,25,10,0.72)');
 gradient.addColorStop(.28,'rgba(255,22,8,0.35)');
 gradient.addColorStop(.62,'rgba(255,18,6,0.12)');
 gradient.addColorStop(1,'rgba(255,0,0,0)');
 ctx.fillStyle=gradient;ctx.fillRect(0,0,256,128);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 return texture;
}
const ledGlow=new THREE.Sprite(new THREE.SpriteMaterial({
 map:makeLedGlowTexture(),color:0xff2a16,transparent:true,opacity:.88,
 blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false,toneMapped:false
}));
ledGlow.position.set(0,.477,.88);ledGlow.scale.set(2.8,.92,1);ledGlow.renderOrder=18;calculator.add(ledGlow);
const ledLight=new THREE.PointLight(0xff1b0b,1.7,3.4,2);
ledLight.position.set(0,.66,.88);calculator.add(ledLight);
function makeTableReflectionTexture(){
 const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;
 const ctx=canvas.getContext('2d');
 const gradient=ctx.createRadialGradient(128,128,8,128,128,126);
 gradient.addColorStop(0,'rgba(255,25,8,0.22)');gradient.addColorStop(.28,'rgba(255,20,7,0.12)');
 gradient.addColorStop(.62,'rgba(255,15,4,0.045)');gradient.addColorStop(1,'rgba(255,0,0,0)');
 ctx.fillStyle=gradient;ctx.fillRect(0,0,256,256);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}
const tableReflection=new THREE.Mesh(new THREE.PlaneGeometry(4.5,4.5),
 new THREE.MeshBasicMaterial({map:makeTableReflectionTexture(),transparent:true,opacity:.9,
 blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));
tableReflection.rotation.x=-Math.PI/2;tableReflection.position.set(0,-.292,.22);tableReflection.renderOrder=2;world.add(tableReflection);

// Tiny floating phosphor sparks. Positions stay in the display's local coordinate
// space so the effect follows the calculator naturally when the model is rotated.
const sparkCount=54;
const sparkPositions=new Float32Array(sparkCount*3);
const sparkColors=new Float32Array(sparkCount*3);
const sparkLife=new Float32Array(sparkCount);
const sparkSpeed=new Float32Array(sparkCount);
const sparkGeometry=new THREE.BufferGeometry();
function respawnSpark(i,initial=false){
 const k=i*3;
 sparkPositions[k]=(Math.random()-.5)*2.28;
 sparkPositions[k+1]=.49+Math.random()*.045;
 sparkPositions[k+2]=.61+Math.random()*.54;
 sparkLife[i]=initial?Math.random():0;
 sparkSpeed[i]=.12+Math.random()*.34;
 sparkColors[k]=1;
 sparkColors[k+1]=.12+Math.random()*.34;
 sparkColors[k+2]=.035+Math.random()*.08;
}
for(let i=0;i<sparkCount;i++)respawnSpark(i,true);
sparkGeometry.setAttribute('position',new THREE.BufferAttribute(sparkPositions,3));
sparkGeometry.setAttribute('color',new THREE.BufferAttribute(sparkColors,3));
const sparkMaterial=new THREE.PointsMaterial({
 size:.032,color:0xffffff,vertexColors:true,transparent:true,opacity:.84,
 blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false,sizeAttenuation:true
});
const ledSparks=new THREE.Points(sparkGeometry,sparkMaterial);
ledSparks.frustumCulled=false;ledSparks.renderOrder=22;calculator.add(ledSparks);
// LED Studio preset and live controls.
const ledStudio={style:'cinematic',brightness:78,particles:'reactive',flicker:'subtle',reflections:true};
let displaySegmentFactor=1,darkMode=false,savedBrightness=ledStudio.brightness,ledPulse=0,lastLedFrame=0;
const environmentLights=[{light:ambientLight,normal:2.0,dark:.12},{light:keyLight,normal:3.0,dark:.16},{light:rimLight,normal:1.4,dark:.08},{light:fillLight,normal:.65,dark:.035}];
function effectiveLedBrightness(){return darkMode?1:ledStudio.brightness/100;}
function setDarkMode(enabled){
 darkMode=Boolean(enabled);
 if(darkMode){savedBrightness=ledStudio.brightness;ledStudio.brightness=100;}
 else ledStudio.brightness=savedBrightness;
 environmentLights.forEach(({light,normal,dark})=>{light.intensity=darkMode?dark:normal;});
 const toggle=document.querySelector('#darkModeToggle');
 if(toggle){toggle.setAttribute('aria-pressed',String(darkMode));toggle.textContent=darkMode?'☾ DARK MODE ON':'☼ DARK MODE OFF';}
 const slider=document.querySelector('#ledBrightness'),value=document.querySelector('#ledBrightnessValue');
 if(slider){slider.value=String(ledStudio.brightness);slider.disabled=darkMode;slider.setAttribute('aria-disabled',String(darkMode));}
 if(value)value.textContent=ledStudio.brightness+'%';
 document.documentElement.classList.toggle('datamath-dark-mode',darkMode);
 applyLedStudio();
}
function flash3DKey(action){
 if(!darkMode)return;
 const cap=keyMeshes.find(item=>item.userData.action===action);
 if(!cap||!cap.userData.top)return;
 const top=cap.userData.top;
 if(top.userData.glowTimer)clearTimeout(top.userData.glowTimer);
 if(!top.userData.originalMaterial)top.userData.originalMaterial=top.material;
 if(top.material===top.userData.originalMaterial)top.material=top.userData.originalMaterial.clone();
 top.material.emissive.set(action==='equals'?0xff6a20:0xff281b);
 top.material.emissiveIntensity=action==='equals'?2.8:2.1;
 top.userData.glowTimer=setTimeout(()=>{top.material=top.userData.originalMaterial;top.userData.glowTimer=null;},160);
}
function applyLedStudio(){
 const b=effectiveLedBrightness();
 ledMat.color.copy(ledBaseColor).multiplyScalar(b);
 const styleScale=ledStudio.style==='authentic'?.78:ledStudio.style==='clean'?.62:ledStudio.style==='futuristic'?1.18:1;
 ledGlow.scale.set(2.8*styleScale,.92*styleScale,1);
 ledGlow.material.color.set(ledStudio.style==='futuristic'?0xff4935:0xff2a16);
 ledLight.intensity=(darkMode?3.2:1.75)*b*(ledStudio.style==='cinematic'?1.12:1)*displaySegmentFactor;
 tableReflection.material.opacity=(darkMode?1.2:.9)*displaySegmentFactor;
 tableReflection.visible=ledStudio.reflections;ledLight.visible=ledStudio.reflections;
 ledSparks.visible=ledStudio.particles!=='off';
}
function triggerLedActivity(action){
 if(ledStudio.particles==='off')return;
 ledPulse=Math.min(1,ledPulse+(action==='equals'?.95:action==='clear'?.72:.36));
 if(ledStudio.particles==='reactive'){
  const count=action==='equals'?24:action==='clear'?16:9;
  for(let n=0;n<count;n++){
   const i=(Math.random()*sparkCount)|0,k=i*3;
   sparkPositions[k]=(Math.random()-.5)*2.18;sparkPositions[k+1]=.50+Math.random()*.025;
   sparkPositions[k+2]=.62+Math.random()*.50;sparkLife[i]=0;sparkSpeed[i]=.65+Math.random()*.9;
  }
 }
}
function animateLedEffects(timeMs){
 const t=timeMs*.001,dt=lastLedFrame?Math.min(.05,Math.max(0,(timeMs-lastLedFrame)*.001)):1/60;
 lastLedFrame=timeMs;
 const amount=ledStudio.flicker==='subtle'?.035:ledStudio.flicker==='vintage'?.095:0;
 const pulse=ledStudio.flicker==='off'?1:1+Math.sin(t*2.1)*amount+Math.sin(t*5.7)*amount*.32;
 ledPulse=Math.max(0,ledPulse-dt*1.9);
 const b=ledStudio.brightness/100;
 const base=ledStudio.style==='cinematic'?.9:ledStudio.style==='authentic'?.66:ledStudio.style==='clean'?.46:.95;
 ledGlow.material.opacity=Math.min(1,base*b*pulse+ledPulse*.15);
 ledLight.intensity=((darkMode?3.2:1.75)*b*pulse+ledPulse*(darkMode?1.4:.9))*displaySegmentFactor;
 tableReflection.material.opacity=(darkMode?1.2:.9)*displaySegmentFactor;
 sparkMaterial.opacity=ledStudio.particles==='ambient'?.74:ledStudio.particles==='reactive'?.24+ledPulse*.68:0;
 for(let i=0;i<sparkCount;i++){
  const k=i*3;sparkLife[i]+=sparkSpeed[i]*dt*.42;
  sparkPositions[k+2]+=(.035+sparkSpeed[i]*.12)*dt;
  sparkPositions[k]+=(Math.sin(t*2+i*1.7))*.0009;
  const twinkle=.45+.55*Math.abs(Math.sin(t*7.5+i*2.31));
  sparkColors[k]=twinkle;sparkColors[k+1]=twinkle*(.12+(i%5)*.045);
  if(sparkLife[i]>1||sparkPositions[k+2]>1.22)respawnSpark(i);
 }
 sparkGeometry.attributes.position.needsUpdate=true;sparkGeometry.attributes.color.needsUpdate=true;
}
function wireLedStudio(){
 const style=document.querySelector('#ledStyle'),brightness=document.querySelector('#ledBrightness');
 const brightnessValue=document.querySelector('#ledBrightnessValue'),particles=document.querySelector('#ledParticles');
 const flicker=document.querySelector('#ledFlicker'),reflections=document.querySelector('#ledReflections');
 const darkToggle=document.querySelector('#darkModeToggle');
 if(!style||!brightness||!brightnessValue||!particles||!flicker||!reflections||!darkToggle)return;
 style.value=ledStudio.style;brightness.value=String(ledStudio.brightness);
 particles.value=ledStudio.particles;flicker.value=ledStudio.flicker;reflections.checked=ledStudio.reflections;
 brightnessValue.textContent=ledStudio.brightness+'%';
 style.addEventListener('change',()=>{ledStudio.style=style.value;applyLedStudio();});
 brightness.addEventListener('input',()=>{ledStudio.brightness=Number(brightness.value);brightnessValue.textContent=ledStudio.brightness+'%';applyLedStudio();});
 particles.addEventListener('change',()=>{ledStudio.particles=particles.value;applyLedStudio();});
 flicker.addEventListener('change',()=>{ledStudio.flicker=flicker.value;applyLedStudio();});
 reflections.addEventListener('change',()=>{ledStudio.reflections=reflections.checked;applyLedStudio();});
 darkToggle.addEventListener('click',()=>setDarkMode(!darkMode));
 applyLedStudio();
}
function setLed(text){
 const raw=String(text).slice(0,16),clean=raw.replace(/\./g,'').slice(-8),chars=clean.padStart(8,' ');
 const litSegments=chars.split('').reduce((total,ch)=>total+(segments[ch]||[]).length,0)+(raw.includes('.')?1:0);
 displaySegmentFactor=.68+.32*(litSegments/56);
 const decimalDigits=raw.includes('.')?raw.slice(0,raw.indexOf('.')).replace(/\./g,'').length:-1;
 const dotSlot=decimalDigits>0?8-clean.length+decimalDigits-1:-1;
 digitGroups.forEach((g,i)=>Object.entries(g.userData).forEach(([name,mesh])=>{
  const ch=chars[i]||' ',on=name==='dot'?i===dotSlot:(segments[ch]||[]).includes(name);
  mesh.material=on?ledMat:ledOffMat;
 }));
}

// Branding printed above the display, oriented to read correctly from above.
function textSprite(text,opts={}){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;
 const ctx=canvas.getContext('2d');ctx.clearRect(0,0,512,128);
 ctx.fillStyle=opts.color||'#24180f';ctx.font=opts.font||'bold 34px Arial';
 ctx.textAlign='center';ctx.textBaseline='middle';
 // These labels sit on planes whose normals point away from the default camera.
 // Only flip horizontally to compensate for the back-side view; keep glyphs upright.
 if(opts.flipX===false){
   ctx.fillText(text,256,64);
 }else{
   ctx.save();ctx.translate(512,0);ctx.scale(-1,1);ctx.fillText(text,256,64);ctx.restore();
 }
 const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
 const material=new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,side:THREE.DoubleSide,toneMapped:false});
 return new THREE.Mesh(new THREE.PlaneGeometry(opts.w||1.4,opts.h||.25),material);
}
const tiText=textSprite('Texas Instruments',{w:1.18,h:.19,font:'900 44px Arial'});
tiText.rotation.x=Math.PI/2;tiText.position.set(-.55,.405,1.61);calculator.add(tiText);
const modelText=textSprite('DATAMATH',{w:.78,h:.16,font:'900 42px Arial'});
modelText.rotation.x=Math.PI/2;modelText.position.set(.91,.405,1.61);calculator.add(modelText);

// Recessed keypad panel, with evenly spaced rows and generous margins.
roundedBox(2.76,.065,2.42,.085,darkMat,calculator,0,.405,-.67);
const keys=[
 ['CE/D','ce',1,1],['÷','op:/',1,2],['×','op:*',1,3],['C','clear',1,4],
 ['7','num:7',2,1],['8','num:8',2,2],['9','num:9',2,3],['−','op:-',2,4],
 ['4','num:4',3,1],['5','num:5',3,2],['6','num:6',3,3],['+','op:+',3,4],
 ['1','num:1',4,1],['2','num:2',4,2],['3','num:3',4,3],
 ['0','num:0',5,1],['.','decimal',5,3],['=','equals',5,4]
];
const keyMeshes=[];
const keyX=[-.91,-.305,.305,.91];
keys.forEach(([label,action,row,col])=>{
 const isZero=label==='0',isEquals=label==='=',isFunction=['CE/D','C','÷','×','−','+'].includes(label);
 const x=isZero?-.605:keyX[col-1],z=.20-(row-1)*.455;
 const cap=new THREE.Group();cap.position.set(x,.455,z);calculator.add(cap);
 const width=isZero?1.08:.47,depth=.375;
 roundedBox(width+.045,.06,depth+.04,.035,edgeMat,cap,0,.005,0);
 const faceMat=isEquals?orangeKeyMat:isFunction?keyTopMat:whiteMat;
 const top=roundedBox(width,.095,depth,.045,faceMat,cap,0,.045,0);
 const face=textSprite(label,{w:isZero ? .98 : .43,h:.23,font:label.length>2?'900 82px Arial':'900 150px Arial',color:'#080604'});
 face.rotation.x=Math.PI/2;face.position.set(0,.096,0);face.renderOrder=30;cap.add(face);
 cap.userData={label,action,homeY:.455,top};top.userData.key=cap;pickables.push(top);keyMeshes.push(cap);
});

// Battery cover and rear details are kept below the face and do not intrude into the keypad.
roundedBox(1.55,.035,1.22,.035,darkMat,calculator,0,-.245,-1.20);
const hatch=roundedBox(1.78,.055,1.43,.035,bodyMat,calculator,0,-.205,-1.20);
hatch.visible=false;hatch.userData.hatch=true;
const hatchLabel=textSprite('BATTERY COMPARTMENT',{w:1.25,h:.15,font:'bold 18px Arial',flipX:false});
hatchLabel.position.set(0,-.18,-1.20);hatchLabel.rotation.x=Math.PI/2;hatchLabel.visible=false;calculator.add(hatchLabel);
const batteryGroup=new THREE.Group();calculator.add(batteryGroup);
for(let i=0;i<2;i++){
 const battery=cylinder(.16,.78,mat(i?'#c8c9bd':'#d5c7a4',.32,.2),batteryGroup,i?.35:-.35,-.16,-1.20,28);
 battery.rotation.z=Math.PI/2;
}
const feetMat=mat('#59432f');
for(const x of [-1.18,1.18])for(const z of [-1.58,1.58])roundedBox(.34,.075,.26,.025,feetMat,calculator,x,-.25,z);
let hatchOpen=false;
function toggleHatch(){
 hatchOpen=!hatchOpen;hatch.visible=!hatchOpen;hatchLabel.visible=hatchOpen;batteryGroup.visible=hatchOpen;
 hatch.position.y=hatchOpen?-.32:-.205;
 loadState.textContent=hatchOpen?'BATTERY BAY OPEN':'MODEL READY';
}
document.querySelector('#batteryButton').addEventListener('click',toggleHatch);

let soundEnabled=true,audioCtx=null;
function clickSound(freq=780,duration=.055){
 if(!soundEnabled)return;
 try{
  audioCtx ||= new (window.AudioContext||window.webkitAudioContext)();
  if(audioCtx.state==='suspended')audioCtx.resume();
  const now=audioCtx.currentTime;
  // A soft mechanical thunk plus a crisp, short plastic-key tick.
  const body=audioCtx.createOscillator(),bodyGain=audioCtx.createGain();
  body.type='triangle';body.frequency.setValueAtTime(175,now);body.frequency.exponentialRampToValueAtTime(82,now+.045);
  bodyGain.gain.setValueAtTime(.0001,now);bodyGain.gain.exponentialRampToValueAtTime(.11,now+.003);bodyGain.gain.exponentialRampToValueAtTime(.0001,now+duration);
  body.connect(bodyGain);bodyGain.connect(audioCtx.destination);body.start(now);body.stop(now+duration+.005);
  const length=Math.max(1,Math.floor(audioCtx.sampleRate*.018));
  const buffer=audioCtx.createBuffer(1,length,audioCtx.sampleRate),data=buffer.getChannelData(0);
  for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*(1-i/length);
  const noise=audioCtx.createBufferSource(),filter=audioCtx.createBiquadFilter(),tickGain=audioCtx.createGain();
  noise.buffer=buffer;filter.type='highpass';filter.frequency.value=1800;
  tickGain.gain.setValueAtTime(.0001,now);tickGain.gain.exponentialRampToValueAtTime(.045,now+.001);tickGain.gain.exponentialRampToValueAtTime(.0001,now+.018);
  noise.connect(filter);filter.connect(tickGain);tickGain.connect(audioCtx.destination);noise.start(now);noise.stop(now+.02);
 }catch(e){/* Audio is an enhancement; calculator remains usable if blocked. */}
}
document.querySelector('#soundToggle').addEventListener('click',e=>{soundEnabled=!soundEnabled;e.currentTarget.textContent=soundEnabled?'♫ SOUND ON':'♫ SOUND OFF';e.currentTarget.setAttribute('aria-pressed',String(soundEnabled));if(soundEnabled)clickSound(950,.06);});

// Arithmetic state machine. It avoids eval() and handles repeated equals, decimals and divide-by-zero.
let current='0',stored=null,operator=null,waiting=false,lastOperand=null,lastOperator=null;
const display=document.querySelector('#display');
function show(){display.textContent=current;setLed(current);}
function tidy(n){if(!Number.isFinite(n))return 'Error';if(Math.abs(n)>99999999)return n.toExponential(2);return String(Number(n.toPrecision(8)));}
function calculate(a,b,op){if(op==='+')return a+b;if(op==='-')return a-b;if(op==='*')return a*b;if(op==='/')return b===0?NaN:a/b;return b;}
function press(action,label){
 clickSound(action==='equals'?520:action.startsWith('op:')?650:820,.035);
 triggerLedActivity(action);flash3DKey(action);
 if(action.startsWith('num:')){
  const n=action.slice(4);current=waiting?n:(current==='0'?n:current==='Error'?n:current+n).slice(0,12);waiting=false;
 }else if(action==='decimal'){
  if(waiting || current==='Error'){current='0.';waiting=false;}else if(!current.includes('.'))current+='.';
 }else if(action==='clear'){current='0';stored=null;operator=null;waiting=false;lastOperand=null;lastOperator=null;}
 else if(action==='ce'){current='0';waiting=false;}
 else if(action==='sign'){if(current!=='0'&&current!=='Error')current=current.startsWith('-')?current.slice(1):'-'+current;}
 else if(action.startsWith('op:')){
  const next=action.slice(3),value=Number(current==='Error'?'0':current);
  if(operator&&!waiting){current=tidy(calculate(stored,value,operator));stored=Number(current);}
  else stored=value;
  operator=next;waiting=true;lastOperator=null;
 }else if(action==='equals'){
  if(operator&&!waiting){lastOperand=Number(current);lastOperator=operator;current=tidy(calculate(stored,lastOperand,operator));stored=null;operator=null;waiting=true;}
  else if(lastOperator&&lastOperand!==null){current=tidy(calculate(Number(current),lastOperand,lastOperator));waiting=true;}
 }
 show();
}
const keypad=document.querySelector('#keypad');
keys.forEach(([label,action,row,col])=>{
 const b=document.createElement('button');
 const isFunction=['CE/D','C'].includes(label),isOperator=['÷','×','−','+'].includes(label);
 b.className='key'+(isFunction?' utility':'')+(isOperator||label==='='?' operator':'');
 b.textContent=label;b.type='button';b.setAttribute('aria-label',label==='C'?'Clear all':label);
 b.style.gridRow=String(row);b.style.gridColumn=label==='0'?'1 / span 2':String(col);
 b.addEventListener('click',()=>{press(action,label);b.classList.add('pressed');setTimeout(()=>b.classList.remove('pressed'),90);});
 keypad.appendChild(b);
});
window.addEventListener('keydown',e=>{
 if(e.metaKey||e.ctrlKey||e.altKey)return;
 const map={'Enter':'equals','=':'equals','Escape':'clear','Backspace':'ce','+':'op:+','-':'op:-','*':'op:*','/':'op:/','.':'decimal'};
 let action=map[e.key];if(/^\d$/.test(e.key))action='num:'+e.key;
 if(action){e.preventDefault();press(action,e.key);}
});
show();
wireLedStudio();

// Raycast 3D keycaps so the physical model is also pressable.
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
renderer.domElement.addEventListener('pointerdown',e=>{
 if(e.button!==0)return;
 const rect=renderer.domElement.getBoundingClientRect();
 pointer.x=((e.clientX-rect.left)/rect.width)*2-1;
 pointer.y=-((e.clientY-rect.top)/rect.height)*2+1;
 raycaster.setFromCamera(pointer,camera);
 const hit=raycaster.intersectObjects(pickables,true).find(item=>item.object.userData.key);
 if(!hit)return;
 const k=hit.object.userData.key;
 press(k.userData.action,k.userData.label);
 k.position.y=k.userData.homeY-.045;
 setTimeout(()=>{k.position.y=k.userData.homeY;},90);
});
function setOrthoView(name){
  calculator.rotation.set(0,0,0);
  camera.up.set(0,1,0);
  const positions={
    'face':new THREE.Vector3(0,10,0),
    'rear':new THREE.Vector3(0,-10,0),
    'left':new THREE.Vector3(-10,0,0),
    'right':new THREE.Vector3(10,0,0),
    'top':new THREE.Vector3(0,0,10),
    'bottom':new THREE.Vector3(0,0,-10)
  };
  // Keep the top of the calculator (+Z) at the top of the screen in the face view.
  if(name==='face'||name==='rear') camera.up.set(0,0,name==='face'?1:-1);
  if(name==='top'||name==='bottom') camera.up.set(0,1,0);
  camera.position.copy(positions[name]);
  camera.zoom=1;camera.updateProjectionMatrix();
  controls.target.set(0,0,0);controls.update();
  viewLabel.textContent=({face:'FACE · ORTHO',rear:'REAR · ORTHO',left:'LEFT · ORTHO',right:'RIGHT · ORTHO',top:'TOP EDGE · ORTHO',bottom:'BOTTOM EDGE · ORTHO'})[name];
}
function resetView(){
 camera.up.set(0,0,1);camera.position.copy(initialCamera);camera.lookAt(0,0,0);camera.zoom=1;camera.updateProjectionMatrix();
 controls.target.set(0,0,0);controls.update();calculator.rotation.set(0,0,0);viewLabel.textContent='3D ORBIT VIEW';
}
document.querySelector('#homeView').addEventListener('click',resetView);
document.querySelectorAll('[data-orbit]').forEach(button=>button.addEventListener('click',()=>{
 const step=Math.PI/12;
 if(button.dataset.orbit==='left')controls.rotateLeft(step);
 if(button.dataset.orbit==='right')controls.rotateLeft(-step);
 if(button.dataset.orbit==='up')controls.rotateUp(step);
 if(button.dataset.orbit==='down')controls.rotateUp(-step);
 controls.update();viewLabel.textContent='3D ORBIT VIEW';
}));
const vrButton=VRButton.createButton(renderer);vrButton.id='threeVrButton';vrButton.style.display='none';document.body.appendChild(vrButton);
if('xr' in navigator){navigator.xr.isSessionSupported('immersive-vr').then(ok=>{const b=document.querySelector('#vrButton');if(ok){b.disabled=false;b.innerHTML='◇ <span>ENTER VR</span>';b.addEventListener('click',()=>vrButton.click());}else{b.disabled=true;b.innerHTML='◇ <span>VR UNAVAILABLE</span>';}}).catch(()=>{});}
function resize(){const w=sceneEl.clientWidth,h=sceneEl.clientHeight;if(!w||!h)return;const aspect=w/h;camera.left=-viewHeight*aspect/2;camera.right=viewHeight*aspect/2;camera.top=viewHeight/2;camera.bottom=-viewHeight/2;camera.updateProjectionMatrix();renderer.setSize(w,h);}
new ResizeObserver(resize).observe(sceneEl);
renderer.setAnimationLoop((time)=>{
  controls.update();
  animateLedEffects(time);
  renderer.render(world,camera);
});
loadState.textContent='MODEL READY';