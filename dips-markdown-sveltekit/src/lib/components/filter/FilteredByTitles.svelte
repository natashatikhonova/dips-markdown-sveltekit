<script>
import { includes } from 'to-markdown/lib/md-converters';
import {allfilterOff, documentList, current_doctype_filtergroup, searchedDocuments, searchValue, checked_titles_filters, documentTypes} from '../../stores/stores';
    import {set_filtered_text, load_markdownNodes} from "../../utils/markdown/markdownFunctions"

    let all_checked = true
    let showClicked = false;
    let searched_value = "";
    let original_titles_list_obj = []
    let show_titles_list_obj =[]
    let filteredDocumentlist = []
    let checked_not_shown = []
    let checked_under_doctype = []
    let deactivated_titles = new Map()
    let all_deactivated = []
    let prev_length = -1
    let selected_documentObj_titles = set_filtered_text(original_titles_list_obj.filter(item => (item.checked)))

    //filter by document types from current filtergroup
    $: filteredDocumentlist = $documentList.filter(item => ($current_doctype_filtergroup.filters.includes(item.title)));

    //sets list depending on what doctypes are chosen
    $: if (filteredDocumentlist.length != prev_length){
        //load documents when new doctype filter is chosen
        original_titles_list_obj = load_markdownNodes(filteredDocumentlist, original_titles_list_obj, $checked_titles_filters)
        show_titles_list_obj = original_titles_list_obj

        //updates $checked_titles_filter with the same values as in original_titles_list_obj:
        for (let i = 0; i < $checked_titles_filters.length; i++){
            let obj = original_titles_list_obj.find(item => item.title == $checked_titles_filters[i].title)
            if (obj == null){
                //Only checked titles wich belonged the old doctype filter, therefor the list is now empty
                $checked_titles_filters[i].nodes = []
            } else {
                //transfered the checked titles to the new doctype filter
                $checked_titles_filters[i].nodes = obj.nodes
            }
            $checked_titles_filters = $checked_titles_filters
        } 
        prev_length = filteredDocumentlist.length
    }

    //sets filtered text in documentObject
    $: if(original_titles_list_obj || $checked_titles_filters){
        checked_not_shown = find_hidden_checked_titles()
        //checks if all items are checked whenever the original list is updated

        check_if_all_checked()
        selected_documentObj_titles = set_filtered_text(original_titles_list_obj.filter(item => (item.checked)))
    }

    //unchecks all title filters
    $: if ($checked_titles_filters.length == 0){
        for(let i = 0; i < original_titles_list_obj.length; i++){
            original_titles_list_obj[i].checked = false
        }
    }

    //uncheckschecks all items whenever filter is turned off
    $: if($allfilterOff){
        $documentList.forEach((doc)=> (doc.temp_filtered_context = ""))
        $current_doctype_filtergroup = {id: -1, name: "", filters: documentTypes.slice()}
        for(let i = 0; i < original_titles_list_obj.length; i++){
            original_titles_list_obj[i].checked = false
        }
        $checked_titles_filters = []
        $allfilterOff = false
    }  

    //Updates the shown titles with search on titles
    $: if (searched_value.length >= 0){ 
        if(showClicked){
            checked_under_doctype = []
            for (let i = 0; i < original_titles_list_obj.length; i++){
                if (original_titles_list_obj[i].checked){
                    checked_under_doctype.push(original_titles_list_obj[i])
                }
            }
        }
         if (searched_value != ""){
            if(!showClicked){
                show_titles_list_obj = original_titles_list_obj.filter(item => (item.title.toLowerCase().includes(searched_value.toLowerCase())));
            }else{
                show_titles_list_obj = checked_under_doctype.filter(item => (item.title.toLowerCase().includes(searched_value.toLowerCase())));
            }
            
             let startsWithSearch = []
             for(let i = 0; i<show_titles_list_obj.length; i++){
                 if (show_titles_list_obj[i].title.toLowerCase().startsWith(searched_value)){
                     startsWithSearch.push(show_titles_list_obj[i])
                     show_titles_list_obj.splice(i, 1)
                 }
             }
             //Show the most relevant searchresults first
             show_titles_list_obj = startsWithSearch.concat(show_titles_list_obj)
         } else {
             //no search value
             if (!showClicked){
                 show_titles_list_obj = original_titles_list_obj
             }else{
                show_titles_list_obj = checked_under_doctype
             }
         }     
     }


    $: if(selected_documentObj_titles.length == 0){
        //when no filters on
        $searchedDocuments = filteredDocumentlist.filter(item => (item.context.toLowerCase().includes($searchValue.toLowerCase()))  || (item.author.toLowerCase().includes($searchValue.toLowerCase()))|| (item.date.toDateString().toLowerCase().includes($searchValue.toLowerCase()))|| (item.title.toLowerCase().includes($searchValue.toLowerCase())));
    } else{
        //when filter is on
        $searchedDocuments = selected_documentObj_titles.filter(item => (item.temp_filtered_context.toLowerCase().includes($searchValue.toLowerCase()))  || (item.author.toLowerCase().includes($searchValue.toLowerCase()))|| (item.date.toDateString().toLowerCase().includes($searchValue.toLowerCase()))|| (item.title.toLowerCase().includes($searchValue.toLowerCase())));
    }

    //happens when an item is checked
    function updateCheckedList(item){
        if (item.checked){
            //remove 
            for(let i = 0; i < $checked_titles_filters.length; i++){
                if ($checked_titles_filters[i].title == item.title){
                    for (let j = 0; j < $checked_titles_filters[i].nodes.length; j++){
                        $checked_titles_filters[i].nodes[j].object.temp_filtered_context = ""
                    }
                    $checked_titles_filters.splice(i, 1)
                    $checked_titles_filters = $checked_titles_filters
                }
            }
        } else if(!item.checked){
            // add
            $checked_titles_filters.push(item)
            // $checked_titles_filters.push({title: item.title, nodes: item.nodes.slice(), checked: true})
        }
        item.checked = !item.checked
        $checked_titles_filters = $checked_titles_filters

        let dict = new Map()
        let list = []
        //loops through checked titles and sets up a Map with parents
        for (let i = 0; i <$checked_titles_filters.length; i++){
            for (let l = 0; l<$checked_titles_filters[i].nodes.length; l++){
                if (dict.get($checked_titles_filters[i]) == null){
                    dict.set($checked_titles_filters[i], [])
                }
                //all children of a parent that is being looped through
                let all_children = $checked_titles_filters[i].nodes[l].object.markdownTree.get_subtree($checked_titles_filters[i].nodes[l])
                //placing children in the Map based on a parent
                for (let j = 0; j< all_children.length; j++){
                    for (let k = 0; k < original_titles_list_obj.length; k++){
                        if (original_titles_list_obj[k].title == all_children[j].title ){
                            dict.set($checked_titles_filters[i], [...dict.get($checked_titles_filters[i]), original_titles_list_obj[k]])
                            list.push(original_titles_list_obj[k])
                        }
                    }
                }
            }
        }

        //reset the map and array with deactivated titles
        deactivated_titles = new Map()
        all_deactivated = []
        for (let i = 0; i<original_titles_list_obj.length; i++){
            let counter = 0
            //counts ocurrencies of a title 
            for (let j = 0; j<list.length; j++){
                if (list[j].title == original_titles_list_obj[i].title){
                    counter++
                }
            }
            //compares amount of ocurrencies to the total amount
            if (counter == original_titles_list_obj[i].nodes.length){
                dict.forEach(function(value, key){
                    //pushes to the map
                    if (value.includes(original_titles_list_obj[i])){
                        if (deactivated_titles.get(key) == null){
                            deactivated_titles.set(key, [original_titles_list_obj[i]])
                        } else{
                            deactivated_titles.set(key, [...deactivated_titles.get(key), original_titles_list_obj[i]])
                        }
                    }
                })
                //updates the lists
                all_deactivated.push(original_titles_list_obj[i])
                original_titles_list_obj[i].checked = true
                $checked_titles_filters.push(original_titles_list_obj[i])
            }
        }
        $checked_titles_filters = $checked_titles_filters
    }
 
    //unchecks all items
    function removeChecked(){
        for(let i = 0; i < original_titles_list_obj.length; i++){
            original_titles_list_obj[i].checked = false
            for (let j = 0; j < $checked_titles_filters.length; j++) {
                if ($checked_titles_filters[j].title == original_titles_list_obj[i].title){
                    for (let k = 0; k < $checked_titles_filters[j].nodes.length; k++){
                        $checked_titles_filters[j].nodes[k].object.temp_filtered_context = ""
                    }
                    $checked_titles_filters.splice(j,1)
                    $checked_titles_filters = $checked_titles_filters
                }
            }
        }

    }

    //checks all items
    function check_all(){
        all_checked = !all_checked
        
        for (let i = 0; i < original_titles_list_obj.length; i++) {
            original_titles_list_obj[i].checked = all_checked
            if (all_checked){
                // add
                if ($checked_titles_filters.find(item => item.title == original_titles_list_obj[i].title) == null) {
                    $checked_titles_filters.push(original_titles_list_obj[i])
                    $checked_titles_filters = $checked_titles_filters
                }
            }
        }
    }

    //checks if all items are checked
    function check_if_all_checked(){
        let all_bool = null
        for (let i = 0; i < original_titles_list_obj.length; i++) {
            if (all_bool == null) {
                all_bool = original_titles_list_obj[i].checked
            }else if (original_titles_list_obj[i].checked != all_bool ) {
                all_bool = false
                break;
            } 
        }
        all_checked = all_bool    
    }
    
    //**FOR LATER USE*/
    //Function that returns an array of object that is checked but not showing because the wrong doctype filter is on
    function find_hidden_checked_titles(){
        let checked_not_shown = []
        for (let i = 0; i < $checked_titles_filters.length; i++){
            let found_title = original_titles_list_obj.find(obj => (obj.title == $checked_titles_filters[i].title ))
            if (found_title == null){
                //Found in $checked_titles_filters
                checked_not_shown.push($checked_titles_filters[i])
            } else {
                //Checks if there are more nodes under this element, but not curently showing
                let nodes_not_shown = []
                if (found_title.nodes.length < $checked_titles_filters[i].nodes.length){
                    for (let j = 0; j < $checked_titles_filters[i].nodes.length; j++){
                        if (found_title.nodes.find(node => (node.compare($checked_titles_filters[i]))) == null) {
                            nodes_not_shown.push($checked_titles_filters[i])

                        }
                    }
                }
            }
        }
        return checked_not_shown
    }


