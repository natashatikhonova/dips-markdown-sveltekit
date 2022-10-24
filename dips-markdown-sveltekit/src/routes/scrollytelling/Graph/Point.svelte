<script>
	import { tweened } from 'svelte/motion'
	
	export let x, y, values, data;
	
	const pos = tweened(0, { duration: y})
	$: $pos = y
	let showInfoBox = false;

	function padTo2Digits(num) {
 		 return num.toString().padStart(2, '0');
	}

	function formatDate(date) {
		return [
			padTo2Digits(date.getDate()),
			padTo2Digits(date.getMonth() + 1),
			date.getFullYear(),
		].join('/');
	}	


</script>

<circle cx={x} cy={$pos} on:mouseover={()=> {showInfoBox = true}} on:mouseout={()=>{showInfoBox = false}} />

{#if showInfoBox}
<defs>
    <filter x="0" y="0" width="1" height="1" id="solid">
      <feFlood flood-color="#e1ebfc" result="bg"/>
      <feMerge>
        <feMergeNode in="bg"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <text  x={x-100} y = {$pos - 10} filter="url(#solid)" >Måling: {values.x}, Temperatur: {values.y} ℃, Dato: {formatDate(data.date)}  </text>
{/if}

<style>
	circle {
		stroke: #9595db;
		stroke-width: 2px;
		fill: #9595db;
		r: 5;
	}
	circle:hover{
		fill: #d43838
	}

	text{
		font-weight: bold;
	}
</style>