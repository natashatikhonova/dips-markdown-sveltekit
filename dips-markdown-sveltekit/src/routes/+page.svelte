<script>
	import documents from './assets/documents.json'
	import DocumentList from './lib/components/documentview/DocumentList.svelte';
	import ContentView from './lib/components/ContentView.svelte';
	import ScrollView from './lib/components/scrollview/ScrollView.svelte';
	import { documentList, currentView, currentlyAddingNewNote,currentlyEditingNote,  currentDocumentObject, DocumentObject, smallDevice, openedDocTabs} from './lib/stores/stores.js';
	import { Pane, Splitpanes } from 'svelte-splitpanes';
	import {ParseMarkdown} from './lib/utils/markdown/ParseMarkdown.js'
	import Device from 'svelte-device-info'
	import ScrollyTellingView from './lib/components/scrollytelling/ScrollyTellingView.svelte';
	import DocumentsTabs from './lib/components/scrollview/DocumentsTabs.svelte';
  
	$smallDevice = (Device.isPhone || Device.isTablet || Device.isMobile)
  
	let typewriter_size = 50
  
	//gets document data from JSON file
	documents.forEach(putInDocumentList);  
  
	//Makes a new DocumentObject for each file and adds it to the store array $documentList
	function putInDocumentList(item){
	  let document = new DocumentObject(item.id, item.date, item.content, item.title, item.readable);
	  document.add_temp(item.temperature);
  
	  //Makes a tree structur for all markdown formated titles:
	  let parse = new ParseMarkdown
	  let tree = parse.parseAndSetIntoTree(document) 
	  document.markdownTree = tree;
  
	  $documentList.push(document);
	  $documentList = $documentList;
	}
  
	//tilpasser til mobilversjon
	$: contentWiewSize = $smallDevice && $currentDocumentObject ? 100: 50
  
	function set_content_view_size(event){
	  //If on mobile the, only one content/pane at time
	  if($smallDevice){
		contentWiewSize = event.detail
	  }
  
	  //Different outcome based on panes current size
	  if(contentWiewSize > 70 && event.detail == 0){
		contentWiewSize = 50
	  }
	  else if(contentWiewSize < 30 && event.detail == 100){
		contentWiewSize = 50
	  }
	  else{
		contentWiewSize = event.detail
	  }
	}
  
	function set_typewriter_size(event){
	  //Different outcome based on panes current size
	  if(typewriter_size > 70 && event.detail == 0){
		typewriter_size = 50
		console.log(1)
	  }
	  else if(typewriter_size < 30 && event.detail == 100){
		typewriter_size = 50
		console.log(2)
	  }
	  else{
		typewriter_size = event.detail
	  }
	}
  
	function updateContentWiewSize(e){
	  if(e.detail[1]){
	  contentWiewSize = e.detail[1].size
	  }
	}
  
	function updateTypewriterSize(e){
	  if(e.detail[1]){
	  typewriter_size = e.detail[1].size
	  }
	}
  
  </script>
  
  <head>
	<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  </head>
  <div class="main">
	{#if $currentView=="Scrollytelling"}
	  <ScrollyTellingView/>
	{:else if $currentView == "Dokumentliste"}
	  <div class="side-container"  >
		{#if $currentlyAddingNewNote}
		  {#if !$smallDevice}
			<Splitpanes theme = "modern-theme" on:resized="{updateTypewriterSize}">
			  <Pane size={(100-typewriter_size).toString()}> <ScrollView on:set_typewriter_size={set_typewriter_size}/> </Pane>
			  <Pane minSize="35" size={typewriter_size.toString()}> <ContentView on:set_typewriter_view_size={set_typewriter_size}/> </Pane>
			</Splitpanes>
		  {:else}  
			  <ScrollView/>
		  {/if}
  
		{:else}
		  <Splitpanes theme = "modern-theme" style="overflow:hidden;" on:resized="{updateContentWiewSize}">
			<Pane size={(100-contentWiewSize).toString()} >
				<DocumentList on:set_content_view_size={set_content_view_size}/>
			</Pane>
		  {#if $currentDocumentObject}
			<Pane size={contentWiewSize.toString()} ><ContentView on:set_content_view_size={set_content_view_size}/></Pane>
		  {/if}
		  </Splitpanes>
		{/if}
	  </div>
	{:else  if $currentView == "Kontinuerlig visning"}
	  <Splitpanes theme = "modern-theme">
		<Pane size={$openedDocTabs.length== 0? "100": "50"}>
		  <ScrollView/>
		</Pane>
		<Pane size={$openedDocTabs.length== 0? "0": "50"}>
		  {#if $openedDocTabs.length>0}
			<DocumentsTabs/>
		  {/if}
		</Pane>
	  </Splitpanes>
	{/if}
  </div>
  
  <style>
  
	 .main {
	  height: 100%;
	  overflow-y: none;
	  overflow-x: hidden;
  
	}
  
	.side-container{
	  height: calc(100%);
	  width: 100%;
	  display: flex;
	  flex-direction: row;
	}
  
	.settings{
	  display: flex;
	  width: 200px;
	  align-items: center;
	  justify-content: space-between;
	}
  
	
  
  </style>
  