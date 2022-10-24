<script>
    import {currentView, documentList, searchValue, amount_searched_words, searchedDocuments, showFiltermenu, selected_line_height, selected_text_size_scrollview, smallDevice, editor} from '../../stores/stores.js';
    import ScrollItem from "./ScrollItem.svelte";
    import Typewriter from '../typewriter/Typewriter.svelte';
    import {currentlyAddingNewNote, currentlyEditingNote} from '../../stores/stores.js';
    import { marked } from 'marked';
    import { Pane, Splitpanes } from 'svelte-splitpanes';
    import ToolMenu from '../ToolMenu.svelte';
    import FilterMenu from '../filter/FilterMenu.svelte';
    import {createEventDispatcher} from 'svelte';

    const dispatch = createEventDispatcher()
    let editor_size = 50
    let show = $currentlyAddingNewNote;
    let sortedData = $documentList;
    let ascendingOrder = true;
    let lengde = $documentList.length;
    //default sliding panes sizes
    let current_size= "0";
    let maxSize_filter = "0"
    let scrollview_size = "125";
    
    //toggle filters panel
    $: if($showFiltermenu){
        open()
    } else{
        close()
    }

    //default sort adn hide editor after saving
    function save(){ 
        show = false;
        ascendingOrder= true;
        sortByString("date")
    }

    //hide editor
    function cancel(){
        show = false;
    }
    
    //show editor and update currentlyAddingNewNote
    function addNote(){
        $currentlyAddingNewNote = true;
        show =true;
    }
    
    //sort documents by date
    const sortByString = (colHeader) => {
        sortedData = sortedData.sort((obj1, obj2) => {
            if (obj1[colHeader] < obj2[colHeader]) {
                return -1;
			} else if (obj1[colHeader] > obj2[colHeader]) {
				return 1;
			}
			return 0; //string code values are equal		
		});

		if (!ascendingOrder) {
            sortedData = sortedData.reverse()
		}
        $documentList = sortedData;
        ascendingOrder = !ascendingOrder;
	}
    
    $: if ($documentList.length>lengde) {
        ascendingOrder = true;
        sortByString("date");
    }
    //sorting by default
    sortByString("date");

    //markes all the "word" in "el" with a color style
    function wrapWord(el, word){
        var expr = new RegExp(word, "gi");
        var nodes = [].slice.call(el.childNodes, 0);
        for (var i = 0; i < nodes.length; i++)
        {
            var node = nodes[i];
            if (node.nodeType == 3) // textNode
            {
                var matches = node.nodeValue.match(expr);
                if (matches)
                {
                    var parts = node.nodeValue.split(expr);
                    for (var n = 0; n < parts.length; n++)
                    {
                        if (n)
                        {
                            var span = el.insertBefore(document.createElement("span"), node);
                            span.appendChild(document.createTextNode(matches[n - 1]));
                            span.style = "color:#d43838; border-bottom: 3px solid #d43838"
                            
                        }
                        if (parts[n])
                        {
                            el.insertBefore(document.createTextNode(parts[n]), node);
                        }
                    }
                    $amount_searched_words++
                    el.removeChild(node);
                }
            }
            else
            {
                wrapWord(node, word);
            }
        }
    }

    //Highlight all the words searched on in htmlText
    function highlightWord(htmlText) {
        if ($searchValue!== "") {
            let container
            container = document.createElement("div")
            container.innerHTML = htmlText
            wrapWord(container, $searchValue)
            return container.innerHTML
        } else{
            return htmlText
        }
    }

    //update sizes for sliding panes
    function close(){
        //sets pane sizes
        current_size = "0";
        maxSize_filter = "0"
        scrollview_size = "125";
        $showFiltermenu = false;
    }

    //update sizes for sliding panes
    function open(){
        if($smallDevice){
            //mobile
            current_size = "100"
            maxSize_filter = "100"
            scrollview_size="0"
        }else{
            current_size = "25";
            maxSize_filter = "50"
            scrollview_size = "100";
        }
    }

    function set_editor_size(size){
        //Different outcome based on panes current size
        if(editor_size > 70 && size == 0){
        editor_size = 50
        console.log(1)
        }
        else if(editor_size < 30 && size == 100){
        editor_size = 50
        console.log(2)
        }
        else{
        editor_size = size
        }
    }

    function updateEditorSize(e){
    if(e.detail[1]){
        editor_size = e.detail[1].size
    }
  }
</script>