</script>

<head>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
</head>

<h2>Overskrifter</h2>
<div class="main">
    <div class="filter-panel-tools">
        {#if !showClicked}
            <h3>Alle overskrifter:</h3>
        {:else}
            <h3>Valgte overskrifter:</h3>
        {/if}

        <input class="search-input" bind:value={searched_value} type="text" placeholder="Søk.." name="search">

        <div>
            <!-- Toggle between show all or remove all buttons -->
            {#if show_titles_list_obj.length > 0}
                {#if all_checked} 
                    <button class="secundary-button" on:click={removeChecked}>Nullstill</button>    
                {:else}
                    <button class="secundary-button" on:click={check_all}>Velg alle</button>
                {/if}    
            {/if}
            <!-- Toggle between chosen or all titles -->
            {#if !showClicked}
                <button class="secundary-button" on:click={()=>{showClicked=true}}>Vis valgte</button>
            {:else}
                <button class="secundary-button" on:click={()=>{showClicked=false}}>Alle overskrifter</button>
            {/if}
        </div>
    </div>

    <!-- All titles as checkboxes -->
    {#if show_titles_list_obj.length == 0}
        <div class = "no-titles">Ingen overskrifter</div>
    {:else}
        <div class="filters">
            {#each show_titles_list_obj as elementObj}
                    {#if deactivated_titles.get(elementObj) != null} 
                    <!-- Title has children that are deactivated -->
                        <details>
                            <summary class="main-filterItem">
                                <label class="filterItem">
                                    <input type="checkbox" class:deactivated-checkbox = {false} bind:checked={elementObj.checked}  on:click={()=>updateCheckedList(elementObj)}>
                                    {elementObj.title}    
                                </label> 
                            </summary>
                            <div class="deactivated-filters">
                                {#each deactivated_titles.get(elementObj) as deactivated}
                                    <label class = "deactivated">
                                        <input type="checkbox" class = "deactivated-checkbox" bind:checked={elementObj.checked}  on:click={()=>updateCheckedList(elementObj)}>
                                        {deactivated.title}    
                                    </label> 
                                {/each}
                            </div>
                        </details>
                    {:else if (searched_value.length == 0 && !all_deactivated.includes(elementObj))|| searched_value}
                    <!-- While searching/default -->
                        <label class:filterItem={!all_deactivated.includes(elementObj)} class:deactivated = {all_deactivated.includes(elementObj)}>
                            <input type="checkbox" class:deactivated-checkbox = {all_deactivated.includes(elementObj)} bind:checked={elementObj.checked}  on:click={()=>updateCheckedList(elementObj)}>
                            {elementObj.title}    
                        </label>   
                    {/if}

            {/each} 
        </div>            
    {/if}
    <!-- Tells user whether none title filters are chosen -->
    {#if original_titles_list_obj.filter(obj => (obj.checked)).length == 0}
        <div class = "shows-all-documents">*Ikke filtrert på overskrifter*</div>
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
        padding-left: 1vw;
        padding-right: 1vw;
        overflow-y: auto;
    }

    .filter-panel-tools{
        display: flex;
        flex-direction: column;
    }
    
    .no-titles{
        margin: 10px;
    }

    .deactivated-filters{
        display:flex;
        flex-direction: column;
        padding-left: 15px;
    }

    .deactivated{
        padding: 5px;
        color: rgb(145, 145, 145);
    }

    .deactivated-checkbox{
        accent-color: rgb(145, 145, 145);
        color: white;
    }

    .filters{
        display: flex;
        flex-direction: column;
        margin-top: 10px;
        padding-left: 18px;
        min-height: 100px;
        overflow-y: auto;
    }

    .filterItem{
        padding: 5px;
    }

    summary{
        margin-left:-13px;
    }

    .filterItem:hover{
        color:#d43838;
        background-color: #e6f2ff;
    }

    .shows-all-documents{
        margin-top: 10px;
        margin-bottom: 10px;
        color: red;
    }

    /* dark mode styling */
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
</style>