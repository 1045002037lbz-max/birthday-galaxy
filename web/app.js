"use strict";

const CARD_COUNT = 64;
const DURATION_MS = 5000;
const HEART_PEAK_SCALE = 1.045;
const palettes = [
  ["#fff9fa", "#f5dce5", "#b46b89"],
  ["#fcfaff", "#e7dff5", "#9275b7"],
  ["#f8fcff", "#ddecf7", "#6e99b5"],
  ["#f8fffb", "#dcefe6", "#6d9a88"],
  ["#fffcf5", "#f5e8cc", "#b79961"],
  ["#fff9f6", "#f6e0d5", "#bb8b76"],
];
const messages = [
  "愿每一次守候，都有温柔回响", "愿你交班之后，也有人接住疲惫", "愿夜班后的清晨，睡眠完整而安稳",
  "愿专业被看见，认真被记得", "愿每一次耐心解释，都换来安心的点头", "愿你守护新生，也不忘照顾自己",
  "愿忙碌的间隙，总有一口热饭和一杯温水", "愿每一份坚定，都有柔软的地方安放", "愿你不只见证新的开始，也常遇见自己的惊喜",
  "愿那些不被镜头记录的付出，都有人懂得", "愿每次平安交接，都是值得珍藏的小小圆满", "愿你的温柔有边界，善良有力量",
  "愿你在别人的重要时刻里，也拥有自己的高光", "愿生活给你的回馈，不止一句谢谢", "26岁，愿你被认真照料，也被好好偏爱",
];

// 计算半边后按等弧长取点，再接上左半边；顺序始终为右下、左上。
function heartPoints(count, width, height, cardWidth, cardHeight) {
  const outline = Array.from({ length: 601 }, (_, i) => {
    const t = i / 600 * Math.PI;
    return [16 * Math.sin(t) ** 3,
      -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t))];
  });
  const minY = Math.min(...outline.map(p => p[1]));
  const maxY = Math.max(...outline.map(p => p[1]));
  const centerY = (minY + maxY) / 2;
  // 让轮廓充分展开；给心跳最大幅度预留空间，始终保持两轴同比缩放。
  const scale = Math.max(0, Math.min((width * .96 / HEART_PEAK_SCALE - cardWidth) / 32,
    (height * .99 / HEART_PEAK_SCALE - cardHeight) / (maxY - minY)));
  const path = outline.map(([x, y]) => [width/2 + x*scale, height/2 + (y-centerY)*scale]);
  const distances = [0];
  for (let i = 1; i < path.length; i++) {
    distances.push(distances[i-1] + Math.hypot(path[i][0]-path[i-1][0], path[i][1]-path[i-1][1]));
  }
  const right = [];
  let segment = 1;
  for (let i = 0; i < count/2; i++) {
    const target = distances.at(-1) * (i+.5) / (count/2);
    while (segment < distances.length-1 && distances[segment] < target) segment++;
    const span = distances[segment] - distances[segment-1];
    const mix = span ? (target-distances[segment-1])/span : 0;
    right.push(path[segment-1].map((value, axis) => value + (path[segment][axis]-value)*mix));
  }
  return [...right, ...right.map(([x,y]) => [width-x,y]).reverse()];
}

const stage = document.getElementById("stage");
const cards = document.getElementById("cards");
const experience = document.getElementById("experience");
const endScreen = document.getElementById("end-screen");
const controls = document.getElementById("controls");
const status = document.getElementById("status");
const introScreen = document.getElementById("intro-screen");
const cakeScreen = document.getElementById("cake-screen");
const cakeEntry = document.getElementById("enter-cake");
const identityScreen = document.getElementById('identity-screen');
let recipient = null;
let cake = null;
let cakeNavigation = 0;
let frame = 0;
let generation = 0;
let nodes = [];
let positions = [];
let cardWidth = 194;
let cardHeight = 120;
let active = false;
let heartbeatTimer = 0;
let cardInteraction=null;

