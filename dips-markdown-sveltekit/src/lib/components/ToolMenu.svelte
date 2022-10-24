<script>
    import { currentView, checked_titles_filters, searchValue, amount_searched_words, current_doctype_filtergroup, showFiltermenu, selected_line_height, selected_text_size_scrollview, allfilterOff, currentDocumentObject, documentTypes, smallDevice, currentlyAddingNewNote, currentlyEditingNote} from '../stores/stores.js';
    import {createEventDispatcher} from 'svelte';
    import ThemeButton from './ThemeButton.svelte';

    export let hideToolBar = true;

    let showTextSettings = false
    let showLineHeights =false;
    let min_size = false;
    let max_size = false;
    let allViews = ["Dokumentliste", "Kontinuerlig visning", "Scrollytelling"]
    let selected_view = $currentView

    const line_heights = ["1.0", "1.15", "1.5", "2.0", "2.5", "3.0"]
    const dispatch = createEventDispatcher()

      //swichting between sideview and scrollview (*the two buttons in upper right corner)
    $: if (selected_view != $currentView) {
        if($currentlyAddingNewNote || $currentlyEditingNote){
            alert("Vennligst lagre eller avbryt!");
            selected_view = $currentView;
        } else{
            $currentView = selected_view;
        }
    }

    //remove line height window when clicked outside of it
    window.addEventListener("click", function(event) {
        if(event.target.id != "line-height" && event.target.id !="icon"){
            showLineHeights = false
        }else{
            showLineHeights = !showLineHeights
        }
    });

    //zoom in and out on text inside scrollview
    function set_text_size(direction){
        if (direction == "bigger"){
            $selected_text_size_scrollview++
            if ($selected_text_size_scrollview == 20){
                max_size=true
            }else if ($selected_text_size_scrollview>7){
            min_size =false
            }
        } else if (direction == "lower"){
            $selected_text_size_scrollview--
            if ($selected_text_size_scrollview == 7){
                min_size=true
            } else if ($selected_text_size_scrollview<20){
            max_size =false
            }
        }
    }

    //reset all filters
    function turnOffFilters(){
        $allfilterOff = true
        $current_doctype_filtergroup = {id: -1, name: "", filters: documentTypes.slice()}
        $checked_titles_filters = []
    }

    //toggle on/off filterpanel
    function filtermenu(){
        $showFiltermenu = !$showFiltermenu
    }

    //make content view take the entire screen
    function showContent(){
      dispatch("set_content_view_size", 100)
    }

    //make typewriter take entire screen
    function showTypewriter(){
        console.log("clicked")
        dispatch("set_typewriter_size", 100)
    }
</script>

