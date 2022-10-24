<script>
    import Scrolly from "./Scrolly.svelte";
    import {documentList, currentDocumentObject, smallDevice, showFiltermenu, amount_searched_words, searchValue, current_doctype_filtergroup, documentTypes} from "../../stores/stores.js"
    import ScrollyElement from "./ScrollyElement.svelte";
    import { marked } from 'marked';
    import ToolMenu from '../ToolMenu.svelte'
    import Graph from "./Graph/Graph.svelte";
    import { fly, fade } from 'svelte/transition';
    import { Pane, Splitpanes } from 'svelte-splitpanes';
    import FilterMenu from '../filter/FilterMenu.svelte';
    import { onDestroy} from "svelte";

	let value = 0
    let current_opacity = 0;
    let current_size= "0";
    let maxSize_filter = "0"
    let scrollytelling_size = "125";
    let points = []
    let marked_html = [];
    let prevSearchValue = "";
   
    

    //filter list by documenttypes
    let filteredDocumentlist = $documentList;
    
    
    $currentDocumentObject = filteredDocumentlist[value]
    $: console.log(filteredDocumentlist)
    let sortedData = filteredDocumentlist;
    let current_index = -1;

    //sort documents by date
    const sortByString = (colHeader) => {
        sortedData = sortedData.sort((obj1, obj2) => {
            if (obj1[colHeader] < obj2[colHeader]) {
                return -1;
            } else if (obj1[colHeader] > obj2[colHeader]) {
                    return 1;
                }
                return 0; //string code values are equal		
            });
            filteredDocumentlist = sortedData;
        }
    
        sortByString("date")    
    const unsubscribe = current_doctype_filtergroup.subscribe(() => {
        value = 0
        points = []
        marked_html = []
        window.scroll({
  top: 0, 
  left: 0, 
  behavior: 'smooth'
});

        filteredDocumentlist = ($documentList.filter(item => ($current_doctype_filtergroup.filters.includes(item.title))));
        for (let i = 0; i < filteredDocumentlist.length; i++) {
            marked_html[i] = {doc: filteredDocumentlist[i], text: highlightWord(marked(filteredDocumentlist[i].context)), title: highlightWord(marked(filteredDocumentlist[i].title)) , author: highlightWord(marked(filteredDocumentlist[i].author)), date: highlightWord(marked(filteredDocumentlist[i].date.toDateString()))} 
        }
        marked_html = marked_html
        console.log("filter endret seg")
        console.log(marked_html)
    }); 

    onDestroy(unsubscribe);
  
    $: if($showFiltermenu){
        open()
    } else{
        close()
    }
   
  
     //markes all the "word" in "el" with a color style
     function wrapWord(el, word){
        var expr = new RegExp(word, "gi");
        var nodes = [].slice.call(el.childNodes, 0);
        for (var i = 0; i < nodes.length; i++)
        {
            var node = nodes[i];
            if (node.nodeType == 3) // textNode
            {
                var matches = node.nodeValue.match(expr);
                if (matches)
                {
                    var parts = node.nodeValue.split(expr);
                    for (var n = 0; n < parts.length; n++)
                    {
                        if (n)
                        {
                            var span = el.insertBefore(document.createElement("span"), node);
                            span.appendChild(document.createTextNode(matches[n - 1]));
                            span.style = "color:#d43838; border-bottom: 3px solid #d43838"
                            
                        }
                        if (parts[n])
                        {
                            el.insertBefore(document.createTextNode(parts[n]), node);
                        }
                    }
                    $amount_searched_words++
                    el.removeChild(node);
                }
            }
            else
            {
                wrapWord(node, word);
            }
        }
    }
     //Highlight all the words searched on in htmlText
     function highlightWord(htmlText) {
        if ($searchValue != "" && $searchValue != prevSearchValue) {
            console.log(prevSearchValue!=$searchValue)
            let container
            console.log("marker ord")
            container = document.createElement("div")
            container.innerHTML = htmlText
            wrapWord(container, $searchValue)
            return container.innerHTML
        } else{
            return htmlText
        }
    }
     //update sizes for sliding panes
     function close(){
        //sets pane sizes
        current_size = "0";
        maxSize_filter = "0"
        scrollytelling_size = "125";
        $showFiltermenu = false;
    }

    //update sizes for sliding panes
    function open(){
        if($smallDevice){
            //mobile
            current_size = "100"
            maxSize_filter = "100"
            scrollytelling_size="0"
        }else{
            current_size = "25";
            maxSize_filter = "50"
            scrollytelling_size = "100";
        }
    }
 
    // let points = [
        // 	{x: 0, y: 37},
	// 	{x: 1, y: 38},
    
	// 	{x: 16, y: 37},
	// 	{x: 17, y: 38},
	// 	{x: 18, y: 39},
	// 	{x: 19, y: 45},
	// 	{x: 20, y: 43},
	// 	{x: 21, y: 41},
	// 	{x: 22, y: 37},
	// 	{x: 23, y: 38},
	// 	{x: 24, y: 47},
	// 	{x: 25, y: 38},
	// 	{x: 26, y: 39},
	// 	{x: 27, y: 36},
	// 	{x: 28, y: 40},
	// 	{x: 29, y: 41},
	// 	{x: 30, y: 46},
	// 	{x: 31, y: 42},
	// ]
    

    function add_points(docObj){
        let temp = docObj.get_temp()
        points.push({x: points.length, y: temp, data: docObj})
        points = points
    }

    $:{
        if (!value){
            value=0
        }
        $currentDocumentObject = filteredDocumentlist[value]
        $currentDocumentObject = $currentDocumentObject
        console.log(filteredDocumentlist)
        console.log("value " + value)
       
        if (value > current_index ) {
            if ($currentDocumentObject.temperature != null){
                add_points($currentDocumentObject)
            }
            current_index = value;
        }
    }

    function check_steps(event){
        let steps = event.detail
        let currentStepRatio = steps[value];
        current_opacity = currentStepRatio
    }
   

    function init_docList(){
        for (let i = 0; i < filteredDocumentlist.length; i++) {
            marked_html[i] = {doc: filteredDocumentlist[i], text: marked(filteredDocumentlist[i].context), title: marked(filteredDocumentlist[i].title), author: marked(filteredDocumentlist[i].author), date: marked(filteredDocumentlist[i].date.toDateString())} 
        }
    }
    init_docList();

    $: if ($searchValue != prevSearchValue) {
        console.log("Oppdaterer listen")
        marked_html = []
        for (let i = 0; i < filteredDocumentlist.length; i++) {
            marked_html[i] = {doc: filteredDocumentlist[i], text: highlightWord(marked(filteredDocumentlist[i].context)), title: highlightWord(marked(filteredDocumentlist[i].title)) , author: highlightWord(marked(filteredDocumentlist[i].author)), date: highlightWord(marked(filteredDocumentlist[i].date.toDateString()))} 
        }
        marked_html = marked_html
        
        prevSearchValue = $searchValue;
    }

   
