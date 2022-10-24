<script>
    import {current_doctype_filtergroup, doctype_filter_groups, allfilterOff, documentTypes, searchedDocuments, searchValue, documentList, checked_titles_filters} from '../../stores/stores';
    import { writable } from 'svelte/store';
    import Modal, { bind } from 'svelte-simple-modal';
    import FilterForm from './FilterForm.svelte';
    import {set_filtered_text, load_markdownNodes} from "../../utils/markdown/markdownFunctions"

    let showAllFilters = true;
    let showClicked = false;
    let filter_searched_value = "";
    let filtergroup_searched_value ="";
    let manageGroup = false
    let showAllButtonName = "Nullstill"
    let searchedDocumentTypes = []
    let original_doctypes = []
    let selected_documentObj_titles = []
    let all_markdown_titles = []

    const modal = writable(null);

    //updates list whenever the group is changed
    $: if($current_doctype_filtergroup.filters){
        let filteredDocumentlist = ($documentList.filter(item => ($current_doctype_filtergroup.filters.includes(item.title))));

        //Adds all the markdown titles in the current filtered documentList to an array of objects
        //Object structure: {title: .. , nodes: [..], checked:true/false}
        //*checked variable in object is irrelevant here*/
        all_markdown_titles = load_markdownNodes(filteredDocumentlist,[], $checked_titles_filters)

        //makes a list of object with all doctypes with a correct checked value
        //object structure: {name: <doctype String>, checked: true/false}
        make_obj_list()

        //Updates $checked_titles_filters to include all the title nodes under this new doctype filter
        for (let i = 0; i<all_markdown_titles.length; i++){
            for (let j =0; j<$checked_titles_filters.length; j++){
                if ($checked_titles_filters[j].title == all_markdown_titles[i].title){
                    $checked_titles_filters[j].nodes = all_markdown_titles[i].nodes //Chooses all nodes under this doctype filter
                }
            }
        }
    }
    
    //filters groups by search:
    $: searchedFiltergroups = $doctype_filter_groups.filter(item => (item.name.toLowerCase().includes(filtergroup_searched_value.toLowerCase())));
    
    //filters doctypes by search && updates showing doctypes
    $: if(showClicked){
        let clickedDocTypes = []
        for(let i = 0; i<original_doctypes.length; i++){
            if (original_doctypes[i].checked){
                clickedDocTypes.push(original_doctypes[i])
            }
        }
        searchedDocumentTypes = clickedDocTypes.filter(item => (item.name.toLowerCase().includes(filter_searched_value.toLowerCase())));
    }else{
        searchedDocumentTypes = original_doctypes.filter(item => (item.name.toLowerCase().includes(filter_searched_value.toLowerCase())));
    }

    //checks all items whenever filter is turned off
    $: if($allfilterOff){
        $documentList.forEach((doc)=> (doc.temp_filtered_context = ""))
        $current_doctype_filtergroup = {id: -1, name: "", filters: documentTypes.slice()}
   
        for (let i = 0; i<original_doctypes.length; i++){
            original_doctypes[i].checked = true
        }

        $allfilterOff = false
        $checked_titles_filters = []
    }  

    //switches button name depending on amount of chosen items
    $: if($current_doctype_filtergroup.filters.length == documentTypes.length){
        showAllButtonName = "Nullstill"
    }
    else if ($current_doctype_filtergroup.filters.length < documentTypes.length){
        showAllButtonName = "Velg alle"
    }

    //sorts by first letter whenever search value is changed
    $: if (filter_searched_value!=""){
        searchedDocumentTypes = relevantSort(searchedDocumentTypes, filter_searched_value)
    }
    $: if (filtergroup_searched_value !=""){
        searchedFiltergroups = relevantSort(searchedFiltergroups, filtergroup_searched_value)
    }

    //add checked titles with current doctype filter to checked_titles
    let checked_titles = []
    $: if (all_markdown_titles.length > 0){
        checked_titles = []
        for (let i = 0; i < all_markdown_titles.length; i++){
            if ($checked_titles_filters.find(item => (item.title == all_markdown_titles[i].title )) != null){
                //Found all_markdown_titles[i] in $checked_titles_filters
                checked_titles.push(all_markdown_titles[i])
            }
        }
    }
    
    $: if ($checked_titles_filters.length == 0 || checked_titles.length == 0){
        //sets list depending on what doctypes are chosen
        let filteredDocumentlist = ($documentList.filter(item => ($current_doctype_filtergroup.filters.includes(item.title))));
        //show documents depending on main search field
        $searchedDocuments = filteredDocumentlist.filter(item =>(
            (item.context.toLowerCase().includes($searchValue.toLowerCase()))  ||
            (item.author.toLowerCase().includes($searchValue.toLowerCase())) ||
            (item.date.toDateString().toLowerCase().includes($searchValue.toLowerCase())) ||
            (item.title.toLowerCase().includes($searchValue.toLowerCase()))))
            
    } else {
        selected_documentObj_titles = set_filtered_text(checked_titles)
        let filteredDocumentlist = (selected_documentObj_titles.filter(item => ($current_doctype_filtergroup.filters.includes(item.title))));
        //show documents depending on main search field
        $searchedDocuments = filteredDocumentlist.filter(item => (
            (item.context.toLowerCase().includes($searchValue.toLowerCase())) ||
            (item.author.toLowerCase().includes($searchValue.toLowerCase())) ||
            (item.date.toDateString().toLowerCase().includes($searchValue.toLowerCase())) ||
            (item.title.toLowerCase().includes($searchValue.toLowerCase()))))
    }
    
    //changes between displaying all filters and group filters
    function changeMode(){
        showAllFilters = !showAllFilters
        make_obj_list()
    }

    //make a list with all doctypes with a correct checked value
    function make_obj_list(){
        let obj_list =  []
        for (let i = 0; i < documentTypes.length; i++) {
            if($current_doctype_filtergroup.filters.includes(documentTypes[i])){
                
                obj_list.push({name: documentTypes[i], checked: true})
            } else{
                obj_list.push({name: documentTypes[i], checked: false})
            }
        }
        original_doctypes = obj_list   
    }


    //sorts by the first letter
    function relevantSort(list, value){
        let startsWithSearch = []
        for(let i = 0; i<list.length; i++){
            if (list[i].name.toLowerCase().startsWith(value)){
                startsWithSearch.push(list[i])
                list.splice(i, 1)
            }
        }
        list = startsWithSearch.concat(list)
        return list
    }

    //checks/unchecks all items and switches button
    function clickedAll(){
        if($current_doctype_filtergroup.filters.length < documentTypes.length){
            //checks all items
            $current_doctype_filtergroup.filters = documentTypes.slice()
            $current_doctype_filtergroup = $current_doctype_filtergroup
            showAllButtonName = "Nullstill"   
            for (let i = 0; i< original_doctypes.length; i++){
                original_doctypes[i].checked = true 
            } 
        }
        else{
            //unchecks all items
            $current_doctype_filtergroup.filters = []
            $current_doctype_filtergroup = $current_doctype_filtergroup
            showAllButtonName = "Vis alle"
            for (let i = 0; i< original_doctypes.length; i++){
                original_doctypes[i].checked = false
            } 
        }
    }

    //finds an index of the group
    function find_index(filterGroup){
        for(let i = 0; i < $doctype_filter_groups.length; i++){
            if ($doctype_filter_groups[i].id == filterGroup.id) {
                return i
            }
        }
        return -1
    }

    //open popup window for a new/editable group
    function openModal(group){
        if (group){
            //edit group
            modal.set(bind(FilterForm,{edit_bool: true, edit_obj_indeks: find_index(group), original_list_obj: original_doctypes.slice()}))
        } else {
            //add new group
            modal.set(bind(FilterForm,{edit_bool: false, edit_obj_indeks: -1, original_list_obj: original_doctypes.slice()}))
        }
        manageGroup = true
    }

    //happens when an item is checked
    function updateCheckedList(item){
        //update current group to a new object so it wont be overwritten
        if ($current_doctype_filtergroup.name !=""){
            $current_doctype_filtergroup = {id: -1, name:"",filters: $current_doctype_filtergroup.filters.slice()}
            $current_doctype_filtergroup = $current_doctype_filtergroup
        }
        if (item.checked){
            //remove from current group list
            $current_doctype_filtergroup.filters.splice($current_doctype_filtergroup.filters.indexOf(item.name), 1)

        }else if(!item.checked){
            // add to  current group listlist
            $current_doctype_filtergroup.filters.push(item.name)
        }

        $current_doctype_filtergroup = $current_doctype_filtergroup
    }
