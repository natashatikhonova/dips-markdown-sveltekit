<script>
    import DocumentItem from "./DocumentItem.svelte";
    import {currentDocumentObject, documentList, currentlyAddingNewNote, current_doctype_filtergroup, showFiltermenu, smallDevice} from '../../stores/stores.js';
    import ToolMenu from '$lib/images/components/ToolMenu.svelte';
    import { Pane, Splitpanes } from 'svelte-splitpanes';
    import FilterMenu from '$lib/images/components/filter/FilterMenu.svelte';
  
    
    let sortedData = $documentList;
    const tableHeaders = ["title", "date","author"];
    let selectedHeader = "date";
    let ascendingOrder = false;
    let lengde;
    // default sizes for sliding panes
    let current_size= "0";
    let documentview_size = "125";
    let maxSize_filter = "0"
    
    //filter list by documenttypes
    $: filteredDocumentlist = ($documentList.filter(item => ($current_doctype_filtergroup.filters.includes(item.title))));

    //toggle filterpanel
    $: if($showFiltermenu){
        open()
    } else{
        close()
    }

    //set sizes for sliding panes depending on whether content view is showing
    $: if ($currentDocumentObject && $showFiltermenu && !$smallDevice){
        current_size = "60"
    }
    $: if (!$currentDocumentObject && $showFiltermenu&& !$smallDevice){
        current_size="25"
    }

    //update store value
    function addNote(){
        $currentlyAddingNewNote = true;
    }
    
    //sort strings depending on which header is selected
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
        
        selectedHeader = colHeader;
        $documentList = sortedData;
        ascendingOrder = !ascendingOrder;
        lengde = $documentList.length;
    }
    //sorting by default/start
    sortByString(selectedHeader);

    //if documentlist updates, then sort
    $: if ($documentList.length>lengde) {
        ascendingOrder = false;
        sortByString("date");
    }

    //update sizes for sliding panes
    function close(){
        current_size = "0";
        documentview_size = "125";
        $showFiltermenu = false;
        maxSize_filter = "0"
    }

    //update sizes for sliding panes
    function open(){
        if($smallDevice){
            current_size = "100"
            maxSize_filter = "100"
            documentview_size="0"
        }else{
            current_size = "25";
            maxSize_filter = "50"
            documentview_size = "100";
        }
    }
</script>

<div class = "with-toolbar-conteiner">
    <ToolMenu hideToolBar={true} on:set_content_view_size/>
    <div class="document-container">
        <Splitpanes theme="modern-theme">
            <!-- Panel for filters -->
            <Pane minSize=20 size={current_size} maxSize={maxSize_filter}>
                <FilterMenu showFilterByTitles={false}/>
            </Pane>
            <!-- Main panel with documents -->
            <Pane size={documentview_size}>
                <div class="table-container" >
                    <table>
                        <thead>
                            <tr>
                                <!--copied from https://svelte.dev/repl/f04266dcd39c4024b1e89084aa549844?version=3.31.2 -->
                                <!-- Table headers -->
                                {#each tableHeaders as header}
                                    <th class:highlighted={selectedHeader === header} on:click={() => sortByString(header)}>
                                        {#if header == "title"}
                                            {"Tittel"}
                                        {:else if header == "date"}
                                            {"Dato"}
                                        {:else if header == "author"}
                                            {"Forfatter"}
                                        {/if}
                                        <!-- Toggle arrows by headers depending on what order is used for sorting -->
                                        {#if header === selectedHeader}	
                                            <span class="order-icon" on:click={() => ascendingOrder = !ascendingOrder}>
                                                {@html ascendingOrder ? "&#9661;" : "&#9651;"}
                                            </span>		
                                        {/if}	
                                    </th>	
                                {/each}
                        </tr>
                        </thead>
                        <tbody>
                            <!-- Shows documents as DocumentItem components -->
                            {#each filteredDocumentlist as item}
                                {#if $currentDocumentObject === item}
                                    <DocumentItem document = {item} chosen = {true} /> <!--add color if file is chosen -->
                                {:else} 
                                    <DocumentItem document = {item} chosen = {false} />
                                {/if}
                            {/each} 
                        </tbody>    
                    </table>
                </div>
            </Pane>
        </Splitpanes>
    </div>
</div>
<!-- Button to add new document - right bottom corner -->
{#if (!$showFiltermenu && $smallDevice) || !$smallDevice}
    <button title="Ny notat"class="add-button" class:mobile = {$smallDevice} class:visible={$currentlyAddingNewNote} on:click = {addNote}>+</button>
{/if}

<style>
    
    .document-container{
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        overflow-x: hidden;
    }
    
    table {
        width: 100%;
        border-collapse: collapse;
        background-color: white;
    }
    
	th {
        text-transform: uppercase;
        background: rgb(253, 253, 253);
		cursor: pointer;
        text-align: left;
		padding: 16px;
        border-bottom:1.5px solid rgb(0, 0, 0);
	}

	.order-icon {
        color: hsl(15, 100%, 25%);
	}
	
	.highlighted {
        color: #cf2417;
	}
     
    .table-container{
        min-width: none;
        overflow-y: auto;
        height: 100%;
        width: 100%;
    }
    
    .table-container thead th{
        position:sticky;
        top:0;
    }
    
    /* dark mode styling */
    :global(body.dark-mode) table{
        background-color: rgb(49, 49, 49);
    }
    
    :global(body.dark-mode) th{
        background-color: rgb(49, 49, 49);
        border-bottom:1.5px solid #cccccc;    
    }

    :global(body.dark-mode) .highlighted{
        color: rgb(148, 17, 17);
    }
</style>

