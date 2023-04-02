<script lang="ts">
	import { onMount } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { blur } from 'svelte/transition';
	type Game = 'waiting for input' | 'in progress' | 'game over';
	type Word = string;

	let game: Game = 'waiting for input';
	let typedLetter = '';
	let seconds = 30;

	let words: Word[] = [];

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
		typedLetter = '';
		seconds = 30;
		wordIndex = 0;
		letterIndex = 0;
		correctLetters = 0;
		$wordsPerMin = 0;
		$accuracy = 0;
		getWords(100);
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
	function focusInput() {
		inputEl.focus();
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
	async function getWords(limit: number) {
		const response = await fetch(`/api/words?limit=${limit}`);
		words = await response.json();
	}

	onMount(async () => {
		getWords(100);
		focusInput();
	});
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
			autofocus
		/>
		<div class="time">
			{seconds}
		</div>
		{#key toggleReset}
			<div
				in:blur|local
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
		{/key}
		<div class="reset">
			<button
				on:click={resetGame}
				aria-label="reset"
			>
				<p class="again">New Words.</p>
			</button>
		</div>
	</div>
{/if}

{#if game === 'game over'}
	<div
		in:blur
		class="results"
	>
		<div>
			<p class="title">Words/Minute:</p>
			<p class="score">{Math.trunc($wordsPerMin)}</p>
		</div>
		<div>
			<p class="title">Accuracy</p>
			<p class="score">{Math.trunc($accuracy)}%</p>
		</div>
		<div class="reset">
			<button
				on:click={resetGame}
				aria-label="reset"
			>
				<p class="again">Try Again</p>
			</button>
		</div>
	</div>
{/if}

<style lang="scss">
	.game {
		position: relative;
		.input {
			position: absolute;
			opacity: 0;
		}
		.time {
			position: absolute;
			display: flex;
			justify-content: center;
			align-items: center;
			top: -162px;
			font-size: 3.4rem;
			line-height: 4.4rem;
			color: var(--primary);
			opacity: 0;
			transition: all 0.3s ease;
			background-color: #6cf;
			height: 126px;
			width: 126px;
			border-radius: 50%;
			font-family: 'loos-extended', serif;
			font-weight: 700;
			color: #fff;
		}

		&[data-game='in progress'] .time {
			opacity: 1;
		}
	}
	.reset {
		width: 100%;
		display: grid;
		justify-content: center;
		margin-top: 4rem;
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
		font-size: 2rem;
		line-height: var(--line-height);
		overflow: hidden;
		user-select: none;
	}
	.cursor {
		position: absolute;
		height: 2.4rem;
		top: 0;
		border-right: 1px solid #fff;
		animation: cursor 800ms infinite;
		transition: all 140ms ease;

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
		.again {
			font-size: 2rem;
			color: #fc6;
			margin-top: 1.8rem;
		}
		.play {
			margin-top: 1rem;
		}
	}
</style>
