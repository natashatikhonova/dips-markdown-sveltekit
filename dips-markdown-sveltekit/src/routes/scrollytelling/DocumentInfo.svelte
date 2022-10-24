<script>
    import { currentDocumentObject} from "../../stores/stores.js"

</script>


<div class="content-container">
    <!-- shows only when editing/adding document og one document is chosen -->
    {#if $currentDocumentObject}
      <!-- triggers typewriter when editing/adding document -->
        <header class="header-bar">
          <div class="doc-title">{$currentDocumentObject.title.toUpperCase()}</div>
        </header>
        <!-- showing document text + meta data -->
        <div class="textfield">
          <br>
          <div class="doc-meta"><strong>Dato:</strong>  {$currentDocumentObject.date.toDateString()}</div>
          <div class="doc-meta"><strong>Forfatter</strong>  {$currentDocumentObject.author}</div>
          <div class="doc-meta"><strong>Tittel</strong>  {$currentDocumentObject.title}</div>
          <div class="doc-meta"><strong>Dokumenttype</strong>   {$currentDocumentObject.title}</div>
          <div class="doc-meta"><strong>Redigerbar</strong>  {$currentDocumentObject.readable ? "Ja" : "Nei"}</div>
        </div>
      {/if}
  </div>

  <style>
    .content-container{
      display: flex;
      flex-direction: column;
      height: 100%;
      flex-grow:1;
      background-color: white;
      border-left: 2px solid rgb(187, 187, 187);
    }
  
    .header-bar {
      background: whitesmoke;
      box-shadow: 0 3px 5px -2px rgba(57, 63, 72, 0.3);
      margin-bottom: 3px;
      display: flex;
    }
    
    .doc-title{
      display: flex;
      flex-grow: 1;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }
    
    .doc-meta{
      margin-left:8px;
    }
    
    .textfield{
      height: 100%;
      flex-grow: 1;
      overflow-y: auto;
    }
       
    /* dark mode styling */
    :global(body.dark-mode) .content-container {
      background-color: rgb(49, 49, 49);
    }
    
    :global(body.dark-mode) .header-bar{
      background-color: rgb(49, 49, 49);
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