</script>

    <div class="main">
  
        <ToolMenu hideToolBar = {false}/>

        <Splitpanes theme = "modern-theme">
            <Pane minSize="20" size={current_size} maxSize={maxSize_filter}>
                <FilterMenu showFilterByTitles={false}/>
            </Pane>
            <Pane size={scrollytelling_size} >
                <div class="scrolly-telling">
        
                    <div class="scroll">
                        <Scrolly bind:value on:steps_ratio={check_steps}>
                                {#each marked_html as item, i}
                                {#if i != marked_html.length-1}
                                    <div class="step" class:active={value == i} >
                                        <ScrollyElement htmlText = {item.text} date = {item.date} title = {item.title} author = {item.author} document = {item.doc}/>
                                     </div>
                                {:else}
                                    <div class="step" class:active={value == i} style="margin-bottom: 20%" >
                                        <ScrollyElement htmlText = {item.text} date = {item.date} title = {item.title} author = {item.author} document = {item.doc}/>
                                    </div>
                                {/if}
                                {/each}
                        </Scrolly>
                    </div>
                    
                   {#if filteredDocumentlist.length!=0 && $currentDocumentObject.get_temp() != null && points.length != 0}
                        <div in:fly="{{ x: -170, duration: 2000 }}" out:fade class = "graph" >
                            <h4> Temperatur </h4>
                            <h6> Viser Temperatur for de siste årene</h6>
                            {#if $current_doctype_filtergroup.filters.length != documentTypes.length}
                                <!-- filter on -->
                                <h6 style = "color: #d43838"> *Filtrert på dokumenter. Sjekk filtermenyen</h6>

                            {/if}
                            <Graph height={500} width = {500} points = {points.slice(0, value)} xName = {"Målinger"} yName = {"Grader"} removed = {points.length != points.slice(0, value).length }/>
                        </div>
                    {/if}
                   
                </div>

            </Pane>
        </Splitpanes>
    </div>

<style>

    .main{
        height: 100%;
        overflow-y: auto;   
       
    }


    .graph{
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 50%;
        width: 20%;
        position: absolute;
        right: 10%;
        top:20%;
        box-shadow: 10px;
    }

    .scrolly-telling{
        display:flex;
        flex-direction: row;
        width: 100%;
        height: 100%;  
      
        
    }

	.scroll{
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        overflow-y: auto;   
        
    }
    
	.step {
        transition: background 100ms;
        width: 60%;
        margin: 5% 0 5% 50px;
        opacity: 0.5;  
	}
    
	.step.active {
        background: whitesmoke;
        border-radius: 20px;
        opacity: 1;
        box-shadow: rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px;
	}
</style>