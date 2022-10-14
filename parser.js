module.exports = {
  options: {
    "toc": true, "cap_img": true, "draw_space": true,
    "cap_prg": true, "cap_tbl": true
  },
  reference: {
    fig: {},
    prg: {},
    tbl: {},
    frm: {},
  },
  onWillParseMarkdown: function(markdown) {
    return new Promise((resolve, reject)=> {
      const settingsOptions = () => {
        let settingsReg = new RegExp(/\^\^\^settings\s+(.*?)\^\^\^/s);
        let settingsContent = null;
        try {
          settingsContent = settingsReg.exec(markdown)[1];
          markdown = markdown.replace(/\^\^\^settings\s+(.*?)\^\^\^/sgm, (whole, content) => "");
        } catch {}
        
        const settingsLable = ["toc", "cap_img", "draw_space", "cap_prg", "cap_tbl"];

        if(settingsContent){
          for (const label of settingsLable){
            try{
              this.options[label] = RegExp(`(?<!.)${label}:\s*(.*)`).exec(settingsContent)[1];
              this.options[label] = this.options[label].replace(' ', '') === "true" ? true : false;
            }catch(err){
              this.options[label] = true;
            }
          }
        }
      }

      const createTOC = () => {
        let contents = "<h2>目次</h2>\n<ul>\n"
        let sectionCount = new Array(0,0,0,0,0,0);
        let markdown_line = markdown.split('\n');
        let ireko = 0;

        for(let line_num in markdown_line){
          if(markdown_line[line_num].startsWith("## ")){
            mokuji = true;
            if(sectionCount[4] > 0 && ireko > 0){
              contents += "</ul>\n";
              ireko--;
            }
            if(sectionCount[3] > 0 && ireko > 0){
              contents += "</ul>\n";
              ireko--;
            }
            contents += `<li class="h2"><a href=#item-${++sectionCount[2]} style="color: black;"> ${sectionCount[2]}. ${markdown_line[line_num].substr(3)}</a>\n</li>`
            markdown_line[line_num] = `<h2 id=item-${sectionCount[2]}>${sectionCount[2]}. ${markdown_line[line_num].substr(3)}</h2>`;
            for(i = 3; i < 6; i++) sectionCount[i] = 0;
          }else if(markdown_line[line_num].startsWith("### ")){
            mokuji = true;
            if(sectionCount[4] > 0 && ireko > 0){
              contents += "</ul>\n";
              ireko--;
            }
            if(sectionCount[3] == 0){
              if(ireko > 0){
                contents += "</ul>\n";
                ireko--;
              }
              contents += "<ul>\n";
              ireko++;
            }
            contents += `<li class="h3"><a href=#item-${sectionCount[2]}-${++sectionCount[3]} style="color: black;"> ${sectionCount[2]}.${sectionCount[3]}. ${markdown_line[line_num].substr(4)}</a>\n</li>`
            markdown_line[line_num] = `<h3 id=item-${sectionCount[2]}-${sectionCount[3]}>${sectionCount[2]}.${sectionCount[3]}. ${markdown_line[line_num].substr(4)}</h3>`;
            for(i = 4; i < 6; i++) sectionCount[i] = 0;
          }else if(markdown_line[line_num].startsWith("#### ")){
            mokuji = true;
            if(sectionCount[4] == 0){
              contents += "<ul>\n";
              ireko++;
            }
            contents += `<li class="h4"><a href=#item-${sectionCount[2]}-${sectionCount[3]}-${++sectionCount[4]} style="color: black;"> ${sectionCount[2]}.${sectionCount[3]}.${sectionCount[4]}. ${markdown_line[line_num].substr(5)}</a></li>`
            markdown_line[line_num] = `<h4 id=item-${sectionCount[2]}-${sectionCount[3]}-${sectionCount[4]}>${sectionCount[2]}.${sectionCount[3]}.${sectionCount[4]}. ${markdown_line[line_num].substr(5)}</h4>`;
          }
        }
        while(ireko --> 0) contents += "</ul>\n";
        contents += '</ul>\n<div class="newpage"></div>\n'
        markdown = contents + markdown_line.join('\n');
      }

      const createCover = () => {
        let reg = new RegExp(/\^\^\^cover\s+(.*?)\^\^\^/s);
        markdown = markdown.replace(reg, (whole, content) => "");

        let content = null;
        try {
          content = reg.exec(markdown)[1];
        } catch {}
        if(!content) return;

        let items = new Object();
              
        const optionsLable = 
        ["sub_date", "title", "subtitle", 
        "exp_date", "subject", "teacher", 
        "number", "name", "depart","collab","desk"]
              
        const trans = {
            title: "",
            subtitle: "",
            sub_date: "提出日: ",
            exp_date: "実験日　　: ",
            subject : "授業科目　: ",
            teacher : "担当教員　: ",
            number  : "学籍番号　: ",
            name    : "氏名　　　: ",
            depart  : "学科　　　: ", 
            collab  : "共同実験者: ",
            desk    : "使用デスク: ",
        }
        
        let replaceStr = ""
        
        for (const label of optionsLable){
            let query = "(?<!.)" + label + ":(.*)";
            try {
              items[label] = RegExp(query).exec(content)[1];
            } catch(err) {
              items[label] = "";
            }
        }
        
        for (const label of optionsLable){
            if(items[label] === ""){
              replaceStr += "<p class=" + label + " none></p>\n";
            }else{
              replaceStr += "<p class=" + label + ">" + trans[label] + items[label] +"</p>\n";
            }
        }
        
        replaceStr += "<div class=newpage></div>";
        let cover = replaceStr;

        markdown = cover + markdown;
      }

      const createReferenceByNumber = () => {
        markdown = markdown.replace(/図(\d+)/gm,
        (whole, number) => 
        `<a href=#fig${number} class="ref">図${number}</a>`
        );
  
        markdown = markdown.replace(/表(\d+)/gm,
        (whole, number) => 
        `<a href=#table${number} class="ref">表${number}</a>`
        );
  
        markdown = markdown.replace(/式(\d+)/gm,
        (whole, number) => 
        `<a href=#formula${number} class="ref">式${number}</a>`
        );
  
        markdown = markdown.replace(/プログラム(\d+)/gm,
        (whole, number) => 
        `<a href=#program${number} class="ref">プログラム${number}</a>`
        );
      }
      
      const assignImageNumber = () => {
        var ImageNum = 0;
        markdown = markdown.replace(/!\[(.*?)\]\((.*?)\)/gm, 
        (whole, caption, url) => 
        `<figure class=image>\n`+
        `  <a name="fig` + String(++ImageNum) + `"></a>\n` +
        `  <img class=image src="${url}"/>\n`+
        `  <figcaption>図` + String(ImageNum) + `. ${caption}</figcaption>\n`+
        `</figure>\n`
        );
      }
      
      const assignFormulaNumber = () => {
        var FormulaNum = 0;
        markdown = markdown.replace(/\$\$\s*\n*(.*?)\s*\n*\$\$/gm, 
        (whole, formula) => 
        `<a name="formula` + String(++FormulaNum) + `"></a>\n` + 
        `\$\$ ${formula} \\tag{` + String(FormulaNum) + `} \$\$`
        );
      }

      const checkLable = () => {
        let reg = new RegExp(/\<label\s+(.*?):\s*(.*?)\>/gm);
        let ImageNum = 0, FormulaNum = 0, TableNum = 0, programNum = 0;
        markdown = markdown.replace(reg, 
          (whole, category, name) => { 
            if(category === 'fig') this.reference[category][name] = ++ImageNum;
            else if(category === 'frm') this.reference[category][name] = ++FormulaNum;
            else if(category === 'tbl') this.reference[category][name] = ++TableNum;
            else if(category === 'prg') this.reference[category][name] = ++programNum;
            return `<a href=#${category}_${name}></a>` 
          });
      }
      const checkRef = () => {
        let reg = new RegExp(/\<ref\s+(.*?):\s*(.*?)\>/gm);
        markdown = markdown.replace(reg,
          (whole, category, name) => {
            let categoryJP = '';
            if(category === 'fig') categoryJP = "図";
            else if(category === 'frm') categoryJP = "式";
            else if(category === 'tbl') categoryJP = "表";
            else if(category === 'prg') categoryJP = "プログラム";
            return `<a href=${category}_${name}>${categoryJP}${this.reference[category][name]}</a>` 
          });
      }
      
      settingsOptions();
      checkLable();
      checkRef(); 
      createCover(); 
      createReferenceByNumber(); 
      if(this.options["toc"]) createTOC();
      if(this.options["cap_img"]) assignImageNumber();
      assignFormulaNumber();
      if(this.options["draw_space"]) markdown = markdown.replaceAll("　", "&#x3000;");

      return resolve(markdown)
    })
  },
  onDidParseMarkdown: function(html, {cheerio}) {
    return new Promise((resolve, reject)=> {
      const assignTableCaption = () => {
        var TableNum = 0;
        html = html.replace(/\<\/table\>\n\<p\>(.*?)\<\/p\>/gm, 
        (whole, cap) => 
        `<a name="table` + String(++TableNum) + `"></a>` +
        `</table>\n`+
        `<p class=caption>表` + String(TableNum) + `. ${cap}</p>`
        );
      }

      const assignProgramCaption = () => {
        let programNum = 0;
        html = html.replace(/\<\/pre\>\<p\>(.*?)\<\/p\>/gm,
        (whole, cap) => 
        `<a name="program` + String(++programNum) + `"></a>` +
        `</pre>\n`+
        `<p class=caption>プログラム` + String(programNum) + `. ${cap}</p>`);
      }

      const transformNewpageElement = () => {
        html = html.replace(/\<newpage\s*\>/gm,
        (whole, number) => 
        `<div class=newpage></div>`
        );
      }
      const transformFlexElement = () => {
        html = html.replace(/\<flex\s*\>(.*?)\<\/flex\>/sgm,
        (whole, text) => 
        `<div style="display:flex;">
          ${text}
        </div>`
        );
      }

      const transformGridElement = () => {
        html = html.replace(/\<grid\s*col:\s*(\d+)\s*\>(.*?)\<\/grid\>/sgm,
        (whole, col, text) => 
        `<div style="display:grid; grid-template-columns: repeat(${col}, ${Math.floor(100/col)}%);">
          ${text}
        </div>`
        );
      }

      if(this.options["cap_tbl"]) assignTableCaption();
      if(this.options["cap_prg"]) assignProgramCaption();
      transformNewpageElement();
      transformFlexElement();
      transformGridElement();

      return resolve(html)
    })
  },
  onWillTransformMarkdown: function (markdown) {
        return new Promise((resolve, reject) => {
            return resolve(markdown);
        });
    },
  onDidTransformMarkdown: function (markdown) {
      return new Promise((resolve, reject) => {
          return resolve(markdown);
      });
  }
}
