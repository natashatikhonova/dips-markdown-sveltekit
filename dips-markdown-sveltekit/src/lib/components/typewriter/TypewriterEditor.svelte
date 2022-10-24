<script>
  import { editor, selected_text_size, autocompleteOn} from "../../stores/stores.js"
  import asRoot from 'typewriter-editor/lib/asRoot';

  let waitingForSpaceOrEnterOrDot = false
  let dot_has_happend = false
  //Autocomplete and TAB:
  let autocomplete_suggestions_words = ["epikrise", "sykepleier", "lege", "sykdom", "sykehus", "legevakt", "fastlege"]
  let prev_suggested_word = ""
  let suggested_word_startindex = -1
  let prev_selection = 0
  let complete_suggested_word = ""

  //reset textsize in editor to default 
  function reset_textsize(){
    $selected_text_size = 11
  }

  //when editor opens - reset textsize
  reset_textsize()

  //resets variables and  removes autocomplete
  function clear_check_text(){
      remove_suggestion()
      waitingForSpaceOrEnterOrDot = false
      dot_has_happend = false
  }

  //Changes to big letter at the start of sentences
  if (editor.getText().length <= 1){
    waitingForSpaceOrEnterOrDot = true
  }

  //checkes for enter, dot and space to change to an uppercase letter 
  function check_text(event){
    let previousEditorSelection = editor.doc.selection
    
    let key = event.key
    
    if(key == "Backspace"){
      waitingForSpaceOrEnterOrDot = false
      dot_has_happend = false
    }

    if(waitingForSpaceOrEnterOrDot && (key == " " || key == "Enter" || key == ".")){
        //find the previous word
        for(let i = editor.doc.selection[0]-1; i >= 0; i--){ //goes backwards throught the text
          let char = editor.getText()[i-1]
          if (char == " " || i == 0 || char == "\n") {

            editor.insert(editor.getText()[i].toLocaleUpperCase(), {}, [i,i+1])
            editor.select(previousEditorSelection)

            break;
          }
        }
        waitingForSpaceOrEnterOrDot = false
        dot_has_happend = false
    }

    if(key == "Enter"){
      waitingForSpaceOrEnterOrDot = true
      dot_has_happend = true
    }

    if (key == ".") {
      dot_has_happend = true
    }

    if (key == " " && dot_has_happend) {
      waitingForSpaceOrEnterOrDot = true
    }
  }

  //suggests autocomplete depending on a word typed in
  function autocomplete(key){
    
    if (key == " " || key == "Enter" || key == "."){ //add in the suggested word
      if (prev_suggested_word.length > 0){
        
        let current_indeks = key == "Enter" ? editor.doc.selection[0]-1: editor.doc.selection[0];

        //New
        editor.select([current_indeks, editor.doc.selection[0] + prev_suggested_word.length])

        //historyStackBefore is to store current history so the editorhistory can ignore the suggested word
        let historyStackBefore = editor.modules.history.getStack()
        editor.modules.history.clearHistory()
        editor.delete()
        editor.modules.history.setStack(historyStackBefore)

        editor.insert(prev_suggested_word, [current_indeks, current_indeks])
        editor.select(editor.doc.selection[0])

        prev_suggested_word = ""

        if(key == "Enter" && !editor.getActive().list){
            editor.insert('\n');
          }
      }
    }

    else if( (key.length == 1) || key == "Backspace") {
      //new suggested word
      let current_indeks = editor.doc.selection[0]

      let suggested_word = ""
      let word = ""
      let editor_text = editor.getText().substring(0, current_indeks) + key

      for (let i = current_indeks; i >= 0; i--){
        
        if (editor_text[i] == " " || editor_text[i] == "\n" ){
          break
        }
        word += editor_text[i]
        
      }
      
      word = word.split("").reverse().join("");
      
      if (word.length != 0) {
        for (let i = 0; i < autocomplete_suggestions_words.length; i++){
          let check_word = autocomplete_suggestions_words[i]
          let found_word = true
          
          for (let j = 0; j < word.length; j++){
            if (word[j].toLowerCase() != check_word[j]){
              found_word = false
              break;
            }
          }
          if (found_word) {
            suggested_word = check_word.substring(word.length)
            complete_suggested_word = check_word
            break;
          }
        }
      }

      let historyStackBefore = editor.modules.history.getStack()
      editor.modules.history.clearHistory()

      let curSel = editor.doc.selection;
      editor.delete([curSel[0], curSel[0] + prev_suggested_word.length])
      editor.insert(suggested_word, {autocomplete:true}, [current_indeks, current_indeks])
      editor.select(curSel)

      editor.modules.history.setStack(historyStackBefore)

      prev_suggested_word = suggested_word
      suggested_word_startindex = current_indeks
      prev_selection = current_indeks

    }
  }

  //triggers other functions when certain keys are pressed
  function whenKeyDown(event){
      let key = event.key
      if (key == "Tab" && !editor.getActive().list) {
        //TAB function
          remove_suggestion()
          prev_suggested_word = ""
          editor.insert("        ");
      } else if ((37 <= event.keyCode) && (event.keyCode <= 40)){
          //Arrow keys
          remove_suggestion()
          prev_suggested_word = ""
          waitingForSpaceOrEnterOrDot = false
          dot_has_happend = false
      } else if ($autocompleteOn){
          //autocomplete suggestions
          autocomplete(key)
      }
  } 

  //removes autocomplete from editor
  //used as well in Typewriter.svelte 
  export const remove_suggestion = ()=>{
      if(!editor.doc.selection) return;
      if (prev_selection != editor.doc.selection[0]) {
          
          let historyStackBefore = editor.modules.history.getStack()
          editor.modules.history.clearHistory()

          let curSel = editor.doc.selection;
          editor.delete([suggested_word_startindex+1, suggested_word_startindex+1 + prev_suggested_word.length])
          editor.select(curSel)
          
          editor.modules.history.setStack(historyStackBefore)
          
          prev_suggested_word = ""
      }
  }
</script>

  <!-- svelte-ignore a11y-autofocus -->
  <!-- Typewriter editor -->
  <div class="editor" style="font-size: {$selected_text_size}pt" autofocus use:asRoot = {editor} on:keyup={check_text} on:keydown={whenKeyDown} on:click={clear_check_text}></div>

<style>
  .editor{
    margin: 5px;
    padding-right:5px;
    padding-left:5px;
    height: 100%;
    overflow-y: auto;
    font-size: 11pt;
  }
  /* dark mode styling */
  :global(body.dark-mode) .editor{
    background-color: rgb(49,49,49);
  }
</style>