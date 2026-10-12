import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/controls/OrbitControls.js';
import { VRButton } from 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/webxr/VRButton.js';
import { RoundedBoxGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/geometries/RoundedBoxGeometry.js';

const sceneEl = document.querySelector('#scene');
const loadState = document.querySelector('#loadState');
const viewLabel = document.querySelector('#viewLabel');
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
// The keypad/branding run along the Z axis: positive Z is the top of the face.
// View from the opposite Z end so the calculator reads upright (brand, display, keys).
const initialCamera = new THREE.Vector3(0, 5.4, -9.5);
camera.position.copy(initialCamera);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.dampingFactor = .06;
controls.minDistance = 5;
controls.maxDistance = 16;
controls.maxPolarAngle = Math.PI; // Permit an exact rear/bottom orthographic inspection view.

world.add(new THREE.HemisphereLight(0xffe4c0, 0x21170f, 2.0));
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
const ledMat = new THREE.MeshBasicMaterial({ color:'#ff382c',depthTest:false,toneMapped:false });
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
const ground = new THREE.Mesh(new THREE.PlaneGeometry(200,200), woodMat); ground.rotation.x=-Math.PI/2; ground.position.y=-.42; ground.receiveShadow=true; world.add(ground);
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
// TI-2500-inspired shell: the working face points toward +Y.
roundedBox(3.30,.54,3.95,.18,edgeMat,calculator,0,0,0);
roundedBox(3.20,.42,3.85,.16,bodyMat,calculator,0,.20,0);
// Inset dark keyboard surround.
roundedBox(2.72,.065,2.35,.09,darkMat,calculator,0,.435,-.66);
// Deep hooded LED well. The dark floor is recessed under the shell surface.
roundedBox(2.82,.105,1.12,.07,edgeMat,calculator,0,.405,.91);
roundedBox(2.62,.018,.79,.035,mat('#160d0a',.22),calculator,0,.414,.91);
// Sculpted side cheeks, thick brow and front lip make a molded hood with a deep shadow line.
roundedBox(.20,.23,1.12,.075,bodyMat,calculator,-1.27,.49,.91);
roundedBox(.20,.23,1.12,.075,bodyMat,calculator,1.27,.49,.91);
roundedBox(2.60,.20,.24,.075,bodyMat,calculator,0,.555,1.36);
roundedBox(2.60,.16,.19,.06,edgeMat,calculator,0,.525,.43);
// Clear, low-opacity lens over the recessed segments catches a subtle highlight.
roundedBox(2.48,.018,.57,.025,lensMat,calculator,0,.433,.91);
// LED segments are rendered on top of the lens for reliable visibility across browsers.
// LED segments: actual lit segment geometry, driven from calculator value.
const segments={0:['a','b','c','d','e','f'],1:['b','c'],2:['a','b','g','e','d'],3:['a','b','g','c','d'],4:['f','g','b','c'],5:['a','f','g','c','d'],6:['a','f','g','e','c','d'],7:['a','b','c'],8:['a','b','c','d','e','f','g'],9:['a','b','c','d','f','g'],'-':['g'],E:['a','f','g','e','d'],e:['a','b','g','e','d'],r:['g','e'],o:['g','e','c','d']};
const digitGroups=[];
function makeDigit(x){
 const group=new THREE.Group(); group.position.set(x,.451,.91); calculator.add(group);
 const specs={a:[0,.15,.17,.035],g:[0,0,.17,.035],d:[0,-.15,.17,.035],f:[-.09,.075,.035,.12],b:[.09,.075,.035,.12],e:[-.09,-.075,.035,.12],c:[.09,-.075,.035,.12],dot:[.105,-.16,.025,.025]};
 for(const [name,[sx,sy,sw,sh]] of Object.entries(specs)){
   const s=new THREE.Mesh(new THREE.BoxGeometry(sw,.009,sh),new THREE.MeshBasicMaterial({color:0x32100e,transparent:true,depthWrite:false,depthTest:false,toneMapped:false}));
   s.position.set(sx,0,sy); s.renderOrder=50; group.add(s); group.userData[name]=s;
 }
 digitGroups.push(group); return group;
}
for(let i=0;i<8;i++)makeDigit(-.98+i*.28);
// A small red scatter suggests light refracting through the lens, with no expensive post-processing.
const ledDustCount=22;
const ledDustGeometry=new THREE.BufferGeometry();
const ledDustPositions=new Float32Array(ledDustCount*3);
const ledDustPhases=new Float32Array(ledDustCount);
for(let i=0;i<ledDustCount;i++){
  ledDustPositions[i*3]=(Math.random()-.5)*1.95;
  ledDustPositions[i*3+1]=.458+Math.random()*.025;
  ledDustPositions[i*3+2]=.91+(Math.random()-.5)*.53;
  ledDustPhases[i]=Math.random()*Math.PI*2;
}
ledDustGeometry.setAttribute('position',new THREE.BufferAttribute(ledDustPositions,3));
const ledDust=new THREE.Points(ledDustGeometry,new THREE.PointsMaterial({color:0xff5946,size:.018,transparent:true,opacity:.38,blending:THREE.AdditiveBlending,depthWrite:false,sizeAttenuation:true}));
calculator.add(ledDust);
// A tiny generated sprite gives the LED area a soft halo without a costly bloom pass.
const glowCanvas=document.createElement('canvas');glowCanvas.width=glowCanvas.height=64;
const glowCtx=glowCanvas.getContext('2d');
const glowGradient=glowCtx.createRadialGradient(32,32,1,32,32,31);
glowGradient.addColorStop(0,'rgba(255,48,30,.38)');glowGradient.addColorStop(.35,'rgba(255,40,25,.12)');glowGradient.addColorStop(1,'rgba(255,30,20,0)');
glowCtx.fillStyle=glowGradient;glowCtx.fillRect(0,0,64,64);
const glowTexture=new THREE.CanvasTexture(glowCanvas);
const ledGlow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture,color:0xff4b32,transparent:true,opacity:.32,blending:THREE.AdditiveBlending,depthWrite:false}));
ledGlow.position.set(0,.465,.91);ledGlow.scale.set(2.45,.63,1);calculator.add(ledGlow);
function setLed(text){
  // Right-align digits and attach each decimal point to the preceding digit.
  const raw=String(text).slice(0,16);
  const clean=raw.replace(/\./g,'').slice(-8);
  const chars=clean.padStart(8,' ');
  const decimalDigits=raw.includes('.')?raw.slice(0,raw.indexOf('.')).replace(/\./g,'').length:-1;
  const dotSlot=decimalDigits>0?8-clean.length+decimalDigits-1:-1;
  digitGroups.forEach((g,i)=>Object.entries(g.userData).forEach(([name,mesh])=>{
    const ch=chars[i]||' ';
    const on=name==='dot'?i===dotSlot:(segments[ch]||[]).includes(name);
    mesh.material=on?ledMat:ledOffMat;mesh.material.depthTest=false;mesh.material.depthWrite=false;mesh.material.transparent=true;mesh.material.toneMapped=false;mesh.renderOrder=50;
  }));
}
// Small printed wordmark and model text on the face.
function textSprite(text,opts={}){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;
 const ctx=canvas.getContext('2d');ctx.clearRect(0,0,512,128);ctx.fillStyle=opts.color||'#3c2a1b';
 ctx.font=opts.font||'bold 34px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,64);
 const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
 const m=new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,depthTest:false,side:THREE.DoubleSide,toneMapped:false});
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(opts.w||1.4,opts.h||.3),m);mesh.renderOrder=30;return mesh;
}
// Printed branding lies flat on the front face (+Y), so it remains readable in 3D.
const tiText=textSprite('Texas Instruments',{w:1.25,h:.17,font:'bold 23px Arial',color:'#392b1d'});
tiText.rotation.x=-Math.PI/2;tiText.position.set(-.53,.424,1.72);calculator.add(tiText);
const modelText=textSprite('DATAMATH',{w:.78,h:.15,font:'bold 23px Arial',color:'#392b1d'});
modelText.rotation.x=-Math.PI/2;modelText.position.set(.94,.424,1.72);calculator.add(modelText);
// Eighteen keys in a TI-2500-style 4-column layout. Equals is orange at bottom-right.
const keys=[
 ['CE/D','ce',1,1],['÷','op:/',1,2],['×','op:*',1,3],['C','clear',1,4],
 ['7','num:7',2,1],['8','num:8',2,2],['9','num:9',2,3],['−','op:-',2,4],
 ['4','num:4',3,1],['5','num:5',3,2],['6','num:6',3,3],['+','op:+',3,4],
 ['1','num:1',4,1],['2','num:2',4,2],['3','num:3',4,3],
 ['0','num:0',5,1],['.','decimal',5,3],['=','equals',5,4]
];
const keyMeshes=[];
const keyX=[-.90,-.30,.30,.90];
keys.forEach(([label,action,row,col])=>{
 const wideZero=label==='0',wideEquals=label==='=';
 const x=wideZero?-.60:keyX[col-1],z=.15-(row-1)*.45;
 const cap=new THREE.Group();cap.position.set(x,.46,z);calculator.add(cap);
 const width=wideZero ? 1.06 : (wideEquals ? 0.46 : 0.46),depth=0.37;
 roundedBox(width+.045,.075,depth+.04,.035,edgeMat,cap,0,-.005,0);
 const isFunction=['CE/D','C','÷','×','−','+'].includes(label);
 const capMaterial=wideEquals?orangeKeyMat:isFunction?keyTopMat:whiteMat;
 const top=roundedBox(width,.105,depth,.045,capMaterial,cap,0,.045,0);
 const darkLegend=!isFunction&&!wideEquals;
 const face=textSprite(label,{w:wideZero ? 0.98 : 0.43,h:wideZero ? 0.25 : 0.25,font:label.length>2?'900 30px Arial':'900 58px Arial',color:'#080604'});
 face.rotation.x=-Math.PI/2;face.position.set(0,.114,0);face.renderOrder=60;cap.add(face);
 cap.userData={label,action,homeY:.46};pickables.push(top);top.userData.key=cap;keyMeshes.push(cap);
});
const hatchGroup=new THREE.Group();calculator.add(hatchGroup);
roundedBox(1.55,.04,1.3,.03,darkMat,hatchGroup,0,-.245,-1.15);
for(let i=0;i<2;i++){
 const battery=cylinder(.18,.9,mat(i?'#c8c9bd':'#d5c7a4',.32,.2),hatchGroup,i?.36:-.36,-.14,-1.45,32);
 battery.rotation.z=Math.PI/2;
 const end=cylinder(.185,.035,mat('#b6b6a7',.25,.3),hatchGroup,i?.82:-.82,-.14,-1.45,32);end.rotation.z=Math.PI/2;
}
const hatch=roundedBox(1.8,.08,1.55,.03,bodyMat,calculator,0,-.13,-1.15);
hatch.visible=false; hatch.userData.hatch=true;
const hatchLabel=textSprite('BATTERY COMPARTMENT',{w:1.25,h:.15,font:'bold 19px Arial'});hatchLabel.position.set(0,-.085,-1.15);hatchLabel.rotation.x=-Math.PI/2;hatchLabel.visible=false;calculator.add(hatchLabel);
let hatchOpen=false;
function toggleHatch(){hatchOpen=!hatchOpen;hatch.visible=!hatchOpen;hatchLabel.visible=hatchOpen;hatch.position.y=hatchOpen?-.55:-.13;loadState.textContent=hatchOpen?'BATTERY BAY OPEN':'MODEL READY';}
document.querySelector('#batteryButton').addEventListener('click',toggleHatch);
// Back details are modeled as part of the same object and become visible when turned over.
const backDetails=new THREE.Group();calculator.add(backDetails);
roundedBox(1.6,.04,1.35,.04,edgeMat,backDetails,0,-.235,-1.15);
for(let i=0;i<4;i++)cylinder(.055,.025,darkMat,backDetails,i%2?1.25:-1.25,-.235,i<2?1.55:-1.55,16);
const feetMat=mat('#59432f');
for(const x of [-1.15,1.15])for(const z of [-1.48,1.48])roundedBox(.38,.08,.3,.02,feetMat,calculator,x,-.25,z);

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
 if(action.startsWith('num:')){
  const n=action.slice(4);current=waiting?n:(current==='0'?n:current==='Error'?n:current+n).slice(0,12);waiting=false;
 }else if(action==='decimal'){
  if(waiting){current='0.';waiting=false;}else if(!current.includes('.'))current+='.';
 }else if(action==='clear'){current='0';stored=null;operator=null;waiting=false;lastOperand=null;lastOperator=null;}
 else if(action==='ce'){current='0';waiting=false;}
 else if(action==='sign'){if(current!=='0'&&current!=='Error')current=current.startsWith('-')?current.slice(1):'-'+current;}
 else if(action.startsWith('op:')){
  const next=action.slice(3),value=Number(current);
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
 camera.up.set(0,1,0);camera.position.copy(initialCamera);camera.zoom=1;camera.updateProjectionMatrix();
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
renderer.setAnimationLoop((time=0)=>{
  controls.update();
  // Animate just 22 particles and one sprite to keep the effect light on integrated graphics.
  const positions=ledDustGeometry.attributes.position.array;
  for(let i=0;i<ledDustCount;i++)positions[i*3+1]=.458+Math.sin(time*.0011+ledDustPhases[i])*.008;
  ledDustGeometry.attributes.position.needsUpdate=true;
  ledGlow.material.opacity=.26+Math.sin(time*.002)*.045;
  renderer.render(world,camera);
});
loadState.textContent='MODEL READY';