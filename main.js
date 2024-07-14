const x = 0, y = 1, dt = 0.0001;
let 위치 = [500, 500], 속도 = [0,0], 기압경도력스칼라 = 0, 마찰계수 = 0, 전향력성분 = 0, 처리횟수 = 1000;
function $(id) {
  return document.getElementById(id);
}
/** @type {HTMLCanvasElement} */
const layer = $('layer'), ctx = layer.getContext('2d');

layer.addEventListener(
  'click', e => {
    const 화면계수 = 1000 / innerHeight;
    위치 = [e.offsetX * 화면계수, e.offsetY * 화면계수];
  }
)

const span들 = {
  처리횟수: $("input-value-처리횟수"),
  기압경도력스칼라: $("input-value-기압경도력스칼라"),
  마찰계수: $("input-value-마찰계수"),
  전향력성분: $("input-value-전향력성분")
}
$('input-range-처리횟수').addEventListener(
  "change", e => {
    span들.처리횟수.innerText = e.target.value;
    처리횟수 = e.target.value;
  }
)
$('input-range-기압경도력스칼라').addEventListener(
  "change", e => {
    span들.기압경도력스칼라.innerText = e.target.value;
    기압경도력스칼라 = e.target.value;
  }
)
$('input-range-마찰계수').addEventListener(
  "change", e => {
    span들.마찰계수.innerText = e.target.value;
    마찰계수 = e.target.value;
  }
)
$('input-range-전향력성분').addEventListener(
  "change", e => {
    span들.전향력성분.innerText = e.target.value;
    전향력성분 = e.target.value;
  }
)

let 기압배치모드 = 'E';
function requestFrame() {
  let 기압경도력 = [0,0],
    마찰력 = [0,0],
    전향력 = [0,0],
    가속도 = [0,0]
  for (let i = 처리횟수; i--;) {
    기압경도력 = 기압경도력벡터계산();
    마찰력 = 벡터2에곱하기(속도, -마찰계수);
    전향력 = 벡터2직각계산(벡터2에곱하기(속도, 전향력성분));
    가속도 = 벡터2부분합계산([기압경도력, 마찰력, 전향력]);
    속도 = 벡터2부분합계산([속도, 벡터2에곱하기(가속도, dt)]);
    위치 = 벡터2부분합계산([위치, 벡터2에곱하기(속도, dt)]);
    if (기압배치모드 == 'E') {
      위치[x] %= 1000;
      위치[y] = (위치[y] + 1000) % 1000;
    }
  }

  ctx.clearRect(0,0,1000,1000)
  물체그리기();
  벡터그리기(속도,'rgb(160, 0, 255)');
  벡터그리기(기압경도력,'rgb(0, 0, 255)');
  벡터그리기(마찰력,'rgb(255, 0, 0)');
  벡터그리기(전향력,'rgb(0, 255, 0)');
  벡터그리기(가속도,'rgb(255, 255, 255)');

  requestAnimationFrame(requestFrame);
}

function 물체그리기() {
  ctx.beginPath();
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.arc(위치[x], 위치[y], 5, 0, 2*Math.PI);
    ctx.fill();
}
/**
 * @param {Number[]} 벡터
 * @param {String} 색
 */
function 벡터그리기(벡터, 색) {
  ctx.beginPath();
    ctx.strokeStyle = 색;
    ctx.lineWidth = 3;
    ctx.moveTo(위치[x], 위치[y]);
    ctx.lineTo(위치[x]+벡터[x], 위치[y]+벡터[y]);
    ctx.stroke();
}

function 저기압성기압경도력벡터계산() {
  return 원형기압경도력계산(기압경도력스칼라);
}
function 고기압성기압경도력벡터계산() {
  return 원형기압경도력계산(-기압경도력스칼라);
}
function 평형기압경도력벡터계산() {
  return [0,-기압경도력스칼라];
}
/**
 * @param {Number} 스칼라
 */
function 원형기압경도력계산(스칼라) {
  const 위치거리 = 빗변계산([500,500], 위치);
  if (위치거리 == 0) {
    return [0,0];
  }
  const 힘 = 스칼라 / 위치거리;
  return [(500-위치[x])*힘, (500-위치[y])*힘];
}
let 기압경도력벡터계산 = 평형기압경도력벡터계산;
requestFrame();

const 배경그라데이션 = $('gradient');
배경그라데이션.style = 'background: linear-gradient(rgb(80, 40, 40), rgb(40, 40, 80));';

$('input-radio-E').addEventListener(
  'click', e => {
    기압경도력벡터계산 = 평형기압경도력벡터계산;
    배경그라데이션.style = 'background: linear-gradient(rgb(80, 40, 40), rgb(40, 40, 80));';
    기압배치모드 = e.target.value;
  }
)
$('input-radio-L').addEventListener(
  'click', e => {
    기압경도력벡터계산 = 저기압성기압경도력벡터계산;
    배경그라데이션.style = 'background: radial-gradient(rgb(80, 40, 40), rgb(40, 40, 80));';
    기압배치모드 = e.target.value;
  }
)
$('input-radio-H').addEventListener(
  'click', e => {
    기압경도력벡터계산 = 고기압성기압경도력벡터계산;
    배경그라데이션.style = 'background: radial-gradient(rgb(40, 40, 80), rgb(80, 40, 40));';
    기압배치모드 = e.target.value;
  }
)

/**
 * @param {Number[]} a
 * @param {Number[]} b
 */
function 빗변계산(a, b) {
  return ( (b[0] - a[0])**2 + (b[1] - a[1])**2 )**0.5;
}
/**
 * @param {Number[][]} vector2Arr
 */
function 벡터2부분합계산(vector2Arr) {
  let sum = [0, 0];
  for (const vector of vector2Arr) {
    sum[x] += vector[x];
    sum[y] += vector[y];
  }
  return sum;
}
/**
 * @param {Number[]} vector2
 * @param {Number} 계수
 */
function 벡터2에곱하기(vector2, 계수) {
  return [vector2[x]*계수, vector2[y]*계수];
}
/**
 * @param {Number[]} vector2
 */
function 벡터2직각계산(vector2) {
  return [-vector2[y], vector2[x]];
}
/**
 * @param {Number} 자전각속도
 * @param {Number} 위도
 */
function 크리올리효과계산(자전각속도, 위도) {
  return 2 * 자전각속도 * Math.sin(위도);
}