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
const camera = new THREE.PerspectiveCamera(36, sceneEl.clientWidth / sceneEl.clientHeight, .1, 100);
const initialCamera = new THREE.Vector3(0, 4.8, 9.5);
camera.position.copy(initialCamera);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.dampingFactor = .06;
controls.minDistance = 5;
controls.maxDistance = 16;
controls.maxPolarAngle = Math.PI * .86;

world.add(new THREE.HemisphereLight(0xffe4c0, 0x21170f, 2.0));
const keyLight = new THREE.DirectionalLight(0xffe1b7, 3.0);
keyLight.position.set(-4, 8, 5); keyLight.castShadow = true; keyLight.shadow.mapSize.set(1024, 1024); world.add(keyLight);
const rimLight = new THREE.DirectionalLight(0xff543c, 1.4); rimLight.position.set(4, 5, -5); world.add(rimLight);
const fillLight = new THREE.PointLight(0xb4c5ff, .65, 20); fillLight.position.set(4, 3, 4); world.add(fillLight);

const mat = (color, roughness=.65, metalness=0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
const bodyMat = mat('#c6ad83', .42);
const edgeMat = mat('#947957', .5);
const darkMat = mat('#382a20', .42);
const keyMat = mat('#5a402b', .35);
const keyTopMat = mat('#6b4e34', .38);
const inkMat = mat('#38281b', .65);
const ledMat = new THREE.MeshBasicMaterial({ color:'#ff382c' });
const ledOffMat = new THREE.MeshBasicMaterial({ color:'#32100e' });
const whiteMat = mat('#e5d3b2', .5);
const woodMat = new THREE.MeshStandardMaterial({color:'#4a2e1b',roughness:.88});
const ground = new THREE.Mesh(new THREE.PlaneGeometry(200,200), woodMat); ground.rotation.x=-Math.PI/2; ground.position.y=-.42; ground.receiveShadow=true; world.add(ground);
// Subtle desk grain gives the scene a studio-table feel without distracting from the object.
for(let i=0;i<34;i++){
  const grain = new THREE.Mesh(new THREE.BoxGeometry(30,.004,.012), new THREE.MeshStandardMaterial({color:i%2?'#68462a':'#2e1b11',roughness:1,transparent:true,opacity:.18}));
  grain.position.set(0,-.414,-9+i*.55); world.add(grain);
}
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
// Main molded shell: long axis vertical, keypad and display on the front (+Z).
roundedBox(3.05,.42,5.25, .12,edgeMat,calculator,0,0,0);
roundedBox(2.98,.37,5.18,.1,bodyMat,calculator,0,.18,0);
// Raised rim and dark display window.
roundedBox(2.48,.075,1.05,.04,edgeMat,calculator,0,.405,1.62);
roundedBox(2.28,.065,.83,.03,darkMat,calculator,0,.45,1.62);
roundedBox(2.03,.012,.55,.01,mat('#180f0c',.2),calculator,0,.49,1.62);
// LED segments: actual lit segment geometry, driven from calculator value.
const segments={0:['a','b','c','d','e','f'],1:['b','c'],2:['a','b','g','e','d'],3:['a','b','g','c','d'],4:['f','g','b','c'],5:['a','f','g','c','d'],6:['a','f','g','e','c','d'],7:['a','b','c'],8:['a','b','c','d','e','f','g'],9:['a','b','c','d','f','g'],'-':['g'],'.':['dot']};
const digitGroups=[];
function makeDigit(x){
 const group=new THREE.Group(); group.position.set(x,.505,1.62); calculator.add(group);
 const specs={a:[0,.15,.17,.035],g:[0,0,.17,.035],d:[0,-.15,.17,.035],f:[-.09,.075,.035,.12],b:[.09,.075,.035,.12],e:[-.09,-.075,.035,.12],c:[.09,-.075,.035,.12],dot:[.105,-.16,.025,.025]};
 for(const [name,[sx,sy,sw,sh]] of Object.entries(specs)){
   const s=new THREE.Mesh(new THREE.BoxGeometry(sw,.012,sh),new THREE.MeshBasicMaterial({color:0x32100e}));
   s.position.set(sx,0,sy); group.add(s); group.userData[name]=s;
 }
 digitGroups.push(group); return group;
}
for(let i=0;i<8;i++)makeDigit(-.86+i*.245);
function setLed(text){
 const str=String(text).slice(0,8); const chars=str.padStart(Math.min(8,str.length),' ');
 digitGroups.forEach((g,i)=>Object.entries(g.userData).forEach(([name,mesh])=>{
   const ch=chars[i]||' '; const on=(segments[ch]||[]).includes(name);
   mesh.material=on?ledMat:ledOffMat;
 }));
}
// Small printed wordmark and model text on the face.
function textSprite(text,opts={}){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;
 const ctx=canvas.getContext('2d');ctx.clearRect(0,0,512,128);ctx.fillStyle=opts.color||'#3c2a1b';
 ctx.font=opts.font||'bold 34px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,64);
 const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
 const m=new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false});
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(opts.w||1.4,opts.h||.3),m);return mesh;
}
const tiText=textSprite('Texas Instruments',{w:1.5,h:.28});tiText.position.set(0,.403,.82);calculator.add(tiText);
const modelText=textSprite('DATAMATH',{w:1.2,h:.22,font:'bold 30px Arial'});modelText.position.set(0,.403,.53);calculator.add(modelText);
// Eighteen raised keycaps, with interactive hit targets and the familiar 4 x 5 grid shape.
const keys=[
 ['ON/C','clear'],['CE','ce'],['+/-','sign'],['÷','op:/'],
 ['7','num:7'],['8','num:8'],['9','num:9'],['×','op:*'],
 ['4','num:4'],['5','num:5'],['6','num:6'],['−','op:-'],
 ['1','num:1'],['2','num:2'],['3','num:3'],['+','op:+'],
 ['0','num:0'],['.','decimal'],['=','equals']
];
const keyMeshes=[];
keys.forEach(([label,action],i)=>{
 const col=i%4,row=Math.floor(i/4);
 const x=(col-1.5)*.62,z=-.38+(2-row)*.67;
 const cap=new THREE.Group();cap.position.set(x,.415,z);calculator.add(cap);
 roundedBox(.52,.11,.53,.02,darkMat,cap,0,-.01,0);
 const top=roundedBox(.48,.12,.49,.02,(i<4?edgeMat:keyMat),cap,0,.055,0);
 const face=textSprite(label,{w:.43,h:.2,font:label.length>2?'bold 23px Arial':'bold 38px Arial',color:'#ead4af'});
 face.rotation.x=-Math.PI/2;face.position.set(0,.118,0);cap.add(face);
 cap.userData={label,action,homeY:.415};pickables.push(top);top.userData.key=cap;keyMeshes.push(cap);
});
const hatchGroup=new THREE.Group();calculator.add(hatchGroup);
roundedBox(1.55,.04,1.3,.03,darkMat,hatchGroup,0,-.245,-1.45);
for(let i=0;i<2;i++){
 const battery=cylinder(.18,.9,mat(i?'#c8c9bd':'#d5c7a4',.32,.2),hatchGroup,i?.36:-.36,-.14,-1.45,32);
 battery.rotation.z=Math.PI/2;
 const end=cylinder(.185,.035,mat('#b6b6a7',.25,.3),hatchGroup,i?.82:-.82,-.14,-1.45,32);end.rotation.z=Math.PI/2;
}
const hatch=roundedBox(1.8,.08,1.55,.03,bodyMat,calculator,0,-.13,-1.48);
hatch.visible=false; hatch.userData.hatch=true;
const hatchLabel=textSprite('BATTERY COMPARTMENT',{w:1.25,h:.15,font:'bold 19px Arial'});hatchLabel.position.set(0,-.085,-1.48);hatchLabel.rotation.x=-Math.PI/2;hatchLabel.visible=false;calculator.add(hatchLabel);
let hatchOpen=false;
function toggleHatch(){hatchOpen=!hatchOpen;hatch.visible=!hatchOpen;hatchLabel.visible=hatchOpen;hatch.position.y=hatchOpen?-.55:-.13;loadState.textContent=hatchOpen?'BATTERY BAY OPEN':'MODEL READY';}
document.querySelector('#batteryButton').addEventListener('click',toggleHatch);
// Back details are modeled as part of the same object and become visible when turned over.
const backDetails=new THREE.Group();calculator.add(backDetails);
roundedBox(1.6,.04,1.35,.04,edgeMat,backDetails,0,-.235,-1.48);
for(let i=0;i<4;i++)cylinder(.055,.025,darkMat,backDetails,i%2?1.25:-1.25,-.235,i<2?2.2:-2.2,16);
const feetMat=mat('#59432f');
for(const x of [-1.15,1.15])for(const z of [-2.05,2.05])roundedBox(.38,.08,.3,.02,feetMat,calculator,x,-.25,z);

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
function show(){display.textContent=current.length>8?Number(current).toPrecision(7):current;setLed(current);}
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
keys.forEach(([label,action])=>{
 const b=document.createElement('button');b.className='key'+(['ON/C','CE','+/-'].includes(label)?' utility':'')+(['÷','×','−','+','='].includes(label)?' operator':'');
 b.textContent=label;b.type='button';b.setAttribute('aria-label',label==='ON/C'?'Clear all':label);
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
 const rect=renderer.domElement.getBoundingClientRect();pointer.x=((e.clientX-rect.left)/rect.width)*2-1;pointer.y=-((e.clientY-rect.top)/rect.height)*2+1;
 raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(pickables,false)[0];
 if(hit?.object?.userData?.key){const k=hit.object.userData.key;press(k.userData.action,k.userData.label);k.position.y=k.userData.homeY-.045;setTimeout(()=>k.position.y=k.userData.homeY,90);}
});
document.querySelector('#homeView').addEventListener('click',()=>{camera.position.copy(initialCamera);controls.target.set(0,0,0);controls.update();calculator.rotation.set(0,0,0);viewLabel.textContent='FRONT · 3D';});
document.querySelector('#flipView').addEventListener('click',()=>{calculator.rotation.y+=Math.PI;viewLabel.textContent=calculator.rotation.y%(Math.PI*2)>1?'REAR · 3D':'FRONT · 3D';});
const vrButton=VRButton.createButton(renderer);vrButton.id='threeVrButton';vrButton.style.display='none';document.body.appendChild(vrButton);
if('xr' in navigator){navigator.xr.isSessionSupported('immersive-vr').then(ok=>{const b=document.querySelector('#vrButton');if(ok){b.disabled=false;b.innerHTML='◇ <span>ENTER VR</span>';b.addEventListener('click',()=>vrButton.click());}else{b.disabled=true;b.innerHTML='◇ <span>VR UNAVAILABLE</span>';}}).catch(()=>{});}
function resize(){const w=sceneEl.clientWidth,h=sceneEl.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);}
new ResizeObserver(resize).observe(sceneEl);
renderer.setAnimationLoop(()=>{controls.update();renderer.render(world,camera);});
loadState.textContent='MODEL READY';