<script>
	import { onMount } from 'svelte'
	import { draw } from 'svelte/transition'
	import { expoInOut, circOut} from 'svelte/easing'
	import { tweened } from 'svelte/motion'
	import Point from './Point.svelte'

	export let height;
	export let width;
	export let xName;
	export let yName;
	export let points;
	export let removed;
	$: console.log(removed)
	$: console.log(durationTime)


	let maxValuesGridX = 10;
	let maxValuesGridY = 10;
	$: durationTime = removed? 0: points.length*300;

	const initialCount = points.length
	const animatedHeight = tweened(0, { easing: circOut})
	const animatedWidth = tweened(0, { easing: circOut })
	$: maxY = Math.max(...points.map(p => p.y))
	$: minY = Math.min(...points.map(p => p.y))
	$: maxX = Math.max(...points.map(p => p.x))
	$: minX = Math.min(...points.map(p => p.x))
	$: xScale = width/points.length;
	$: heightDict = (maxY == minY)? noHeightDif():calcHeight(points);
	$: path = `M${points[0].x},${heightDict[points[0].y]} ${points.slice(1, initialCount).map(p => `L${p.x*xScale},${heightDict[p.y]}`).join(' ')}`
	$: $animatedHeight = height
	$: $animatedWidth = width

	let showLine = false

	function calcHeight(points){
		let dif = maxY - minY;
		
		let heightDict = {maxY: 0, minY: height}
		
		for (let i = 0; i < points.length; i++){
			let y = points[i].y;
			let heigthPx = (y-minY) * (height/dif)
			heightDict[y] = height-heigthPx;
		}
		return heightDict;
	}
	function noHeightDif(){
		let dif = height/2
		
		let heightDict = {maxY: 0, minY: height}
		
		for (let i = 0; i < points.length; i++){
			let y = points[i].y;
			let heigthPx = (y) * (height/dif)
			heightDict[y] = height-heigthPx;
		}
		return heightDict;
	}
	function removeSomeValues(array, axis){
		let newArray = []
		if (axis == "x"){
			let remove = Math.ceil(points.length / maxValuesGridX);
			for(let i = 0; i < array.length; i++){
				if ((array[i].x == maxX) || (i%remove == 0) || (array[i].y == minY)) {
					newArray.push(array[i])
				}
			}
		} else {
			let remove = Math.ceil(Object.keys(heightDict).length / maxValuesGridY);
			for(let i = 0; i < array.length; i++){
				if ((array[i].y == maxY) || (i%remove == 0) || (array[i].y == minY) ) {
					newArray.push(array[i])
				}
			}
		}
		return newArray
	}

	onMount(() => {
		// const interval = setInterval(addRandomPoint, 5000)

		setTimeout(() => showLine = true)
		// return () => clearInterval(interval)
	})
	
	function addRandomPoint() {
		const randomPoint = {x: points.length, y: 36+Math.floor(Math.random()*5)}
		points = [...points, randomPoint]
	}

</script>



<svg viewBox="0 0 {$animatedWidth} {$animatedHeight}">
	<path
		d="M0 {$animatedHeight} L{$animatedWidth} {$animatedHeight}"
		class="axes"
	/>
	<g class="x" transform="translate(0,120)">
		{#if points.length < maxValuesGridX}
				{#each points as point}
					<text x={point.x*xScale} y={$animatedHeight-80}>{point.x}</text>
				{/each}

		{:else}
			{#each removeSomeValues(points, "x") as point}
				<text x={point.x*xScale} y={$animatedHeight-80}>{point.x}</text>
			{/each}
		{/if}
		<text x={maxX*xScale + 30} y={$animatedHeight-80} class = "xName">{xName}</text>
	</g> 

	<path
		d="M0 {$animatedHeight} L0 0"
		class="axes"
	/>
	<g class="y" transform="translate(-10,0)">
		{#if Object.keys(heightDict).length < maxValuesGridY}
			{#each points as point}
				<text x={-15} y={heightDict[point.y]+5}>{point.y}</text>
			{/each}
		{:else}
			{#each removeSomeValues(points, "y") as point}
				<text x={-15} y={heightDict[point.y]+5}>{point.y}</text>
			{/each}
		{/if}
		<text x={-15} y={maxY - 65} class = "yName">{yName}</text>
	</g>

	{#if showLine}
	 <path transition:draw={{duration: (removed? 0: 300), delay: (removed? 0: 300), easing: expoInOut}} d={path} stroke-linecap="round" stroke-linejoin="round"/>
	{/if} 

	{#each points.slice(initialCount) as point, i}
		{console.log(initialCount)}
		<path transition:draw={{duration:(removed? 0: 300), delay: (removed? 0: 300)}} d={`M${points[initialCount-1+i].x*xScale},${heightDict[points[initialCount-1+i].y]} L${point.x*xScale},${heightDict[point.y]}`} />
	{/each}

  {#each points as point}
		<Point x={point.x * xScale} y={heightDict[point.y]} values = {point} data = {point.data} />
	{/each}
</svg>

<style>
	:global(body) {
		display: flex;
		flex-direction: column;
	}
	.xName, .yName{
		font-weight: bold;;
	}

	svg {
		padding: 0;
		overflow: visible;
	}

	path {
		fill: none;
		stroke: #9595db;
		stroke-width: 4px;
	}
</style>