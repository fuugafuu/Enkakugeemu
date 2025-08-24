const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const gameoverEl = document.getElementById('gameover');
let drawing = false;
let points = [];

// 難易度ごとのしきい値
const thresholds = {
  easy: 40,
  normal: 60,
  hard: 80
};
let currentThreshold = thresholds.easy;

// 難易度切り替え
document.querySelectorAll('input[name="level"]').forEach(radio => {
  radio.addEventListener('change', e => {
    currentThreshold = thresholds[e.target.value];
    clearCanvas();
  });
});

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

// 手ぶれ補正
function smoothPoint(newPoint) {
  const smoothFactor = 0.3;
  if (points.length === 0) return newPoint;
  let last = points[points.length-1];
  return {
    x: last.x + (newPoint.x - last.x) * smoothFactor,
    y: last.y + (newPoint.y - last.y) * smoothFactor
  };
}

function startDraw(e) {
  if (gameoverEl.style.display === "flex") return; // ゲームオーバー時は描けない
  drawing = true;
  points = [];
  ctx.clearRect(0,0,canvas.width,canvas.height);
  let pos = getPos(e);
  pos = smoothPoint(pos);
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
  points.push(pos);
  e.preventDefault();
}

function draw(e) {
  if (!drawing) return;
  let pos = getPos(e);
  pos = smoothPoint(pos);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
  points.push(pos);

  // 描画中はリアルタイムスコア表示だけ
  if (points.length % 5 === 0) calcScore(false);

  e.preventDefault();
}

function endDraw() {
  if (!drawing) return;
  drawing = false;
  calcScore(true); // 離した時にゲームオーバー判定
}

function calcScore(finalCheck) {
  if (points.length < 10) {
    scoreEl.innerText = "スコア: 線が短すぎます";
    return;
  }
  let cx = points.reduce((a,p)=>a+p.x,0)/points.length;
  let cy = points.reduce((a,p)=>a+p.y,0)/points.length;
  let rs = points.map(p => Math.hypot(p.x - cx, p.y - cy));
  let rmean = rs.reduce((a,b)=>a+b,0)/rs.length;
  let variance = rs.reduce((a,r)=>a+(r-rmean)**2,0)/rs.length;
  let stdev = Math.sqrt(variance);
  let score = Math.max(0, 100 - (stdev/rmean)*100);

  scoreEl.innerText = "スコア: " + score.toFixed(1) + " 点";

  if (score >= 90) {
    scoreEl.style.color = "#4caf50";
    scoreEl.style.transform = "scale(1.2)";
  } else if (score >= 70) {
    scoreEl.style.color = "#ff9800";
    scoreEl.style.transform = "scale(1.1)";
  } else {
    scoreEl.style.color = "#f44336";
    scoreEl.style.transform = "scale(1.05)";
  }
  setTimeout(()=> scoreEl.style.transform = "scale(1)", 200);

  // 最後に離した時だけゲームオーバー判定
  if (finalCheck && score < currentThreshold) {
    gameoverEl.style.display = "flex";
  }
}

function clearCanvas() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  scoreEl.innerText = "スコア: まだ未計測";
  scoreEl.style.color = "#222";
  gameoverEl.style.display = "none";
}
