import { MarkdownNode, Tree } from './MarkdownTree';

export class ParseMarkdown{
    idCounter = 1;
    
    //Gets the titles in an object and sets it into a tree structur
    parseAndSetIntoTree(object){
        this.tree = new Tree(object);
        let content = object.context;
        let substring = "";
        let markdownCode = "";
        let title = "";
        let newNode;
        let prevNode = this.tree.root;
        let possible_parent = null;
        let started = false
        let indeks = 0;

        while(indeks < content.length) {
            let char = content.charAt(indeks);

            if (char == "#") {
                if (started) {
                    newNode = new MarkdownNode(this.idCounter++, markdownCode, title, substring, object);
                    this.tree.insert(possible_parent, newNode);
                    prevNode = newNode;
                }
                title = ""
                substring = ""
                markdownCode = "#";
                indeks++;

                while (content.charAt(indeks) == "#") {
                    markdownCode = markdownCode + "#" ;
                    indeks++;
                }
         
                //finds the parent for the next node that is going to be inserted
                possible_parent = prevNode
             
                //continues up in the tree until we have found a title that have a shorter markdown code (bigger title)
                while( markdownCode.length <= possible_parent.markdownCode.length ){ 
                    possible_parent = possible_parent.parent;
                }
            
                let char = content.charAt(indeks);
                //It have to be space after the markdown code
                if (char == " ") { 
                    while (char != "\n") {
                        title += char;
                        indeks++;
                        char = content.charAt(indeks);
                    }
                    title += char;
                    indeks++;
                    started = true;
                } else {
                    started = false;
                }
            } else { 
                //Registers the text that comes after the markdown title
                substring += char; 
                indeks++;
            }
        }

        if (started) { 
            //Adds in the last node
            newNode = new MarkdownNode(this.idCounter++, markdownCode, title, substring, object)
            this.tree.insert(possible_parent, newNode)
        }
        return this.tree
    }
}