const BACKGROUND_MUSIC = { src: "audio/liu-yimiao-birthday.mp3", title: "给刘怡苗的专属生日配乐" };
let backgroundAudio = null;
let musicEnabled = false;
let musicWanted = false;
let musicRequest = 0;
let musicFade = 0;

function updateMusicButton() {
  const available = Boolean(BACKGROUND_MUSIC.src);
  const button = document.getElementById("music");
  button.hidden = !available;
  document.getElementById("music-divider").hidden = !available;
  button.setAttribute("aria-pressed", String(musicWanted));
  button.setAttribute('aria-busy',String(musicWanted&&!musicEnabled));
  button.title = musicWanted ? `关闭音乐 · ${BACKGROUND_MUSIC.title}` : `播放 ${BACKGROUND_MUSIC.title}`;
  document.getElementById("music-label").textContent = musicWanted ? "静音" : "音乐";
  const cakeMusic=document.getElementById('cake-music');cakeMusic.hidden=!available;
  cakeMusic.setAttribute('aria-pressed',String(musicWanted));cakeMusic.setAttribute('aria-busy',String(musicWanted&&!musicEnabled));
  cakeMusic.setAttribute('aria-label',button.title);cakeMusic.title=button.title;
}

function musicVolume(){return document.querySelector('#card-reader[open],#wish-letter-dialog[open]') ? .16 : .38;}
function fadeMusicTo(target,duration,request=musicRequest){
  cancelAnimationFrame(musicFade);if(!backgroundAudio)return;
  const start=backgroundAudio.volume,started=performance.now();
  function tick(now){
    if(request!==musicRequest)return;const t=Math.min(1,(now-started)/duration),ease=t*t*(3-2*t);
    backgroundAudio.volume=start+(target-start)*ease;
    if(t<1)musicFade=requestAnimationFrame(tick);
    else if(target===0&&!musicWanted){backgroundAudio.pause();musicEnabled=false;updateMusicButton();}
  }
  musicFade=requestAnimationFrame(tick);
}
async function setMusic(enabled,immediate=false) {
  const request = ++musicRequest;
  musicWanted=Boolean(enabled&&BACKGROUND_MUSIC.src);cancelAnimationFrame(musicFade);
  if (!musicWanted) {
    musicEnabled = false;
    if (backgroundAudio){
      if(immediate||document.hidden||backgroundAudio.paused){backgroundAudio.volume=0;backgroundAudio.pause();}
      else fadeMusicTo(0,260,request);
    }
    updateMusicButton();
    return;
  }
  updateMusicButton();
  try {
    if (!backgroundAudio||backgroundAudio.error) {
      backgroundAudio?.pause();
      backgroundAudio = new Audio(BACKGROUND_MUSIC.src);
      backgroundAudio.loop = true;
      backgroundAudio.volume = 0;
      backgroundAudio.preload = "none";
    }
    // Call play inside the original click handler, before any await, for mobile browsers.
    await backgroundAudio.play();
    if (request !== musicRequest){if(!musicWanted)backgroundAudio.pause();return;}
    musicEnabled = true;
    fadeMusicTo(musicVolume(),1400,request);
    updateMusicButton();
  } catch {
    if(request!==musicRequest)return;
    musicWanted=false;
    musicEnabled = false;
    updateMusicButton();
    status.textContent = "音乐暂时未能开启，祝福仍会照常送达";
    document.getElementById('workshop-status').textContent='音乐暂时未能开启，点击音符可重试';
  }
}

function layout() {
  if (experience.hidden) return;
  const { width, height } = stage.getBoundingClientRect();
  // 卡片略收窄，让爱心的内圈更宽，避免中间被厚厚一圈卡片挤住。
  cardWidth = width < 580 ? Math.max(84, Math.min(116, width * .27)) : Math.min(184, Math.max(144, width * .125));
  cardHeight = Math.round(cardWidth * .62);
  stage.style.setProperty("--card-width", `${cardWidth}px`);
  stage.style.setProperty("--card-height", `${cardHeight}px`);
  positions = heartPoints(CARD_COUNT, width, height, cardWidth, cardHeight);
  nodes.forEach((node, index) => positionCard(node, index));
  cardInteraction?.relayout();
}

