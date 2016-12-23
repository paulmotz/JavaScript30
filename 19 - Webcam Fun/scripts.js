const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');

function getVideo() {
	navigator.mediaDevices.getUserMedia({ video: true, audio: false})
		.then(localMediaStream => {
			console.log(localMediaStream);
			video.src = window.URL.createObjectURL(localMediaStream);
			video.play();
		})
		.catch(err => {
			console.error(`webcam access decnied`, err);
		});
}

function paintToCanvas() {
	const width = video.videoWidth;
	const height = video.videoHeight;
	canvas.width = width;
	canvas.height = height;

	return setInterval(() => {
		ctx.drawImage(video, 0, 0, width, height);
		let pixels = ctx.getImageData(0, 0, width, height);

		pixels = redEffect(pixels);

		pixels = greenEffect(pixels);
		
		pixels = blueEffect(pixels);

		// pixels = rbgSplit(pixels);
		// ctx.globalAlpha = 0.1;

		// pixels = greenScreen(pixels);

		ctx.putImageData(pixels, 0, 0);
	}, 16);
}

function takePhoto() {
	snap.currentTIme = 0;
	snap.play();

	const data = canvas.toDataURL('image/jpeg');
	const link = document.createElement('a');
	link.href = data;
	link.setAttribute('download', 'me');
	link.textContent = 'Download Image';
	link.innerHTML = `<img src="${data}" alt="Me" />`;
	strip.insertBefore(link, strip.firstChild);
}

function redEffect(pixels) {
	for (let i = 0; i < pixels.data.length; i += 4) {
		pixels.data[i] += 50; // r
		pixels.data[i + 1] -= 50; // g
		pixels.data[i + 2] -= 50; // b
		// pixels.data[i + 3] -= 100
	}
	return pixels;
}

function greenEffect(pixels) {
	for (let i = 1; i < pixels.data.length; i += 4) {
		pixels.data[i - 1] -= 50; // r
		pixels.data[i] += 50; // g
		pixels.data[i + 1] -= 50; // b
		// pixels.data[i + 3] -= 100
	}
	return pixels;
}

function blueEffect(pixels) {
	for (let i = 2; i < pixels.data.length; i += 4) {
		pixels.data[i - 2] -= 50; // r
		pixels.data[i - 1] -= 50; // g
		pixels.data[i] += 50; // b
		// pixels.data[i + 3] -= 100
	}
	return pixels;
}

function rbgSplit(pixels) {
	for (let i = 0; i < pixels.data.length; i += 4) {
		pixels.data[i - 150] = pixels.data[i]; // r
		pixels.data[i + 400] = pixels.data[i + 1]; // g
		pixels.data[i + 300] = pixels.data[i + 2]; // b
		// pixels.data[i + 3] -= 100
	}
	return pixels;	
}

function greenScreen(pixels) {
	const levels = {};

	document.querySelectorAll('.rgb input').forEach((input) => {
		levels[input.name] = input.value;
	});

	for (i = 0; i < pixels.data.length; i += 4) {
		red = pixels.data[i];
		green = pixels.data[i + 1];
		blue = pixels.data[i + 2];
		alpha = pixels.data[i + 3];

		if (red >= levels.rmin
			&& green >= levels.gmin
			&& blue >= levels.bmin
			&& red <= levels.rmax
			&& green <= levels.gmax
			&& blue <= levels.bmax) {

			// take out by setting alpha to 0
			pixels.data[i + 3] = 0;
		}
	}

	return pixels;
}

getVideo();

video.addEventListener('canplay', paintToCanvas);