// script.js
(() => {
  const canvas = document.getElementById('space');
  const ctx = canvas.getContext('2d');
  const msgEl = document.getElementById('msg');

  
  function fit() {
	const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
	canvas.width  = Math.floor(innerWidth * dpr);
	canvas.height = Math.floor(innerHeight * dpr);
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0); 
  }
  fit();
  addEventListener('resize', fit, { passive: true });

  // --- Starfield  ---
  const MAX_DEPTH = 1.0;
  const MIN_DEPTH = 0.05;
  const SPEED = 1.5; // fixed fast speed

  function starCount() {
	const area = innerWidth * innerHeight;
	return Math.min(1200, Math.max(150, Math.floor(area / 2500)));
  }

  // --- Stars ---
  let stars = [];
  function resetStars() {
	stars = new Array(starCount()).fill(0).map(newStar);
  }
  function newStar() {
	const angle = Math.random() * Math.PI * 2;
	const radius = Math.pow(Math.random(), 0.6); // bias toward center
	const x = Math.cos(angle) * radius;
	const y = Math.sin(angle) * radius;
	const z = Math.random() * (MAX_DEPTH - MIN_DEPTH) + MIN_DEPTH;
	return { x, y, z, px: 0, py: 0 };
  }
  resetStars();

  // --- 3D -> 2D projection ---
  function project(s) {
	const fov = Math.min(innerWidth, innerHeight) * 0.9;
	const scale = fov / (s.z * fov + 1);
	return {
	  sx: innerWidth  * 0.5 + s.x * scale * fov,
	  sy: innerHeight * 0.5 + s.y * scale * fov
	};
  }

  // --- Animation loop ---
  function frame() {
	// fade to black 
	ctx.fillStyle = 'rgba(0,0,0,0.35)';
	ctx.fillRect(0, 0, innerWidth, innerHeight);

	for (let i = 0; i < stars.length; i++) {
	  const s = stars[i];
	  const last = project(s);
	  s.px = last.sx; s.py = last.sy;

	 // move toward camera
	  s.z -= SPEED * 0.008 * (0.3 + Math.abs(s.x) + Math.abs(s.y));

	 // recycle star if it passes the camera or flies offscreen
	  if (s.z <= MIN_DEPTH * 0.6 || s.px < -40 || s.px > innerWidth + 40 || s.py < -40 || s.py > innerHeight + 40) {
		stars[i] = newStar();
		continue;
	  }

	  const now = project(s);
	  const size = Math.max(1.5, 3.5 - s.z * 3.5);
	  const glow = Math.min(1, 1.2 - s.z);
	  const alpha = 0.6 + glow * 0.4;

	  // streak
	  ctx.beginPath();
	  ctx.moveTo(s.px, s.py);
	  ctx.lineTo(now.sx, now.sy);
	  ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
	  ctx.lineWidth = size;
	  ctx.stroke();

	  // head dot
	  ctx.beginPath();
	  ctx.arc(now.sx, now.sy, size * 0.5, 0, Math.PI * 2);
	  ctx.fillStyle = `rgba(255,255,255,${Math.min(1, alpha + 0.2)})`;
	  ctx.fill();
	}

	requestAnimationFrame(frame);
  }
  // initial clear + start loop
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, innerWidth, innerHeight);
  requestAnimationFrame(frame);

  // Pause when hidden
  document.addEventListener('visibilitychange', () => {
	if (document.hidden) return; 
  });

  let lastWH = `${innerWidth}x${innerHeight}`;
  setInterval(() => {
	const nowWH = `${innerWidth}x${innerHeight}`;
	if (nowWH !== lastWH) {
	  lastWH = nowWH;
	  fit();
	  resetStars();
	}
  }, 500);

  // --- Fortune messages (non-repeating) ---
  const fortunes = [
	"Adventure awaits.",
	"Look up — the universe is smiling at you.",
	"Small steps lead to big journeys.",
	"Your energy lights up the cosmos.",
	"Today is full of hidden stars.",
	"The future is vast and bright.",
	"You are exactly where you need to be.",
	"Even in darkness, you shine.",
	"A spark can become a galaxy.",
	"Trust the path among the stars.",
	"Every sunrise is a new beginning.",
	"The answers you seek are closer than you think.",
	"Patience will open hidden doors.",
	"Your smile changes worlds.",
	"Great things grow from small seeds.",
	"Someone is thinking of you fondly.",
	"Dreams whispered at night find their way to daylight.",
	"A kind word will return to you tenfold.",
	"Luck is following your footsteps.",
	"The journey matters more than the destination.",
	"Courage is your hidden superpower.",
	"Your curiosity will lead you somewhere magical.",
	"Hope is the brightest star in your sky.",
  "Trust your timing — it is perfect.",
  "An unexpected gift will come your way.",
  "Your heart already knows the answer.",
  "A moment of stillness will guide you forward.",
  "Good news will travel to you soon.",
  "You are stronger than yesterday.",
  "Friendship will light your path.",
  "Your laughter is contagious joy.",
  "Change brings hidden opportunities.",
  "A chance encounter will inspire you.",
  "Gratitude attracts abundance.",
  "The stars favor your boldness.",
  "A door long closed will soon open.",
  "Your kindness will circle back to you.",
  "New adventures are waiting across the horizon.",
  "Balance will bring you peace.",
  "Something lost will soon return.",
  "The world is better with you in it.",
  "Magic hides in everyday moments.",
  "The best view comes after the hardest climb.",
  "You will soon dance with joy.",
  "Listen closely — the universe whispers.",
  "A simple choice will change everything.",
  "You are about to learn something valuable.",
  "Unexpected connections will delight you.",
  "Your inner light guides others home.",
  "Believe in beginnings.",
  "Tomorrow will surprise you in the best way.",
  "Your story is only just beginning."
	// Add extra fortunes here or push
  ];

  let lastIndex = -1;
  function showRandomMessage() {
	if (!fortunes.length) return;
	let idx;
	do { idx = Math.floor(Math.random() * fortunes.length); }
	while (idx === lastIndex && fortunes.length > 1);

	lastIndex = idx;
	msgEl.textContent = fortunes[idx];
	msgEl.style.opacity = 1;
	setTimeout(() => { msgEl.style.opacity = 0; }, 7500);
  }

  showRandomMessage();
  setInterval(showRandomMessage, 21000);
})();