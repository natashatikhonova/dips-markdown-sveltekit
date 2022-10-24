<script>
    import Toolbar from 'typewriter-editor/lib/Toolbar.svelte';
    import {editor, smallDevice, selected_text_size, autocompleteOn} from '../../stores/stores.js';

    let fileinput;
    let min_size = false;
    let max_size = false;
    //default
    let text_size = 11
    
    //get users image -> upload it to editor
    const onFileSelected =(e)=>{                      
        let image = e.target.files[0];
        let reader = new FileReader();
        reader.readAsDataURL(image);
        reader.onload = e => {
        editor.setHTML(editor.getHTML()+"\n <img src=" + e.target.result + ">") 
        };      
    }

    function file_choser(){
        fileinput.click()
        editor.root.focus();
    }

    //change textsize within editor
    //max size is set to 20, min size is set to 7
    function set_text_size(direction){
      if (direction == "bigger"){
          text_size++
          if (text_size == 20){
              max_size=true
          }else if (text_size>7){
          min_size =false
          }
      } else if (direction == "lower"){
          text_size--
          if (text_size == 7){
              min_size=true
          } else if (text_size<20){
          max_size =false
          }
      }
      $selected_text_size = text_size
      editor.root.focus();
    }

    //turn on/off autocomplete function
    function set_autocomplete(){
        $autocompleteOn = !$autocompleteOn
        editor.root.focus();
    }
</script>

<Toolbar {editor} let:active let:commands>
    <!-- buttons with functions from Typewriter -->
    <div class="main-functions">
      <button
        title="Overskrift"
        class="toolbar-button"
        class:active={active.header === 1}
        class:mobile={$smallDevice}
        on:click={commands.header1}><i class="material-icons">title</i></button>
  
      <button
        title="Underskrift"
        class="toolbar-button"
        class:active={active.header === 2}
        class:mobile={$smallDevice}
        on:click={commands.header2}><i class="material-icons header2">title</i></button>
  
      <button
        title="Uthevet"
        class="toolbar-button"
        class:active={active.bold}
        class:mobile={$smallDevice}
        on:click={commands.bold}><i class="material-icons">format_bold</i></button>
  
      <button
        title="Kursiv"
        class="toolbar-button"
        class:active={active.italic}
        class:mobile={$smallDevice}
        on:click={commands.italic}><i class="material-icons">format_italic</i></button>

      <button
        title="Punktliste"
        class="toolbar-button"
        class:active={active.bulletList}
        class:mobile={$smallDevice}
        on:click={commands.bulletList}><i class="material-icons">format_list_bulleted</i></button>

      <button
        title="Nummerert liste"
        class="toolbar-button"
        class:active={active.orderedList}
        class:mobile={$smallDevice}
        on:click={commands.orderedList}><i class="material-icons">format_list_numbered</i></button>

      <button
        title="Angre"
        class="toolbar-button arrow"
        disabled={!active.undo}
        class:mobile={$smallDevice}
        on:click={commands.undo}><i class="material-icons">undo</i></button>

      <button
        title="Gjøre om"
        class="toolbar-button arrow"
        disabled={!active.redo}
        class:mobile={$smallDevice}
        on:click={commands.redo}><i class="material-icons">redo</i></button>
    </div>

    <!-- Buttons with functions written and triggered in this code -->
    <div class="secondary-functions">

      <div class="extra-functions" class:no-border={$smallDevice}>
        <button 
        title="Legg til bilde"
        class="toolbar-button"
        class:mobile={$smallDevice}
        on:click={file_choser}  ><i class="material-icons">image</i></button>

        <input style="display:none" type="file" accept="*/image" on:change={(e)=>onFileSelected(e)} bind:this={fileinput} >

        <button
        title="Autocomplete"
        class="toolbar-button "
        class:active={$autocompleteOn}
        class:mobile={$smallDevice}
        on:click={set_autocomplete}><i class="material-icons">auto_awesome</i></button>
      </div>

      <div class="extra-functions" class:no-border={$smallDevice}>
        <button
        title="Zoom out"
        class="toolbar-button"
        disabled={min_size}
        class:mobile={$smallDevice}
        on:click={() => {set_text_size("lower")}}><i class="material-icons">zoom_out</i></button>

        <button
        title="Zoom in"
        class="toolbar-button"
        disabled={max_size}
        class:mobile={$smallDevice}
        on:click={() => {set_text_size("bigger")}}><i class="material-icons">zoom_in</i></button>
      </div>
    </div>
  </Toolbar>

  <style>
    .main-functions{
      display: inline-flex;
      background: whitesmoke;
    }
    
    .secondary-functions{
      display: inline-flex;
      background: whitesmoke;
    }

    .extra-functions{
      display: flex;
      border-left: solid rgb(74, 74, 74);
      padding-left: 0.5vw;
    }

    .toolbar-button {
      display: flex;
      justify-content: center;
      align-items: center;
      background: #fff;
      width: 2.3rem;
      height: 2.3rem;
      margin-right: 0.4rem;
      border-radius: 4px;
      border: 1px solid #ced4da;
      transition: border-color .15s ease-in-out, box-shadow .15s ease-in-out;
      cursor: pointer;
    }

    .toolbar-button:hover {
      outline: none;
      border-color: #80bdff;
      box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
    }

    .toolbar-button.active {
      border: solid 2px;
      border-color: #80bdff;
    }

    .active {
      border-color: #80bdff;
      background: #eaf4ff;
    }

    .header2{
      font-size:large;
    }

    .arrow{
      color:black;
      font-weight: bolder;
      font-size:x-large;
    }

    .no-border{
      border:none;
      padding-left:0;
    }
    
    /* dark mode styling */
    :global(body.dark-mode) .main-functions{
        background: rgb(32, 32, 32);
    }

    :global(body.dark-mode) .secondary-functions{
        background: rgb(32, 32, 32);
    }

    :global(body.dark-mode) .toolbar-button{
        background-color: #353535;
        color: #cccccc;
        border: none;
    }

    :global(body.dark-mode) .toolbar-button:hover{
        border-color: #b7daff;
        box-shadow: 0 0 0 0.2rem rgba(104, 177, 255, 0.5);
    }
    
    :global(body.dark-mode) .toolbar-button.active{
      border-color: #b7daff;
        box-shadow: 0 0 0 0.2rem rgba(104, 177, 255, 0.5);
    }
  </style>