function positionCard(node, index) {
  const offset=cardInteraction?.offsetFor(node)||{x:0,y:0};
  node.style.left = `${positions[index][0] - cardWidth/2+offset.x}px`;
  node.style.top = `${positions[index][1] - cardHeight/2+offset.y}px`;
}

function createCard(index) {
  const node = document.createElement("article");
  node.className = "wish-card";
  const palette = palettes[index % palettes.length];
  ["--paper-top", "--paper-bottom", "--accent"].forEach((property, i) => node.style.setProperty(property, palette[i]));
  node.style.zIndex = index + 1;
  node.innerHTML = '<div class="card-header"><span class="card-heart" aria-hidden="true">♡</span><span class="card-label">写给产房里的守护者</span><button class="card-close" type="button" aria-label="收起这张祝福卡片">×</button></div><p class="card-message"></p><span class="card-footer" aria-hidden="true">HAPPY BIRTHDAY</span>';
  const namedMessages=recipient?[`${recipient.name}，生日快乐`,messages[0],messages[1],messages[2],messages[3],messages[4],messages[5],messages[6],messages[7],messages[8],messages[9],messages[10],messages[11],messages[12],`${recipient.birthdayAge}岁，愿你也成为被守护的人`]:messages;
  const message=namedMessages[index % namedMessages.length];
  node.querySelector(".card-message").textContent = message;
  node.classList.toggle('personal-long',Array.from(message).length>19);
  node.title=message;
  cardInteraction?.register(node,index);
  positionCard(node, index);
  cards.append(node);
  nodes.push(node);
  // 先绘制初始帧，让每张新卡片轻轻出现。
  const current = generation;
  requestAnimationFrame(() => { if (current === generation && active) node.classList.add("visible"); });
}

function replay() {
  if(!recipient){// 专属入口：预设姓名与生日，自动完成原有校验，直接进入蛋糕开场页。
// 音乐仍由她点击开场按钮后启动，符合浏览器的用户手势播放要求。
document.getElementById('birthday-name').value = '刘怡苗';
document.getElementById('birthday-password').value = '2000.11.19';
document.getElementById('identity-form').requestSubmit();return;}
  cakeNavigation++;
  cake?.pause();
  cakeScreen.hidden = true;
  cakeEntry.hidden = true;
  cancelAnimationFrame(frame);
  clearTimeout(heartbeatTimer);
  cardInteraction?.reset();cardInteraction?.setReady(false);
  cards.classList.remove("beating");
  generation++;
  active = true;
  introScreen.hidden = true;
  document.body.classList.remove("awaiting-start");
  document.querySelector(".page-header").inert = false;
  document.querySelector(".page-header").hidden = false;
  experience.inert = false;
  endScreen.hidden = true;
  experience.hidden = false;
  controls.hidden = false;
  cards.replaceChildren();
  nodes = [];
  status.textContent = `${recipient.name}，把每一份美好，慢慢送给你`;
  layout();
  let started = null;
  function tick(now) {
    if (!active) return;
    started ??= now;
    const progress = Math.min(1, (now-started)/DURATION_MS);
    const target = Math.min(CARD_COUNT, Math.floor(progress*(CARD_COUNT-1))+1);
    while (nodes.length < target) createCard(nodes.length);
    if (progress < 1) frame = requestAnimationFrame(tick);
    else {
      status.textContent = `64 份小小的心意，都送给${recipient.name}的${recipient.birthdayAge}岁生日`;
      const current = generation;
      // 等最后一张卡片的入场过渡完成，再启动整体心跳。
      heartbeatTimer = setTimeout(() => {
        if (active && current === generation) {
          cards.classList.add("beating");
          cardInteraction?.setReady(true);
          status.textContent=`${recipient.name}，把卡片拖出来，点开读一读这份祝福 ♡`;
          cakeEntry.hidden = false;
        }
      }, 260);
    }
  }
  frame = requestAnimationFrame(tick);
}

