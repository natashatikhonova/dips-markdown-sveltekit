<script>
    import {currentDocumentObject} from '../../stores/stores.js';
    export let document;
    export let chosen = false;

    //update currentDocumentObject when item is clicked on
    function handleClick(){
        $currentDocumentObject = document
    }

</script>

<tr class:selected = {chosen} class:notSelected = {!chosen} on:click={handleClick} >
    <td>{document.title}</td>
    <td>{document.date.toDateString()}</td>
    <td>{document.author}</td>
</tr>

<style> 
    td {
        text-align: left;
		padding-top: 10px;
		padding-bottom: 10px;
        padding-right: 16px;
        padding-left: 10px;
        border-bottom:1px solid rgb(97, 96, 96);  
	}

    .selected{
        background-color: #ccebff;
    }

    .notSelected:hover{
        background-color: #e6f2ff;
    }
    
    /* dark mode styling */
    :global(body.dark-mode) .selected{
        background-color: rgb(61, 61, 61);  
    }

    :global(body.dark-mode) .notSelected:hover{
        background-color: rgb(61, 61, 61);    
    }
</style>