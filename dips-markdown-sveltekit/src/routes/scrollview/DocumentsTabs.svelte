<script>
    import {openedDocTabs, documentList} from '../../stores/stores.js';
    import { marked } from 'marked';
    let selectedDoc = null;
    $: if ($documentList) {
        selectedDoc = $openedDocTabs.length>0 ? selectedDoc: null
    } 
    $:if ($openedDocTabs) {
        selectedDoc = $openedDocTabs.length>0 ? $openedDocTabs[$openedDocTabs.length-1] : null
    }

    function removeTab(doc){
        $openedDocTabs.splice($openedDocTabs.indexOf(doc), 1)
        $openedDocTabs = $openedDocTabs
    }
</script>

<div class="main">
    <header class="header">
        {#each $openedDocTabs as doc}
            <div class:selected-tab={selectedDoc == doc} class:tab={selectedDoc != doc} >
                <button class:selected-tab-button={selectedDoc == doc} on:click={()=>{selectedDoc = doc}}>
                    {doc.title} {doc.date.toDateString()}
                </button>
                <button class:selected-tab-remove-button={selectedDoc == doc} on:click={()=>{removeTab(doc)}}><i class="material-icons" >close</i></button>
                
            </div>
            {#if selectedDoc != doc }| {/if}
        {/each}
    </header>

    <div class="content">
        {#if selectedDoc!=null}
            <div class="doc-meta">Skrevet av {selectedDoc.author}, {selectedDoc.date.toDateString()}</div>  
            {#if selectedDoc.readable}
                <div>{@html marked(selectedDoc.context)}</div>
            {:else}
                <div ><a href={selectedDoc.context} target="_blank">Klikk her for å åpne dokumentet i egen visning</a></div>
            {/if}
        {/if}
    </div>
</div>

<style>
.main{
   display: flex;
   flex-direction: column; 
   height: 100%;
   width:100%;
   overflow-y: auto;
   overflow-x: hidden;
  
}

.header{
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    background-color: whitesmoke;
    position: absolute;
  

}
.content{
    margin-top: 40px;
    width: 100%;
    height: calc(100%-40px);
    padding: 10px;
}

.doc-meta{
    font-style: italic;
    margin-bottom: 7px;
}


.header button{
    width: fit-content;
    height: 40px;
    text-align: center;
    background: none;
    border:none;
}
.tab{
    display: inline-flex;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.tab:hover{
    background-color: rgb(250, 250, 250);
}

.header .selected-tab{
    background: white;
    font-weight: bold;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    display: inline-flex;

}
.header .selected-tab-button{
    background: white;
    font-weight: bold;
    border-radius: 10px;
    border-top-right-radius: 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

}
.header .selected-tab-remove-button{
    background: white;
    font-weight: bold;
    border-radius: 10px;
    border-top-right-radius: 10px;

}
i{
    background: none;
    font-size: medium;
}

i:hover{
    background: rgb(209, 209, 209);
    padding: 1px;
    border-radius: 20px;
}

a{
    color: #d43838;
    font-weight: bold;
        font-style: italic;
}

/* darkmode */
:global(body.dark-mode) .header{
    background-color: rgb(43, 43, 43);
}

:global(body.dark-mode) .tab button{
    color: #cccccc;
}

:global(body.dark-mode) .tab:hover{
    background-color: rgb(48, 48, 48);
}

:global(body.dark-mode) .header .selected-tab{
    background-color: rgb(49, 49, 49);
}

:global(body.dark-mode) .header .selected-tab-button{
    background-color: rgb(49, 49, 49);
    color: #cccccc;
}

:global(body.dark-mode) .header .selected-tab-remove-button{
    background-color: rgb(49, 49, 49);
    color: #cccccc;
}

:global(body.dark-mode)  i:hover{
    background: rgb(100, 100, 100);
}


</style>