function exit() {
  cardInteraction?.reset();cardInteraction?.setReady(false);
  cakeNavigation++;
  cake?.dispose();
  cake = null;
  cakeScreen.hidden = true;
  cakeEntry.disabled = false;
  cakeEntry.hidden = true;
  cancelAnimationFrame(frame);
  clearTimeout(heartbeatTimer);
  cards.classList.remove("beating");
  generation++;
  active = false;
  setMusic(false,true);
  cards.replaceChildren();
  nodes = [];
  experience.hidden = true;
  controls.hidden = true;
  endScreen.hidden = false;
  document.getElementById("restart").focus({ preventScroll: true });
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
}

async function enterCake() {
  if (!recipient || cakeEntry.disabled || cakeEntry.hidden || !active) return;
  const navigation = ++cakeNavigation;
  cakeEntry.disabled = true;
  experience.hidden = true;
  document.querySelector(".page-header").hidden = true;
  controls.hidden = true;
  cards.classList.remove("beating");
  cakeScreen.hidden = false;
  document.getElementById("back-heart").focus({ preventScroll: true });
  try {
    if (!cake) {
      document.getElementById("workshop-status").textContent = "正在把星光，变成你的蛋糕…";
      const { createWorkshop: createCake } = await import("./workshop.js?v=9");
      if (navigation !== cakeNavigation) return;
      const created = await createCake(document.getElementById("workshop-canvas"));
      if (navigation !== cakeNavigation) { created.dispose(); return; }
      cake = created;
    }
    cake.resume();
  } catch (error) {
    if (navigation === cakeNavigation) {
      document.getElementById("workshop-status").textContent = "蛋糕暂时未能加载，请返回爱心后重试（请使用本地网页地址）";
      console.error("Cake initialization failed:", error);
    }
  } finally {
    if (navigation === cakeNavigation) cakeEntry.disabled = false;
  }
}

function backToHeart() {
  cakeNavigation++;
  cake?.pause();
  cakeScreen.hidden = true;
  cakeEntry.disabled = false;
  experience.hidden = false;
  document.querySelector(".page-header").hidden = false;
  controls.hidden = false;
  cards.classList.add("beating");
  layout();
  cakeEntry.focus({ preventScroll: true });
}

function startExperience(withMusic) {
  if (!recipient || introScreen.hidden) return;
  // 在用户点击的同一次事件内开启音频，避免被浏览器的自动播放规则拦截。
  if (withMusic && BACKGROUND_MUSIC.src) setMusic(true);
  replay();
  document.getElementById("replay").focus({ preventScroll: true });
}

