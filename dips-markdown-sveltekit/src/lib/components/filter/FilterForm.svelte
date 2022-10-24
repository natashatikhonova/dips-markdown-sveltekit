<script>
    import {doctype_filter_groups, current_doctype_filtergroup } from '../../stores/stores';
    import { getContext, setContext } from 'svelte';

    export let original_list_obj =[]
    export let edit_bool;
    export let edit_obj_indeks;

    let group_name = edit_bool && edit_obj_indeks != -1 ? $doctype_filter_groups [edit_obj_indeks].name : ""
    let manageName = edit_bool && edit_obj_indeks != -1? "Rediger filtergruppe" : "Opprett ny filtergruppe"
    let show_list_obj =[]
    let searched_value = ""

    //using modal for a popup form
    const { close } = getContext('simple-modal');
    setContext('modal', this)

    if (edit_bool && (edit_obj_indeks != -1)){
        //editing group
        uncheck_original_list()
        //checks the correct items in modal
        for (let i = 0; i < $doctype_filter_groups[edit_obj_indeks].filters.length; i++) {
            for (let j = 0; j < original_list_obj.length; j++){
                if (original_list_obj[j].name === $doctype_filter_groups[edit_obj_indeks].filters[i]){
                    original_list_obj[j].checked = true
                }
            }
        }
    } else if (edit_bool && (edit_obj_indeks == -1)){ 
        //New filter group for the filters already checked
        edit_bool = false
        
    } else {
        //New filterGroup. unchecks all
        uncheck_original_list()
    }

    //filter list by search
    $: if (searched_value != ""){
        show_list_obj = original_list_obj.filter(item => (item.name.toLowerCase().includes(searched_value.toLowerCase())));
    } else { 
        show_list_obj = original_list_obj
    }

    //loops through and unchecks all items
    function uncheck_original_list(){
        for(let i=0; i<original_list_obj.length; i++){
            original_list_obj[i].checked = false
        }
    }

    //finds a new id for the group
    function findNewId(){
        let ids = []
        $doctype_filter_groups.forEach((filter)=>ids.push(filter.id))
        let num = 1;
        while(ids.includes(num)){
            num += 1;
        }
        return num;
    }

    //checks if the group name was used before
    function name_used(group_name){
        for(let i = 0; i < $doctype_filter_groups .length; i++){
            if ( ($doctype_filter_groups [i].name == group_name) && (i != edit_obj_indeks)) return true;
        }
        return false
    }

    //adds new/edits exisiting group to the array
    function add_to_groupStore(group_name, index, checked_filters){
        if (index != -1) {
            //edit existing group
            $doctype_filter_groups[index] = {id: $doctype_filter_groups[index].id, name: group_name, filters: checked_filters}
            $doctype_filter_groups = $doctype_filter_groups
            $current_doctype_filtergroup = $doctype_filter_groups[index]
            $current_doctype_filtergroup = $current_doctype_filtergroup
            edit_bool = false
        } else{
            //add a new group
            $doctype_filter_groups.push({id: findNewId(), name: group_name, filters: checked_filters})
            $doctype_filter_groups = $doctype_filter_groups
            $current_doctype_filtergroup = $doctype_filter_groups[$doctype_filter_groups.length-1]
            $current_doctype_filtergroup = $current_doctype_filtergroup    
        }
    }

    //saves changes/new group
    function save(){
        if (group_name == "") {
            alert("Vennligst skriv inn gruppenavn!")
        } else if (name_used(group_name)) {
            alert("Gruppenavnet finnes fra før!")
        }else {
            let checked_filters = []
            for (let i = 0; i<original_list_obj.length; i++){
                if(original_list_obj[i].checked){
                    checked_filters.push(original_list_obj[i].name)
                }
            }
            if (checked_filters.length == 0) {
                alert("Du må velge minst 1 overskrift")
            } else {
                if (edit_bool) { //Edited group
                    add_to_groupStore(group_name, edit_obj_indeks, checked_filters)    
                } else { //New group 
                    add_to_groupStore(group_name, -1, checked_filters)
                }
                close()
            }
        }
    }
</script>

<div class="main">

    <h2>{manageName}</h2>
    <input bind:value ={group_name} type="text" placeholder="Skriv inn gruppenavn.." name="search">
    <h3>Velg dokumenttyper</h3>
    <input bind:value ={searched_value} type="text" placeholder="Søk.." name="search">

    <div class="filters">
        <!-- Shows all filters as checkboxes -->
        {#if show_list_obj.length == 0}
            <div class = "no-filters">Ingen dokumenttyper</div>
        {:else}
            {#each show_list_obj as elementObj}
                <label class="title">
                    <input type="checkbox" bind:checked={elementObj.checked} />
                    <div class="title">{elementObj.name}</div>
                </label>                
            {/each} 
        {/if}
    </div>

    <button class = "main-button" on:click={save}>Lagre</button>

</div>

<style>
    .main {
        display: flex;
        flex-direction: column;
        height: 70vh;
        overflow: auto;
    }

    .filters{
        padding-right: 2vw;
        overflow-y: auto;
        min-height: 100px;
    }

    button {
        margin-top: 10px;
        align-self: flex-end;
        max-height: 30px;
        background-color: #d43838;
    }

    button:hover{
        border: solid 0.1em;
        box-shadow: 0 0 0 0.2rem rgb(255, 92, 81);
    }

    input[type=text] {

        padding: 6px;
        border: none;
        border-bottom: solid;
        margin-bottom: 2vh;
        font-size: 17px;
        width:90%;
    }

    .title{
        cursor: pointer;
        display: flex;
        padding: 2px;
    }

    .title:hover{
        color:#d43838;
        background-color: #e6f2ff;
    }

    .no-filters{
        margin-top: 2vh;
    }

    /* dark mode styling */

    :global(body.dark-mode) button{
        background: #701c1c;
        border: 1px solid #cccccc;
        color:#cccccc;
    }

    :global(body.dark-mode) button:hover{
        box-shadow: 0 0 0 0.25rem rgb(126, 33, 26);
    }

    :global(body.dark-mode) input{
        background-color: rgb(49, 49, 49);
        border-bottom: 1px solid #cccccc;
        color:#cccccc;
    }

    :global(body.dark-mode) ::placeholder {
        color: #cccccc;   
    }

    :global(body.dark-mode) h2{
        color:#cccccc;
    }

    :global(body.dark-mode) h3{
        color:#cccccc;
    }

    :global(body.dark-mode) .title{
        color:#cccccc;
    }

    :global(body.dark-mode) .title:hover{
        color:#d43838;
        background-color: rgb(55, 55, 55);
    }

</style>