module.exports = {
  onWillParseMarkdown: function(markdown) {
    return new Promise((resolve, reject)=> {
      let settingsOptions = new Object();
      try{
        let settingsReg = new RegExp(/\^\^\^settings\s+(.*?)\^\^\^/s);
        let settingsContent = settingsReg.exec(markdown)[1];
        //markdown = markdown.replace(/\^\^\^settings\s+(.*?)\^\^\^/sgm, (whole, content) => "");
        
        const settingsLable = ["toc", "cap_img", "cap_prg", "cap_tbl"];

        if(settingsContent){
          for (const label of settingsLable){
            try{
              settingsOptions[label] = RegExp(`(?<!.)${label}:\s*(.*)`).exec(settingsContent)[1];
              settingsOptions[label] = settingsOptions[label].replace(' ', '') === "true" ? true : false;
            }catch(err){
              settingsOptions[label] = null;
            }
          }
        }
      }catch(err){}

      // 目次の生成
      if(settingsOptions["toc"]){
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

      var ImageNum = 0;
      var FormulaNum = 0;
    
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

      markdown = markdown.replace(/\$\$\s*\n*(.*?)\s*\n*\$\$/gm, 
      (whole, formula) => 
      `<a name="formula` + String(++FormulaNum) + `"></a>\n` + 
      `\$\$ ${formula} \\tag{` + String(FormulaNum) + `} \$\$`
      );
      
      if(settingsOptions["cap_img"]){
        markdown = markdown.replace(/!\[(.*?)\]\((.*?)\)/gm, 
        (whole, caption, url) =>
        `<a name="fig` + String(++ImageNum) + `"></a>\n` + 
        `<figure class=image>\n`+
        `  <img class=image src="${url}"/>\n`+
        `  <figcaption>図` + String(ImageNum) + `. ${caption}</figcaption>\n`+
        `</figure>\n`
        );
      }
      
      markdown = markdown.replaceAll("　", "&#x3000;")

      try {
        var reg = new RegExp(/\^\^\^cover\s+(.*?)\^\^\^/s);
        var content = reg.exec(markdown)[1];
        var options = new Object();
    
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
    
        var replaceStr = ""

        for (const label of optionsLable){
            var query = "(?<!.)" + label + ":(.*)";
        
            try {
              options[label] = RegExp(query).exec(content)[1];
            } catch(err) {
              options[label] = "";
            }
        }
    
        for (const label of optionsLable){
            if(options[label] === ""){
              replaceStr += "<p class=" + label + " none></p>\n";
            }else{
              replaceStr += "<p class=" + label + ">" + trans[label] + options[label] +"</p>\n";
            }
        }
        
        replaceStr += "<div class=newpage></div>";
        let cover = replaceStr;

        markdown = markdown.replace(/\^\^\^cover\s+(.*?)\^\^\^/sgm, (whole, content) => "");
        markdown = cover + markdown;
    } catch(err){}

      return resolve(markdown)
    })
  },
  onDidParseMarkdown: function(html, {cheerio}) {
    return new Promise((resolve, reject)=> {
      var TableNum = 0;
      let programNum = 0;

      let settingsOptions = new Object();
      try{
        let settingsReg = new RegExp(/\^\^\^settings\s+(.*?)\^\^\^/s);
        let settingsContent = settingsReg.exec(html)[1];
        html = html.replace(/\^\^\^settings\s+(.*?)\^\^\^/sgm, (whole, content) => "");
        
        const settingsLable = ["toc", "cap_img", "cap_prg", "cap_tbl"];

        if(settingsContent){
          for (const label of settingsLable){
            try{
              settingsOptions[label] = RegExp(`(?<!.)${label}:\s*(.*)`).exec(settingsContent)[1];
              settingsOptions[label] = settingsOptions[label].replace(' ', '') === "true" ? true : false;
            }catch(err){
              settingsOptions[label] = null;
            }
          }
        }
      }catch(err){}

      if(settingsOptions["cap_tbl"]){
        html = html.replace(/\<\/table\>\n\<p\>(.*?)\<\/p\>/gm, 
        (whole, cap) => 
        `<a name="table` + String(++TableNum) + `"></a>` +
        `</table>\n`+
        `<p class=caption>表` + String(TableNum) + `. ${cap}</p>`
        );
      }
      if(settingsOptions["cap_prg"]){
        html = html.replace(/\<\/pre\>\<p\>(.*?)\<\/p\>/gm,
        (whole, cap) => 
        `<a name="program` + String(++programNum) + `"></a>` +
        `</pre>\n`+
        `<p class=caption>プログラム` + String(programNum) + `. ${cap}</p>`);
      }

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
