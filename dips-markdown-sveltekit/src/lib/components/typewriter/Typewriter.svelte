<script>
    import { currentView, currentDocumentObject,currentlyAddingNewNote, currentlyEditingNote, findNewDocumentObjId, DocumentObject, documentTypes, smallDevice} from "../../stores/stores";
    import {marked} from 'marked';
    import {editor} from '../../stores/stores.js';
    import {documentList} from '../../stores/stores.js';
    import toMarkdown from 'to-markdown';
    import {createEventDispatcher} from 'svelte';
    import {ParseMarkdown} from "../../utils/markdown/ParseMarkdown.js"
    import { h as hFromTypewriter} from 'typewriter-editor';
    import TypewriterToolbar from "./TypewriterToolbar.svelte";
    import TypewriterEditor from "./TypewriterEditor.svelte";

    //size for sliding panes
    export let editor_size 

    const dispatch = createEventDispatcher();
    //size for sliding panes
    let typewriterEditor;

    //document types
    let selectedDocType = "Velg dokumenttype";
    let documentTypesCpy = documentTypes.slice()
    documentTypesCpy.splice(0,0,"Velg dokumenttype")

    editor.typeset.formats.add({
      name: 'autocomplete',
      selector: 'autoSuggestion',
      render: (attributes, children) => hFromTypewriter('autoSuggestion', null, children),
    });

    //Sets text in editor
    $: if ($currentDocumentObject && !$currentlyAddingNewNote){
        //edit document -> get text from currentDocumentObject
        editor.setHTML(marked($currentDocumentObject.context));
    } else if($currentDocumentObject && $currentlyAddingNewNote){
        //add new document -> no text in editor
        editor.setHTML(marked(""));
    } 
   
    //Either editor shows or just the text
    function changeEdit(){
        dispatch('editable');
    }

    //Sets the text back to the previous shown text
    function cancel(){
      changeEdit();
      dispatch("cancel");
      if($currentDocumentObject){
        editor.setHTML(marked($currentDocumentObject.context));
      } else{
        editor.setHTML("");
      }
      $currentlyAddingNewNote=false;
      $currentlyEditingNote = false;
    }

    //available ONLY on mobile -> takes editor down
    function mobileDown(){
      dispatch("cancel");
    }

    //Saves the text if the text is not empty and stores the text
    function save(){
      //remove autocomplete before saving
      typewriterEditor.remove_suggestion()

      if( toMarkdown(editor.getHTML()) === ""){
        //Empty note -> dont save
        alert("Tom notat!");
      }else{

        if($currentlyEditingNote){ 
          //Edit note
          dispatch("save");
          $currentlyEditingNote = false;
          //find the right document in the list
          $documentList.forEach((element)=>{
            if (element.id === $currentDocumentObject.id){
                //update document
                element.context= toMarkdown(editor.getHTML()) + " \n";
                //make an tree over all markdown titles
                let parse = new ParseMarkdown()
                let tree = parse.parseAndSetIntoTree(element)
                element.markdownTree = tree;
            }
          })
          $documentList = $documentList;
          changeEdit();

        } else{
          //adding new document
          if (selectedDocType !== documentTypesCpy[0]) { 
            //create new document object
            const readable = true;
            let newElement = new DocumentObject(findNewDocumentObjId($documentList.slice()), new Date().toDateString(), (toMarkdown(editor.getHTML())+" \n"), readable);
            newElement.readable = readable
            newElement.title = selectedDocType;

            //make an tree over all markdown titles
            let parse = new ParseMarkdown()
            let tree = parse.parseAndSetIntoTree(newElement)
            newElement.markdownTree = tree;

            //update store values
            $documentList.push(newElement);
            $documentList = $documentList;
            $currentDocumentObject = newElement;
            $currentlyAddingNewNote = false;

            dispatch("save");
            changeEdit();

          } else{ //must choose documenttype
            alert("Vennligst velg dokumenttype!");
          }  
        } 
      }
    }

    //manage sliding panes
    function showDocuments(){
      dispatch("set_typewriter_view_size", 0)
    }

    function manageScrollView(size){
      dispatch("set_editor_size", size)
    }
</script>

<head>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
</head>