<header class="tool-menu">
    <div class="left-menu">
        <button class="main-button" on:click={filtermenu}>Filter</button>
        {#if ($current_doctype_filtergroup.filters.length != documentTypes.length) || ($checked_titles_filters.length > 0)}
          <button class="filteroff-button" on:click={turnOffFilters}>Skru av filter</button>
        {/if}	
    </div>

    <div class="middle-menu">
        <div class="settings">
            <select class="dropdown-menu" bind:value={selected_view} >
              {#each allViews as value}<option {value} class = "dropdown-option">{value}</option>{/each}
            </select>
          
        </div>
    </div>

    <div class="right-menu">
        
        {#if $currentView}
            <!-- Search field for all documents (content, date, author, title) in scroll view-->
            <div class = "search_field" class:hidden={hideToolBar}>
                <input on:input={()=>{$amount_searched_words = 0}} bind:value = {$searchValue} placeholder="Søk.." name="search" class="search-input searchWord-input"/>
                {#if $searchValue != ""}
                    <button class="cancel-button" on:click={()=>{$searchValue = ""}}><i class="material-icons">close</i></button>
                {/if}
                <div class="searched_words"> 
                    {#if $searchValue != "" && $amount_searched_words != 0}
                        {$amount_searched_words} ord
                    {/if}
                </div>
            </div>

            <button class="settings-button" title= "Instillinger" class:active={showTextSettings} on:click={()=>{showTextSettings=!showTextSettings}}><i class="material-icons">settings</i></button>
            {#if showTextSettings}
                <div class="text-settings">
                    <div class="extra-functions">
                        <!-- Zoom in/out -->
                        <button
                        title="Zoom out"
                        class="toolbar-button"
                        disabled={min_size}
                        on:click={() => {set_text_size("lower")}}><i class="material-icons">zoom_out</i></button>
                        <button
                        title="Zoom in"
                        class="toolbar-button"
                        disabled={max_size}
                        on:click={() => {set_text_size("bigger")}}><i class="material-icons">zoom_in</i></button>
                    </div>
                    <!-- Line height panel -->
                    <div class="line-button">
                        <button title="Linjeavstand" class="toolbar-button" id="line-height"  class:active={showLineHeights} ><i class="material-icons" id="icon">format_line_spacing</i></button>
                        <div class:hidden={!showLineHeights} on:blur={()=>{showLineHeights=false}} class="dropdownContent">
                            <!-- Show all possible lineheights -->
                            {#each line_heights as value}
                                <button class="line-height-item" class:selected = {$selected_line_height==value} on:click={()=>{$selected_line_height=value}}>{value}</button>
                            {/each}
                        </div>
                    </div>
                </div>
            {/if}
        
        {/if}
        <ThemeButton/>
        {#if $currentView != "Kontinuerlig visning"}
            {#if !hideToolBar && ($currentView == "Dokumentliste")}
                <button title = "Vis dokumentliste" class="arrow-keys" on:click={showTypewriter}><i class="material-icons">keyboard_arrow_left</i></button>
            {:else if $currentDocumentObject && !($smallDevice && ($currentlyAddingNewNote || $currentlyEditingNote) ) && ($currentView != "Scrollytelling")}
                <button title = "tilbake" class="arrow-keys" on:click={showContent}><i class="material-icons">keyboard_arrow_left</i></button>
            {/if}
        {/if}

        
    </div>
</header>

<style>
    /* Search field */
    .searched_words{
        line-height: 2.2rem;
        width:60px;
        background: none;
        text-align:center;
        border: none;
        border-bottom: solid;
        margin: 2px;
        margin-left: 0;
        min-height: 30px;
        font-weight: bold;
    }

    .search_field{
        height: 100%;
        display: flex;
        flex-direction: row;
        margin-right: 10px;
    }

    .searchWord-input{
        margin-right: 0;
    }

    .left-menu{
        height: 100%;
        display: flex;
        flex-direction: row;
    }

    .right-menu{
        display: flex;
        height: 100%;
        flex-direction: row;
        align-items: center;
    }

    .tool-menu{
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        background-color: whitesmoke;
        box-shadow: 0 3px 5px -2px rgba(57, 63, 72, 0.3);
        margin-bottom: 3px;
    }

    /* Filter off button */
    .filteroff-button{
        width: fit-content;
        border: none;
        background: none;
        transition: border-color .15s ease-in-out, box-shadow .15s ease-in-out;
        cursor: pointer;
    }
    .filteroff-button:hover {
        color:#666363;
    }
    
    .hidden{
        visibility: hidden;
    } 
    
    .text-settings{
        display: flex;
        position: absolute;
        flex-direction: row-reverse;
        align-items: center;
        top:80px;
        width: 8.7rem;
        background-color: #f1f1f1;
        border: 1px rgb(191, 190, 190) solid;
        border-radius: 4px;
        margin-right: 1.15rem;
        z-index: 1;
        align-items: center;
        box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
    }

    .extra-functions{
        display: flex;
    }

    /* Line height panel/buttons */
    .dropdownContent{
        position: absolute;
        top:2.8rem;
        background-color: #f1f1f1;
        box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
        width: 2.3rem;
        z-index: 1;
        align-items: center;
    }

    .line-height-item{
        border:none;
        width: 100%;
        text-align: center;
        font-size: 11pt;
    }
    
    .line-height-item:hover{
        background-color: white;
    }
    
    .selected{
        background-color: white;
    }

    /* Toolbar button */
    .toolbar-button {
        display: flex;
        justify-content: center;
        align-items: center;
        background: #fff;
        width: 2.3rem;
        height: 2.3rem;
        margin: 0.3rem;
        border-radius: 4px;
        border: 1px solid #ced4da;
        transition: border-color .15s ease-in-out, box-shadow .15s ease-in-out;
        cursor: pointer;
    }
    
    .toolbar-button:hover {
        outline: none;
        border-color: #87bbde;
        box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
    }
    
    .toolbar-button.active {
        border: solid 2px;
        border-color: #87bbde;
    }

    /* Cancel button - searchfield */

    .cancel-button{
        display: flex;
        justify-content: center;
        align-items: center;
        background: none;
        width: 2.2rem;
        height: 2.2rem;
        border:none;
        border-bottom: solid;
        margin-top: 3px;
        cursor: pointer;
        border-bottom: solid;
    }
    
    /* Text settings button */
    .settings-button {
        display: flex;
        justify-content: center;
        align-items: center;
        background: none;
        width: 2.3rem;
        height: 2.3rem;
        margin-right: 0.8rem;
        border: none;
        cursor: pointer;
    }
    
    .settings-button :hover {
        color:#d43838;
    }
    
    .settings-button.active{
        color:#d43838;
    }
    .dropdown-menu {
        background-color:whitesmoke;
        height: 25px;
        border-radius: 4px;
        border: none;
        cursor: pointer;
        font-weight: bold;

  }

  .dropdown-menu:hover {
    outline: none;
    border: none;
    border-bottom: solid;
    border-color: #d43838;
    
  }


  /* Darkmode */
  :global(body.dark-mode) .dropdown-menu{
    background-color: rgb(43, 43, 43);
    color: #cccccc;
  }

  :global(body.dark-mode) .dropdown-menu:hover{
    border: none;
    border-bottom: solid 1px;
    border-color: #cccccc;
  }

    
    /* dark mode styling */
    :global(body.dark-mode) .tool-menu{
        background-color: rgb(43, 43, 43);
        color: white;
    }

    :global(body.dark-mode) input{
        border-bottom: 1px solid #cccccc;
        color:#cccccc;  
    }

    :global(body.dark-mode) .searched_words{
        border-bottom: 1px solid #cccccc;
    }

    :global(body.dark-mode) ::placeholder {
        color: #cccccc;   
    }

    :global(body.dark-mode) .filteroff-button{
        color:#cccccc;
    }

    :global(body.dark-mode) .filteroff-button:hover{
        color:#d43838;
    }

    :global(body.dark-mode) .text-settings{
        background-color: rgb(49, 49, 49);
        border: 0.5px #cccccc solid;
    }
    
    :global(body.dark-mode) .toolbar-button{
        background-color: #424242;
        color: #cccccc;
        border: none;
    }

    :global(body.dark-mode) .toolbar-button:hover{
        border-color: #b7daff;
        box-shadow: 0 0 0 0.2rem rgba(104, 177, 255, 0.5);
    }
    
    :global(body.dark-mode) .settings-button{
        color: #cccccc;
    }

    :global(body.dark-mode) .cancel-button{
        color:#cccccc;
        border-bottom: 1px solid #cccccc;
    }
    
    :global(body.dark-mode) .arrow-keys {
        color: #cccccc;
    }
    :global(body.dark-mode) .arrow-keys:hover{
        color: #d43838;
    }

    :global(body.dark-mode) .arrow-keys:disabled{
        color:#585858;
    }
</style>