const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let drawing = false;
let points = [];

// 初期リサイズ
function resizeCanvas() {
  let size = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.6);
  canvas.width = size;
  canvas.height = size;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('touchstart', startDraw);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('touchmove', draw);
canvas.addEventListener('mouseup', endDraw);
canvas.addEventListener('mouseleave', endDraw);
canvas.addEventListener('touchend', endDraw);

function getPos(e) {
  if (e.touches && e.touches[0]) {
    let rect = canvas.getBoundingClientRect();
    return {x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top};
  } else {
    return {x: e.offsetX, y: e.offsetY};
  }
}

function startDraw(e) {
  drawing = true;
  points = [];
  ctx.beginPath();
  let pos = getPos(e);
  ctx.moveTo(pos.x, pos.y);
  points.push(pos);
  e.preventDefault();
}

function draw(e) {
  if (!drawing) return;
  let pos = getPos(e);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
  points.push(pos);
  e.preventDefault();
}

function endDraw() {
  if (!drawing) return;
  drawing = false;
  calcScore();
}

function calcScore() {
  if (points.length < 10) {
    document.getElementById('score').innerText = "スコア: 線が短すぎます";
    return;
  }
  let cx = points.reduce((a,p)=>a+p.x,0)/points.length;
  let cy = points.reduce((a,p)=>a+p.y,0)/points.length;
  let rs = points.map(p => Math.hypot(p.x - cx, p.y - cy));
  let rmean = rs.reduce((a,b)=>a+b,0)/rs.length;
  let variance = rs.reduce((a,r)=>a+(r-rmean)**2,0)/rs.length;
  let stdev = Math.sqrt(variance);
  let score = Math.max(0, 100 - (stdev/rmean)*100);
  
  // スコア表示
  let scoreEl = document.getElementById('score');
  scoreEl.innerText = "スコア: " + score.toFixed(1) + " 点";

  // 🎉 演出：スコアによって色とアニメーションを変化
  if (score >= 90) {
    scoreEl.style.color = "#4caf50"; // 緑
    scoreEl.style.transform = "scale(1.3)";
    setTimeout(()=> scoreEl.style.transform = "scale(1)", 300);
    confettiEffect();
  } else if (score >= 70) {
    scoreEl.style.color = "#ff9800"; // オレンジ
    scoreEl.style.transform = "scale(1.2)";
    setTimeout(()=> scoreEl.style.transform = "scale(1)", 300);
  } else {
    scoreEl.style.color = "#f44336"; // 赤
    scoreEl.style.transform = "scale(1.1)";
    setTimeout(()=> scoreEl.style.transform = "scale(1)", 300);
  }
}

function clearCanvas() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  document.getElementById('score').innerText = "スコア: まだ未計測";
  document.getElementById('score').style.color = "#222";
}

// 🎉 簡易コンフェッティ演出
function confettiEffect() {
  for (let i = 0; i < 20; i++) {
    const conf = document.createElement("div");
    conf.innerText = "✨";
    conf.style.position = "absolute";
    conf.style.left = (Math.random() * window.innerWidth) + "px";
    conf.style.top = "-20px";
    conf.style.fontSize = "20px";
    conf.style.animation = `fall ${1 + Math.random()*1.5}s linear`;
    document.body.appendChild(conf);
    setTimeout(()=> conf.remove(), 2000);
  }
}

// CSSアニメーションを追加
const style = document.createElement('style');
style.innerHTML = `
@keyframes fall {
  to {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}`;
document.head.appendChild(style);