document.getElementById("start").addEventListener("click", () => startExperience(true));
document.getElementById('identity-form').addEventListener('submit',async event=>{
  event.preventDefault();
  const button=document.getElementById('identity-submit'),nameInput=document.getElementById('birthday-name'),dateInput=document.getElementById('birthday-password'),error=document.getElementById('identity-error');
  if(button.disabled)return;button.disabled=true;error.textContent='';nameInput.removeAttribute('aria-invalid');dateInput.removeAttribute('aria-invalid');
  try{
    const [profile,interaction]=await Promise.all([import('./birthday-profile.js?v=2'),import('./heart-cards.js?v=1')]);
    const next=profile.createBirthdayProfile(nameInput.value,dateInput.value);profile.setRecipient(next);recipient=next;
    cardInteraction??=interaction.createCardInteraction({cards,stage,getNodes:()=>nodes,getPositions:()=>positions,getCardSize:()=>({width:cardWidth,height:cardHeight}),position:positionCard,onStatus:text=>status.textContent=text});
    document.getElementById('recipient-greeting').textContent=`只送给 ${next.name}`;
    document.getElementById('recipient-heart-note').textContent=`愿你的${next.birthdayAge}岁，自由、明亮、满是欢喜`;
    document.getElementById('intro-description').textContent=`给${next.name}的${next.birthdayAge}岁生日惊喜`;
    document.getElementById('cake-recipient-line').textContent=`${next.name}的${next.birthdayAge}岁生日，愿每一个心愿都有星光回应`;
    document.title=`${next.name}，${next.birthdayAge}岁生日快乐`;
    identityScreen.hidden=true;identityScreen.inert=true;introScreen.hidden=false;introScreen.inert=false;dateInput.value='';
    document.body.classList.remove('awaiting-identity');document.getElementById('start').focus({preventScroll:true});
  }catch(reason){
    error.textContent=reason instanceof Error?reason.message:'入口暂未打开成功，请再试一次。';
    const field=nameInput.value.trim()?dateInput:nameInput;field.setAttribute('aria-invalid','true');field.focus({preventScroll:true});
  }finally{button.disabled=false;}
});
document.getElementById('birthday-password-toggle').addEventListener('click',()=>{
  const input=document.getElementById('birthday-password'),button=document.getElementById('birthday-password-toggle'),show=input.type==='password';
  input.type=show?'text':'password';button.textContent=show?'隐藏':'显示';button.setAttribute('aria-pressed',String(show));button.setAttribute('aria-label',show?'隐藏生日':'显示生日');
});
document.getElementById("start-quiet").addEventListener("click", () => startExperience(false));
document.getElementById("replay").addEventListener("click", replay);
document.getElementById("restart").addEventListener("click", replay);
document.getElementById("exit").addEventListener("click", exit);
cakeEntry.addEventListener("click", enterCake);
document.getElementById("back-heart").addEventListener("click", backToHeart);
document.getElementById("cake-exit").addEventListener("click", exit);
document.getElementById("music").addEventListener("click", () => setMusic(!musicWanted));
document.getElementById('cake-music').addEventListener('click',()=>setMusic(!musicWanted));
const musicReadingObserver=new MutationObserver(()=>{if(musicWanted&&musicEnabled)fadeMusicTo(musicVolume(),600);});
['card-reader','wish-letter-dialog'].forEach(id=>musicReadingObserver.observe(document.getElementById(id),{attributes:true,attributeFilter:['open']}));
window.addEventListener('pagehide',()=>setMusic(false,true));
document.getElementById("fullscreen").addEventListener("click", async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch { status.textContent = "当前浏览器未开启全屏，仍可正常观看祝福"; }
});
document.addEventListener("fullscreenchange", () => {
  document.getElementById("fullscreen-label").textContent = document.fullscreenElement ? "还原" : "全屏";
});
document.addEventListener("keydown", event => {
  if (document.querySelector('dialog[open]')) return;
  if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.target.matches("input, textarea, select")) return;
  if (event.key.toLowerCase() === "r" && introScreen.hidden && cakeScreen.hidden) replay();
  if (event.key === "Escape" && active) {
    if (!cakeScreen.hidden) backToHeart(); else exit();
  }
});
new ResizeObserver(layout).observe(stage);
updateMusicButton();
if (!BACKGROUND_MUSIC.src) {
  document.getElementById("intro-title").textContent = "点击开启祝福";
  document.getElementById("start-quiet").hidden = true;
}
else document.getElementById('intro-title').textContent='点击开启音乐与祝福';
// 专属入口：预设姓名与生日，自动完成原有校验，直接进入蛋糕开场页。
// 音乐仍由她点击开场按钮后启动，符合浏览器的用户手势播放要求。
document.getElementById('birthday-name').value = '刘怡苗';
document.getElementById('birthday-password').value = '2000.11.19';
document.getElementById('identity-form').requestSubmit();