</script>

<h2>Filter dokumenttyper</h2>
<div class="main">
    <!-- Popup modal for creating/editing filtergroup -->
    {#if manageGroup}
        <Modal on:closed={() => manageGroup = false } show={$modal}/>
    {:else if showAllFilters}
        <div class="filter-panel">
            <div class="filter-panel-tools">
                {#if !showClicked}
                    <h3>Alle filtere:</h3>
                {:else}
                    <h3>Valgte filtere:</h3>
                {/if}
                <input class="search-input" bind:value={filter_searched_value} type="text" placeholder="Søk.." name="search">
                <div>
                    {#if searchedDocumentTypes.length > 0}
                        <button class="secundary-button" on:click={clickedAll}>{showAllButtonName}</button>
                    {/if}
                    <button class="secundary-button" on:click={changeMode}>Filtreringsgrupper</button>
                    {#if !showClicked}
                        <button class="secundary-button" on:click={()=>{showClicked=true}}>Vis valgte</button>
                    {:else}
                        <button class="secundary-button" on:click={()=>{showClicked=false}}>Alle filtere</button>
                    {/if}
                </div>
            </div>
            {#if searchedDocumentTypes.length == 0}
                <div class = "no-doctypes">Ingen dokumenttyper</div>
            {:else}
                <!-- Shows all documenttypes as checkboxes -->
                <div class="filters">
                    {#each searchedDocumentTypes as item}    
                        <label class = "filterItem" >
                            <input class='test' type="checkbox" on:click={()=>updateCheckedList(item)} bind:checked={item.checked} >
                            <span class="checkmark"></span>
                            {item.name}
                        </label>
                    {/each}
                </div>
                <div class = "save-filter-button">
                    {#if $current_doctype_filtergroup.filters.length>0}
                        <button class="secundary-button" on:click={()=>openModal($current_doctype_filtergroup)}>Lagre som filreringsgruppe</button>
                    {/if}
                </div>
            {/if}

            {#if checked_titles.length > 0}
                <div class = "no-title-filters">*Filtrert på overskrifter*</div>
            {/if}
        </div>
    {:else}    
        <!-- Filter groups -->
        <h3>Filtergrupper:</h3>
        <input class="search-input" bind:value={filter_searched_value} type="text" placeholder="Søk.." name="search">

        <div>
            <button class="secundary-button" on:click={changeMode}>Alle filtere</button>
            <button class="secundary-button" on:click={()=>{openModal(null)}}>Nytt filter</button>
        </div>

        <div class="filters">
            <!-- Show all filtergroups as radio buttons with possibility to edit and delete -->
            {#each searchedFiltergroups as filter}
                <div class="group">
                    <label class="filter-group-label">
                        <input type="radio"  checked={$current_doctype_filtergroup  == filter} on:change={() => $current_doctype_filtergroup = filter}  />

                        <div class="title">
                            {filter.name} 
                        </div>
                    </label>
                    <div class="group-buttons">
                        <button class="edit-button" title ="Rediger" on:click={()=>openModal(filter)} ><i class="material-icons">edit</i></button>
                        <button class="edit-button" title="Slett" on:click={()=> $doctype_filter_groups = $doctype_filter_groups.filter(item => (item.id != filter.id))}><i class="material-icons">delete</i></button>
                    </div> 
                </div>
            {/each}
        </div>
    {/if}

    {#if manageGroup}
        <Modal on:closed={() => manageGroup = false } show={$modal}/>
    {/if}
</div>

<style>
    h2{
        align-self: center;
    }

    .main{
        display: flex;
        flex-direction: column;
        height: 100%;
        padding-left: 2vw;
        padding-right: 2vw;
        overflow-y: auto;
        margin-bottom: 10px;
    }

    .filter-panel{
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    .filter-panel-tools{
        display: flex;
        flex-direction: column;
    }

    .no-doctypes{
        margin: 10px;
    }

    .filters{
        display: flex;
        height: 100%;
        flex-direction: column;
        margin-top: 10px;
        min-height: 100px;
        overflow-y: auto;
    }

    .filterItem{
        padding: 5px;
        cursor: pointer;
    }

    .filterItem:hover{
        color:#d43838; 
    }
    
    .save-filter-button{
        margin-top: 10px;
    }

    .filter-group-label{
        padding: 10px;
        display: flex;
        flex-direction: row;
        width: 100%;
        height: 100%;
        cursor: pointer;
        align-items: center;
    }

    .group{
        display: flex;
        align-items: center;
    }

    .group:hover{
        background-color: #e6f2ff;
    }
    
    .group-buttons{
        display: inline-flex;
    }

    .edit-button{
        background: none;
        border: none;
    }

    .edit-button:hover{
        color:#d43838;
        cursor: pointer;
    }

    .no-title-filters{
        margin-top: 10px;
        color: red;
    }

    /* dark mode styling */
    :global(body.dark-mode) .edit-button{
        color:#cccccc;
    }

    :global(body.dark-mode) .edit-button:hover{
        color:#d43838;
    }

    :global(body.dark-mode) input{
        border-bottom: 1px solid #cccccc;
        color:#cccccc;  
    }

    :global(body.dark-mode) ::placeholder {
        color: #cccccc;   
    }

    :global(body.dark-mode) .filterItem:hover{
        color:#d43838;
        background-color: rgb(55, 55, 55);
    }

    :global(body.dark-mode) .group:hover{
        color:#d43838;
        background-color: rgb(55, 55, 55);
    }
</style>