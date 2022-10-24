//sets the correct temp_filtered_context in each documentObject depending on wich titles filters have been checked
export function set_filtered_text(checked_titles){

    let obj_list = checked_titles
    let selected_titles_objects = []

    obj_list.forEach((item)=>{
        //loops through the markdown title nodes under this checked title filter
        item.nodes.forEach((node)=> {
            let index = -1
            //loops throug list to see if it has allready been created
            for (let i = 0; i < selected_titles_objects.length; i++) { 
                if (selected_titles_objects[i].docObject.id == node.object.id) { 
                    //If they belong to the same object
                    index = i;
                    break;
                }
            }
            
            if (index != -1){ 

                //found an object with the same documentObject as node on index <index> in selected_titles_object[index]

                //find_placement_among_nodes(array, node) returns a number:
                //* return value >= 0, number is index in array where node must be inserted, replacing the node that is allready there
                //* return value == -1, signals to not adding to list because there allready is a node in the list showing the node's content
                //* return value == -2, signals to add to list, find right placememt later
                let nodes_index = find_placement_among_nodes(selected_titles_objects[index].nodes, node)
                if (nodes_index >= 0){ 
                    selected_titles_objects[index].nodes[nodes_index] = node

                    //removes toher nodes that are in the subtree of the new node that was added
                    //creates a new node list that only contain one node from each subtree, wich is the highest node in each subtree. Does only need this for showing the context later
                    for (let i = nodes_index+1; i < selected_titles_objects[index].nodes.length; i++){
                        let cmpNode = selected_titles_objects[index].nodes[i]
                        if(is_in_subtree(node,cmpNode)){
                            selected_titles_objects[index].nodes.splice(i, 1)
                        }
                    }

                } else if ( nodes_index == -2) {
                    //The node is a sibling to the other nodes
                    let nodes_document_order = selected_titles_objects[index].docObject.markdownTree.get_nodes_in_order()
                    //Index for node among all title nodes in the document
                    let node_index = nodes_document_order.map(function(e) { return e.id; }).indexOf(node.id); 
            
                    //Finds the rigth placement among the nodes in comparison to the original document
                    let inserted_bool = false
                    for (let i = 0; i < selected_titles_objects[index].nodes.length; i++){
                        let cmpNode = selected_titles_objects[index].nodes[i]
                        let tempIndex = nodes_document_order.map(function(e) { return e.id; }).indexOf(cmpNode.id);
                        if (tempIndex > node_index) {
                            //place in selected_titles_objects[index].nodes list before cmpNode
                            selected_titles_objects[index].nodes.splice(i, 0, node)
                            inserted_bool = true
                            break
                        }
                    }
                    if (inserted_bool == false) {
                        selected_titles_objects[index].nodes.push(node)
                    }
                }

            } else { 
                //no object in list belonging to the same documentType
                selected_titles_objects.push({docObject: node.object, nodes: [node]})
            }
        })
    })
    
    //adds the nodes context together into their documentObjects variable temp_filtered_context
    let new_documentObj_list = []
    for (let i = 0; i < selected_titles_objects.length; i++){
        selected_titles_objects[i].docObject.temp_filtered_context = ""
        let text = "" //Storing filtered text in this document

        for (let j = 0; j < selected_titles_objects[i].nodes.length; j++){
            let node = selected_titles_objects[i].nodes[j]
            text += selected_titles_objects[i].docObject.markdownTree.get_text_under(node)
        }
        selected_titles_objects[i].docObject.temp_filtered_context = text
        new_documentObj_list.push(selected_titles_objects[i].docObject)
    }
    //sorts documents by date
    ascendingOrder = true
    sortDate("date", new_documentObj_list);

    return new_documentObj_list
}

//load all title nodes to variables
export function load_markdownNodes(chosen_documents, oldObjList, checked_titles) {
    let all_nodes = [] 

    chosen_documents.forEach((document) => {
        let nodes_array = document.markdownTree.get_nodes_in_order() 
        nodes_array.forEach((node)=> {all_nodes.push(node)})
    }) 

    let titles_obj = make_titles_obj_list(all_nodes.filter(item => (item.id != 0)), oldObjList, checked_titles)
    
    titles_obj = sortByString(titles_obj)
    return titles_obj
}


function is_in_subtree(to_node, add_node){

    let subtree = to_node.object.markdownTree.get_subtree(to_node)

    for(let i = 0; i < subtree.length; i++) {
        let check_node = subtree[i]
        if (check_node.compare(add_node)) {
            return true; //add_node is in subtree of to_node
        }
    }
    return false; //add_node is not in subtree of to_node
}

function find_placement_among_nodes(nodes_list, node){

    for(let i = 0; i < nodes_list.length; i++){
        if (is_in_subtree(nodes_list[i], node)){
            //old node is over the new node
            return -1 //not adding to list because the parent node will show this node
        } else if (is_in_subtree(node, nodes_list[i])) {
            //new node is over the old node
            return i; //replace the allready added node with this new node, beause the new node wil show the old node's context
        }
    }
    return -2 //add into list. is sibling to all the other title nodes
}


let ascendingOrder = true;
const sortDate = (colHeader, sortData) => {
    let sortedData = sortData.sort((obj1, obj2) => {
        if (obj1[colHeader] < obj2[colHeader]) {
                return -1;
        } else if (obj1[colHeader] > obj2[colHeader]) {
            return 1;
        }
        return 0; //string code values are equal		
    });

    if (!ascendingOrder) {
        sortedData = sortedData.reverse()
    }
    ascendingOrder = !ascendingOrder;
    return sortedData;
}


//sorts alphabetically
const sortByString = (list) => {

    let sortedData = list.sort((obj1, obj2) => {
        if (obj1.title < obj2.title) {
                return -1;
        } else if (obj1.title > obj2.title) {
            return 1;
        }
        return 0; //string code values are equal		
    });

    
    return sortedData
}



//creates a list of objects on the form [{title: .., nodes: [..], checked: true/false},..] from a list of nodes [..node]
//The checked value in each object is based on the checked_titles parameter
function make_titles_obj_list(node_list, oldObjList, checked_titles){
    let obj_list = []

    for (let i = 0; i<node_list.length; i++){
        let new_element = {}
        let node = node_list[i]
        let found = false;
        for (let j= 0; j<obj_list.length; j++){
            if(obj_list[j].title == node.title){
                obj_list[j].nodes.push(node)
                found = true
                break;
            }
        }
        if (!found){
            if (oldObjList.length == 0) { 
                //First time
                if (is_checked(node.title, checked_titles)){
                    new_element = {title: node.title, nodes: [node], checked: true }
                } else {
                    new_element = {title: node.title, nodes: [node], checked: false }

                }

            } else { 
                //Check if the node is checked in original_titles_obj_list
                let found_in_list = false
                for (let i = 0; i < oldObjList.length; i++) {
                    if (node.title == oldObjList[i].title) {
                        if (oldObjList[i].checked) {
                            new_element = {title: node.title, nodes: [node], checked: true }
                            found_in_list = true
                        } 
                        break;
                    }
                }
                if (!found_in_list){
                    new_element = {title: node.title, nodes: [node], checked: false }
                }
            }
            obj_list.push(new_element)
        }
    }
    return obj_list
}


function is_checked(title, checked_titles){
let bool = false

for (let i = 0; i < checked_titles.length; i++){
    if (checked_titles[i].title == title) {
        bool = true
        break
    }
}

return bool
}



