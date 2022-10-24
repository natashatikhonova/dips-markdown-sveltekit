import { writable } from "svelte/store";
import { Editor } from 'typewriter-editor';

//if mobile version or not
export let smallDevice = writable(false)

//the current document oject showing
export const currentDocumentObject = writable();

//list of all documet object
export let documentList=writable([]);

//typewriter editor
export const editor = new Editor();

//true/false value if we are currently editing/adding document:
export let currentlyAddingNewNote = writable(false);
export let currentlyEditingNote = writable(false);

//when true it signals that all filters must be turned off 
export let allfilterOff = writable(false);
//all documentTypes available
export let documentTypes = ["Epikrise","hehehe", "Poliklinisk notat", "Lab", "Sykepleier notat", "Rutinekontroll", "Røntgen bilde", "typ1", "typ2", "typ3", "typ4", "typ5", "typ6", "typ7", "typ8", "typ9", "typ10", "typ11", "typ12", "typ13", "typ14", "typ1", "typ2", "typ3", "typ4", "typ5", "typ6", "typ7", "typ8", "typ9", "typ10", "typ11", "typ12", "typ13", "typ14"].sort();

export let currentView = writable("Dokumentliste");
//stores wich doctypes filters who is chosen
//When id is -1, no group is selected but it stores wich filters is checked among all doctypes
//when id >= 0, group is selected
export let current_doctype_filtergroup = writable({id: -1, name: "", filters: documentTypes.slice()});

//temporary premade filter groups:
export let doctype_filter_groups = writable([
    {id: 1, name: "Filter 1", filters: ["Epikrise"]},
    {id: 2, name: "Sindres filter", filters: ["Lab", "Sykepleier notat", "Rutinekontroll"]},
    {id: 3, name: "Natashas filter", filters: ["Epikrise", "Poliklinisk notat", "Lab", "Rutinekontroll"]},
    {id: 4, name: "Torkilds filter", filters: ["Epikrise", "Lab", "Rutinekontroll"]},
    {id: 5, name: "Thors filter", filters: ["Lab"]}
]);

//array of objects that are checked
//object form: {title: title, nodes: [..], checked: true } **checked value here is not used, because there are only objects that are schecked in this list**
export let checked_titles_filters = writable([]) 

//      searchfield values:
//Which word is searched on
export let searchValue = writable("")
export let amount_searched_words = writable(0)

//filtered document list based on the $searchedValue
export let searchedDocuments = writable([])

//signals to show filtering menu
export let showFiltermenu = writable(false)

//for storing value about settings in editor
export let selected_text_size = writable(11)
export let autocompleteOn = writable(false)

//for storing value about text settings in scrollview
export let selected_text_size_scrollview = writable(11)
export let selected_line_height = writable("1.5")

//list with open documents - tabs
export let openedDocTabs = writable([])

//for storing the markdown text and info
export class DocumentObject{
    
    constructor(id, date, context, title, readable){
        this.id = id;
        this.date = new Date(date);
        this.context = context;
        this.title = title;
        this.readable = readable;
        this.author = "Dr.Who";
        this.markdownTree = null;
        //Sorting on titles
        this.temp_filtered_context = ""     
        this.temperature = null;
        
        
    }
    add_temp(temp_degrees){
        this.temperature= temp_degrees;
    }
    get_temp(){
        return this.temperature;
    }

}

//finds an id for the documentObject
export function findNewDocumentObjId(documentListCpy){
    let ids = []
    documentListCpy.forEach(docType => (ids.push(docType.id)))
    let num = 1;
    while(ids.includes(num)){
        num += 1;
    }
    return num;
}
