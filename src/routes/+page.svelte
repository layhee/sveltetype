<script lang="ts">
	import { tweened } from 'svelte/motion';
	import { blur } from 'svelte/transition';
	type Game = 'waiting for input' | 'in progress' | 'game over';
	type Word = string;

	let game: Game = 'waiting for input';
	let typedLetter = '';
	let seconds = 6;

	let words: Word[] =
		'The quick brown fox jumps over the lazy dog. The quick brown fox jumps over the lazy dog. The quick brown fox jumps over the lazy dog The quick brown fox jumps over the lazy dog. The quick brown fox jumps over the lazy dog. The quick brown fox jumps over the lazy dog The quick brown fox jumps over the lazy dog. The quick brown fox jumps over the lazy dog. The quick brown fox jumps over the lazy dog'.split(
			' '
		);
	let wordIndex = 0;
	let letterIndex = 0;
	let correctLetters = 0;
	let toggleReset = false;
	let wordsPerMin = tweened(0, { delay: 300, duration: 1000 });
	let accuracy = tweened(0, { delay: 1300, duration: 1000 });
	let wordsEl: HTMLDivElement;
	let letterEl: HTMLSpanElement;
	let inputEl: HTMLInputElement;
	let cursorEl: HTMLDivElement;

	function resetGame() {
		toggleReset = !toggleReset;
		seconds = 30;
		wordIndex = 0;
		letterIndex = 0;
		correctLetters = 0;
		$wordsPerMin = 0;
		$accuracy = 0;
		setGameState('waiting for input');
	}
	function getWordsPerMin() {
		const word = 5;
		const minutes = 0.5;
		return Math.floor(correctLetters / word / minutes);
	}
	function getAccuracy() {
		const totalLetters = getTotalLetters(words);
		return Math.floor((correctLetters / totalLetters) * 100);
	}
	function getTotalLetters(words: Word[]) {
		return words.reduce((count, word) => count + word.length, 0);
	}
	function getResults() {
		$wordsPerMin = getWordsPerMin();
		$accuracy = getAccuracy();
	}
	function startGame() {
		setGameState('in progress');
		setGameTimer();
	}

	function setGameState(state: Game) {
		game = state;
	}
	function setGameTimer() {
		function gameTimer() {
			if (seconds > 0) {
				seconds -= 1;
			}
			if (game === 'waiting for input' || seconds === 0) {
				clearInterval(interval);
			}
			if (seconds === 0) {
				setGameState('game over');
				getResults();
			}
		}
		const interval = setInterval(gameTimer, 1000);
	}
	function updateGameState() {
		setLetter();
		checkLetter();
		nextLetter();
		resetLetter();
		updateLine();
		moveCursor();
	}
	function setLetter() {
		const isWordCompleted = letterIndex > words[wordIndex].length - 1;
		console.dir(wordsEl.children[wordIndex]);

		if (!isWordCompleted) {
			letterEl = wordsEl.children[wordIndex].children[
				letterIndex
			] as HTMLSpanElement;
		}
	}

	function checkLetter() {
		const currentLetter = words[wordIndex][letterIndex];

		if (typedLetter === currentLetter) {
			letterEl.dataset.letter = 'correct';
			increaseScore();
		}

		if (typedLetter !== currentLetter) {
			letterEl.dataset.letter = 'incorrect';
		}
	}
	function increaseScore() {
		correctLetters += 1;
	}
	function nextLetter() {
		letterIndex += 1;
	}
	function nextWord() {
		const isNotFirstLetter = letterIndex !== 0;
		const isOneLetterWord = words[wordIndex].length === 1;

		if (isNotFirstLetter || isOneLetterWord) {
			wordIndex += 1;
			letterIndex = 0;
			increaseScore();
			moveCursor();
		}
	}
	function updateLine() {
		const wordEl = wordsEl.children[wordIndex];
		const wordsY = wordsEl.getBoundingClientRect().y;
		const wordY = wordEl.getBoundingClientRect().y;

		if (wordY > wordsY) {
			wordEl.scrollIntoView({ block: 'center' });
		}
	}
	function resetLetter() {
		typedLetter = '';
	}
	function moveCursor() {
		const offset = 4;
		const { offsetTop, offsetLeft, offsetWidth } = letterEl;
		cursorEl.style.top = `${offsetTop + offset}px`;
		cursorEl.style.left = `${offsetLeft + offsetWidth}px`;
	}
	function handleKeydown(event: KeyboardEvent) {
		if (event.code === 'Space') {
			event.preventDefault();
			if (game === 'in progress') {
				nextWord();
			}
		}
		if (game === 'waiting for input') {
			startGame();
		}
	}
</script>

{#if game !== 'game over'}
	<div
		class="game"
		data-game={game}
	>
		<input
			bind:this={inputEl}
			bind:value={typedLetter}
			on:input={updateGameState}
			on:keydown={handleKeydown}
			class="input"
			type="text"
		/>
		<div class="time">
			{seconds}
		</div>
		<div
			bind:this={wordsEl}
			class="words"
		>
			{#each words as word}
				<span class="word">
					{#each word as letter}
						<span class="letter">{letter}</span>
					{/each}
				</span>
			{/each}
			<div
				bind:this={cursorEl}
				class="cursor"
			/>
		</div>
	</div>
{/if}

{#if game === 'game over'}
	<div class="results">
		<div>
			<p class="title">Words/Minute:</p>
			<p class="score">{Math.trunc($wordsPerMin)}</p>
		</div>
		<div>
			<p class="title">Accuracy</p>
			<p class="score">{Math.trunc($accuracy)}%</p>
		</div>
	</div>
{/if}

<style lang="scss">
	.game {
		position: relative;

		.time {
			position: absolute;
			top: -118px;
			font-size: 3rem;
			color: var(--primary);
			opacity: 0;
			transition: all 0.3s ease;
		}

		&[data-game='in progress'] .time {
			opacity: 1;
		}
	}
	.words {
		--line-height: 1em;
		--lines: 3;

		width: 75%;
		max-height: calc(var(--line-height) * var(--lines) * 1.42);
		display: flex;
		flex-wrap: wrap;
		gap: 0.4em;
		position: relative;
		font-size: 1.5rem;
		line-height: var(--line-height);
		overflow: hidden;
		user-select: none;
	}
	.cursor {
		position: absolute;
		height: 1.8rem;
		top: 0;
		border-right: 1px solid #fff;
		animation: cursor 1s infinite;
		transition: all 0.2s ease;

		@keyframes cursor {
			0%,
			to {
				opacity: 0;
			}
			50% {
				opacity: 1;
			}
		}
	}
	.results {
		display: flex;
		align-items: center;
		flex-direction: column;
		.title {
			font-size: 2rem;
			color: var(--fg-200);
			margin-top: 1.8rem;
		}

		.score {
			line-height: 3.4rem;
			display: flex;
			justify-content: center;
			font-size: 4rem;
			color: #6cf;
			font-family: 'loos-extended';
			font-weight: 700;
		}

		.play {
			margin-top: 1rem;
		}
	}
</style>