<head>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
</head>

    <div class="with-toolbar-conteiner">
        <!-- Toggle Toolmenu (header with searchfield, filter button and textsettings) -->
        {#if ($currentlyAddingNewNote || $currentlyEditingNote) && show && $smallDevice}
            <ToolMenu hideToolBar={true}/>
        {:else}
            <ToolMenu hideToolBar={false} on:set_typewriter_size={()=>{dispatch("set_typewriter_size", 100)}}/>
        {/if}
        <div class="scroll-container">
            <Splitpanes theme="modern-theme">
                <!-- Pane for filter panel -->
                <Pane minSize="20" size={current_size} maxSize={maxSize_filter}>
                    <FilterMenu on:close={close}/>
                </Pane>
                <Pane size={scrollview_size} >
                    <Splitpanes theme="modern-theme" horizontal={true} on:resized="{updateEditorSize}">
                        <!-- Pane for scroll view of documents -->
                        <Pane size={(100 - editor_size).toString()}> 
                            <div class:container={show} class:full-container={!show} >
                                <!-- Shows all documents as ScrollItem components -->
                                {#if $searchedDocuments.length > 0}
                                    <div class = "document-list" style="line-height:{$selected_line_height}; font-size: {$selected_text_size_scrollview}pt">
                                        
                                        {#each $searchedDocuments as item}
                                            <ScrollItem htmlText = {(item.temp_filtered_context == "") ? highlightWord(marked(item.context)) : highlightWord(marked(item.temp_filtered_context))} date = {highlightWord(item.date.toDateString())} title = {highlightWord(item.title)} author = {highlightWord(item.author)} on:editItem = {()=>show=!show} document = {item} deactivate ={show}/>
                                        {/each}
                                    </div>
                                {:else}
                                    <div class = "no-result"> Ingen Søkeresultater</div>
                                {/if}
                                <!-- Button to add new document - right bottom corner -->
                                {#if !show}

                                    <button title="Ny notat"class="add-button" class:visible={$currentlyAddingNewNote|| $currentlyEditingNote} on:click = {addNote}>+</button>

                                {/if}
                            </div>
                        </Pane>
                        {#if show && ((!($currentView == "Dokumentliste") && !$smallDevice) || $smallDevice)}
                            <!--  Pane for Typewriter -->
                            <Pane size={$smallDevice ? "100" : editor_size.toString()}>
                                <div class="editor">
                                    <Typewriter editor_size = {editor_size} on:save = {save} on:cancel = {cancel} on:set_editor_size={(e)=>set_editor_size(e.detail)}/>
                                </div>
                            </Pane>
                            {#if editor_size==0}
                            <div class="hidden-typewriter">
                                <button class="arrow-up-button" on:click={()=>{set_editor_size(50)}}>Vis <i class="material-icons">keyboard_arrow_up</i></button>
                            </div>
                            {/if}
                        {/if}
                    </Splitpanes>
                    <!-- ONLY mobile button to toggle editor up and down -->
                    {#if $smallDevice && ($currentlyAddingNewNote || $currentlyEditingNote)&&!show}
                        <button class="mobile-arrow-up-button" on:click={()=>{show=true}}>Vis <i class="material-icons">keyboard_arrow_up</i></button>
                    {/if}
                </Pane>
            </Splitpanes>
        </div>
    </div>

<style>

    .document-list {
        margin-top: 4vh;
        line-height: normal;
        font-size:11pt;
        margin-bottom: 6vh;
    }

    .scroll-container{
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        overflow-y:auto;
        
     
    }
    
    .full-container{
        flex-grow: 1;
        overflow-y: auto;
        display: flex; 
        flex-direction: column-reverse;
        background-color: white;
        width: 100%;
        height: 100%;
        
        
    }

    .container{
        overflow-y: auto; 
        display:flex;
        flex-direction: column-reverse;
        background-color: white;
        width: 100%;
        height: 100%;
        min-width: 17%;
        
    }

    .editor{
        display:flex;
        flex-direction: column;
        /* overflow-y: auto; */
        width: 100%;
        height: 100%;
        background: #ffffff;
        border: solid 1px black;
        background-color: white;
    }

    .hidden-typewriter{
        height:3%;
    }

    .visible{
        visibility: hidden;
    }
    
    .no-result{
        display:flex;
        font-size: xx-large;
        align-self: center;
        justify-self: center;
        position: absolute;
        top: 40%;
    }

    .arrow-up-button{
        display: flex;
        justify-content: center;
        align-items: center;
        align-self: center;
        position: absolute;
        bottom: 0;
        width: 100%;
        background: rgb(255, 255, 255);
        border:none;
        font-weight: bold;
        font-size: 300;
    }

    .mobile-arrow-up-button{
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        bottom: 0;
        width: 100%;
        padding: 1%;
        background: rgb(255, 255, 255);
        border:none;
        font-weight: bold;
        font-size: medium;
    }
    
    /* dark mode styling */
    :global(body.dark-mode) .full-container{
        background-color: rgb(49, 49, 49);
    }

    :global(body.dark-mode) .container{
        background-color: rgb(49, 49, 49);
    }

    :global(body.dark-mode) .editor{
        background-color: rgb(49, 49, 49);
    }

    :global(body.dark-mode) .arrow-up-button{
        background: rgb(49, 49, 49);
        color:#cccccc;
    }
    
    :global(body.dark-mode) .mobile-arrow-up-button{
        background: rgb(49, 49, 49);
        color:#cccccc;
    }
</style>