<!-- source: https://github.com/typewriter-editor/typewriter -->
  <header class="tool-menu">
    <!-- ONLY on mobile -> pushes editor down -->
    {#if $smallDevice  &&(!($currentView == "Dokumentliste") || $currentlyAddingNewNote)}
      <div>
          <button class="arrow-down-button" on:click={mobileDown}> <i class="material-icons">keyboard_arrow_down</i></button>
      </div>
    {/if}

    <div >
      {#if !$smallDevice && ($currentView == "Dokumentliste")}
        <button title = "Vis dokumentliste" class="arrow-keys" on:click={showDocuments}><i class="material-icons">keyboard_arrow_right</i></button>
      {:else if !$smallDevice && !($currentView == "Dokumentliste")}
        <button title = "Vis dokumenter" class="arrow-keys" on:click={()=>{manageScrollView(0)}}><i class="material-icons">keyboard_arrow_down</i></button>
        <button disabled={editor_size==100} title = "Vis teksteditor" class="arrow-keys" on:click={()=>{manageScrollView(100)}}><i class="material-icons">keyboard_arrow_up</i></button>
      {/if}
    </div>

    <div class="toolmenu-title">
      <h4>
        {#if $currentlyAddingNewNote}
          NYTT DOKUMENT
        {:else}
          REDIGER DOKUMENT
        {/if}
      </h4>
    </div>
    <!-- Buttons to save/ignore changes -->
    <div class = "controls">
      <button title="Lagre"class="save " class:mobile={$smallDevice} on:click={save}> <i class="material-icons">save</i></button>
      <button title="Avbryt" class = "save" class:mobile={$smallDevice} on:click={cancel} > <i class="material-icons">close</i></button>
    </div>
  </header>

  <div class="toolbar" class:mobile-toolbar = {$smallDevice}>
    <TypewriterToolbar/>
  </div>

  <!-- Dropdown menu for document types (only while adding new document) -->
  {#if $currentlyAddingNewNote}
    <div class="dropdown">
      <select class="dropdown-menu" bind:value={selectedDocType} >
        {#each documentTypesCpy as value}<option {value}>{value}</option>{/each}
      </select>
    </div>
  {/if}
  
  <!-- Meta data about document (only while editing exising document) -->
  {#if !$currentlyAddingNewNote  && $currentDocumentObject} 
    <div class="title">{$currentDocumentObject.title}</div>
    <div class="meta">Skrevet av {$currentDocumentObject.author}, {$currentDocumentObject.date.toDateString()}</div>
  {/if}

  <TypewriterEditor bind:this = {typewriterEditor}/>

<style>
  
  .toolmenu-title{
    align-self: center;
  }

  .tool-menu{
    width: 100%;
    height: 100%;
    max-height: 40px;
    min-height: 40px;
    display: inline-flex;
    justify-content: space-between;
    background-color: whitesmoke;
  }

  .toolbar {
    display:flex;
    background: whitesmoke;
    padding: 10px;
    box-shadow: 0 3px 5px -2px rgba(57, 63, 72, 0.3);
    margin-bottom: 3px;
  }

  .controls{
    display: inline-flex;
    align-items: center;
  }

  .save{
    background: none;
    width: 2.5rem;
    height: 2.5rem;
    margin-right: auto;
    border:none;
    transition: border-color .15s ease-in-out, box-shadow .15s ease-in-out;
    cursor: pointer;
  }

  .save:hover{
    color:#d43838;
    border:none;
    border-color: none;
    box-shadow: none;
  }  
  
  .dropdown{
    margin-left: 10px;
  }

  .dropdown-menu {
    background: #fff;
    height: 35px;
    border-radius: 4px;
    border: 1px solid #ced4da;
    cursor: pointer;
  }

  .dropdown-menu:hover {
    outline: none;
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
  }

  .title{
    font-weight: bold;
    font-style: italic;
    margin-left: 1vw;
    margin-top:1vh;
  }
  
  .meta{
    font-style: italic;
    margin-left:1vw;
    margin-top:1vh;
  }
  
  /* mobile styling */
  .arrow-down-button{
    background: none;
    border:none;
  }

  .mobile-toolbar{
    display: contents;
  }

  .mobile{
    margin: 2px;
    height: 2rem;
    width: 2rem;
  }
  
  /* dark mode styling */
  :global(body.dark-mode) .tool-menu{
    background-color: rgb(49,49,49);
    color: #cccccc;
  }

  :global(body.dark-mode) .toolbar{
    background: rgb(32, 32, 32);
  }

  :global(body.dark-mode) .arrow-down-button{
    color:#cccccc;
  }

  :global(body.dark-mode) .dropdown-menu{
    background-color: rgb(49,49,49);
    color: #cccccc;
  }

  :global(body.dark-mode) .dropdown-menu:hover{
    border-color: #b7daff;
    box-shadow: 0 0 0 0.2rem rgba(104, 177, 255, 0.5);
  }

  :global(.editor code){
    color:lightgray;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;;
  }

  :global(body.dark-mode .editor code) {
    color: #666666;
  }

  :global(.editor autoSuggestion){
    color:lightgray;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;;
  }

  :global(body.dark-mode .editor autoSuggestion) {
    color: #666666;
  }

  :global(.editor img){
    max-height: 50%;
    max-width: 50%
  }

  :global(body.dark-mode) .save{
    color:#cccccc;
  }
  
  :global(body.dark-mode) .save:hover{
    color: #d43838;
  }
</style>